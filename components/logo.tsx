"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function Logo() {
  const { t } = useLocale();
  return (
    <Link className="logo" href="/" aria-label={`LAB-BRIDGE ${t("home")}`}>
      <span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>LAB-BRIDGE</span>
    </Link>
  );
}
