import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL("../../supabase/migrations/010_normalize_trial_source.sql", import.meta.url),
  "utf8"
);

describe("trial source migration", () => {
  it("uses to_regclass as the table existence guard", () => {
    expect(migrationSql).toContain("to_regclass('public.subscription_acquisitions')");
    expect(migrationSql).not.toContain("::regclass");
  });

  it("normalizes legacy influencer_code rows and keeps the allowed values list", () => {
    expect(migrationSql).toContain("where trial_source = 'influencer_code'");
    expect(migrationSql).toContain(
      "check (trial_source in ('none', 'standard_trial', 'influencer_trial'))"
    );
  });
});
