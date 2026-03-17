import { Router, type IRouter } from "express";
import { db, categoriesTable, businessesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import {
  CreateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryBody,
  DeleteCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable);
  const counts = await db
    .select({ categoryId: businessesTable.categoryId, count: count() })
    .from(businessesTable)
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.categoryId);

  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

  const result = cats.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    description: c.description,
    businessCount: countMap.get(c.id) || 0,
  }));

  res.json(result);
});

router.post(
  "/categories",
  requireAdmin,
  async (req: AuthRequest, res): Promise<void> => {
    const parsed = CreateCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error" });
      return;
    }

    const [cat] = await db
      .insert(categoriesTable)
      .values(parsed.data)
      .returning();
    res.status(201).json({ ...cat, businessCount: 0 });
  },
);

router.put(
  "/categories/:id",
  requireAdmin,
  async (req: AuthRequest, res): Promise<void> => {
    const params = UpdateCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error" });
      return;
    }

    const [cat] = await db
      .update(categoriesTable)
      .set(parsed.data)
      .where(eq(categoriesTable.id, params.data.id))
      .returning();

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({ ...cat, businessCount: 0 });
  },
);

router.delete(
  "/categories/:id",
  requireAdmin,
  async (req: AuthRequest, res): Promise<void> => {
    const params = DeleteCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [deleted] = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, params.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({ message: "Category deleted" });
  },
);

export default router;
