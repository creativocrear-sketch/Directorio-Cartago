import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import businessesRouter from "./businesses";
import subscriptionsRouter from "./subscriptions";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(businessesRouter);
router.use(subscriptionsRouter);
router.use(adminRouter);

export default router;
