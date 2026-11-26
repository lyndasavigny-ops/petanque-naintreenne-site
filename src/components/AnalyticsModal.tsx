"use client";

import React, { useState } from "react";
import { X, TrendingUp, Calendar, Clock, BarChart3, Users, ShieldAlert, Award } from "lucide-react";
import { AnalyticsData } from "@/types";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: AnalyticsData | null;
  isAdmin: boolean;
}

export default function AnalyticsModal({ isOpen, onClose, analyticsData, isAdmin }: AnalyticsModalProps) {
  const [activeView, setActiveView] = useState<"daily" | "monthly">("daily");

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-red-100">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Accès Réservé</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Le graphique des visites est confidentiel et réservé aux dirigeants du club. Veuillez vous connecter avec vos identifiants.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const stats = analyticsData?.stats || { today: 0, thisMonth: 0, thisYear: 0, total: 0 };
  const daily = analyticsData?.chartDaily || [];
  const monthly = analyticsData?.chartMonthly || [];

  // Calculate maximum for chart scale
  const maxDaily = Math.max(...daily.map((d) => d.count), 10);
  const maxMonthly = Math.max(...monthly.map((m) => m.count), 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-sky-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <BarChart3 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">Statistiques & Graphique des Visites</h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3 inline" /> Privé Club
                </span>
              </div>
              <p className="text-sky-200 text-xs mt-0.5">Audience de la Pétanque Naintreénne en direct</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-4 text-center">
              <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-sky-900">{stats.today}</div>
              <div className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">Aujourd'hui</div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4 text-center">
              <Calendar className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-teal-900">{stats.thisMonth}</div>
              <div className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Ce Mois</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-4 text-center">
              <TrendingUp className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-amber-900">{stats.thisYear}</div>
              <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Cette Année</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 text-center">
              <Users className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-slate-800">{stats.total}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Visites</div>
            </div>
          </div>

          {/* Toggle Daily / Monthly */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              {activeView === "daily" ? "Évolution quotidienne (30 derniers jours)" : "Évolution mensuelle"}
            </h4>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveView("daily")}
                className={`px-3 py-1 rounded-md transition ${
                  activeView === "daily" ? "bg-white text-sky-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Par Jour (30j)
              </button>
              <button
                onClick={() => setActiveView("monthly")}
                className={`px-3 py-1 rounded-md transition ${
                  activeView === "monthly" ? "bg-white text-sky-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Par Mois
              </button>
            </div>
          </div>

          {/* Graphical View */}
          {activeView === "daily" ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-end gap-1.5 h-48 pt-6 pb-2 overflow-x-auto">
                {daily.map((item, idx) => {
                  const heightPercent = Math.max(8, Math.round((item.count / maxDaily) * 100));
                  return (
                    <div key={idx} className="flex-1 min-w-[14px] flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        {item.date} : <strong>{item.count}</strong> visite(s)
                      </div>
                      {/* Bar */}
                      <div className="w-full bg-slate-200 rounded-t-sm overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-sky-600 to-teal-400 group-hover:from-sky-500 group-hover:to-teal-300 transition-all rounded-t-sm"
                        />
                      </div>
                      {/* Label on every 5th or 6th bar */}
                      {idx % 5 === 0 && (
                        <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap transform -rotate-45 origin-top-left">
                          {item.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-right text-[11px] text-slate-400 mt-2">
                Échelle max : {maxDaily} visites/jour
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              {monthly.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500">Données mensuelles en cours de compilation...</p>
              ) : (
                <div className="space-y-2.5">
                  {monthly.map((m, idx) => {
                    const widthPercent = Math.max(10, Math.round((m.count / maxMonthly) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Mois {m.monthStr}</span>
                          <span className="text-sky-700 font-bold">{m.count} visites</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${widthPercent}%` }}
                            className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Privacy Note */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Confidentialité garantie :</strong> Seuls les membres connectés avec un rôle dirigeant peuvent
              accéder à ce graphique. Les visiteurs publics voient uniquement le compteur de visites global.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Fermer le panneau
          </button>
        </div>
      </div>
    </div>
  );
}
