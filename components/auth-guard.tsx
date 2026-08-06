"use client";

import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useLocale } from "./locale-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const { t } = useLocale();

  useEffect(() => onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setAllowed(true);
  }), [pathname, router]);

  if (!allowed) return <main className="dashboard-loading">{t("authChecking")}</main>;
  return children;
}
