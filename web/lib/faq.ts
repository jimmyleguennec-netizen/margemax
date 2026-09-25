// Source unique des questions frequentes -- partagee entre la section FAQ
// publique de la landing (components/landing/faq.tsx) et la modale
// "Aide et paramètres" du dashboard (components/dashboard/help-modal.tsx),
// pour ne jamais avoir deux listes de reponses qui divergent avec le temps.
export const faqs = [
  {
    question: "Comment fonctionne le calcul des marges réelles ?",
    answer:
      "MargeMax fait une analyse et une estimation des coûts réels : prix produit, livraison et frais d'importation (TVA/douane), lus sur la fiche publique de l'annonce AliExpress. Chaque donnée est marquée confirmée, estimée ou indisponible. Quand un montant n'est pas affiché sur la fiche (les taxes, par exemple, ne sont connues qu'au paiement), il est estimé par une règle indiquée à l'écran, et le résultat s'affiche « partiellement vérifié ». MargeMax n'a pas accès à ton panier AliExpress : vérifie toujours le total final au moment de commander.",
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
      "Si l'annonce ne peut pas du tout être analysée (page indisponible, produit retiré, accès bloqué), tu es prévenu immédiatement et aucun crédit n'est débité. Si l'analyse aboutit mais que certaines données manquent, le résultat est affiché avec ce qui a été trouvé : les valeurs estimées sont clairement signalées comme telles, et l'analyse compte alors pour 1 crédit.",
  },
  {
    question: "1 crédit correspond-il toujours à 1 analyse ?",
    answer:
      "Oui : 1 crédit = 1 analyse aboutie d'une annonce AliExpress (analyse et estimation des coûts), qu'elle soit complète ou partiellement vérifiée. Les 3 crédits offerts à l'inscription (= 3 analyses) suivent la même règle.",
  },
];
