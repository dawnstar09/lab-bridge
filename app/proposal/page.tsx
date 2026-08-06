import { ProposalEditor } from "@/components/proposal-editor";
import { SiteHeader } from "@/components/site-header";
import { AuthGuard } from "@/components/auth-guard";

export default function ProposalPage() {
  return <AuthGuard><main className="site-page"><SiteHeader /><ProposalEditor /></main></AuthGuard>;
}
