import "dotenv/config";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import checkinsRoutes from "./routes/checkins.routes.js";
import aiUsageRoutes from "./routes/aiUsage.routes.js";
import dietsRoutes from "./routes/diets.routes.js";
import creatorsRoutes from "./routes/creators.routes.js";
import mealsRoutes from "./routes/meals.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import referralsRoutes from "./routes/referrals.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  analyzeFoodRateLimiter,
  authRateLimiter,
  checkinsRateLimiter,
  generateDietRateLimiter,
  globalRateLimiter,
} from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(globalRateLimiter);
app.use("/", paymentsRoutes);
app.use(express.json({ limit: "10mb" }));
app.use("/", referralsRoutes);
app.use("/creators", creatorsRoutes);
app.use(["/auth", "/login", "/register", "/reset-password"], authRateLimiter);
app.use("/analyze-food", analyzeFoodRateLimiter);
app.use("/generate-diet", generateDietRateLimiter);
app.use("/checkins", checkinsRateLimiter);
app.use("/", checkinsRoutes);
app.use("/", aiUsageRoutes);
app.use("/", dietsRoutes);
app.use("/", mealsRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "NutriSmartCoach backend activo",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "nutrismartcoach-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
