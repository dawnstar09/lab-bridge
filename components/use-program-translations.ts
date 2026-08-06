"use client";

import { useEffect, useMemo, useState } from "react";
import type { Program } from "@/lib/programs";
import type { Locale } from "./locale-provider";

export type ProgramTranslation = { id:string; title:string; ministry:string; agency:string; programName:string };

const CACHE_VERSION = "v2";
const BATCH_SIZE = 8;

export function useProgramTranslations(programs: Program[], locale: Locale) {
  const idsKey = programs.map((program) => program.id).join(",");
  const ids = useMemo(() => idsKey ? idsKey.split(",") : [], [idsKey]);
  const key = `labbridge-program-translations-${CACHE_VERSION}-${locale}`;
  const [translations, setTranslations] = useState<Record<string, ProgramTranslation>>({});
  useEffect(() => {
    if (locale === "ko") { setTranslations({}); return; }
    setTranslations({});
    let cached: ProgramTranslation[] = [];
    try {
      cached = JSON.parse(localStorage.getItem(key) || "[]") as ProgramTranslation[];
      setTranslations(Object.fromEntries(cached.map((item) => [item.id,item])));
    } catch { localStorage.removeItem(key); }
    const missingIds = ids.filter((id) => !cached.some((item) => item.id === id));
    if (!missingIds.length) return;
    const controller = new AbortController();
    const batches = Array.from({ length: Math.ceil(missingIds.length / BATCH_SIZE) }, (_, index) =>
      missingIds.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE),
    );
    void Promise.all(batches.map(async (batch) => {
      const response = await fetch("/api/programs/translate", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale,ids:batch}),signal:controller.signal });
      if (!response.ok) throw new Error("PROGRAM_TRANSLATION_FAILED");
      return (await response.json() as {items:ProgramTranslation[]}).items;
    })).then((items) => {
      const merged = [...cached, ...items.flat()].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      localStorage.setItem(key, JSON.stringify(merged));
      setTranslations(Object.fromEntries(merged.map((item) => [item.id,item])));
    }).catch(() => undefined);
    return () => controller.abort();
  }, [idsKey, key, locale]);
  return translations;
}

export function programText(value: string, translated: string | undefined, locale: Locale, loadingLabel = "Translating…") {
  if (locale === "ko") return value;
  return translated?.trim() || loadingLabel;
}

export function programStatus(status: string, locale: Locale) {
  const statusKey = status.includes("마감") ? "closed" : status.includes("진행") || status.includes("접수") ? "open" : "notice";
  return {
    ko: { closed:"마감", open:"접수 중", notice:"공고" },
    en: { closed:"Closed", open:"Open", notice:"Notice" },
    zh: { closed:"已截止", open:"申请中", notice:"公告" },
    ja: { closed:"締切", open:"受付中", notice:"公募" },
    vi: { closed:"Đã đóng", open:"Đang nhận hồ sơ", notice:"Thông báo" },
  }[locale][statusKey];
}

export function programDataValue(value: string, locale: Locale) {
  if (!value || value === "-") return "—";
  if (value.includes("과제별 상이")) return { ko:"과제별 상이", en:"Varies by project", zh:"因项目而异", ja:"課題ごとに異なる", vi:"Khác nhau theo dự án" }[locale];
  return value;
}
