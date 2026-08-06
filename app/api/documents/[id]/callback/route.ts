import { writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { documentPaths, validateDocumentId } from "@/lib/document-storage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: 1 });

  const body = await request.json() as { status?: number; url?: string };
  if ((body.status === 2 || body.status === 6) && body.url) {
    try {
      const response = await fetch(body.url);
      if (!response.ok) throw new Error("OnlyOffice 저장 파일 다운로드 실패");
      const paths = await documentPaths(id);
      await writeFile(paths.file, new Uint8Array(await response.arrayBuffer()));
    } catch {
      return NextResponse.json({ error: 1 });
    }
  }
  return NextResponse.json({ error: 0 });
}
