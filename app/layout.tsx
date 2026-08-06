import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "LAB-BRIDGE",
  description: "Research opportunities, connected.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
