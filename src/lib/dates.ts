export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Vrai si la date de relance est aujourd'hui ou dépassée. */
export function isDue(date: string | null | undefined) {
  return Boolean(date) && date!.slice(0, 10) <= today();
}
