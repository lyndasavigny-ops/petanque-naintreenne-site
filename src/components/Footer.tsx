"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, MapPin, Mail, Phone, Heart, GitBranch, Globe, ExternalLink, HelpCircle } from "lucide-react";
import { ClubInfo, AnalyticsData } from "@/types";

interface FooterProps {
  clubInfo: ClubInfo;
  analyticsData: AnalyticsData | null;
  onOpenLogin: () => void;
  onOpenAnalytics: () => void;
  isAdmin: boolean;
}

export default function Footer({
  clubInfo,
  analyticsData,
  onOpenLogin,
  onOpenAnalytics,
  isAdmin,
}: FooterProps) {
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const stats = analyticsData?.stats || { today: 0, thisMonth: 0, thisYear: 0, total: 0 };

  return (
    <footer className="bg-[#0e1a26] text-slate-400 border-t border-slate-800 text-xs mt-16">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Club Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-teal-400/50 bg-slate-900">
                <Image src="/images/logo.png" alt="Logo PN" fill className="object-cover" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-wide block">
                  PÉTANQUE NAINTRÉENNE
                </span>
                <span className="text-[11px] text-teal-400 font-bold block">
                  Vienne (86) • Affilié FFPJP
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Club sportif et convivial de pétanque à Naintré. Championnats Départementaux des Clubs (CDC) et coupes.
            </p>
          </div>

          {/* Col 2: Coordonnées */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
              Coordonnées
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span>{clubInfo.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span className="break-all">{clubInfo.email}</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span>{clubInfo.phone}</span>
            </div>
          </div>

          {/* Col 3: Compteur & Audience */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
              Audience du Site
            </h4>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>Visites aujourd'hui :</span>
                <strong className="text-teal-400">{stats.today}</strong>
              </div>
              <div className="flex justify-between">
                <span>Visites ce mois :</span>
                <strong className="text-slate-200">{stats.thisMonth}</strong>
              </div>
              <div className="flex justify-between">
                <span>Visites cette année :</span>
                <strong className="text-slate-200">{stats.thisYear}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span>Total historique :</span>
                <strong className="text-white">{stats.total}</strong>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={onOpenAnalytics}
                className="text-teal-400 hover:text-teal-300 underline text-[11px] block mt-1"
              >
                📊 Ouvrir le graphique privé des visites
              </button>
            )}
          </div>

          {/* Col 4: Guide Déploiement GitHub & Vercel */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
              Mise en Ligne (Vercel & GitHub)
            </h4>
            <p className="text-xs text-slate-400">
              Prêt pour GitHub & Vercel. Vous pourrez dupliquer ce projet pour votre comité départemental.
            </p>
            <button
              onClick={() => setShowDeployGuide(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-sky-400" />
              <span>Guide Vercel & GitHub</span>
            </button>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} Pétanque Naintreénne • Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            {!isAdmin ? (
              <button onClick={onOpenLogin} className="text-slate-400 hover:text-white underline">
                Espace Dirigeant / Connexion
              </button>
            ) : (
              <span className="text-emerald-400 font-bold">✓ Espace Gestion Actif</span>
            )}
          </div>
        </div>
      </div>

      {/* Deploy Guide Modal */}
      {showDeployGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Guide : Mettre en ligne sur Vercel & GitHub</span>
              </h3>
              <button
                onClick={() => setShowDeployGuide(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Pour publier le site de votre club ou en faire un pour votre comité :
            </p>

            <ol className="list-decimal pl-4 space-y-2 text-slate-700">
              <li>
                <strong>1. Dépôt GitHub :</strong> Poussez ce projet sur votre compte GitHub (ex:{" "}
                <code>github.com/votre-nom/petanque-naintre</code>).
              </li>
              <li>
                <strong>2. Connexion Vercel :</strong> Connectez-vous sur{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 underline font-bold"
                >
                  vercel.com
                </a>
                , cliquez sur "Add New Project" et sélectionnez votre dépôt.
              </li>
              <li>
                <strong>3. Base de données PostgreSQL :</strong> Sur Vercel, ajoutez une base PostgreSQL (Vercel Postgres ou Neon gratuit) en 1 clic.
              </li>
              <li>
                <strong>4. Déploiement :</strong> Cliquez sur Deploy ! Votre site sera en ligne avec son adresse (ex: <code>petanque-naintre.vercel.app</code>) et mis à jour automatiquement à chaque modification.
              </li>
              <li>
                <strong>5. Pour le Comité :</strong> Dupliquez simplement le dépôt pour créer le site du comité avec son propre nom et ses couleurs !
              </li>
            </ol>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
              💡 Toutes les modifications de scores, photos, joueurs et actualités faites en direct sont sauvegardées immédiatement dans la base PostgreSQL.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDeployGuide(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
