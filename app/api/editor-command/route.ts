import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { validateDocumentId } from "@/lib/document-storage";

export const runtime = "nodejs";

const commandDirectory = path.join(process.cwd(), "data", "editor-commands");
const commandPath = path.join(commandDirectory, "pending.json");
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

type EditorCommand = {
  id: string;
  documentId: string;
  action: "navigate" | "comment";
  quote: string;
  feedback?: string;
};

export async function POST(request: Request) {
  const body = await request.json() as Partial<EditorCommand>;
  const quote = body.quote?.trim();
  const feedback = body.feedback?.trim();
  if (!body.documentId || !validateDocumentId(body.documentId)) return NextResponse.json({ error: "잘못된 문서입니다." }, { status: 400 });
  if (body.action !== "navigate" && body.action !== "comment") return NextResponse.json({ error: "잘못된 명령입니다." }, { status: 400 });
  if (!quote || quote.length > 2000) return NextResponse.json({ error: "문장 길이를 확인해 주세요." }, { status: 400 });
  if (body.action === "comment" && (!feedback || feedback.length > 5000)) return NextResponse.json({ error: "댓글 내용을 확인해 주세요." }, { status: 400 });

  const command: EditorCommand = {
    id: crypto.randomUUID(),
    documentId: body.documentId,
    action: body.action,
    quote,
    feedback,
  };
  await mkdir(commandDirectory, { recursive: true });
  await writeFile(commandPath, JSON.stringify(command), "utf8");
  return NextResponse.json({ queued: true, id: command.id });
}

export async function GET() {
  try {
    const command = await readFile(commandPath, "utf8");
    await unlink(commandPath).catch(() => undefined);
    return new NextResponse(command, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
