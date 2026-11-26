"use client";

import React, { useState } from "react";
import { Bell, AlertTriangle, Send, Mail, CheckCircle2, X } from "lucide-react";
import { UrgentAlert } from "@/types";

interface UrgentAlertBannerProps {
  urgentAlert: UrgentAlert | null;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function UrgentAlertBanner({ urgentAlert, isAdmin, onRefresh }: UrgentAlertBannerProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // New alert form
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail) return;

    try {
      const res = await fetch("/api/urgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          email: subscriberEmail,
          name: subscriberName,
        }),
      });
      const data = await res.json();
      setSubscribeStatus(data.message || "Inscription enregistrée !");
      setTimeout(() => {
        setShowEmailModal(false);
        setSubscribeStatus(null);
        setSubscriberEmail("");
        setSubscriberName("");
      }, 2000);
    } catch {
      setSubscribeStatus("Erreur lors de l'inscription");
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastLoading(true);
    try {
      const res = await fetch("/api/urgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          title: alertTitle,
          message: alertMessage,
        }),
      });
      const data = await res.json();
      setBroadcastStatus(data.broadcastSummary || "Alerte diffusée en direct !");
      onRefresh();
      setTimeout(() => {
        setShowNewAlertModal(false);
        setBroadcastStatus(null);
        setAlertTitle("");
        setAlertMessage("");
      }, 2200);
    } catch {
      setBroadcastStatus("Erreur lors de la diffusion");
    } finally {
      setBroadcastLoading(false);
    }
  };

  return (
    <>
      {/* Active banner */}
      {urgentAlert && urgentAlert.isActive && !dismissed && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium z-40 relative animate-pulse-slow">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 flex-1 pr-4">
            <span className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-[11px]">
                {urgentAlert.title} :
              </span>
              <span>{urgentAlert.message}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-white text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Recevoir les alertes par email</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Fermer l'alerte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating trigger or Admin button for urgent messages */}
      {isAdmin && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setShowNewAlertModal(true)}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2 text-xs border border-white/20 hover:scale-105 transition transform"
          >
            <Bell className="w-4 h-4 animate-swing" />
            <span>Diffuser une Alerte Urgente</span>
          </button>
        </div>
      )}

      {/* Subscribe to urgent alerts modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-sky-100 relative">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Alertes Urgentes du Club</h3>
                <p className="text-xs text-slate-500">Pétanque Naintreénne</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Renseignez votre email pour être notifié instantanément en cas d'annulation météo, convocation de match urgente ou assemblée générale.
            </p>

            {subscribeStatus ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{subscribeStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Votre Nom / Prénom</label>
                  <input
                    type="text"
                    value={subscriberName}
                    onChange={(e) => setSubscriberName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Votre Adresse Email *</label>
                  <input
                    type="email"
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    placeholder="licencie@exemple.fr"
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                >
                  M'inscrire aux notifications urgentes
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Admin New Alert Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-red-100 relative">
            <button
              onClick={() => setShowNewAlertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Diffuser une Notification Urgente</h3>
                <p className="text-xs text-slate-500">Affichage bandeau direct + envoi aux contacts</p>
              </div>
            </div>

            {broadcastStatus ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{broadcastStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Titre d'urgence (ex: ALERTE MÉTÉO, REPORT MATCH)
                  </label>
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="Ex: Report Rencontre CDC Loudun..."
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message détaillé pour les joueurs et visiteurs
                  </label>
                  <textarea
                    rows={3}
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Précisez la date, l'horaire ou les consignes de sécurité..."
                    required
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800">
                  ⚡ Dès validation, ce message s'affichera immédiatement en direct en haut de toutes les pages pour les visiteurs.
                </div>

                <button
                  type="submit"
                  disabled={broadcastLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcastLoading ? "Diffusion en cours..." : "Publier et Diffuser en Direct"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
