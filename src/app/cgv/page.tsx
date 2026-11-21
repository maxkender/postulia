import Link from "next/link";
import { Info, LegalPage, Section } from "@/components/LegalPage";
import { PLANS } from "@/lib/stripe";

export const metadata = { title: "Conditions générales — Postulia" };

export default function Page() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente" intro="Les règles qui s'appliquent quand vous utilisez Postulia, gratuitement ou avec l'abonnement Pro.">
      <div className="-mt-10">
        <Section title="1. Objet">
          <p>Les présentes conditions régissent l'accès au site Postulia et l'utilisation de ses services, édités par <Info k="company" /> (« l'éditeur »). Elles s'appliquent à toute personne qui crée un compte (« vous »). En créant un compte, vous les acceptez.</p>
        </Section>

        <Section title="2. Le service">
          <p>Postulia est un assistant de candidature. Il permet notamment :</p>
          <ul>
            <li>de rechercher des offres d'emploi publiées par des sites tiers et d'importer une annonce ;</li>
            <li>d'analyser une offre et de générer un CV, une lettre de motivation et d'autres textes à l'aide de l'intelligence artificielle ;</li>
            <li>de s'entraîner à un entretien, de suivre ses candidatures et ses contacts.</li>
          </ul>
          <p>Postulia n'envoie aucune candidature à votre place et n'est ni un cabinet de recrutement ni un employeur.</p>
        </Section>

        <Section title="3. Compte">
          <p>Vous devez avoir au moins 16 ans et fournir une adresse e-mail valide. Vous êtes responsable de la confidentialité de vos identifiants et de l'activité réalisée depuis votre compte.</p>
        </Section>

        <Section title="4. Offres et prix">
          <ul>
            <li><b>Offre gratuite</b> : {PLANS.free.dailyGenerations} générations par période de 24 heures, sans limite de durée.</li>
            <li><b>Offre Pro</b> : {PLANS.pro.dailyGenerations} générations par période de 24 heures, au prix de {PLANS.pro.priceLabel} par mois.</li>
          </ul>
          <p>Une « génération » correspond à un document rédigé ou à une analyse produite par l'intelligence artificielle. Les prix sont indiqués en euros ; le montant total à payer, taxes comprises le cas échéant, est affiché avant la validation du paiement. L'éditeur peut modifier ses prix pour l'avenir : vous en êtes informé au moins 30 jours avant et pouvez résilier sans frais.</p>
        </Section>

        <Section title="5. Paiement, durée et renouvellement">
          <p>Le paiement de l'offre Pro est réalisé par carte bancaire auprès de notre prestataire Stripe. L'éditeur n'a jamais accès à vos données de carte.</p>
          <p>L'abonnement est conclu pour une durée d'un mois et se renouvelle automatiquement chaque mois, au même prix, jusqu'à sa résiliation.</p>
        </Section>

        <Section title="6. Résiliation">
          <p>Vous pouvez résilier l'abonnement à tout moment, en quelques clics, depuis la page « Offre » de votre espace. La résiliation prend effet à la fin de la période mensuelle déjà payée : vous conservez l'accès Pro jusqu'à cette date, puis votre compte repasse à l'offre gratuite.</p>
          <p>L'éditeur peut suspendre ou fermer un compte en cas de manquement aux présentes conditions, après vous en avoir informé, sauf urgence.</p>
        </Section>

        <Section title="7. Droit de rétractation">
          <p>Si vous êtes un consommateur, vous disposez d'un délai de 14 jours à compter de la souscription de l'abonnement Pro pour vous rétracter, sans avoir à motiver votre décision. Il suffit d'écrire à <Info k="email" /> en indiquant l'adresse e-mail de votre compte. L'éditeur vous rembourse alors la totalité de la somme versée, dans les 14 jours suivant votre demande, par le même moyen de paiement.</p>
        </Section>

        <Section title="8. Contenus générés par l'intelligence artificielle">
          <ul>
            <li>Les contenus sont produits automatiquement à partir des informations que vous fournissez. Ils peuvent comporter des erreurs, des approximations ou des oublis.</li>
            <li>Vous devez les relire, les corriger et vous assurer qu'ils reflètent fidèlement votre parcours avant de les utiliser. Vous restez seul responsable des candidatures que vous envoyez.</li>
            <li>Les scores, analyses et estimations de salaire sont indicatifs.</li>
            <li>L'éditeur ne garantit pas l'obtention d'un entretien ou d'un emploi.</li>
          </ul>
        </Section>

        <Section title="9. Vos engagements">
          <p>Vous vous engagez à fournir des informations exactes sur votre parcours, à ne pas utiliser le service pour créer de fausses qualifications ou usurper une identité, à ne pas tenter de contourner les limites d'utilisation, et à n'enregistrer dans votre carnet de contacts que des informations professionnelles obtenues loyalement.</p>
        </Section>

        <Section title="10. Propriété intellectuelle">
          <p>Les documents que vous créez vous appartiennent. Le site, la marque et le logiciel restent la propriété de l'éditeur, qui vous accorde un droit d'utilisation personnel et non cessible pendant la durée de votre compte.</p>
        </Section>

        <Section title="11. Disponibilité et responsabilité">
          <p>L'éditeur s'efforce de maintenir le service accessible, sans garantir une disponibilité continue : des interruptions pour maintenance ou des pannes de prestataires peuvent survenir. Les offres d'emploi proviennent de tiers et peuvent être inexactes ou périmées.</p>
          <p>La responsabilité de l'éditeur est limitée aux dommages directs et prévisibles résultant d'un manquement de sa part. Rien dans les présentes conditions ne limite les droits que la loi reconnaît aux consommateurs, notamment la garantie légale de conformité applicable aux services numériques.</p>
        </Section>

        <Section title="12. Données personnelles">
          <p>Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
        </Section>

        <Section title="13. Réclamations et médiation">
          <p>Pour toute réclamation, écrivez d'abord à <Info k="email" />. Si aucune solution n'est trouvée dans un délai de deux mois, et si vous êtes un consommateur, vous pouvez saisir gratuitement le médiateur de la consommation dont relève l'éditeur : <Info k="mediator" />.</p>
        </Section>

        <Section title="14. Modification des conditions et droit applicable">
          <p>L'éditeur peut modifier les présentes conditions. Les changements importants vous sont notifiés par e-mail ou dans votre espace avant leur entrée en vigueur.</p>
          <p>Les présentes conditions sont soumises au droit français. Si vous êtes un consommateur résidant dans un autre pays, vous conservez la protection des règles impératives de votre pays de résidence.</p>
        </Section>
      </div>
    </LegalPage>
  );
}
