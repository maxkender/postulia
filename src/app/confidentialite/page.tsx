import { Info, LegalPage, Section } from "@/components/LegalPage";

export const metadata = { title: "Politique de confidentialité — Postulia" };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité" intro="Quelles données Postulia collecte, pourquoi, avec qui elles sont partagées, et comment exercer vos droits.">
      <div className="-mt-10">
        <Section title="1. Responsable du traitement">
          <p>Le responsable du traitement est <Info k="company" />, <Info k="address" />. Pour toute question sur vos données : <Info k="email" />.</p>
        </Section>

        <Section title="2. Données que nous traitons">
          <ul>
            <li><b>Compte</b> : adresse e-mail, mot de passe (conservé sous forme chiffrée, illisible pour nous) ou identifiant Google si vous utilisez la connexion Google.</li>
            <li><b>Profil et recherche d'emploi</b> : nom, intitulé de poste, parcours ou CV que vous collez, et vos réponses au questionnaire d'accueil (situation, objectifs, type de contrat, salaire souhaité, pays et mode de travail visés).</li>
            <li><b>Candidatures</b> : offres enregistrées, texte des annonces, analyses, réponses aux questions ciblées, documents générés, statuts, dates et notes.</li>
            <li><b>Contacts</b> : les personnes que vous ajoutez à votre carnet (nom, entreprise, fonction, e-mail, lien de profil, notes). Vous êtes responsable de la loyauté de cette collecte.</li>
            <li><b>Abonnement</b> : statut de l'abonnement et identifiants techniques transmis par Stripe. Nous ne recevons ni ne conservons vos données de carte bancaire.</li>
            <li><b>Utilisation</b> : nombre et type de générations effectuées, pour appliquer les limites de votre offre.</li>
          </ul>
          <p>Nous ne vous demandons aucune donnée sensible (santé, opinions, origine…). Évitez d'en inscrire dans votre parcours ou vos notes.</p>
        </Section>

        <Section title="3. Pourquoi nous les utilisons">
          <ul>
            <li>Fournir le service : créer votre compte, générer vos documents, afficher votre suivi (exécution du contrat).</li>
            <li>Gérer l'abonnement, la facturation et les demandes de remboursement (exécution du contrat et obligations légales).</li>
            <li>Sécuriser le service et prévenir les abus (intérêt légitime).</li>
            <li>Vous envoyer les e-mails nécessaires au fonctionnement du compte, comme la confirmation d'inscription (exécution du contrat).</li>
          </ul>
          <p>Nous ne vendons pas vos données, nous ne les utilisons pas pour de la publicité, et aucune décision produisant des effets juridiques n'est prise à votre égard de manière automatisée : les scores et analyses sont de simples aides.</p>
        </Section>

        <Section title="4. Intelligence artificielle">
          <p>Pour générer un document ou une analyse, les informations utiles (votre parcours, vos réponses, le texte de l'offre) sont transmises à notre prestataire d'intelligence artificielle fal.ai, qui fait appel à des modèles de langage de fournisseurs tiers. Ces envois n'ont lieu que lorsque vous lancez une génération.</p>
        </Section>

        <Section title="5. Destinataires et sous-traitants">
          <ul>
            <li><b>Supabase</b> : hébergement de la base de données et authentification, sur des serveurs situés dans l'Union européenne (Paris).</li>
            <li><b>Vercel</b> : hébergement du site (États-Unis).</li>
            <li><b>fal.ai et les fournisseurs de modèles</b> : génération des contenus (États-Unis).</li>
            <li><b>Stripe</b> : paiement et facturation.</li>
            <li><b>Google</b> : uniquement si vous choisissez la connexion Google.</li>
            <li><b>Sites d'offres d'emploi</b> (Remotive, Arbeitnow, Jooble, Adzuna) : ils reçoivent seulement les mots-clés et le lieu de votre recherche, jamais votre identité.</li>
          </ul>
          <p>Certains de ces prestataires sont établis hors de l'Union européenne. Les transferts correspondants sont encadrés par les garanties prévues par le RGPD, telles que les clauses contractuelles types de la Commission européenne ou le cadre de protection des données UE–États-Unis.</p>
        </Section>

        <Section title="6. Durées de conservation">
          <ul>
            <li>Données du compte, du profil, des candidatures et des contacts : tant que votre compte existe, puis suppression dans les 30 jours suivant sa fermeture.</li>
            <li>Comptes inactifs : suppression après 3 ans sans connexion, après un e-mail de préavis.</li>
            <li>Pièces comptables liées aux paiements : 10 ans, conformément à la loi.</li>
          </ul>
        </Section>

        <Section title="7. Cookies et stockage local">
          <p>Postulia n'utilise ni cookie publicitaire ni outil de mesure d'audience. Seuls sont déposés les cookies strictement nécessaires à votre connexion. Vos réponses au questionnaire d'accueil sont gardées dans le stockage local de votre navigateur jusqu'à la création de votre compte. Ces éléments ne nécessitent pas votre consentement.</p>
        </Section>

        <Section title="8. Sécurité">
          <p>Les échanges avec le site sont chiffrés. Chaque compte n'a accès qu'à ses propres données, grâce à des règles appliquées directement dans la base de données. Aucun système n'étant infaillible, nous vous informerons, ainsi que l'autorité compétente, en cas de violation de données présentant un risque pour vous.</p>
        </Section>

        <Section title="9. Vos droits">
          <p>Vous pouvez accéder à vos données, les faire rectifier ou effacer, en demander une copie réutilisable, vous opposer à certains traitements ou en demander la limitation, et définir des directives sur leur sort après votre décès.</p>
          <p>Vous pouvez modifier la plupart de vos données directement dans votre espace. Pour le reste, y compris la suppression de votre compte, écrivez à <Info k="email" /> : nous répondons dans un délai d'un mois.</p>
          <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (cnil.fr) ou à l'autorité de protection des données de votre pays.</p>
        </Section>

        <Section title="10. Mineurs">
          <p>Le service s'adresse aux personnes âgées d'au moins 16 ans.</p>
        </Section>

        <Section title="11. Évolution de cette politique">
          <p>Cette politique peut évoluer. En cas de changement important, vous en êtes informé par e-mail ou dans votre espace.</p>
        </Section>
      </div>
    </LegalPage>
  );
}
