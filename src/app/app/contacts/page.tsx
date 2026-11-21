"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays, formatDate, isDue, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

type Contact = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  notes: string | null;
  last_contact_at: string | null;
  follow_up_at: string | null;
};

const COLUMNS = "id, name, company, role, email, linkedin_url, notes, last_contact_at, follow_up_at";
const EMPTY = { name: "", company: "", role: "", email: "", linkedin_url: "", notes: "" };
const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

export default function Contacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .from("contacts")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const link = form.linkedin_url.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }
    const { data, error } = await createClient()
      .from("contacts")
      .insert({ name: form.name, company: form.company || null, role: form.role || null, email: form.email || null, linkedin_url: link || null, notes: form.notes || null })
      .select(COLUMNS)
      .single();
    if (error) setError(error.message);
    else {
      setItems((prev) => [data, ...prev]);
      setForm(EMPTY);
      setAdding(false);
    }
  }

  async function update(id: string, patch: Partial<Contact>) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const { error } = await createClient().from("contacts").update(patch).eq("id", id);
    if (error) setError("La modification n'a pas pu être enregistrée.");
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce contact ?")) return;
    setItems((prev) => prev.filter((c) => c.id !== id));
    await createClient().from("contacts").delete().eq("id", id);
  }

  const due = items.filter((c) => isDue(c.follow_up_at)).length;
  const sorted = [...items].sort((a, b) => Number(isDue(b.follow_up_at)) - Number(isDue(a.follow_up_at)));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Réseau</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Mes contacts</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Recruteurs, managers, anciens collègues : note qui tu as contacté et quand relancer.
            {due > 0 && <span className="font-semibold text-[#c2185b]"> {due} à relancer.</span>}
          </p>
        </div>
        <button className="btn-blue" onClick={() => setAdding(!adding)}>{adding ? "Fermer" : "+ Ajouter un contact"}</button>
      </div>

      {adding && (
        <form onSubmit={add} className="card mt-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="label" htmlFor="name">Nom</label>
              <input id="name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="company">Entreprise</label>
              <input id="company" className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="role">Fonction</label>
              <input id="role" className="input" placeholder="Ex. Responsable recrutement" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="linkedin">Profil LinkedIn</label>
              <input id="linkedin" className="input" placeholder="https://" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="cnotes">Notes</label>
            <textarea id="cnotes" rows={3} maxLength={4000} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn">Ajouter</button>
        </form>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((c) => (
          <article key={c.id} className={`card flex flex-col ${isDue(c.follow_up_at) ? "ring-2 ring-coral/50" : ""}`}>
            <div className="flex items-start gap-3">
              <span className="tile grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white">
                {c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{c.name}</h2>
                <p className="truncate text-sm text-muted">{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <button aria-label={`Supprimer ${c.name}`} className="ml-auto px-1 text-muted hover:text-red-700" onClick={() => remove(c.id)}>✕</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-brand">
              {c.email && <a href={`mailto:${c.email}`}>E-mail</a>}
              {safeUrl(c.linkedin_url) && <a href={safeUrl(c.linkedin_url)!} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
              <Link href="/app/outils/recruteur">Rédiger un message</Link>
            </div>
            <textarea
              aria-label={`Notes sur ${c.name}`}
              rows={2}
              maxLength={4000}
              className="input mt-4 text-[13px]"
              placeholder="Notes"
              defaultValue={c.notes ?? ""}
              onBlur={(e) => e.target.value !== (c.notes ?? "") && update(c.id, { notes: e.target.value || null })}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p className="rounded-xl bg-cream px-3 py-2"><span className="block text-muted">Dernier contact</span><b>{formatDate(c.last_contact_at) || "Jamais"}</b></p>
              <p className={`rounded-xl px-3 py-2 ${isDue(c.follow_up_at) ? "bg-[#ffe1ea] text-[#c2185b]" : "bg-cream"}`}><span className="block opacity-70">Relance</span><b>{formatDate(c.follow_up_at) || "Aucune"}</b></p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-ghost px-3.5 py-2 text-[13px]" onClick={() => update(c.id, { last_contact_at: today(), follow_up_at: addDays(7) })}>Contacté aujourd'hui</button>
              {c.follow_up_at && <button className="btn-ghost px-3.5 py-2 text-[13px]" onClick={() => update(c.id, { follow_up_at: null })}>Retirer la relance</button>}
            </div>
          </article>
        ))}
      </div>
      {!items.length && <p className="mt-6 text-muted">{loading ? "Chargement…" : "Aucun contact pour l'instant. Ajoute la première personne à qui tu as écrit."}</p>}
    </div>
  );
}
