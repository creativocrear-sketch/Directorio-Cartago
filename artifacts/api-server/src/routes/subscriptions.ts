import { Router, type IRouter } from "express";
import { db, subscriptionPlansTable, subscriptionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { SubscribeBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  const plans = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.isActive, true));
  res.json(plans);
});

router.get("/subscriptions/current", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.id;
  const now = new Date();

  const [sub] = await db
    .select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      planId: subscriptionsTable.planId,
      planName: subscriptionPlansTable.name,
      startDate: subscriptionsTable.startDate,
      endDate: subscriptionsTable.endDate,
      isActive: subscriptionsTable.isActive,
      paymentReference: subscriptionsTable.paymentReference,
    })
    .from(subscriptionsTable)
    .leftJoin(subscriptionPlansTable, eq(subscriptionsTable.planId, subscriptionPlansTable.id))
    .where(
      and(
        eq(subscriptionsTable.userId, userId),
        eq(subscriptionsTable.isActive, true),
        gt(subscriptionsTable.endDate, now)
      )
    )
    .limit(1);

  if (!sub) {
    res.status(404).json({ error: "No active subscription" });
    return;
  }

  res.json({ ...sub, userName: null });
});

router.post("/subscriptions/subscribe", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = SubscribeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }

  const { planId, paymentReference } = parsed.data;
  const userId = req.user!.id;

  const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, planId));
  if (!plan || !plan.isActive) {
    res.status(404).json({ error: "Plan not found or inactive" });
    return;
  }

  // Deactivate existing subscriptions
  await db.update(subscriptionsTable)
    .set({ isActive: false })
    .where(eq(subscriptionsTable.userId, userId));

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const [sub] = await db.insert(subscriptionsTable).values({
    userId,
    planId,
    startDate,
    endDate,
    isActive: true,
    paymentReference: paymentReference || null,
  }).returning();

  res.status(201).json({
    id: sub.id,
    userId: sub.userId,
    userName: null,
    planId: sub.planId,
    planName: plan.name,
    startDate: sub.startDate,
    endDate: sub.endDate,
    isActive: sub.isActive,
    paymentReference: sub.paymentReference,
  });
});

export default router;
