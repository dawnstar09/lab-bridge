import { NextResponse } from "next/server";
import { validateDocumentId } from "@/lib/document-storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return new NextResponse("Invalid document", { status: 400 });
  const origin = new URL(request.url).origin;
  const documentServer = (process.env.NEXT_PUBLIC_ONLYOFFICE_URL || "").replace(/\/$/, "");
  if (!documentServer.startsWith("https://")) return new NextResponse("Document server is not configured", { status: 503 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><script src="${documentServer}/sdkjs-plugins/v1/plugins.js"></script><script>window.LABBRIDGE_PLUGIN={apiBase:${JSON.stringify(origin)},documentId:${JSON.stringify(id)}};</script><script defer src="${origin}/onlyoffice-plugins/labbridge-bridge/plugin.js?v=1.1.3"></script></head><body></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
}
