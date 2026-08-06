import { NextResponse } from "next/server";
import { programs } from "@/lib/programs";

export const runtime = "nodejs";

const languages = { en:"English",zh:"Simplified Chinese",ja:"Japanese",vi:"Vietnamese" } as const;

export async function POST(request: Request) {
  const body = await request.json() as { locale?: keyof typeof languages; ids?: string[] };
  if (!body.locale || !languages[body.locale] || !Array.isArray(body.ids)) return NextResponse.json({ error:"INVALID_REQUEST" }, { status:400 });
  const selected = programs.filter((program) => body.ids?.includes(program.id)).slice(0, 10);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error:"OPENAI_API_KEY_MISSING" }, { status:503 });
  const response = await fetch("https://api.openai.com/v1/responses", { method:"POST", headers:{ Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json" }, body:JSON.stringify({
    model:process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input:`Translate every Korean text field in these R&D announcement records into ${languages[body.locale]}. Do not leave Korean text in any output field. Preserve acronyms, years, program identifiers, institution identity, and legal meaning. Transliterate proper names only when no established translated name exists. Use natural research-administration terminology. Return only the schema output.\n${JSON.stringify(selected.map(({id,title,ministry,agency,programName}) => ({id,title,ministry,agency,programName})))}`,
    reasoning:{ effort:"low" }, max_output_tokens:3000,
    text:{ format:{ type:"json_schema",name:"program_translations",strict:true,schema:{ type:"object",additionalProperties:false,properties:{items:{type:"array",items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},title:{type:"string"},ministry:{type:"string"},agency:{type:"string"},programName:{type:"string"}},required:["id","title","ministry","agency","programName"]}}},required:["items"]}}},
  }) });
  const payload = await response.json() as { output?: Array<{content?:Array<{type?:string;text?:string}>}>; error?:{message?:string} };
  if (!response.ok) return NextResponse.json({ error:payload.error?.message || "TRANSLATION_FAILED" }, { status:response.status });
  const text = payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!text) return NextResponse.json({ error:"EMPTY_TRANSLATION" }, { status:502 });
  return NextResponse.json(JSON.parse(text));
}
