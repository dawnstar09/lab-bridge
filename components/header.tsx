import Link from "next/link";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="header">
      <Logo />
      <nav className="desktop-nav" aria-label="주요 메뉴">
        <Link href="#workflow">How it works</Link>
        <Link href="#opportunities">Opportunities</Link>
        <Link href="#assistant">AI Assistant</Link>
        <Link href="#network">Network</Link>
      </nav>
      <div className="header-actions">
        <Link className="text-link" href="/login">Sign in</Link>
        <Link className="button button-dark button-small" href="/register">Get started <span>↗</span></Link>
      </div>
    </header>
  );
}
