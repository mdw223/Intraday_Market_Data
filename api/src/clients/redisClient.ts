import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err: Error) => {
    console.error("Redis error:", err);
});

redisClient.on("connect", () => {
    console.log("Redis connected");
});

export default redisClient;