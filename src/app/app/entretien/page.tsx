"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote } from "@/components/ErrorNote";
import { Markdown } from "@/components/Markdown";
import { createClient } from "@/lib/supabase/client";
import { useStream } from "@/lib/useStream";

type Msg = { role: "user" | "assistant"; content: string };

export default function Entretien() {
  const [job, setJob] = useState({ jobTitle: "", company: "", jobDescription: "" });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [answer, setAnswer] = useState("");
  const { output, busy, error, upgrade, run } = useStream();
  const bottom = useRef<HTMLDivElement>(null);

  // Arrivée depuis le parcours d'une offre : on reprend son poste, son entreprise et son texte.
  useEffect(() => {
    const offre = new URLSearchParams(window.location.search).get("offre");
    if (!offre) return;
    createClient()
      .from("applications")
      .select("job_title, company, description")
      .eq("id", offre)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setJob({ jobTitle: data.job_title, company: data.company, jobDescription: data.description ?? "" });
      });
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [output, messages]);

  async function send(history: Msg[]) {
    const text = await run("/api/interview", { ...job, messages: history });
    if (text) setMessages([...history, { role: "assistant", content: text }]);
    return text;
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setMessages([]);
    setDone(false);
    setStarted(true);
    if (!(await send([]))) setStarted(false);
  }

  async function reply(content: string) {
    if (!content.trim() || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: content.trim() }];
    setMessages(history);
    setAnswer("");
    if (content === "BILAN") setDone(true);
    await send(history);
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Simulation</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Entraîne-toi à l'entretien</h1>
        <p className="mt-3 text-lg text-muted">Un recruteur IA te pose les questions du poste, une par une, et te donne un retour après chaque réponse. Termine par un bilan noté.</p>
        <form onSubmit={start} className="card mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="job">Poste visé</label>
              <input id="job" required className="input" value={job.jobTitle} onChange={(e) => setJob({ ...job, jobTitle: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="company">Entreprise</label>
              <input id="company" className="input" value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="offer">Texte de l'offre (facultatif)</label>
            <textarea id="offer" rows={6} maxLength={12000} className="input" value={job.jobDescription} onChange={(e) => setJob({ ...job, jobDescription: e.target.value })} />
          </div>
          <button className="btn-blue w-full py-3.5">Commencer l'entretien</button>
          <ErrorNote error={error} upgrade={upgrade} />
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Simulation d'entretien</p>
          <h1 className="page-title mt-2">{job.jobTitle}{job.company ? ` · ${job.company}` : ""}</h1>
        </div>
        <button className="btn-ghost px-4 py-2" onClick={() => setStarted(false)}>Nouvel entretien</button>
      </div>

      <div className="mt-6 space-y-4">
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="card"><Markdown text={m.content} /></div>
          ) : m.content === "BILAN" ? null : (
            <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-[24px] rounded-br-md bg-brand px-5 py-3.5 text-sm leading-relaxed text-white">{m.content}</div>
          ),
        )}
        {busy && (
          <div className="card">
            {output ? <Markdown text={output} /> : <p className="animate-pulse text-sm font-semibold uppercase tracking-[0.12em] text-brand">Le recruteur réfléchit…</p>}
          </div>
        )}
        <ErrorNote error={error} upgrade={upgrade} />
        <div ref={bottom} />
      </div>

      {!done && (
        <form
          className="card sticky bottom-4 mt-6 p-4 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            reply(answer);
          }}
        >
          <label className="sr-only" htmlFor="answer">Ta réponse</label>
          <textarea id="answer" rows={3} maxLength={6000} className="input" placeholder="Écris ta réponse comme tu la dirais à l'oral" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <div className="mt-3 flex flex-wrap justify-between gap-2">
            <button type="button" className="btn-ghost px-4 py-2.5" disabled={busy || messages.length < 3} onClick={() => reply("BILAN")}>Terminer et voir le bilan</button>
            <button className="btn-blue px-6 py-2.5" disabled={busy || !answer.trim()}>Répondre</button>
          </div>
        </form>
      )}
    </div>
  );
}
