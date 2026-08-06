import { del, get, list, put } from "@vercel/blob";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { validateDocumentId } from "@/lib/document-storage";

export const runtime = "nodejs";

const commandDirectory = path.join(process.cwd(), "data", "editor-commands");
const allowedOrigin = (process.env.NEXT_PUBLIC_ONLYOFFICE_URL || "http://localhost:8080").replace(/\/$/, "");
const corsHeaders = { "Access-Control-Allow-Origin": allowedOrigin, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };
type EditorCommand = { id:string; documentId:string; action:"navigate"|"comment"; quote:string; feedback?:string };
const commandPrefix = (id: string) => `editor-commands/${id}/`;
const commandPath = (documentId: string, commandId: string) => `${commandPrefix(documentId)}${Date.now()}-${commandId}.json`;
const localDirectory = (id: string) => path.join(commandDirectory, id);

export async function POST(request: Request) {
  const body = await request.json() as Partial<EditorCommand>;
  const quote=body.quote?.trim(); const feedback=body.feedback?.trim();
  if (!body.documentId || !validateDocumentId(body.documentId)) return NextResponse.json({error:"잘못된 문서입니다."},{status:400});
  if (body.action!=="navigate" && body.action!=="comment") return NextResponse.json({error:"잘못된 명령입니다."},{status:400});
  if (!quote || quote.length>2000) return NextResponse.json({error:"문장 길이를 확인해 주세요."},{status:400});
  if (body.action==="comment" && (!feedback || feedback.length>5000)) return NextResponse.json({error:"댓글 내용을 확인해 주세요."},{status:400});
  const command:EditorCommand={id:crypto.randomUUID(),documentId:body.documentId,action:body.action,quote,feedback};
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(commandPath(body.documentId,command.id),JSON.stringify(command),{access:"public",addRandomSuffix:false,allowOverwrite:false,contentType:"application/json",cacheControlMaxAge:60});
  } else {
    const directory=localDirectory(body.documentId); await mkdir(directory,{recursive:true}); await writeFile(path.join(directory,`${Date.now()}-${command.id}.json`),JSON.stringify(command),"utf8");
  }
  return NextResponse.json({queued:true,id:command.id});
}

export async function GET(request: Request) {
  const id=new URL(request.url).searchParams.get("documentId") || "";
  if (!validateDocumentId(id)) return NextResponse.json({error:"잘못된 문서입니다."},{status:400,headers:corsHeaders});
  try {
    let command:string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const queued=await list({prefix:commandPrefix(id),limit:20});
      const next=queued.blobs.sort((a,b)=>a.uploadedAt.getTime()-b.uploadedAt.getTime() || a.pathname.localeCompare(b.pathname))[0];
      if (!next) throw new Error("EMPTY");
      const result=await get(next.pathname,{access:"public",useCache:false});
      if (!result || result.statusCode!==200 || !result.stream) throw new Error("EMPTY");
      command=await new Response(result.stream).text(); await del(next.pathname);
    } else {
      const directory=localDirectory(id); const files=(await readdir(directory)).filter((file)=>file.endsWith(".json")).sort();
      if (!files[0]) throw new Error("EMPTY");
      const next=path.join(directory,files[0]); command=await readFile(next,"utf8"); await unlink(next).catch(()=>undefined);
    }
    return new NextResponse(command,{headers:{...corsHeaders,"Content-Type":"application/json"}});
  } catch { return new NextResponse(null,{status:204,headers:corsHeaders}); }
}

export async function OPTIONS(){return new NextResponse(null,{status:204,headers:corsHeaders});}
