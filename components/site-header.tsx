"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Logo } from "./logo";
import { useLocale } from "./locale-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const { t } = useLocale();

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setReady(true);
  }), []);

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/");
  }

  return (
    <header className="site-header">
      <Logo />
      <nav aria-label={t("navigation")}>
        <Link className={pathname.startsWith("/rd") ? "active" : ""} href="/rd">{t("rd")}</Link>
        <Link className={pathname === "/proposal" ? "active" : ""} href="/proposal">{t("proposal")}</Link>
        <Link className={pathname === "/network" ? "active" : ""} href="/network">{t("network")}</Link>
      </nav>
      <div className={`site-actions ${ready ? "ready" : ""}`}>
        {ready && user ? (
          <><span className="header-user">{user.displayName || user.email?.split("@")[0]}</span><Link className="site-primary" href="/dashboard">{t("mypage")}</Link><button type="button" onClick={handleSignOut}>{t("logout")}</button></>
        ) : ready ? (
          <><Link href="/login">{t("login")}</Link><Link className="site-primary" href="/register">{t("register")}</Link></>
        ) : null}
      </div>
    </header>
  );
}
