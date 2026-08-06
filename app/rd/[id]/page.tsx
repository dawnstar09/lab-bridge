import { notFound } from "next/navigation";
import { programs } from "@/lib/programs";
import { ProgramDetailClient } from "@/components/program-detail-client";

export function generateStaticParams() { return programs.map((program) => ({ id: program.id })); }

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = programs.find((item) => item.id === id);
  if (!program) notFound();
  return <ProgramDetailClient program={program} />;
}
