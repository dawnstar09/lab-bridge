import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDirectory = path.join(process.cwd(), "data", "documents");

export function validateDocumentId(id: string) {
  return /^[a-f0-9-]{36}$/.test(id);
}

export async function documentPaths(id: string) {
  await mkdir(storageDirectory, { recursive: true });
  return {
    file: path.join(storageDirectory, `${id}.docx`),
    metadata: path.join(storageDirectory, `${id}.json`),
  };
}

export async function readDocumentMetadata(id: string) {
  const paths = await documentPaths(id);
  return JSON.parse(await readFile(paths.metadata, "utf8")) as { name: string };
}

export async function saveDocument(id: string, bytes: Uint8Array, name: string) {
  const paths = await documentPaths(id);
  await writeFile(paths.file, bytes);
  await writeFile(paths.metadata, JSON.stringify({ name }), "utf8");
}
