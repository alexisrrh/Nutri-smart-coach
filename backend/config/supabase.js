import { createClient } from "@supabase/supabase-js";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]?.trim()
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required backend environment variables: ${missingEnvVars.join(", ")}`
  );
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
