"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useLocale } from "./locale-provider";

export function SaveProgramButton() {
  const [saved, setSaved] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  function toggleSaved() {
    if (!auth.currentUser) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setSaved((value) => !value);
  }
  return <button type="button" onClick={toggleSaved}>{saved ? `${t("saved")} ✓` : t("saveProgram")}</button>;
}
