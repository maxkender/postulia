"use client";

import { useState } from "react";

export function BillingButton({ endpoint, label }: { endpoint: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? "Une erreur est survenue. Réessaie dans un instant.");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={go} disabled={loading} className="btn-blue w-full py-3.5">
        {loading ? "Redirection…" : label}
      </button>
      {error && <p role="alert" className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">{error}</p>}
    </div>
  );
}
