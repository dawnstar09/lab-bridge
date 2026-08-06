import type { Program } from "@/lib/programs";
import type { ResearcherProfile } from "@/lib/researcher-profile";

export type MatchResult = { score: number; reasons: string[]; requiresConfirmation: boolean };

export function localizeMatchReason(reason: string, locale: "ko"|"en"|"zh"|"ja"|"vi") {
  if (locale === "ko") return reason;
  const keywordCount = reason.match(/\d+/)?.[0] || "";
  const table = {
    en:{"프로필을 완성하면 적합도를 계산합니다.":"Complete your profile to calculate fit.","연구 분야 일치":"Research field match","융합 분야 연관":"Related convergence field","세부 전공 일치":"Specialty match","희망 활동 일치":"Preferred activity match","신청 자격·기관 조건은 원문 확인 필요":"Check the original announcement for eligibility and institution requirements"},
    zh:{"프로필을 완성하면 적합도를 계산합니다.":"完善档案后可计算匹配度。","연구 분야 일치":"研究领域匹配","융합 분야 연관":"与融合领域相关","세부 전공 일치":"专业匹配","희망 활동 일치":"期望活动匹配","신청 자격·기관 조건은 원문 확인 필요":"申请资格和机构条件需查看原公告"},
    ja:{"프로필을 완성하면 적합도를 계산합니다.":"プロフィールを完成すると適合度を計算できます。","연구 분야 일치":"研究分野が一致","융합 분야 연관":"融合分野に関連","세부 전공 일치":"専門分野が一致","희망 활동 일치":"希望活動が一致","신청 자격·기관 조건은 원문 확인 필요":"申請資格・機関条件は原文確認が必要"},
    vi:{"프로필을 완성하면 적합도를 계산합니다.":"Hoàn tất hồ sơ để tính độ phù hợp.","연구 분야 일치":"Khớp lĩnh vực nghiên cứu","융합 분야 연관":"Liên quan lĩnh vực liên ngành","세부 전공 일치":"Khớp chuyên ngành","희망 활동 일치":"Khớp hoạt động mong muốn","신청 자격·기관 조건은 원문 확인 필요":"Cần kiểm tra bản gốc về điều kiện và tổ chức"},
  }[locale];
  if (reason.startsWith("관심 기술 키워드")) return {en:`${keywordCount} research keywords matched`,zh:`匹配 ${keywordCount} 个研究关键词`,ja:`研究キーワード${keywordCount}件が一致`,vi:`Khớp ${keywordCount} từ khóa nghiên cứu`}[locale];
  return table[reason as keyof typeof table] || reason;
}

const activityTerms: Record<string, string[]> = {
  "joint-research":["공동연구","협업","collaboration","joint research","合作","共同研究","hợp tác"],
  "project-participation":["과제 참여","연구과제","project","课题","プロジェクト","dự án"],
  startup:["창업","startup","创业","起業","khởi nghiệp"],
  "technology-transfer":["기술이전","사업화","technology transfer","commercialization","技术转移","技術移転","chuyển giao"],
  "personnel-funding":["인건비","장학","연구인력","personnel","scholarship","人才","人材","nhân lực"],
};

function tokens(value: string) {
  return new Set(value.toLowerCase().split(/[^\p{L}\p{N}+#-]+/u).filter((item) => item.length > 1));
}

export function matchProgram(program: Program, profile: ResearcherProfile | null): MatchResult {
  if (!profile) return { score: 0, reasons: ["프로필을 완성하면 적합도를 계산합니다."], requiresConfirmation: true };
  let score = 0;
  const reasons: string[] = [];
  if (program.fieldCodes.includes(profile.researchField)) { score += 30; reasons.push("연구 분야 일치"); }
  else if (program.fieldCodes.includes("convergence")) { score += 12; reasons.push("융합 분야 연관"); }

  if (program.specialtyCodes.includes(profile.specialty)) { score += 25; reasons.push("세부 전공 일치"); }
  else {
    const interestTokens = tokens(`${profile.interests} ${(profile.publications || []).join(" ")}`);
    const matched = program.keywords.filter((keyword) => [...tokens(keyword)].some((token) => interestTokens.has(token))).length;
    const keywordScore = Math.min(25, Math.round((matched / Math.max(1, program.keywords.length)) * 25));
    if (keywordScore) { score += keywordScore; reasons.push(`관심 기술 키워드 ${matched}개 일치`); }
  }

  const interestText = `${profile.interests} ${(profile.publications || []).join(" ")}`.toLowerCase();
  const activityMatches = program.activities.filter((activity) => activityTerms[activity]?.some((term) => interestText.includes(term.toLowerCase())));
  if (activityMatches.length) { const activityScore = Math.min(20, activityMatches.length * 10); score += activityScore; reasons.push("희망 활동 일치"); }

  // The supplied list does not contain detailed eligibility or affiliation restrictions.
  score += 12;
  reasons.push("신청 자격·기관 조건은 원문 확인 필요");
  return { score: Math.min(100, score), reasons, requiresConfirmation: true };
}
