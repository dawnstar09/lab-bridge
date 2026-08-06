import { NextResponse } from "next/server";
import { reviewDocumentWithOpenAI, verifiedReview } from "@/lib/openai-review";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8080",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { documentText?: string; selectedText?: string; question?: string };
    const documentText = body.documentText?.trim().slice(0, 80000) || "";
    const selectedText = body.selectedText?.trim().slice(0, 5000) || "";
    const question = body.question?.trim().slice(0, 1000) || "선택 문장의 문제점과 구체적인 개선 방향을 검토해 주세요.";
    if (!documentText || !selectedText) return NextResponse.json({ error: "검토할 문장을 먼저 선택해 주세요." }, { status: 400, headers: corsHeaders });
    const result = await reviewDocumentWithOpenAI({ documentText, selectedText, question });
    return NextResponse.json(verifiedReview(result, documentText), { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("OpenAI selection review error", message);
    const status = message.includes("OPENAI_API_ERROR:429") ? 429 : message.includes("OPENAI_API_ERROR:401") ? 401 : 502;
    const userMessage = status === 429 ? "OpenAI API 사용 한도 또는 결제 상태를 확인해 주세요." : status === 401 ? "OpenAI API 키가 올바르지 않습니다." : "선택 문장 분석에 실패했습니다.";
    return NextResponse.json({ error: userMessage }, { status, headers: corsHeaders });
  }
}
