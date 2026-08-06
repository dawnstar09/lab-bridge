"use client";

import { useEffect, useMemo, useState } from "react";
import type { Program } from "@/lib/programs";
import type { Locale } from "./locale-provider";

export type ProgramTranslation = { id:string; title:string; ministry:string; agency:string; programName:string };

export function useProgramTranslations(programs: Program[], locale: Locale) {
  const idsKey = programs.map((program) => program.id).join(",");
  const ids = useMemo(() => idsKey ? idsKey.split(",") : [], [idsKey]);
  const key = `labbridge-program-translations-${locale}`;
  const [translations, setTranslations] = useState<Record<string, ProgramTranslation>>({});
  useEffect(() => {
    if (locale === "ko") { setTranslations({}); return; }
    try {
      const cached = JSON.parse(localStorage.getItem(key) || "[]") as ProgramTranslation[];
      if (ids.every((id) => cached.some((item) => item.id === id))) { setTranslations(Object.fromEntries(cached.map((item) => [item.id,item]))); return; }
    } catch { localStorage.removeItem(key); }
    const controller = new AbortController();
    void fetch("/api/programs/translate", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale,ids}),signal:controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data:{items:ProgramTranslation[]}) => { localStorage.setItem(key,JSON.stringify(data.items)); setTranslations(Object.fromEntries(data.items.map((item) => [item.id,item]))); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [idsKey, key, locale]);
  return translations;
}
