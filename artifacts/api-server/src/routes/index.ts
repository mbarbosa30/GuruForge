import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import gurusRouter from "./gurus";
import usersRouter from "./users";
import ratingsRouter from "./ratings";
import subscriptionsRouter from "./subscriptions";
import telegramRouter from "./telegram";
import wisdomRouter from "./wisdom";
import feedRouter from "./feed";
import trainingRouter from "./training";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(gurusRouter);
router.use(usersRouter);
router.use(ratingsRouter);
router.use(subscriptionsRouter);
router.use(telegramRouter);
router.use(wisdomRouter);
router.use(feedRouter);
router.use(trainingRouter);

export default router;
