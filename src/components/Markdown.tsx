import { Fragment } from "react";

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Rendu Markdown minimal : titres, puces, gras, paragraphes. */
export function Markdown({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    out.push(
      <ul key={out.length} className="my-2 list-disc space-y-1 pl-5">
        {bullets.map((b, i) => <li key={i}>{inline(b)}</li>)}
      </ul>,
    );
    bullets = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flush();
    if (line.startsWith("# ")) out.push(<h1 key={out.length} className="text-3xl font-medium">{inline(line.slice(2))}</h1>);
    else if (line.startsWith("## ")) out.push(<h2 key={out.length} className="mt-5 border-b border-line pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand">{inline(line.slice(3))}</h2>);
    else if (line.startsWith("### ")) out.push(<h3 key={out.length} className="mt-3 font-semibold">{inline(line.slice(4))}</h3>);
    else if (/^-{3,}$/.test(line)) out.push(<hr key={out.length} className="my-3 border-line" />);
    else if (line.trim() === "") out.push(<div key={out.length} className="h-2" />);
    else out.push(<p key={out.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="text-sm leading-relaxed">{out}</div>;
}
