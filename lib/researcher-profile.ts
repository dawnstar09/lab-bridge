import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ResearcherProfile = {
  fullName: string;
  organization: string;
  researchField: string;
  specialty: string;
  careerStage: string;
  interests: string;
  orcid: string;
  email: string;
  country: string;
  locale: "ko" | "en" | "zh" | "ja" | "vi";
  terminologyPreference: "original_with_explanation" | "translated_with_original" | "original_only";
};

export async function saveResearcherProfile(uid: string, profile: ResearcherProfile) {
  await setDoc(doc(db, "users", uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export async function loadResearcherProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() as ResearcherProfile : null;
}
