import "dotenv/config"; // load environment variables from .env file
import express from "express";
import cors from "cors";
import router from "./routes/routes";
import { errorHandler } from "./middleware/errorHandler";
const port = process.env.PORT || 3000;
const app = express(); // create express application

// Restricted to only the allowed origin, the frontend URL
app.use(cors({ origin: process.env.ALLOWED_ORIGIN })); // enable cors
app.use(express.json()); // parse json bodies

// define routes
app.use("/api", router);

// handle 404 errors like unknown routes
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use(errorHandler);

// start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})