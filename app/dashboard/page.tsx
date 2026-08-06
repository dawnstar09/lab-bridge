import { DashboardClient } from "@/components/dashboard-client";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardPage() {
  return <AuthGuard><DashboardClient /></AuthGuard>;
}
