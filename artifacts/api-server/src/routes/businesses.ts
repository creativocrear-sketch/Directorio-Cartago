import { Router, type IRouter } from "express";
import {
  db,
  businessesTable,
  businessImagesTable,
  categoriesTable,
  usersTable,
  subscriptionsTable,
} from "@workspace/db";
import { eq, and, ilike, count, sql, gt, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth, type AuthRequest } from "../middlewares/auth";
import {
  GetBusinessesQueryParams,
  CreateBusinessBody,
  GetBusinessParams,
  UpdateBusinessParams,
  UpdateBusinessBody,
  DeleteBusinessParams,
  ApproveBusinessParams,
  RejectBusinessParams,
  RejectBusinessBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function hasActiveSubscription(userId: number): Promise<boolean> {
  const now = new Date();
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, userId),
        eq(subscriptionsTable.isActive, true),
        gt(subscriptionsTable.endDate, now)
      )
    )
    .limit(1);
  return !!sub;
}

async function getBusinessWithDetails(businessId: number) {
  const [business] = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      description: businessesTable.description,
      address: businessesTable.address,
      phone: businessesTable.phone,
      whatsapp: businessesTable.whatsapp,
      instagram: businessesTable.instagram,
      facebook: businessesTable.facebook,
      website: businessesTable.website,
      googleMapsUrl: businessesTable.googleMapsUrl,
      schedule: businessesTable.schedule,
      categoryId: businessesTable.categoryId,
      categoryName: categoriesTable.name,
      ownerId: businessesTable.ownerId,
      ownerName: usersTable.name,
      status: businessesTable.status,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id))
    .leftJoin(usersTable, eq(businessesTable.ownerId, usersTable.id))
    .where(eq(businessesTable.id, businessId));

  if (!business) return null;

  const images = await db
    .select()
    .from(businessImagesTable)
    .where(eq(businessImagesTable.businessId, businessId));

  return {
    ...business,
    images: images.map(img => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary === 1,
    })),
    averageRating: null,
    reviewCount: 0,
  };
}

router.get("/businesses", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const queryParsed = GetBusinessesQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { search, categoryId, status, page = 1, limit = 12 } = queryParsed.data;

  const conditions = [];

  // Visitors and unauthenticated users only see approved businesses
  const userRole = req.user?.role;
  if (userRole === "admin") {
    if (status) conditions.push(eq(businessesTable.status, status as "pending" | "approved" | "rejected"));
  } else if (userRole === "business_owner") {
    // owners see approved + their own pending
    conditions.push(eq(businessesTable.status, "approved"));
  } else {
    conditions.push(eq(businessesTable.status, "approved"));
  }

  if (search) {
    conditions.push(ilike(businessesTable.name, `%${search}%`));
  }

  if (categoryId) {
    conditions.push(eq(businessesTable.categoryId, categoryId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(businessesTable)
    .where(whereClause);

  const total = Number(totalResult.count);

  const businesses = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      description: businessesTable.description,
      address: businessesTable.address,
      phone: businessesTable.phone,
      whatsapp: businessesTable.whatsapp,
      instagram: businessesTable.instagram,
      facebook: businessesTable.facebook,
      website: businessesTable.website,
      googleMapsUrl: businessesTable.googleMapsUrl,
      schedule: businessesTable.schedule,
      categoryId: businessesTable.categoryId,
      categoryName: categoriesTable.name,
      ownerId: businessesTable.ownerId,
      ownerName: usersTable.name,
      status: businessesTable.status,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(categoriesTable, eq(businessesTable.categoryId, categoriesTable.id))
    .leftJoin(usersTable, eq(businessesTable.ownerId, usersTable.id))
    .where(whereClause)
    .orderBy(businessesTable.createdAt)
    .limit(limit)
    .offset(offset);

  const businessIds = businesses.map(b => b.id);
  let allImages: Array<{ id: number; businessId: number; url: string; isPrimary: number }> = [];
  if (businessIds.length > 0) {
    allImages = await db
      .select()
      .from(businessImagesTable)
      .where(inArray(businessImagesTable.businessId, businessIds));
  }

  const result = businesses.map(b => ({
    ...b,
    images: allImages
      .filter(img => img.businessId === b.id)
      .map(img => ({ id: img.id, url: img.url, isPrimary: img.isPrimary === 1 })),
    averageRating: null,
    reviewCount: 0,
  }));

  res.json({
    businesses: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/businesses", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { images, ...businessData } = parsed.data;

  const [business] = await db
    .insert(businessesTable)
    .values({
      ...businessData,
      ownerId: req.user!.id,
      status: "pending",
    })
    .returning();

  if (images && images.length > 0) {
    await db.insert(businessImagesTable).values(
      images.map((url, idx) => ({
        businessId: business.id,
        url,
        isPrimary: idx === 0 ? 1 : 0,
      }))
    );
  }

  const result = await getBusinessWithDetails(business.id);
  res.status(201).json(result);
});

router.get("/businesses/:id", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const business = await getBusinessWithDetails(params.data.id);
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  res.json(business);
});

router.put("/businesses/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const [existing] = await db.select().from(businessesTable).where(eq(businessesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const user = req.user!;
  if (user.role !== "admin" && existing.ownerId !== user.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { images, ...businessData } = parsed.data;

  await db.update(businessesTable)
    .set({ ...businessData, updatedAt: new Date() })
    .where(eq(businessesTable.id, params.data.id));

  if (images !== undefined) {
    await db.delete(businessImagesTable).where(eq(businessImagesTable.businessId, params.data.id));
    if (images.length > 0) {
      await db.insert(businessImagesTable).values(
        images.map((url, idx) => ({
          businessId: params.data.id,
          url,
          isPrimary: idx === 0 ? 1 : 0,
        }))
      );
    }
  }

  const result = await getBusinessWithDetails(params.data.id);
  res.json(result);
});

router.delete("/businesses/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(businessesTable).where(eq(businessesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const user = req.user!;
  if (user.role !== "admin" && existing.ownerId !== user.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  await db.delete(businessesTable).where(eq(businessesTable.id, params.data.id));
  res.json({ message: "Business deleted" });
});

router.post("/businesses/:id/approve", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = ApproveBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.update(businessesTable)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(businessesTable.id, params.data.id));

  const result = await getBusinessWithDetails(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(result);
});

router.post("/businesses/:id/reject", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = RejectBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = RejectBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  await db.update(businessesTable)
    .set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() })
    .where(eq(businessesTable.id, params.data.id));

  const result = await getBusinessWithDetails(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(result);
});

export default router;
