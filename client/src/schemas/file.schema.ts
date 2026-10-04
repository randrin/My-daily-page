import { z } from "zod";

export const FILE_KINDS = ["task-image"] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const storedFileSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  url: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  originalName: z.string(),
  kind: z.enum(FILE_KINDS),
  createdAt: z.coerce.date().optional(),
});

export type StoredFile = z.infer<typeof storedFileSchema>;
