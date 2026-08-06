"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { programs } from "@/lib/programs";
import { auth } from "@/lib/firebase";
import { loadResearcherProfile, ResearcherProfile } from "@/lib/researcher-profile";
import { localizeMatchReason, matchProgram } from "@/lib/program-matching";
import { researchFieldOptions } from "@/lib/profile-options";
import { useProgramTranslations } from "./use-program-translations";
import { StatusPill } from "./status-pill";
import { useLocale } from "./locale-provider";

export function RdBrowser() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all");
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const { locale, t } = useLocale();
  const translations = useProgramTranslations(programs, locale);
  const allLabel = { ko:"전체",en:"All",zh:"全部",ja:"すべて",vi:"Tất cả" }[locale];
  useEffect(() => onAuthStateChanged(auth, async (user) => { setProfile(user ? await loadResearcherProfile(user.uid) : null); }), []);
  const visible = useMemo(() => programs
    .map((program) => ({ program, match: matchProgram(program, profile) }))
    .filter(({ program }) => { const translated = translations[program.id]; return (field === "all" || program.fieldCodes.includes(field)) && `${program.title} ${program.agency} ${program.ministry} ${translated?.title || ""} ${translated?.agency || ""}`.toLowerCase().includes(query.toLowerCase()); })
    .sort((a, b) => b.match.score - a.match.score), [field, query, profile, translations]);

  return (
    <div className="rd-layout">
      <aside className="filter-card">
        <span className="section-label">FILTER</span><h2>{t("filter")}</h2>
        <label>{t("keyword")}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("keyword")} /></label>
        <fieldset><legend>{t("field")}</legend><button type="button" className={field === "all" ? "selected" : ""} onClick={() => setField("all")}>{allLabel}</button>{researchFieldOptions.map((item) => <button type="button" className={field === item.value ? "selected" : ""} onClick={() => setField(item.value)} key={item.value}>{item.labels[locale]}</button>)}</fieldset>
        <div className="filter-note"><b>{profile ? t("profileMatch") : t("profile")}</b><p>{profile ? `${researchFieldOptions.find((item) => item.value === profile.researchField)?.labels[locale] || profile.researchField} · ${profile.specialty}` : t("profileDescription")}</p></div>
      </aside>
      <section className="program-list">
        <div className="list-heading"><div><span className="section-label">OPPORTUNITIES</span><h1>{t("notices")}</h1></div><p>{visible.length}</p></div>
        {visible.map(({ program, match }) => (
          <article className="program-row" key={program.id}>
            <div className="match-score"><strong>{profile ? match.score : "—"}</strong><span>{profile ? `% ${t("profileMatch")}` : t("profile")}</span></div>
            <div><StatusPill tone="soft">{researchFieldOptions.find((item) => item.value === program.fieldCodes[0])?.labels[locale] || program.fieldCodes[0]}</StatusPill><h3>{translations[program.id]?.title || program.title}</h3>{locale !== "ko" && translations[program.id] && <small>{program.title}</small>}<p>{translations[program.id]?.agency || program.agency} · {match.reasons.slice(0, 3).map((reason) => localizeMatchReason(reason, locale)).join(" · ")}</p></div>
            <div className="program-action"><b>{program.status} · {program.deadline}</b><Link href={`/rd/${program.id}`}>{t("details")} →</Link></div>
          </article>
        ))}
        {!visible.length && <div className="empty-card">조건에 맞는 사업이 없습니다.</div>}
      </section>
    </div>
  );
}
