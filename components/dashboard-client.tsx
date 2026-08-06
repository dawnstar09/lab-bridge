"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FundingProject, loadFundingProjects, loadResearcherProfile, ResearcherProfile, saveResearcherProfile } from "@/lib/researcher-profile";
import { SiteHeader } from "./site-header";
import { countryOptions, TerminologyPreference, useLocale } from "./locale-provider";
import { SearchableSelect } from "./searchable-select";
import { careerStageOptions, institutionOptions, researchFieldOptions, specialtyOptions } from "@/lib/profile-options";
import { programs } from "@/lib/programs";
import { matchProgram } from "@/lib/program-matching";
import { useProgramTranslations } from "./use-program-translations";

const activityCopy = {
  ko:{detail:"활동 상세",requestedAt:"요청일",target:"요청 대상",createdAt:"등록일",amount:"목표 금액",description:"프로젝트 설명",files:"첨부파일",download:"다운로드",noFiles:"첨부파일 없음"},
  en:{detail:"Activity details",requestedAt:"Requested",target:"Recipient",createdAt:"Created",amount:"Target amount",description:"Project description",files:"Attachments",download:"Download",noFiles:"No attachments"},
  zh:{detail:"活动详情",requestedAt:"请求日期",target:"请求对象",createdAt:"注册日期",amount:"目标金额",description:"项目说明",files:"附件",download:"下载",noFiles:"无附件"},
  ja:{detail:"活動詳細",requestedAt:"依頼日",target:"依頼先",createdAt:"登録日",amount:"目標金額",description:"プロジェクト説明",files:"添付ファイル",download:"ダウンロード",noFiles:"添付ファイルなし"},
  vi:{detail:"Chi tiết hoạt động",requestedAt:"Ngày yêu cầu",target:"Người nhận",createdAt:"Ngày đăng",amount:"Số tiền mục tiêu",description:"Mô tả dự án",files:"Tệp đính kèm",download:"Tải xuống",noFiles:"Không có tệp"},
};

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [addingAchievement, setAddingAchievement] = useState(false);
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [ownProjects, setOwnProjects] = useState<FundingProject[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<{ type:"meeting"; title:string; createdAt:string } | { type:"project"; project:FundingProject } | null>(null);
  const { country, locale, terminologyPreference, setCountry, setLocale, setTerminologyPreference, t } = useLocale();
  const activityUi = activityCopy[locale];
  const programTranslations = useProgramTranslations(programs, locale);

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) { router.replace("/login"); return; }
    setUser(currentUser);
    try {
      const loaded = await loadResearcherProfile(currentUser.uid);
      setProfile(loaded);
      void loadFundingProjects().then((items) => setOwnProjects(items.filter((item) => item.authorId === currentUser.uid))).catch(() => setOwnProjects([]));
      setAchievements(loaded?.publications || []);
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
  async function addAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (title && profile && user) {
      const publications = [...achievements, title];
      await saveResearcherProfile(user.uid, { ...profile, publications });
      setProfile({ ...profile, publications });
      setAchievements(publications);
    }
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
      publications: profile?.publications || [],
      savedProgramIds: profile?.savedProgramIds || [],
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
  const savedPrograms = programs.filter((program) => profile?.savedProgramIds.includes(program.id));

  return (
    <main className="site-page">
      <SiteHeader />
      <section className="mypage">
        <div className="profile-heading"><div><span className="section-label">MY RESEARCH</span><h1>{profile?.fullName || user?.displayName || t("profile")},<br />{t("hello")}</h1><p>{user?.email}</p></div><button onClick={handleSignOut}>{t("logout")}</button></div>
        {profileMessage && <div className="action-notice" role="status">{profileMessage}<button onClick={() => setProfileMessage("")}>{t("close")}</button></div>}
        <div className="profile-grid">
          <section className="profile-card full researcher-profile"><div className="card-heading"><div><h2>{t("profile")}</h2><p>{t("profileUse")}</p></div><button onClick={() => setEditingProfile((value) => !value)}>{editingProfile ? t("cancel") : t("editProfile")}</button></div>{editingProfile ? <form className="profile-edit-form" onSubmit={updateResearchProfile}><label>{t("country")}<select value={country} onChange={(event) => setCountry(event.target.value)}>{countryOptions.map((item) => <option value={item.code} key={item.code}>{item.label}</option>)}</select></label><label>{t("name")}<input name="fullName" required defaultValue={profile?.fullName || user?.displayName || ""} /></label><label>{t("organization")}<SearchableSelect name="organization" options={institutionOptions} value={profile?.organization || ""} placeholder={t("organization")} required /></label><label>{t("field")}<SearchableSelect name="researchField" options={researchFieldOptions} value={profile?.researchField || ""} placeholder={t("field")} required /></label><label>{t("specialty")}<SearchableSelect name="specialty" options={specialtyOptions} value={profile?.specialty || ""} placeholder={t("specialty")} required /></label><label>{t("career")}<SearchableSelect name="careerStage" options={careerStageOptions} value={profile?.careerStage || ""} placeholder={t("career")} required /></label><label>ORCID<input name="orcid" defaultValue={profile?.orcid || ""} /></label><label>{t("terminology")}<select value={terminologyPreference} onChange={(event) => setTerminologyPreference(event.target.value as TerminologyPreference)}><option value="original_with_explanation">{t("termOriginalExplanation")}</option><option value="translated_with_original">{t("termTranslationFirst")}</option><option value="original_only">{t("termOriginalOnly")}</option></select></label><label className="full">{t("interests")}<textarea name="interests" required defaultValue={profile?.interests || ""} /></label><button type="submit">{t("save")}</button></form> : <dl className="research-profile-data"><div><dt>{t("country")}</dt><dd>{countryOptions.find((item) => item.code === profile?.country)?.label || t("notEntered")}</dd></div><div><dt>{t("organization")}</dt><dd>{institutionOptions.find((item) => item.value === profile?.organization)?.labels[locale] || profile?.organization || t("notEntered")}</dd></div><div><dt>{t("field")}</dt><dd>{researchFieldOptions.find((item) => item.value === profile?.researchField)?.labels[locale] || profile?.researchField || t("notEntered")}</dd></div><div><dt>{t("specialty")}</dt><dd>{specialtyOptions.find((item) => item.value === profile?.specialty)?.labels[locale] || profile?.specialty || t("notEntered")}</dd></div><div><dt>{t("career")}</dt><dd>{careerStageOptions.find((item) => item.value === profile?.careerStage)?.labels[locale] || profile?.careerStage || t("notEntered")}</dd></div><div><dt>{t("interests")}</dt><dd>{profile?.interests || t("notEntered")}</dd></div><div><dt>ORCID</dt><dd>{profile?.orcid || t("notEntered")}</dd></div></dl>}</section>
          <section className="profile-card wide"><div className="card-heading"><div><h2>{t("publications")}</h2><p>{t("achievementHelp")}</p></div><button onClick={() => setAddingAchievement((value) => !value)}>{addingAchievement ? t("cancel") : t("addAchievement")}</button></div>{addingAchievement && <form className="achievement-form" onSubmit={addAchievement}><input name="title" required placeholder={t("achievementPlaceholder")} /><button type="submit">{t("add")}</button></form>}{achievements.length ? <ol className="achievement-list">{achievements.map((item, index) => <li key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></li>)}</ol> : <p>{t("noPublications")}</p>}</section>
          <section className="profile-card"><div className="card-heading"><div><h2>{t("researchActivity")}</h2><p>{t("researchActivityHelp")}</p></div><Link href="/network">{t("networkTitle")} →</Link></div><div className="activity-list">{profile?.meetingRequests?.map((request) => <button type="button" key={request.id} onClick={() => setSelectedActivity({ type:"meeting", title:request.researcher, createdAt:request.createdAt })}><span>{t("meetingRequestLabel")}</span><strong>{request.researcher}</strong><i>→</i></button>)}{profile?.fundingProjects?.map((project) => <button type="button" key={project.id} onClick={() => { const fullProject=ownProjects.find((item) => item.id === project.id) || { ...project, authorId:user?.uid || "", authorName:profile?.fullName || user?.displayName || user?.email || "Researcher", authorOrganization:profile?.organization || "", files:[] }; setSelectedActivity({ type:"project", project:fullProject }); }}><span>{t("fundingProjectLabel")}</span><strong>{project.title}</strong><i>→</i></button>)}</div>{!profile?.meetingRequests?.length && !profile?.fundingProjects?.length && <p>{t("noResearchActivity")}</p>}</section>
          <section className="profile-card full"><div className="card-heading"><div><h2>{t("savedPrograms")}</h2><p>{t("savedProgramsHelp")}</p></div><Link href="/rd">{t("viewAll")} →</Link></div>{savedPrograms.length ? savedPrograms.map((program) => <div className="recommendation-row" key={program.id}><div><b>{program.status}</b><span>{program.deadline}</span></div><h3>{programTranslations[program.id]?.title || program.title}</h3><Link href={`/rd/${program.id}`}>{t("check")} →</Link></div>) : <p>{t("noSavedPrograms")}</p>}</section>
          <section className="profile-card full"><div className="card-heading"><div><h2>{t("recommendedPrograms")}</h2><p>{t("recommendationHelp")}</p></div><Link href="/rd">{t("viewAll")} →</Link></div>{topRecommendation && <div className="recommendation-row"><div><b>{topRecommendation.match.score}%</b><span>{t("profileMatch")}</span></div><h3>{programTranslations[topRecommendation.program.id]?.title || topRecommendation.program.title}</h3><Link href={`/rd/${topRecommendation.program.id}`}>{t("check")} →</Link></div>}</section>
        </div>
      </section>
      {selectedActivity && <div className="modal-backdrop" onMouseDown={(event) => { if(event.target===event.currentTarget)setSelectedActivity(null); }}><section className="form-modal project-detail-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label={t("close")} onClick={() => setSelectedActivity(null)}>×</button><span className="section-label">{activityUi.detail}</span>{selectedActivity.type === "meeting" ? <><h2>{t("meetingRequestLabel")}</h2><dl><div><dt>{activityUi.target}</dt><dd>{selectedActivity.title}</dd></div><div><dt>{activityUi.requestedAt}</dt><dd>{new Intl.DateTimeFormat(locale,{dateStyle:"long",timeStyle:"short"}).format(new Date(selectedActivity.createdAt))}</dd></div></dl></> : <><h2>{selectedActivity.project.title}</h2><div className="project-author"><b>{t("profile")}</b><span>{selectedActivity.project.authorName}</span>{selectedActivity.project.authorOrganization && <small>{selectedActivity.project.authorOrganization}</small>}</div><p className="project-description">{selectedActivity.project.description}</p><dl><div><dt>{activityUi.amount}</dt><dd>{new Intl.NumberFormat(locale).format(selectedActivity.project.amount)} KRW</dd></div><div><dt>{activityUi.createdAt}</dt><dd>{new Intl.DateTimeFormat(locale,{dateStyle:"long"}).format(new Date(selectedActivity.project.createdAt))}</dd></div></dl><div className="project-files"><b>{activityUi.files}</b>{selectedActivity.project.files?.length ? selectedActivity.project.files.map((file) => <a href={file.url} target="_blank" rel="noreferrer" download key={file.pathname}><span>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span><strong>{activityUi.download} ↓</strong></a>) : <p>{activityUi.noFiles}</p>}</div></>}</section></div>}
    </main>
  );
}
