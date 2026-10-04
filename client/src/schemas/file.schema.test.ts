import { describe, expect, it } from "vitest";
import { storedFileSchema } from "@/schemas/file.schema";

describe("storedFileSchema", () => {
  it("parse une réponse d’upload", () => {
    const result = storedFileSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      key: "task-image/user/2026/abc.jpg",
      url: "http://localhost:9000/my-daily-page/task-image/user/2026/abc.jpg",
      contentType: "image/jpeg",
      size: 1200,
      originalName: "photo.jpg",
      kind: "task-image",
      createdAt: "2026-09-28T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});
