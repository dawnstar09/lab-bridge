"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Program } from "@/lib/programs";
import { auth } from "@/lib/firebase";
import { loadResearcherProfile, ResearcherProfile } from "@/lib/researcher-profile";
import { matchProgram } from "@/lib/program-matching";
import { researchFieldOptions } from "@/lib/profile-options";
import { SiteHeader } from "./site-header";
import { StatusPill } from "./status-pill";
import { SaveProgramButton } from "./save-program-button";
import { Locale, useLocale } from "./locale-provider";

const copy: Record<Locale, Record<string,string>> = {
  ko:{back:"사업 목록",match:"프로필 적합도",overview:"공고 정보",period:"접수 기간",amount:"공고 금액",eligibility:"신청 자격",eligibilityUnknown:"제공된 목록에 상세 자격이 없어 원문 확인이 필요합니다.",ministry:"담당 부처",agency:"공고 기관",contact:"문의처",reason:"추천 근거",prepare:"신청 준비하기",prepareText:"원문에서 신청 자격과 제출 서류를 확인한 후 계획서 작성을 시작하세요.",proposal:"계획서 작성",original:"공고 원문 열기"},
  en:{back:"Programs",match:"Profile fit",overview:"Announcement details",period:"Application period",amount:"Announcement amount",eligibility:"Eligibility",eligibilityUnknown:"The supplied list has no detailed eligibility criteria. Check the original announcement.",ministry:"Ministry",agency:"Agency",contact:"Contact",reason:"Match rationale",prepare:"Prepare application",prepareText:"Check eligibility and required documents in the original announcement before writing the proposal.",proposal:"Write proposal",original:"Open original announcement"},
  zh:{back:"项目列表",match:"档案匹配度",overview:"公告信息",period:"申请期间",amount:"公告金额",eligibility:"申请资格",eligibilityUnknown:"提供的列表不含详细资格条件，请查看原公告。",ministry:"主管部门",agency:"公告机构",contact:"联系方式",reason:"推荐依据",prepare:"准备申请",prepareText:"请先在原公告中确认资格和提交材料，再开始撰写计划书。",proposal:"撰写计划书",original:"打开原公告"},
  ja:{back:"事業一覧",match:"プロフィール適合度",overview:"公募情報",period:"受付期間",amount:"公募金額",eligibility:"申請資格",eligibilityUnknown:"提供された一覧に詳細な資格条件がないため、原文の確認が必要です。",ministry:"担当省庁",agency:"公募機関",contact:"問い合わせ",reason:"推薦理由",prepare:"申請準備",prepareText:"原文で申請資格と提出書類を確認してから計画書を作成してください。",proposal:"計画書作成",original:"公募原文を開く"},
  vi:{back:"Danh sách chương trình",match:"Độ phù hợp hồ sơ",overview:"Thông tin thông báo",period:"Thời gian đăng ký",amount:"Ngân sách thông báo",eligibility:"Điều kiện",eligibilityUnknown:"Danh sách được cung cấp không có điều kiện chi tiết. Hãy kiểm tra thông báo gốc.",ministry:"Bộ phụ trách",agency:"Cơ quan",contact:"Liên hệ",reason:"Lý do đề xuất",prepare:"Chuẩn bị hồ sơ",prepareText:"Kiểm tra điều kiện và tài liệu cần nộp trong thông báo gốc trước khi viết kế hoạch.",proposal:"Viết kế hoạch",original:"Mở thông báo gốc"},
};

function amountLabel(amount: string, locale: Locale) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return amount === "0" ? "—" : amount;
  return `${new Intl.NumberFormat(locale).format(value)} KRW`;
}

export function ProgramDetailClient({ program }: { program: Program }) {
  const { locale } = useLocale();
  const ui = copy[locale];
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  useEffect(() => onAuthStateChanged(auth, async (user) => setProfile(user ? await loadResearcherProfile(user.uid) : null)), []);
  const match = matchProgram(program, profile);
  const field = researchFieldOptions.find((item) => item.value === program.fieldCodes[0])?.labels[locale] || program.fieldCodes[0];
  return <main className="site-page"><SiteHeader /><section className="program-detail">
    <Link className="back-link" href="/rd">← {ui.back}</Link>
    <div className="program-detail-head"><div><StatusPill tone="soft">{field}</StatusPill><h1>{program.title}</h1><p>{program.agency}</p></div><div className="detail-match"><b>{profile ? `${match.score}%` : "—"}</b><span>{ui.match}</span></div></div>
    <div className="detail-grid"><article><span>{ui.overview}</span><h2>{program.programName || program.noticeType || program.title}</h2><dl><div><dt>{ui.period}</dt><dd>{program.start || "—"} – {program.deadline} {program.deadlineTime}</dd></div><div><dt>{ui.amount}</dt><dd>{amountLabel(program.amount, locale)}</dd></div><div><dt>{ui.eligibility}</dt><dd>{ui.eligibilityUnknown}</dd></div><div><dt>{ui.ministry}</dt><dd>{program.ministry}</dd></div><div><dt>{ui.agency}</dt><dd>{program.agency}</dd></div><div><dt>{ui.contact}</dt><dd>{program.contact || "—"}</dd></div></dl><h3>{ui.reason}</h3><p>{match.reasons.join(" · ")}</p></article><aside><h3>{ui.prepare}</h3><p>{ui.prepareText}</p><a href={program.url} target="_blank" rel="noreferrer">{ui.original} ↗</a><Link href="/proposal">{ui.proposal} →</Link><SaveProgramButton /></aside></div>
  </section></main>;
}
