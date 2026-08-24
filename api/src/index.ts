import "dotenv/config"; // load environment variables from .env file
import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/routes";
import { errorHandler } from "./middleware/errorHandler";
import redisClient from "./clients/redisClient";
const port = process.env.PORT || 3000;
const app = express(); // create express application

// Restricted to only the allowed origin, the frontend URL
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());
// log requests in development mode
// combined is more verbose for production
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); 

// define routes
app.use("/api", router);

// handle 404 errors like unknown routes
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use(errorHandler);

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Failed to connect to Redis. Exiting.", err);
        process.exit(1);
    }
    app.listen(port, () => console.log(`Server running on port ${port}`));
})();