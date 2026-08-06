import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(hwp|hwpx)$/.test(name)) return NextResponse.json({ error: "잘못된 파일입니다." }, { status: 400 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "data", "imports", name));
    return new NextResponse(bytes, { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}
