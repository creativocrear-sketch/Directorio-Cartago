import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.put("/users/profile", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const userId = req.user!.id;
  const [updated] = await db
    .update(usersTable)
    .set({
      name: parsed.data.name,
      phone: parsed.data.phone,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

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

export default router;
