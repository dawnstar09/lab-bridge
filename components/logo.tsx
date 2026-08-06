"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function Logo() {
  const { t } = useLocale();
  return (
    <Link className="logo" href="/" aria-label={`LAB-BRIDGE ${t("home")}`}>
      <img className="logo-image" src="/labbridge-logo.svg" alt="" width="179" height="40" />
    </Link>
  );
}
