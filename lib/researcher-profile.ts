import { arrayRemove, arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ResearcherProfile = {
  fullName: string;
  organization: string;
  researchField: string;
  specialty: string;
  careerStage: string;
  interests: string;
  publications: string[];
  savedProgramIds: string[];
  fundingProjects?: Array<{ id:string; title:string; amount:number; description:string; createdAt:string }>;
  meetingRequests?: Array<{ id:string; researcher:string; createdAt:string }>;
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
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Partial<ResearcherProfile>;
  return { ...data, publications: data.publications || [], savedProgramIds: data.savedProgramIds || [] } as ResearcherProfile;
}

export async function setProgramSaved(uid: string, programId: string, saved: boolean) {
  await updateDoc(doc(db, "users", uid), { savedProgramIds: saved ? arrayUnion(programId) : arrayRemove(programId), updatedAt: serverTimestamp() });
}

export async function addFundingProject(uid: string, project: { id:string; title:string; amount:number; description:string; createdAt:string }) {
  await updateDoc(doc(db, "users", uid), { fundingProjects: arrayUnion(project), updatedAt: serverTimestamp() });
}

export async function addMeetingRequest(uid: string, request: { id:string; researcher:string; createdAt:string }) {
  await updateDoc(doc(db, "users", uid), { meetingRequests: arrayUnion(request), updatedAt: serverTimestamp() });
}
