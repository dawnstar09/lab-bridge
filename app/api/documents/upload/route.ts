import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { saveDocument } from "@/lib/document-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["docx", "hwp", "hwpx"].includes(extension)) return NextResponse.json({ error: "DOCX, HWP, HWPX 파일만 지원합니다." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "파일 크기는 20MB 이하여야 합니다." }, { status: 413 });

  const id = randomUUID();
  const safeName = file.name.replace(/[\r\n"\\/]/g, "_").slice(0, 180);
  const uploadedBytes = new Uint8Array(await file.arrayBuffer());
  if (extension === "docx") {
    await saveDocument(id, uploadedBytes, safeName);
    return NextResponse.json({ id, name: safeName });
  }

  const importsDirectory = path.join(process.cwd(), "data", "imports");
  await mkdir(importsDirectory, { recursive: true });
  const importName = `${id}.${extension}`;
  const importPath = path.join(importsDirectory, importName);
  await writeFile(importPath, uploadedBytes);

  try {
    const host = request.headers.get("host") || "localhost:3000";
    const port = host.split(":").pop() || "3000";
    const conversionResponse = await fetch(`http://localhost:8080/converter?shardkey=${id}`, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        async: false,
        filetype: extension,
        key: id,
        outputtype: "docx",
        title: safeName.replace(/\.(hwp|hwpx)$/i, ".docx"),
        url: `http://host.docker.internal:${port}/api/imports/${importName}`,
      }),
    });
    const conversion = await conversionResponse.json() as { endConvert?: boolean; fileUrl?: string; error?: number };
    if (!conversionResponse.ok || !conversion.endConvert || !conversion.fileUrl) throw new Error(`변환 오류 ${conversion.error || conversionResponse.status}`);
    const convertedResponse = await fetch(conversion.fileUrl);
    if (!convertedResponse.ok) throw new Error("변환된 파일을 가져오지 못했습니다.");
    const convertedName = safeName.replace(/\.(hwp|hwpx)$/i, ".docx");
    await saveDocument(id, new Uint8Array(await convertedResponse.arrayBuffer()), convertedName);
    return NextResponse.json({ id, name: convertedName, convertedFrom: extension });
  } catch (error) {
    console.error("HWP conversion error", error);
    return NextResponse.json({ error: "한글 파일을 DOCX로 변환하지 못했습니다. DOCX로 저장한 뒤 다시 시도해 주세요." }, { status: 422 });
  } finally {
    await unlink(importPath).catch(() => undefined);
  }
}
