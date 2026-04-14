import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import gurusRouter from "./gurus";
import usersRouter from "./users";
import ratingsRouter from "./ratings";
import subscriptionsRouter from "./subscriptions";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(gurusRouter);
router.use(usersRouter);
router.use(ratingsRouter);
router.use(subscriptionsRouter);
router.use(telegramRouter);

export default router;
