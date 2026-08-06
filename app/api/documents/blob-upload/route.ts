import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const docxType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob 저장소가 연결되지 않았습니다." }, { status: 503 });
  }

  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^documents\/[a-f0-9-]{36}\/.+\.docx$/i.test(pathname)) {
          throw new Error("DOCX 파일 경로가 올바르지 않습니다.");
        }
        return {
          allowedContentTypes: [docxType, "application/octet-stream"],
          maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Vercel Blob upload error", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "DOCX 업로드에 실패했습니다." }, { status: 400 });
  }
}
