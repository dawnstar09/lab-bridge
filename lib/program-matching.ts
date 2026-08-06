import type { Program } from "@/lib/programs";
import type { ResearcherProfile } from "@/lib/researcher-profile";

export type MatchResult = { score: number; reasons: string[]; requiresConfirmation: boolean };

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
    const interestTokens = tokens(profile.interests);
    const matched = program.keywords.filter((keyword) => [...tokens(keyword)].some((token) => interestTokens.has(token))).length;
    const keywordScore = Math.min(25, Math.round((matched / Math.max(1, program.keywords.length)) * 25));
    if (keywordScore) { score += keywordScore; reasons.push(`관심 기술 키워드 ${matched}개 일치`); }
  }

  const interestText = profile.interests.toLowerCase();
  const activityMatches = program.activities.filter((activity) => activityTerms[activity]?.some((term) => interestText.includes(term.toLowerCase())));
  if (activityMatches.length) { const activityScore = Math.min(20, activityMatches.length * 10); score += activityScore; reasons.push("희망 활동 일치"); }

  // The supplied list does not contain detailed eligibility or affiliation restrictions.
  score += 12;
  reasons.push("신청 자격·기관 조건은 원문 확인 필요");
  return { score: Math.min(100, score), reasons, requiresConfirmation: true };
}
