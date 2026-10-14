import { describe, it, expect } from "vitest";
import {
  exportFilterSchema,
  retentionHoldSchema,
  retentionPolicySchema,
  dataProofSchema,
} from "./admin-data";
describe("Administration data forms", () => {
  it("requires an ordered bounded period", () => {
    expect(exportFilterSchema.safeParse({ from: "", to: "" }).success).toBe(
      false,
    );
    expect(
      exportFilterSchema.safeParse({
        from: "2026-10-13T00:00:00Z",
        to: "2026-10-12T00:00:00Z",
      }).success,
    ).toBe(false);
    expect(
      exportFilterSchema.safeParse({
        from: "2025-01-01T00:00:00Z",
        to: "2026-10-12T00:00:00Z",
      }).success,
    ).toBe(false);
    expect(
      exportFilterSchema.safeParse({
        from: "2026-10-13T00:00:00Z",
        to: "2026-10-14T00:00:00Z",
        role: "support",
      }).success,
    ).toBe(true);
  });
  it("keeps minimum conservation and validates exceptions and second factors", () => {
    expect(
      retentionPolicySchema.safeParse({
        auditDays: 1,
        reminderDays: 0,
        exportDays: 0,
      }).success,
    ).toBe(false);
    expect(
      retentionPolicySchema.safeParse({
        auditDays: 365,
        reminderDays: 90,
        exportDays: 7,
      }).success,
    ).toBe(true);
    expect(
      retentionHoldSchema.safeParse({
        resourceType: "audit",
        resourceId: "bad",
        reason: "short",
      }).success,
    ).toBe(false);
    expect(dataProofSchema.safeParse({ password: "", code: "" }).success).toBe(
      false,
    );
  });
});
