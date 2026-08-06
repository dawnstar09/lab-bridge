import { kaistResearchers } from "@/lib/kaist-researchers";
import { researchFieldOptions, specialtyOptions } from "@/lib/profile-options";
import type { ResearcherProfile } from "@/lib/researcher-profile";

const aliases: Record<string, string[]> = {
  ai:["인공지능","머신러닝","딥러닝","컴퓨터비전","데이터"], semiconductor:["반도체","시스템반도체","패키징","회로"],
  "computer-science":["컴퓨터","컴퓨팅","데이터","네트워크"], "data-hpc":["데이터","고성능컴퓨팅","HPC","컴퓨팅"],
  chemistry:["화학","분자","합성","촉매"], "chemical-engineering":["화학공학","생체분자","대사공학","촉매"],
  biology:["생물과학","바이오","생명공학"], biotechnology:["생명공학","바이오","의생명","헬스케어"],
  physics:["물리학","광학","분광학","양자"], materials:["재료","재료과학","극한재료","복합재료"], nano:["나노","나노기술","나노포토닉스"],
  mechanical:["기계공학","열공학","유체","공정"], aerospace:["항공우주","구조","복합재료"], mathematics:["수학","편미분방정식","해석학","수리모델"],
  "electrical-information":["전기전자","회로","반도체","정보"], energy:["에너지","열공학","지속가능"],
};

function tokenize(value: string) {
  return value.toLowerCase().normalize("NFKC").match(/[가-힣a-z0-9+#.-]{2,}/g) || [];
}

function cosine(left: string, right: string) {
  const a = new Map<string, number>();
  const b = new Map<string, number>();
  tokenize(left).forEach((token) => a.set(token, (a.get(token) || 0) + 1));
  tokenize(right).forEach((token) => b.set(token, (b.get(token) || 0) + 1));
  let dot = 0;
  a.forEach((value, token) => { dot += value * (b.get(token) || 0); });
  const normA = Math.sqrt([...a.values()].reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt([...b.values()].reduce((sum, value) => sum + value * value, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

export function matchKaistResearchers(profile: ResearcherProfile | null) {
  const specialty = profile?.specialty || "";
  const specialtyLabel = specialtyOptions.find((item) => item.value === specialty)?.labels.ko || specialty;
  const fieldLabel = researchFieldOptions.find((item) => item.value === profile?.researchField)?.labels.ko || profile?.researchField || "";
  const profileText = [fieldLabel, specialtyLabel, ...(aliases[specialty] || []), profile?.interests, ...(profile?.publications || [])].filter(Boolean).join(" ");
  return kaistResearchers.map((researcher) => {
    const labText = [researcher.lab, researcher.department, ...researcher.keywords].join(" ");
    const similarity = cosine(profileText, labText);
    const matchedKeywords = researcher.keywords.filter((keyword) => tokenize(profileText).some((token) => keyword.toLowerCase().includes(token) || token.includes(keyword.toLowerCase()))).slice(0, 3);
    return { ...researcher, score: Math.round(similarity * 100), matchedKeywords };
  }).sort((a, b) => b.score - a.score || a.lab.localeCompare(b.lab, "ko"));
}
