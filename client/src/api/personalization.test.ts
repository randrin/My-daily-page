import { apiClient } from "./client";
import { describe, it, expect, vi } from "vitest";
import {
  defaultValues,
  defaultsSchema,
  inviteSchema,
  personalizationApi,
} from "./personalization";
describe("Personalization forms", () => {
  it("accepts defaults and rejects out-of-range values", () => {
    expect(defaultsSchema.safeParse(defaultValues).success).toBe(true);
    expect(
      defaultsSchema.safeParse({ ...defaultValues, reminderLeadMinutes: -1 })
        .success,
    ).toBe(false);
    expect(
      defaultsSchema.safeParse({ ...defaultValues, reminderLeadMinutes: 10081 })
        .success,
    ).toBe(false);
    expect(
      defaultsSchema.safeParse({
        ...defaultValues,
        categoryId: "foreign-not-uuid",
      }).success,
    ).toBe(false);
  });
  it("requires consent and normalizes the recipient email", () => {
    expect(
      inviteSchema.safeParse({
        email: "person@example.invalid",
        consent: false,
      }).success,
    ).toBe(false);
    expect(
      inviteSchema.parse({ email: " Person@Example.invalid ", consent: true })
        .email,
    ).toBe("person@example.invalid");
  });
  it("keeps invitation secrets in request bodies rather than API URLs", async () => {
    const token = "a".repeat(64);
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Compte de test",
          expiresAt: "2026-10-20T00:00:00Z",
        },
      });
    try {
      await personalizationApi.invitation(token);
      await personalizationApi.respond(token, true);
      expect(post).toHaveBeenNthCalledWith(
        1,
        "/personalization/invitation/inspect",
        { token },
      );
      expect(post).toHaveBeenNthCalledWith(
        2,
        "/personalization/invitation/accept",
        { token, consent: true },
      );
    } finally {
      post.mockRestore();
    }
  });
});
