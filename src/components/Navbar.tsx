"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Home,
  Newspaper,
  Shield,
  Calendar,
  Award,
  Camera,
  Handshake,
  HelpCircle,
  CreditCard,
  MessageSquare,
  LogOut,
  LogIn,
  BarChart2,
  ChevronDown,
  Eye,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { User, AnalyticsData } from "@/types";

export type NavTab =
  | "accueil"
  | "actualites"
  | "club"
  | "saison"
  | "scores"
  | "medias"
  | "partenaires"
  | "faq"
  | "licences"
  | "forum";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAnalytics: () => void;
  analyticsData: AnalyticsData | null;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenAnalytics,
  analyticsData,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: "accueil", label: "ACCUEIL", icon: <Home className="w-3.5 h-3.5" /> },
    { id: "actualites", label: "ACTUALITÉS", icon: <Newspaper className="w-3.5 h-3.5" /> },
    { id: "club", label: "CLUB", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "saison", label: "SAISON", icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "scores", label: "SCORES & CLASSEMENTS", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "medias", label: "MÉDIAS", icon: <Camera className="w-3.5 h-3.5" /> },
    { id: "partenaires", label: "PARTENAIRES", icon: <Handshake className="w-3.5 h-3.5" /> },
    { id: "faq", label: "FAQ", icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: "licences", label: "LICENCES", icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: "forum", label: "FORUM", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const stats = analyticsData?.stats || { today: 0, thisMonth: 0, thisYear: 0, total: 0 };

  return (
    <header className="sticky top-0 z-40 bg-[#142332] text-white border-b border-sky-950/60 shadow-lg">
      {/* Top bar with logo, nav, and user actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab("accueil")}
            className="flex items-center gap-2.5 text-left shrink-0 group focus:outline-none"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-teal-400 shadow-md group-hover:scale-105 transition transform bg-slate-900">
              <Image
                src="/images/logo.png"
                alt="Logo Pétanque Naintreénne"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="leading-tight">
              <span className="block font-black text-sm sm:text-base tracking-wide text-white font-sans uppercase">
                PÉTANQUE
              </span>
              <span className="block text-[11px] sm:text-xs font-bold text-teal-400 uppercase tracking-widest">
                NAINTRÉENNE
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1 font-semibold text-[11px] tracking-wide">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "text-teal-300 bg-teal-950/60 border border-teal-500/40 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={isActive ? "text-teal-400" : "text-slate-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* Private Graph Trigger for Admin */}
            {currentUser && (
              <button
                onClick={onOpenAnalytics}
                title="Graphique privé des visites (Réservé au club)"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-800/60 text-xs font-semibold transition"
              >
                <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden md:inline">Graphique Visites</span>
              </button>
            )}

            {/* User Pill or Login Button */}
            {currentUser ? (
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{currentUser.displayName || currentUser.username}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-200" />
                  </button>

                  <button
                    onClick={onLogout}
                    title="Déconnexion"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-200">
                    <div className="px-3 py-1.5 border-b border-slate-800 font-semibold text-slate-400 text-[10px] uppercase">
                      Connecté en tant que {currentUser.role}
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAnalytics();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-sky-300"
                    >
                      <BarChart2 className="w-4 h-4 text-sky-400" />
                      <span>Graphique des Visites (Privé)</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab("club");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-teal-400" />
                      <span>Gérer Notre Club & Arbitres</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab("scores");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Gérer CDC & Classements</span>
                    </button>
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-950/40 text-red-400 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion Club</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Medium Screen Sub-nav (for lg screens between 1024 and 1280) */}
        <div className="hidden lg:flex xl:hidden items-center justify-center gap-1 pb-2 overflow-x-auto text-[11px] font-semibold border-t border-slate-800/80 pt-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition whitespace-nowrap ${
                activeTab === item.id
                  ? "text-teal-300 bg-teal-950/60 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Visitor Counter Ribbon */}
      <div className="bg-[#0c1620] border-t border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Direct Club
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Visites Aujourd'hui :</span>
              <strong className="text-white bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800/50">
                {stats.today}
              </strong>
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline">
              Ce mois : <strong className="text-slate-200">{stats.thisMonth}</strong>
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline">
              Cette année : <strong className="text-slate-200">{stats.thisYear}</strong>
            </span>
            <span className="hidden lg:inline text-slate-500">·</span>
            <span className="hidden lg:inline">
              Total : <strong className="text-slate-200">{stats.total}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={onOpenAnalytics}
                className="text-teal-400 hover:text-teal-300 underline flex items-center gap-1 text-[11px]"
              >
                <BarChart2 className="w-3 h-3" />
                <span>Voir le graphique réservé au club</span>
              </button>
            ) : (
              <span className="text-slate-500 italic text-[10px]">
                Graphique complet réservé aux dirigeants (connectez-vous)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
                activeTab === item.id
                  ? "bg-teal-900/60 text-teal-300 border border-teal-500/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          {currentUser && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenAnalytics();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-sky-400 bg-sky-950/60"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Afficher le Graphique des Visites</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
