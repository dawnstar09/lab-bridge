import { kaistResearchers, type KaistResearcher } from "@/lib/kaist-researchers";
import { researchFieldOptions, specialtyOptions } from "@/lib/profile-options";

export type ResearcherProfile = {
  researchField?: string;
  specialty?: string;
  interests?: string;
  publications?: string | string[];
};

export type ResearcherMatch = KaistResearcher & {
  score: number;
  matchedKeywords: string[];
};

type LabTaxonomy = { specialties: string[]; fields: string[] };

const labTaxonomy: Record<string, LabTaxonomy> = {
  "kaist-smesh": { specialties:["chemical-engineering","biotechnology","biology"], fields:["engineering-technology","medical-health","natural-sciences"] },
  "kaist-acoustic-microfluidics": { specialties:["mechanical","biotechnology","basic-medicine"], fields:["engineering-technology","medical-health"] },
  "kaist-computational-materials": { specialties:["physics","materials","data-hpc"], fields:["natural-sciences","engineering-technology"] },
  "kaist-catalyst-design": { specialties:["chemistry","chemical-engineering","materials"], fields:["natural-sciences","engineering-technology"] },
  "kaist-nanophotonics": { specialties:["physics","nano","quantum"], fields:["natural-sciences","engineering-technology"] },
  "kaist-biodeengineering": { specialties:["biology","biotechnology","chemical-engineering"], fields:["natural-sciences","medical-health","engineering-technology"] },
  "kaist-thermal-superconductor": { specialties:["physics","materials","energy","mechanical"], fields:["natural-sciences","engineering-technology"] },
  "kaist-sustainable-chemistry": { specialties:["chemistry","chemical-engineering","materials"], fields:["natural-sciences","engineering-technology"] },
  "kaist-semiconductor-packaging": { specialties:["semiconductor","electrical-information","materials"], fields:["engineering-technology"] },
  "kaist-pde": { specialties:["mathematics","data-hpc"], fields:["natural-sciences"] },
  "kaist-extreme-materials": { specialties:["aerospace","materials","mechanical"], fields:["engineering-technology"] },
  "kaist-vic-agi": { specialties:["ai","computer-science","robotics","electrical-information"], fields:["engineering-technology"] },
  "kaist-ai-semiconductor": { specialties:["ai","semiconductor","electrical-information","computer-science"], fields:["engineering-technology"] },
  "kaist-molecular-spectroscopy": { specialties:["chemistry","physics","chemical-engineering"], fields:["natural-sciences","engineering-technology"] },
  "kaist-advanced-data": { specialties:["data-hpc","computer-science","ai"], fields:["engineering-technology","natural-sciences"] },
};

const conceptAliases: Record<string, string[]> = {
  ai: [
    "ai",
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "computer vision",
    "vision",
    "인공지능",
    "머신러닝",
    "기계학습",
    "딥러닝",
    "컴퓨터 비전",
  ],
  computing: [
    "computer science",
    "computing",
    "data science",
    "data computing",
    "software",
    "컴퓨터",
    "전산",
    "컴퓨팅",
    "데이터 과학",
    "소프트웨어",
  ],
  semiconductor: [
    "semiconductor",
    "integrated circuit",
    "chip",
    "반도체",
    "집적회로",
    "패키징",
  ],
  bio: [
    "biology",
    "biological",
    "biotechnology",
    "bioengineering",
    "healthcare",
    "생명과학",
    "생명공학",
    "바이오",
    "헬스케어",
  ],
  chemistry: [
    "chemistry",
    "chemical",
    "catalyst",
    "catalysis",
    "organic synthesis",
    "화학",
    "촉매",
    "유기 합성",
  ],
  materials: [
    "materials science",
    "material physics",
    "advanced materials",
    "재료",
    "신소재",
    "소재",
  ],
  physics: [
    "physics",
    "photonics",
    "spectroscopy",
    "superconductor",
    "물리",
    "광학",
    "분광학",
    "초전도",
  ],
  mathematics: [
    "mathematics",
    "mathematical",
    "partial differential equation",
    "pde",
    "수학",
    "편미분방정식",
  ],
  mechanical: [
    "mechanical engineering",
    "microfluidics",
    "acoustics",
    "기계공학",
    "미세유체",
    "마이크로유체",
    "음향",
  ],
  aerospace: [
    "aerospace",
    "aeronautics",
    "항공우주",
    "항공",
  ],
  electrical: [
    "electrical engineering",
    "electronics",
    "전자공학",
    "전기공학",
    "전자",
    "전기",
  ],
  energy: [
    "energy",
    "battery",
    "renewable energy",
    "에너지",
    "배터리",
    "이차전지",
  ],
};

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[·_/,&()\[\]{}:;]+/g, " ")
    .replace(/[^\p{L}\p{N}+#.-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(" ") : value || "";
}

function includesAlias(text: string, alias: string) {
  const normalizedAlias = normalizeText(alias);
  if (!normalizedAlias) return false;
  if (/^[a-z0-9+#.-]+$/.test(normalizedAlias)) {
    return new RegExp(`(^|\\s)${normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "i").test(text);
  }
  return text.includes(normalizedAlias);
}

function detectedConcepts(value: string) {
  const text = normalizeText(value);
  return Object.entries(conceptAliases)
    .filter(([, aliases]) => aliases.some((alias) => includesAlias(text, alias)))
    .map(([concept]) => concept);
}

function addFeature(vector: Map<string, number>, key: string, weight: number) {
  vector.set(key, (vector.get(key) || 0) + weight);
}

function featureVector(value: string) {
  const vector = new Map<string, number>();
  const words = normalizeText(value).split(" ").filter((word) => word.length >= 2);

  words.forEach((word) => {
    addFeature(vector, `word:${word}`, 1.5);

    const size = /[가-힣]/.test(word) ? 2 : 3;
    if (word.length >= size + 1) {
      for (let index = 0; index <= word.length - size; index += 1) {
        addFeature(vector, `gram:${word.slice(index, index + size)}`, 0.18);
      }
    }
  });

  detectedConcepts(value).forEach((concept) => addFeature(vector, `concept:${concept}`, 4));
  return vector;
}

function cosineSimilarity(left: string, right: string) {
  const leftVector = featureVector(left);
  const rightVector = featureVector(right);
  if (!leftVector.size || !rightVector.size) return 0;

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  leftVector.forEach((weight, feature) => {
    dot += weight * (rightVector.get(feature) || 0);
    leftMagnitude += weight * weight;
  });
  rightVector.forEach((weight) => {
    rightMagnitude += weight * weight;
  });

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function localizedOptionText(
  value: string | undefined,
  options: Array<{ value: string; labels: Record<string, string>; keywords?: string | string[] }>,
) {
  if (!value) return "";
  const option = options.find((item) => item.value === value);
  return [value, ...Object.values(option?.labels || {}), textValue(option?.keywords)].join(" ");
}

function labText(researcher: KaistResearcher) {
  return [
    researcher.lab,
    researcher.labEn,
    researcher.professor,
    researcher.professorEn,
    researcher.department,
    researcher.departmentEn,
    ...researcher.keywords,
  ].join(" ");
}

function weightedSimilarity(profile: ResearcherProfile, researcher: KaistResearcher) {
  const candidate = labText(researcher);
  const sections = [
    {
      text: localizedOptionText(profile.specialty, specialtyOptions),
      weight: 0.5,
    },
    {
      text: localizedOptionText(profile.researchField, researchFieldOptions),
      weight: 0.2,
    },
    {
      text: [profile.interests, textValue(profile.publications)].filter(Boolean).join(" "),
      weight: 0.3,
    },
  ].filter((section) => section.text.trim());

  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
  if (!totalWeight) return 0;

  return sections.reduce(
    (sum, section) => sum + cosineSimilarity(section.text, candidate) * section.weight,
    0,
  ) / totalWeight;
}

function taxonomyScore(profile: ResearcherProfile, researcher: KaistResearcher) {
  const taxonomy = labTaxonomy[researcher.id];
  if (!taxonomy) return { score: 0, weight: 0 };
  let score = 0;
  let weight = 0;

  if (profile.specialty) {
    weight += 0.55;
    const specialtyIndex = taxonomy.specialties.indexOf(profile.specialty);
    if (specialtyIndex === 0) score += 0.55;
    else if (specialtyIndex > 0) score += Math.max(0.28, 0.46 - specialtyIndex * 0.06);
  }
  if (profile.researchField) {
    weight += 0.15;
    if (taxonomy.fields.includes(profile.researchField)) score += 0.15;
  }

  return { score, weight };
}

function hybridSimilarity(profile: ResearcherProfile, researcher: KaistResearcher) {
  const taxonomy = taxonomyScore(profile, researcher);
  const hasContext = Boolean(profile.interests?.trim() || textValue(profile.publications).trim());
  if (!taxonomy.weight && !hasContext) return 0;
  return taxonomy.score + (hasContext ? weightedSimilarity(profile, researcher) * 0.3 : 0);
}

function matchedKeywords(profileText: string, researcher: KaistResearcher) {
  const profileConcepts = new Set(detectedConcepts(profileText));
  return researcher.keywords
    .filter((keyword) => {
      const keywordConcepts = detectedConcepts(keyword);
      return (
        cosineSimilarity(profileText, keyword) >= 0.12 ||
        keywordConcepts.some((concept) => profileConcepts.has(concept))
      );
    })
    .slice(0, 3);
}

export function matchKaistResearchers(profile: ResearcherProfile | null | undefined): ResearcherMatch[] {
  const resolvedProfile = profile || {};
  const profileText = [
    localizedOptionText(resolvedProfile.researchField, researchFieldOptions),
    localizedOptionText(resolvedProfile.specialty, specialtyOptions),
    resolvedProfile.interests,
    textValue(resolvedProfile.publications),
  ]
    .filter(Boolean)
    .join(" ");

  return kaistResearchers
    .map((researcher) => ({
      ...researcher,
      score: Math.min(100, Math.round(hybridSimilarity(resolvedProfile, researcher) * 100)),
      matchedKeywords: matchedKeywords(profileText, researcher),
    }))
    .sort((left, right) => right.score - left.score || left.professor.localeCompare(right.professor));
}
