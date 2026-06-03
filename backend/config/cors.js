const localOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

const productionOrigins = [
  "https://www.nutrismartcoach.com",
  "https://nutrismartcoach.com",
];

export const allowedOrigins = [
  ...new Set([
    ...localOrigins,
    ...productionOrigins,
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.CORS_ORIGINS),
  ]),
];

export const corsOptions = {
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
  optionsSuccessStatus: 204,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS no permitido: ${origin}`));
  },
};

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}
