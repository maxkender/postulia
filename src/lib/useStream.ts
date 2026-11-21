"use client";

import { useCallback, useRef, useState } from "react";

/** Appelle une route qui diffuse du texte et expose l'état de la génération. */
export function useStream() {
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const run = useCallback(async (url: string, body: unknown): Promise<string | null> => {
    setBusy(true);
    setError("");
    setUpgrade(false);
    setOutput("");
    abort.current = new AbortController();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setUpgrade(Boolean(data?.upgrade));
        throw new Error(data?.error ?? "La génération a échoué. Réessaie dans un instant.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOutput(text);
      }
      return text;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof TypeError ? "La génération a été interrompue. Réessaie dans un instant." : (err as Error).message);
      }
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const stop = useCallback(() => abort.current?.abort(), []);
  return { output, setOutput, busy, error, upgrade, run, stop };
}
