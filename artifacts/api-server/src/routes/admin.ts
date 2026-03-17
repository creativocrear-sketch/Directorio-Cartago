import { Router, type IRouter } from "express";
import { db, usersTable, businessesTable, categoriesTable, subscriptionsTable, subscriptionPlansTable } from "@workspace/db";
import { eq, count, and, gt, sql } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import { seedIfEmpty, updateBusinessImages } from "../seed";
import {
  AdminGetUsersQueryParams,
  AdminUpdateUserParams,
  AdminUpdateUserBody,
  AdminDeleteUserParams,
  CreateSubscriptionPlanBody,
  UpdateSubscriptionPlanParams,
  UpdateSubscriptionPlanBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const queryParsed = AdminGetUsersQueryParams.safeParse(req.query);
  const page = queryParsed.success ? (queryParsed.data.page || 1) : 1;
  const limit = queryParsed.success ? (queryParsed.data.limit || 20) : 20;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ count: count() }).from(usersTable);
  const total = Number(totalResult.count);

  const users = await db
    .select()
    .from(usersTable)
    .orderBy(usersTable.createdAt)
    .limit(limit)
    .offset(offset);

  const now = new Date();
  const activeSubs = await db
    .select({ userId: subscriptionsTable.userId })
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.isActive, true), gt(subscriptionsTable.endDate, now)));

  const activeSubUserIds = new Set(activeSubs.map(s => s.userId));

  res.json({
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
      hasActiveSubscription: activeSubUserIds.has(u.id),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.put("/admin/users/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = AdminUpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    phone: updated.phone,
    createdAt: updated.createdAt,
    hasActiveSubscription: false,
  });
});

router.delete("/admin/users/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = AdminDeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ message: "User deleted" });
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const now = new Date();

  const [[totalUsers], [totalBusinesses], [pendingBusinesses], [approvedBusinesses], [activeSubscriptions], [totalCategories]] = await Promise.all([
    db.select({ count: count() }).from(usersTable),
    db.select({ count: count() }).from(businessesTable),
    db.select({ count: count() }).from(businessesTable).where(eq(businessesTable.status, "pending")),
    db.select({ count: count() }).from(businessesTable).where(eq(businessesTable.status, "approved")),
    db.select({ count: count() }).from(subscriptionsTable).where(and(eq(subscriptionsTable.isActive, true), gt(subscriptionsTable.endDate, now))),
    db.select({ count: count() }).from(categoriesTable),
  ]);

  res.json({
    totalUsers: Number(totalUsers.count),
    totalBusinesses: Number(totalBusinesses.count),
    pendingBusinesses: Number(pendingBusinesses.count),
    approvedBusinesses: Number(approvedBusinesses.count),
    activeSubscriptions: Number(activeSubscriptions.count),
    totalCategories: Number(totalCategories.count),
  });
});

router.get("/admin/subscriptions", requireAdmin, async (_req, res): Promise<void> => {
  const subs = await db
    .select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      userName: usersTable.name,
      planId: subscriptionsTable.planId,
      planName: subscriptionPlansTable.name,
      startDate: subscriptionsTable.startDate,
      endDate: subscriptionsTable.endDate,
      isActive: subscriptionsTable.isActive,
      paymentReference: subscriptionsTable.paymentReference,
    })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .leftJoin(subscriptionPlansTable, eq(subscriptionsTable.planId, subscriptionPlansTable.id))
    .orderBy(subscriptionsTable.createdAt);

  res.json(subs);
});

router.post("/admin/subscription-plans", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateSubscriptionPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const [plan] = await db.insert(subscriptionPlansTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    durationDays: parsed.data.durationDays,
    isActive: parsed.data.isActive !== undefined ? parsed.data.isActive : true,
  }).returning();

  res.status(201).json(plan);
});

router.put("/admin/subscription-plans/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateSubscriptionPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateSubscriptionPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const [plan] = await db
    .update(subscriptionPlansTable)
    .set(parsed.data)
    .where(eq(subscriptionPlansTable.id, params.data.id))
    .returning();

  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  res.json(plan);
});

router.post("/admin/seed", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const result = await seedIfEmpty(true);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post("/admin/update-images", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const result = await updateBusinessImages();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
