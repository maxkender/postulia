import { Info, LegalPage, Section } from "@/components/LegalPage";

export const metadata = { title: "Mentions légales — Postulia" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" intro="Qui édite et héberge le site Postulia.">
      <div className="-mt-10">
        <Section title="Éditeur du site">
          <p>
            Le site Postulia est édité par <Info k="company" />, <Info k="legalForm" />, dont le siège social est situé <Info k="address" />, immatriculée sous le numéro <Info k="registration" />.
          </p>
          <ul>
            <li>Numéro de TVA intracommunautaire : <Info k="vat" /></li>
            <li>Directeur de la publication : <Info k="director" /></li>
            <li>Contact : <Info k="email" /></li>
          </ul>
        </Section>

        <Section title="Hébergement">
          <p>Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (vercel.com).</p>
          <p>Les données des comptes sont hébergées par Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992 (supabase.com), sur des serveurs situés dans l'Union européenne (région de Paris).</p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>La marque Postulia, le site, son interface, ses textes et ses éléments graphiques sont la propriété de l'éditeur. Toute reproduction ou réutilisation sans autorisation écrite est interdite.</p>
          <p>Les documents que vous créez avec Postulia (CV, lettres, messages) vous appartiennent.</p>
        </Section>

        <Section title="Responsabilité">
          <p>Postulia fournit des outils d'aide à la candidature qui s'appuient sur l'intelligence artificielle. Les contenus générés peuvent contenir des erreurs : il vous appartient de les relire et de les vérifier avant tout envoi. L'éditeur ne garantit ni l'obtention d'un entretien ni celle d'un emploi.</p>
          <p>Les offres d'emploi affichées proviennent de sites tiers. L'éditeur n'est pas responsable de leur contenu, de leur exactitude ni de leur disponibilité.</p>
        </Section>

        <Section title="Signaler un contenu ou un problème">
          <p>Pour toute question ou réclamation, écrivez à <Info k="email" />.</p>
        </Section>
      </div>
    </LegalPage>
  );
}
