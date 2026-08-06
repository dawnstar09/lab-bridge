import { NextResponse } from "next/server";
import { validateDocumentId } from "@/lib/document-storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: "잘못된 문서 ID입니다." }, { status: 400 });
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    name: "Lab-BridGE Editor Bridge",
    guid: "asc.{A6843506-4E9A-4B1C-8D53-4E4E44C315E2}",
    version: "1.1.0",
    variations: [{
      description: "Lab-BridGE AI 피드백을 문서에 연결합니다.",
      url: `${origin}/api/documents/${id}/plugin`,
      icons: [],
      isViewer: false,
      EditorsSupport: ["word"],
      isVisual: false,
      isModal: false,
      isInsideMode: false,
      isSystem: true,
      type: "background",
      initDataType: "none",
      buttons: [],
    }],
  }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
}
