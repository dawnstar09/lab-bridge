import { writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { documentPaths, validateDocumentId } from "@/lib/document-storage";
import { verifyOnlyOfficeToken } from "@/lib/onlyoffice-jwt";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: 1 });

  const secret = process.env.ONLYOFFICE_JWT_SECRET;
  if (secret) {
    const headerName = process.env.ONLYOFFICE_JWT_HEADER || "Authorization";
    const token = request.headers.get(headerName);
    if (!token || !verifyOnlyOfficeToken(token, secret)) return NextResponse.json({ error: 1 }, { status: 401 });
  }

  const body = await request.json() as { status?: number; url?: string };
  if ((body.status === 2 || body.status === 6) && body.url) {
    try {
      const response = await fetch(body.url);
      if (!response.ok) throw new Error("OnlyOffice 저장 파일 다운로드 실패");
      const bytes = Buffer.from(await response.arrayBuffer());
      const pathname = new URL(request.url).searchParams.get("pathname");
      if (pathname && process.env.BLOB_READ_WRITE_TOKEN) {
        if (!new RegExp(`^documents/${id}/.+\\.docx$`, "i").test(pathname)) throw new Error("잘못된 Blob 경로");
        await put(pathname, bytes, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControlMaxAge: 60,
        });
      } else {
        const paths = await documentPaths(id);
        await writeFile(paths.file, bytes);
      }
    } catch {
      return NextResponse.json({ error: 1 });
    }
  }
  return NextResponse.json({ error: 0 });
}
