import "dotenv/config"; // load environment variables from .env file
import express from "express";
import cors from "cors";
import router from "./routes/routes";
import { errorHandler } from "./middleware/errorHandler";
const port = process.env.PORT || 3000;
const app = express(); // create express application
app.use(cors()); // enable cors
app.use(express.json()); // parse json bodies

// define routes
app.use("/api", router);

app.use(errorHandler);

// start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})