import { api } from "./api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) reject(new Error("Failed to read file"));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(file: File): Promise<string> {
  const dataBase64 = await fileToBase64(file);
  const data = await api<{ url: string }>("/uploads", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      dataBase64,
    }),
  });
  return data.url;
}

export async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files);
  return Promise.all(list.map(uploadFile));
}
