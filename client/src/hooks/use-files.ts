import { useMutation } from "@tanstack/react-query";
import { deleteFile, uploadFile } from "@/api/files";
import type { FileKind } from "@/schemas/file.schema";

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: FileKind }) =>
      uploadFile(file, kind),
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
  });
}
