// Source unique des questions frequentes -- partagee entre la section FAQ
// publique de la landing (components/landing/faq.tsx) et la modale
// "Aide et paramètres" du dashboard (components/dashboard/help-modal.tsx),
// pour ne jamais avoir deux listes de reponses qui divergent avec le temps.
export const faqs = [
  {
    question: "Comment fonctionne le calcul des marges réelles ?",
    answer:
      "MargeMax combine le prix produit, la livraison et les frais d'importation réellement appliqués — chaque donnée est marquée confirmée, estimée ou indisponible, jamais devinée. Dès que le total réellement payé au checkout est retrouvé, un badge de vérification croisée confirme que le calcul de marge et de ROI correspond bien à la réalité.",
  },
  {
    question: "Pourquoi acheter des crédits au lieu d'un abonnement ?",
    answer:
      "Parce que tu ne paies que ce que tu utilises, sans mensualité qui tourne dans le vide les mois calmes. Aucun engagement, aucun renouvellement automatique — tu achètes un pack quand tu en as besoin, point final.",
  },
  {
    question: "Les crédits ont-ils une date d'expiration ?",
    answer:
      "Non, jamais. Les crédits achetés t'appartiennent à vie, sans date limite ni compte à rebours — utilise-les à ton rythme.",
  },
  {
    question:
      "Que se passe-t-il si un produit AliExpress ne peut pas être analysé ?",
    answer:
      "Tu es prévenu immédiatement et aucun crédit n'est débité. MargeMax n'invente jamais une donnée manquante : si une information ne peut pas être récupérée (page indisponible, produit retiré...), elle reste clairement signalée comme absente plutôt que devinée.",
  },
  {
    question: "1 crédit correspond-il toujours à 1 analyse ?",
    answer:
      "Oui : 1 crédit = 1 analyse complète d'une annonce AliExpress. Les 3 crédits offerts à l'inscription (= 3 analyses) suivent la même règle.",
  },
];
