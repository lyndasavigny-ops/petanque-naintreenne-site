"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Shield, Trophy, Users, Award } from "lucide-react";

export default function FaqTab() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment prendre ou renouveler sa licence à la Pétanque Naintreénne ?",
      a: "Pour obtenir ou renouveler votre licence FFPJP, vous devez fournir un certificat médical (ou questionnaire de santé QS-SPORT si licence récente), une photo d'identité et régler la cotisation annuelle lors des permanences au boulodrome ou auprès de notre secrétaire Sylvie Renard.",
    },
    {
      q: "Comment fonctionne le Championnat Départemental des Clubs (CDC) ?",
      a: "Le CDC est une compétition officielle par équipes opposant les clubs de la Vienne. Chaque rencontre comporte des tête-à-tête, doublettes et triplettes. Une victoire rapporte 3 points (ou selon le barème configuré), un match nul 2 points, une défaite 1 point et un forfait 0 point.",
    },
    {
      q: "Quels sont les horaires des entraînements au boulodrome municipal ?",
      a: "Les entraînements libres et dirigés ont lieu chaque mardi et jeudi de 14h00 à 19h00, ainsi que le vendredi soir de 18h00 à 22h00. Les concours internes et officiels se déroulent généralement le samedi et le dimanche.",
    },
    {
      q: "Quelles sont les différentes catégories de joueurs (Élite, Honneur, Promotion...) ?",
      a: "La FFPJP classe les joueurs en 4 catégories selon leurs points de performance en concours : Élite (plus haut niveau départemental/régional), Honneur (joueurs confirmés), Promotion (pratiquants réguliers) et Non classé (nouveaux adhérents et loisirs).",
    },
    {
      q: "Comment les résultats et classements sont-ils mis à jour sur ce site ?",
      a: "Les résultats sont saisis en direct par les capitaines et dirigeants du club via l'espace d'administration. Dès qu'un score est modifié, le classement se recalcule automatiquement selon les règles de points.",
    },
    {
      q: "Puis-je créer un site identique pour mon comité ou un autre club ?",
      a: "Oui absolument ! Ce site est conçu de manière modulaire et prêt à être déployé sur Vercel et GitHub pour n'importe quel club ou comité départemental.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Foire Aux Questions (FAQ)</h2>
          <p className="text-xs text-slate-500">Toutes les réponses sur la vie du club, les licences et le CDC</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-teal-600 font-extrabold text-base">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
