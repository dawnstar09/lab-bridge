import { NextResponse } from "next/server";
import { signOnlyOfficeConfig } from "@/lib/onlyoffice-jwt";
import { validateDocumentId } from "@/lib/document-storage";

export const runtime = "nodejs";

type ConfigRequest = { name?: string; url?: string; pathname?: string; locale?: string };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: "잘못된 문서 ID입니다." }, { status: 400 });
  const secret = process.env.ONLYOFFICE_JWT_SECRET;
  if (!secret) return NextResponse.json({ error: "ONLYOFFICE_JWT_SECRET 환경 변수가 필요합니다." }, { status: 503 });

  const body = await request.json() as ConfigRequest;
  if (!body.name || !body.url) return NextResponse.json({ error: "문서 정보가 부족합니다." }, { status: 400 });
  const documentUrl = new URL(body.url);
  if (documentUrl.protocol !== "https:" || !documentUrl.hostname.endsWith(".public.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "허용되지 않은 문서 주소입니다." }, { status: 400 });
  }
  if (body.pathname && !new RegExp(`^documents/${id}/.+\\.docx$`, "i").test(body.pathname)) {
    return NextResponse.json({ error: "잘못된 Blob 경로입니다." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const callbackQuery = body.pathname ? `?pathname=${encodeURIComponent(body.pathname)}` : "";
  const config: Record<string, unknown> = {
    documentType: "word",
    type: "desktop",
    width: "100%",
    height: "100%",
    document: {
      fileType: "docx",
      key: id,
      title: body.name.slice(0, 180),
      url: body.url,
      permissions: { comment: true, download: true, edit: true, print: true },
    },
    editorConfig: {
      callbackUrl: `${origin}/api/documents/${id}/callback${callbackQuery}`,
      lang: ["ko", "en", "zh", "ja", "vi"].includes(body.locale || "") ? body.locale : "ko",
      mode: "edit",
      user: { id: "labbridge-user", name: "Lab-BridGE 연구자" },
      customization: { autosave: true, compactHeader: false, forcesave: true },
    },
  };
  return NextResponse.json({ ...config, token: signOnlyOfficeConfig(config, secret) });
}
