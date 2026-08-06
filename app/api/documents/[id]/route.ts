import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { documentPaths, readDocumentMetadata, validateDocumentId } from "@/lib/document-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: "잘못된 문서 ID입니다." }, { status: 400 });
  try {
    const paths = await documentPaths(id);
    const [bytes, metadata] = await Promise.all([readFile(paths.file), readDocumentMetadata(id)]);
    const disposition = request.nextUrl.searchParams.has("download") ? "attachment" : "inline";
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(metadata.name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }
}
