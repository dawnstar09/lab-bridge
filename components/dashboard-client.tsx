"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loadResearcherProfile, ResearcherProfile, saveResearcherProfile } from "@/lib/researcher-profile";
import { SiteHeader } from "./site-header";
import { StatusPill } from "./status-pill";
import { countryOptions, TerminologyPreference, useLocale } from "./locale-provider";
import { SearchableSelect } from "./searchable-select";
import { careerStageOptions, institutionOptions, researchFieldOptions, specialtyOptions } from "@/lib/profile-options";
import { programs } from "@/lib/programs";
import { matchProgram } from "@/lib/program-matching";

const initialAchievements = ["다국어 연구행정 지원 시스템 설계", "생성형 AI 기반 문서 분석 모델", "외국인 연구자 사용자 조사", "R&D 공고 추천 알고리즘"];

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [addingAchievement, setAddingAchievement] = useState(false);
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const { country, locale, terminologyPreference, setCountry, setLocale, setTerminologyPreference, t } = useLocale();

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) { router.replace("/login"); return; }
    setUser(currentUser);
    try {
      const loaded = await loadResearcherProfile(currentUser.uid);
      setProfile(loaded);
      if (loaded?.country) setCountry(loaded.country);
      if (loaded?.locale) setLocale(loaded.locale);
      if (loaded?.terminologyPreference) setTerminologyPreference(loaded.terminologyPreference);
    } catch {
      setProfileMessage(t("profileLoadFailed"));
    } finally {
      setChecking(false);
    }
  }), [router]);

  async function handleSignOut() { await signOut(auth); router.replace("/login"); }
  function addAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (title) setAchievements((current) => [...current, title]);
    setAddingAchievement(false);
  }
  async function updateResearchProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    const nextProfile: ResearcherProfile = {
      fullName: String(data.get("fullName") || "").trim(),
      email: user.email || "",
      organization: String(data.get("organization") || "").trim(),
      researchField: String(data.get("researchField") || "").trim(),
      specialty: String(data.get("specialty") || "").trim(),
      careerStage: String(data.get("careerStage") || "").trim(),
      interests: String(data.get("interests") || "").trim(),
      orcid: String(data.get("orcid") || "").trim(),
      country,
      locale,
      terminologyPreference,
    };
    await saveResearcherProfile(user.uid, nextProfile);
    setProfile(nextProfile);
    setEditingProfile(false);
    setProfileMessage(t("profileSaved"));
  }
  if (checking) return <main className="dashboard-loading">{t("authChecking")}</main>;
  const topRecommendation = profile ? programs.map((program) => ({ program, match: matchProgram(program, profile) })).sort((a, b) => b.match.score - a.match.score)[0] : null;

  return (
    <main className="site-page">
      <SiteHeader />
      <section className="mypage">
        <div className="profile-heading"><div><span className="section-label">MY RESEARCH</span><h1>{profile?.fullName || user?.displayName || t("profile")},<br />{t("hello")}</h1><p>{user?.email}</p></div><button onClick={handleSignOut}>{t("logout")}</button></div>
        {profileMessage && <div className="action-notice" role="status">{profileMessage}<button onClick={() => setProfileMessage("")}>{t("close")}</button></div>}
        <div className="profile-grid">
          <section className="profile-card full researcher-profile"><div className="card-heading"><div><h2>{t("profile")}</h2><p>{t("profileUse")}</p></div><button onClick={() => setEditingProfile((value) => !value)}>{editingProfile ? t("cancel") : t("editProfile")}</button></div>{editingProfile ? <form className="profile-edit-form" onSubmit={updateResearchProfile}><label>{t("country")}<select value={country} onChange={(event) => setCountry(event.target.value)}>{countryOptions.map((item) => <option value={item.code} key={item.code}>{item.label}</option>)}</select></label><label>{t("name")}<input name="fullName" required defaultValue={profile?.fullName || user?.displayName || ""} /></label><label>{t("organization")}<SearchableSelect name="organization" options={institutionOptions} value={profile?.organization || ""} placeholder={t("organization")} required /></label><label>{t("field")}<SearchableSelect name="researchField" options={researchFieldOptions} value={profile?.researchField || ""} placeholder={t("field")} required /></label><label>{t("specialty")}<SearchableSelect name="specialty" options={specialtyOptions} value={profile?.specialty || ""} placeholder={t("specialty")} required /></label><label>{t("career")}<SearchableSelect name="careerStage" options={careerStageOptions} value={profile?.careerStage || ""} placeholder={t("career")} required /></label><label>ORCID<input name="orcid" defaultValue={profile?.orcid || ""} /></label><label>{t("terminology")}<select value={terminologyPreference} onChange={(event) => setTerminologyPreference(event.target.value as TerminologyPreference)}><option value="original_with_explanation">{t("termOriginalExplanation")}</option><option value="translated_with_original">{t("termTranslationFirst")}</option><option value="original_only">{t("termOriginalOnly")}</option></select></label><label className="full">{t("interests")}<textarea name="interests" required defaultValue={profile?.interests || ""} /></label><button type="submit">{t("save")}</button></form> : <dl className="research-profile-data"><div><dt>{t("country")}</dt><dd>{countryOptions.find((item) => item.code === profile?.country)?.label || t("notEntered")}</dd></div><div><dt>{t("organization")}</dt><dd>{institutionOptions.find((item) => item.value === profile?.organization)?.labels[locale] || profile?.organization || t("notEntered")}</dd></div><div><dt>{t("field")}</dt><dd>{researchFieldOptions.find((item) => item.value === profile?.researchField)?.labels[locale] || profile?.researchField || t("notEntered")}</dd></div><div><dt>{t("specialty")}</dt><dd>{specialtyOptions.find((item) => item.value === profile?.specialty)?.labels[locale] || profile?.specialty || t("notEntered")}</dd></div><div><dt>{t("career")}</dt><dd>{careerStageOptions.find((item) => item.value === profile?.careerStage)?.labels[locale] || profile?.careerStage || t("notEntered")}</dd></div><div><dt>{t("interests")}</dt><dd>{profile?.interests || t("notEntered")}</dd></div><div><dt>ORCID</dt><dd>{profile?.orcid || t("notEntered")}</dd></div></dl>}</section>
          <section className="profile-card wide"><div className="card-heading"><div><h2>{t("recentAchievements")}</h2><p>{t("achievementHelp")}</p></div><button onClick={() => setAddingAchievement((value) => !value)}>{addingAchievement ? t("cancel") : t("addAchievement")}</button></div>{addingAchievement && <form className="achievement-form" onSubmit={addAchievement}><input name="title" required placeholder={t("achievementPlaceholder")} /><button type="submit">{t("add")}</button></form>}<ol className="achievement-list">{achievements.map((item, index) => <li key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><small>2026</small></li>)}</ol></section>
          <section className="profile-card"><div className="card-heading"><div><h2>{t("collaborationStatus")}</h2><p>{t("activeConnections")}</p></div></div><div className="collaboration-list"><div><StatusPill tone="soft">{t("upcomingMeeting")}</StatusPill><b>KAIST AI Lab</b><small>2026-08-12 14:00</small></div><div><StatusPill tone="line">{t("underReview")}</StatusPill><b>International joint research proposal</b><small>{t("waitingReply")}</small></div></div></section>
          <section className="profile-card full"><div className="card-heading"><div><h2>{t("recommendedPrograms")}</h2><p>{t("recommendationHelp")}</p></div><Link href="/rd">{t("viewAll")} →</Link></div>{topRecommendation && <div className="recommendation-row"><div><b>{topRecommendation.match.score}%</b><span>{t("profileMatch")}</span></div><h3>{topRecommendation.program.title}</h3><Link href={`/rd/${topRecommendation.program.id}`}>{t("check")} →</Link></div>}</section>
        </div>
      </section>
    </main>
  );
}
