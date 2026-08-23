import express from "express";
import { getStocks } from "../controllers/controller";
const router = express.Router();

router.get("/stocks", getStocks);

export default router;