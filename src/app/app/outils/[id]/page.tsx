import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolRunner } from "@/components/ToolRunner";
import { TOOLS, getTool } from "@/lib/tools";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ id: t.id }));
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) notFound();
  return (
    <div>
      <Link href="/app/outils" className="no-print text-sm font-semibold text-brand">← Tous les outils</Link>
      <h1 className="no-print page-title mt-3">{tool.title}</h1>
      <p className="no-print mb-6 mt-2 text-muted">{tool.short}</p>
      <ToolRunner id={tool.id} title={tool.title} cta={tool.cta} fields={tool.fields} />
    </div>
  );
}
