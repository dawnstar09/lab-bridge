"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { loadResearcherProfile, setProgramSaved } from "@/lib/researcher-profile";
import { useLocale } from "./locale-provider";

export function SaveProgramButton({ programId }: { programId: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) void loadResearcherProfile(user.uid).then((profile) => setSaved(profile?.savedProgramIds.includes(programId) || false));
  }, [programId]);

  async function toggleSaved() {
    const user = auth.currentUser;
    if (!user) { router.push(`/login?next=${encodeURIComponent(pathname)}`); return; }
    setSaving(true);
    const next = !saved;
    try { await setProgramSaved(user.uid, programId, next); setSaved(next); }
    finally { setSaving(false); }
  }

  return <button type="button" onClick={() => void toggleSaved()} disabled={saving}>{saving ? "…" : saved ? `${t("saved")} ✓` : t("saveProgram")}</button>;
}
