import "dotenv/config";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import checkinsRoutes from "./routes/checkins.routes.js";
import dietsRoutes from "./routes/diets.routes.js";
import mealsRoutes from "./routes/meals.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use("/", checkinsRoutes);
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
  });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
