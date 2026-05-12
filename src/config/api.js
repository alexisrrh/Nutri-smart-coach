export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://nutricoach-backend-frlc.onrender.com"
)
.trim()
.replace(/\/$/, "");