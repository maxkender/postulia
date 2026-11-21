/**
 * Informations légales de l'éditeur, affichées sur les pages Mentions légales, CGV et Confidentialité.
 * Remplacer chaque valeur TODO par l'information réelle : tant qu'une valeur commence par « TODO »,
 * la page l'affiche surlignée avec la mention « à compléter ».
 */
export const LEGAL = {
  company: "TODO raison sociale",
  legalForm: "TODO forme juridique et capital social",
  address: "TODO adresse du siège social",
  registration: "TODO numéro SIREN et ville du RCS",
  vat: "TODO numéro de TVA intracommunautaire",
  director: "TODO nom du directeur de la publication",
  email: "TODO adresse e-mail de contact",
  mediator: "TODO nom et site du médiateur de la consommation",
  updated: "21 novembre 2026",
  site: "https://postulia-lemon.vercel.app",
};

export const isTodo = (value: string) => value.startsWith("TODO");
