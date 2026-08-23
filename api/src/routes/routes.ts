import express from "express";
import { getStocks } from "../controllers/controller";
const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({ message: "OK" });
});

router.get("/stocks/:symbol", getStocks);

export default router;