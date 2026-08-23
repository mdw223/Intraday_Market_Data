import express from "express";
import { getStocks } from "../controllers/controller";
const router = express.Router();


router.get("/stocks/:symbol", getStocks);

export default router;