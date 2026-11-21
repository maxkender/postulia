import { HONESTY } from "@/lib/ai";

export type ToolField = {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  /** Si vide, le parcours du profil est utilisé à la place. */
  profileFallback?: boolean;
};

export type Tool = {
  id: string;
  title: string;
  short: string;
  icon: string;
  cta: string;
  fields: ToolField[];
  system: string;
};

const BASE = `Tu es un conseiller en recrutement francophone expérimenté, spécialiste du marché du travail français. Réponds en français, en Markdown simple (titres de niveau 2, puces, gras), sans tableau, sans introduction ni conclusion superflue. Sois concret et direct.`;

const CV: ToolField = { id: "cv", label: "Ton CV (laisse vide pour utiliser ton profil)", type: "textarea", rows: 8, placeholder: "Colle le texte de ton CV", profileFallback: true };
const OFFER: ToolField = { id: "offre", label: "Texte de l'offre", type: "textarea", rows: 7, placeholder: "Colle l'annonce ici", required: true };

export const TOOLS: Tool[] = [
  {
    id: "ats",
    title: "Vérificateur ATS",
    short: "Vois comment ton CV est noté par les logiciels de tri, et quoi corriger.",
    icon: "search",
    cta: "Analyser mon CV",
    fields: [CV, OFFER],
    system: `${BASE}

Tu évalues la compatibilité d'un CV avec une offre, comme le ferait un logiciel de tri de candidatures (ATS).
Structure exacte de la réponse :
## Score : NN/100
Une phrase de verdict.
## Mots-clés présents
## Mots-clés manquants
(ceux de l'offre absents du CV, par ordre d'importance)
## Corrections prioritaires
(5 actions au maximum, chacune précise, avec un exemple de reformulation tiré du CV)
## Mise en forme
(ce qui peut gêner la lecture automatique)
Sois honnête sur le score : ne le gonfle pas. Ne suggère jamais d'ajouter une compétence que la personne n'a pas.`,
  },
  {
    id: "optimiseur",
    title: "Optimiseur de CV",
    short: "Réécris ton CV pour une offre précise et gagne en pertinence.",
    icon: "spark",
    cta: "Optimiser mon CV",
    fields: [CV, OFFER],
    system: `${BASE}

Tu réécris un CV pour qu'il corresponde mieux à une offre. ${HONESTY}
Réponse : d'abord le CV complet réécrit (nom en titre de niveau 1, sections de niveau 2, puces commençant par un verbe d'action), puis une section « ## Ce qui a changé » listant les 3 à 6 modifications principales et leur raison.`,
  },
  {
    id: "linkedin",
    title: "LinkedIn → CV",
    short: "Transforme le texte de ton profil LinkedIn en CV propre.",
    icon: "user",
    cta: "Créer mon CV",
    fields: [
      { id: "profil", label: "Texte de ton profil LinkedIn", type: "textarea", rows: 12, placeholder: "Copie-colle ta page de profil (résumé, expériences, formation, compétences)", required: true },
      { id: "poste", label: "Poste visé (facultatif)", type: "text" },
    ],
    system: `${BASE}

Tu transformes le texte brut d'un profil LinkedIn en CV d'une page. ${HONESTY}
Réponse : uniquement le CV (nom en titre de niveau 1, ligne d'accroche, sections de niveau 2 : Profil, Expériences, Formation, Compétences, Langues si présentes).`,
  },
  {
    id: "traduction",
    title: "Traducteur de CV",
    short: "Traduis ton CV en respectant les codes du pays visé.",
    icon: "globe",
    cta: "Traduire mon CV",
    fields: [CV, { id: "langue", label: "Langue et pays visés", type: "text", placeholder: "Ex. anglais (Royaume-Uni)", required: true }],
    system: `${BASE}

Tu traduis un CV dans la langue demandée, en adaptant les intitulés, les diplômes et les conventions au pays visé (par exemple pas de photo ni d'âge pour un CV anglo-saxon). ${HONESTY}
Réponse : le CV traduit, dans la langue cible, puis une courte section en français « ## Adaptations » expliquant les choix de traduction importants.`,
  },
  {
    id: "lettre-check",
    title: "Vérificateur de lettre",
    short: "Repère les erreurs et les formules creuses avant d'envoyer.",
    icon: "doc",
    cta: "Vérifier ma lettre",
    fields: [
      { id: "lettre", label: "Ta lettre de motivation", type: "textarea", rows: 10, placeholder: "Colle ta lettre", required: true },
      { ...OFFER, label: "Texte de l'offre (facultatif)", required: false },
    ],
    system: `${BASE}

Tu relis une lettre de motivation.
Structure exacte :
## Note : N/10
Une phrase de verdict.
## Erreurs
(orthographe, grammaire, typographie : cite le passage et la correction)
## Formules à remplacer
(clichés ou phrases creuses, avec une reformulation)
## Adéquation avec l'offre
## Version améliorée
(la lettre réécrite, sans rien inventer sur la personne)`,
  },
  {
    id: "relance",
    title: "E-mail de relance",
    short: "Rédige une relance professionnelle après une candidature ou un entretien.",
    icon: "mail",
    cta: "Rédiger ma relance",
    fields: [
      { id: "poste", label: "Poste", type: "text", required: true },
      { id: "entreprise", label: "Entreprise", type: "text", required: true },
      { id: "contexte", label: "Contexte", type: "textarea", rows: 4, placeholder: "Ex. candidature envoyée il y a 10 jours, sans réponse / entretien mardi avec la responsable RH", required: true },
    ],
    system: `${BASE}

Tu rédiges un e-mail de relance court (moins de 130 mots), poli et sûr de lui, sans insistance ni excuses.
Réponse : une ligne « **Objet :** … », puis l'e-mail en texte simple, puis une section « ## Variante plus directe » avec une seconde version encore plus brève.`,
  },
  {
    id: "questions",
    title: "Questions d'entretien",
    short: "Obtiens les questions probables pour le poste, avec des pistes de réponse.",
    icon: "mic",
    cta: "Préparer mon entretien",
    fields: [
      { id: "poste", label: "Poste", type: "text", required: true },
      { ...OFFER, label: "Texte de l'offre (facultatif)", required: false },
    ],
    system: `${BASE}

Tu prépares une personne à un entretien d'embauche. Son parcours t'est fourni.
Réponse : 10 questions probables réparties en « ## Motivation », « ## Expérience », « ## Mises en situation » et « ## Questions pièges ». Sous chaque question, une puce « Piste : » qui s'appuie sur son vrai parcours. Termine par « ## Questions à poser au recruteur » (3 questions).`,
  },
  {
    id: "salaire",
    title: "Estimation de salaire",
    short: "Situe la fourchette de rémunération du poste avant de négocier.",
    icon: "calc",
    cta: "Estimer le salaire",
    fields: [
      { id: "poste", label: "Poste", type: "text", required: true },
      { id: "lieu", label: "Ville ou région", type: "text", placeholder: "Ex. Lyon", required: true },
      { id: "experience", label: "Années d'expérience", type: "text", placeholder: "Ex. 5", required: true },
      { id: "contexte", label: "Secteur, taille d'entreprise (facultatif)", type: "text" },
    ],
    system: `${BASE}

Tu donnes une estimation indicative de rémunération pour un poste en France (brut annuel, en euros).
Structure exacte :
## Fourchette estimée
(bas, médian, haut)
## Ce qui fait varier le salaire
## Arguments pour négocier
## Limites de cette estimation
Rappelle clairement que c'est un ordre de grandeur issu de connaissances générales, pas de données de marché en temps réel, et qu'il faut le recouper avec des sources à jour (APEC, grilles de convention collective, offres publiées).`,
  },
];

export function getTool(id: string) {
  return TOOLS.find((t) => t.id === id);
}
