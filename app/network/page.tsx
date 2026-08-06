import { NetworkClient } from "@/components/network-client";
import { SiteHeader } from "@/components/site-header";
import { AuthGuard } from "@/components/auth-guard";

export default function NetworkPage() {
  return <AuthGuard><main className="site-page"><SiteHeader /><NetworkClient /></main></AuthGuard>;
}
