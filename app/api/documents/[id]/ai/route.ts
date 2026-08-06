import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { documentPaths, validateDocumentId } from "@/lib/document-storage";
import { reviewDocumentWithOpenAI, verifiedReview } from "@/lib/openai-review";

export const runtime = "nodejs";

const apiMessages = {
  ko: { question:"질문은 1~1000자로 입력해 주세요.",empty:"문서에서 분석할 본문을 찾지 못했습니다.",missing:".env.local에 OPENAI_API_KEY를 추가해 주세요.",limit:"OpenAI API 사용 한도 또는 결제 상태를 확인해 주세요.",key:"OpenAI API 키가 올바르지 않습니다.",failed:"OpenAI 문서 분석 중 오류가 발생했습니다." },
  en: { question:"Enter a question between 1 and 1,000 characters.",empty:"No document text was found to analyze.",missing:"Add OPENAI_API_KEY to .env.local.",limit:"Check the OpenAI API usage limit or billing status.",key:"The OpenAI API key is invalid.",failed:"An error occurred during OpenAI document analysis." },
  zh: { question:"请输入 1 至 1000 个字符的问题。",empty:"未找到可分析的文档正文。",missing:"请在 .env.local 中添加 OPENAI_API_KEY。",limit:"请检查 OpenAI API 使用限额或结算状态。",key:"OpenAI API 密钥无效。",failed:"OpenAI 文档分析时发生错误。" },
  ja: { question:"質問は1～1000文字で入力してください。",empty:"分析できる文書本文が見つかりませんでした。",missing:".env.localにOPENAI_API_KEYを追加してください。",limit:"OpenAI APIの利用上限または支払い状況を確認してください。",key:"OpenAI APIキーが正しくありません。",failed:"OpenAI文書分析中にエラーが発生しました。" },
  vi: { question:"Nhập câu hỏi từ 1 đến 1.000 ký tự.",empty:"Không tìm thấy nội dung tài liệu để phân tích.",missing:"Thêm OPENAI_API_KEY vào .env.local.",limit:"Kiểm tra hạn mức sử dụng hoặc trạng thái thanh toán OpenAI API.",key:"Khóa OpenAI API không hợp lệ.",failed:"Đã xảy ra lỗi khi OpenAI phân tích tài liệu." },
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validateDocumentId(id)) return NextResponse.json({ error: "잘못된 문서 ID입니다." }, { status: 400 });
  const body = await request.json() as { question?: string; documentUrl?: string; mode?: "review" | "question"; locale?: "ko" | "en" | "zh" | "ja" | "vi"; terminologyPreference?: "original_with_explanation" | "translated_with_original" | "original_only" };
  const message = apiMessages[body.locale || "ko"];
  const question = body.question?.trim();
  if (!question || question.length > 1000) return NextResponse.json({ error: message.question }, { status: 400 });

  try {
    let documentBuffer: Buffer;
    if (body.documentUrl) {
      const url = new URL(body.documentUrl);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com")) {
        return NextResponse.json({ error: "허용되지 않은 문서 주소입니다." }, { status: 400 });
      }
      const documentResponse = await fetch(url, { cache: "no-store" });
      if (!documentResponse.ok) throw new Error("DOCUMENT_DOWNLOAD_FAILED");
      documentBuffer = Buffer.from(await documentResponse.arrayBuffer());
    } else {
      const paths = await documentPaths(id);
      documentBuffer = await readFile(paths.file);
    }
    const extracted = await mammoth.extractRawText({ buffer: documentBuffer });
    const documentText = extracted.value.replace(/\n{3,}/g, "\n\n").trim().slice(0, 80000);
    if (!documentText) return NextResponse.json({ error: message.empty }, { status: 422 });
    const result = await reviewDocumentWithOpenAI({ documentText, question, locale: body.locale, terminologyPreference: body.terminologyPreference });
    return NextResponse.json(verifiedReview(result, documentText));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "";
    console.error("OpenAI document review error", errorMessage);
    if (errorMessage === "OPENAI_API_KEY_MISSING") return NextResponse.json({ error: message.missing }, { status: 503 });
    if (errorMessage.includes("OPENAI_API_ERROR:429")) return NextResponse.json({ error: message.limit }, { status: 429 });
    if (errorMessage.includes("OPENAI_API_ERROR:401")) return NextResponse.json({ error: message.key }, { status: 401 });
    return NextResponse.json({ error: message.failed }, { status: 502 });
  }
}
