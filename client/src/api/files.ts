import { apiClient } from "@/api/client";
import {
  storedFileSchema,
  type FileKind,
  type StoredFile,
} from "@/schemas/file.schema";

export async function uploadFile(
  file: File,
  kind: FileKind,
): Promise<StoredFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const { data } = await apiClient.post("/files", form, { timeout: 60_000 });
  return storedFileSchema.parse(data);
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}
