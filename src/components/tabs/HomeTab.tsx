"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Trophy,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Radio,
  Eye,
  X,
} from "lucide-react";
import { NewsSlide, CalendarMatch, ClubInfo } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import { DEFAULT_BANNER, DEFAULT_LOGO } from "@/assets/defaultImages";

interface HomeTabProps {
  slides: NewsSlide[];
  matches: CalendarMatch[];
  clubInfo: ClubInfo;
  isAdmin: boolean;
  onNavigateTab: (tab: any) => void;
  onRefresh: () => void;
}

export default function HomeTab({
  slides,
  matches,
  clubInfo,
  isAdmin,
  onNavigateTab,
  onRefresh,
}: HomeTabProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Slide modal
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<NewsSlide | null>(null);
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideContent, setSlideContent] = useState("");
  const [slideImage, setSlideImage] = useState("");
  const [slideBadge, setSlideBadge] = useState("À la Une");

  // Auto advance slides every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % Math.max(slides.length, 1));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % Math.max(slides.length, 1));
  };

  const openAddSlide = () => {
    setEditingSlide(null);
    setSlideTitle("");
    setSlideSubtitle("");
    setSlideContent("");
    setSlideImage("/images/banner.jpg");
    setSlideBadge("Actualité");
    setShowSlideModal(true);
  };

  const openEditSlide = (slide: NewsSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle || "");
    setSlideContent(slide.content);
    setSlideImage(slide.imageUrl || "/images/banner.jpg");
    setSlideBadge(slide.badge || "Actualité");
    setShowSlideModal(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideContent.trim()) return;

    try {
      if (editingSlide) {
        await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSlide.id,
            title: slideTitle.trim(),
            subtitle: slideSubtitle.trim(),
            content: slideContent.trim(),
            imageUrl: slideImage.trim(),
            badge: slideBadge.trim(),
            isSlide: true,
          }),
        });
      } else {
        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: slideTitle.trim(),
            subtitle: slideSubtitle.trim(),
            content: slideContent.trim(),
            imageUrl: slideImage.trim(),
            badge: slideBadge.trim(),
            isSlide: true,
          }),
        });
      }
      setShowSlideModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce slide de l'accueil ?")) return;
    try {
      await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Official Banner (Photo 2 Ribbon & Photo 3 Crest) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sky-100 bg-gradient-to-r from-sky-900 via-sky-800 to-teal-900">
        {/* Sky Background with Turquoise Ribbon Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <img
            src={DEFAULT_BANNER}
            alt="Pétanque Naintreénne Bannière Officielle"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Subtle azure overlay for legibility without overpowering */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

          {/* Shield Badge Overlay & Welcome Title */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-teal-300 shadow-2xl bg-slate-900 shrink-0 flex items-center justify-center">
                  <img src={DEFAULT_LOGO} alt="Blason Club" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-500/90 text-slate-950 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Radio className="w-3 h-3 text-slate-900 animate-pulse" /> Site Officiel
                    </span>
                    <span className="text-sky-200 text-xs hidden sm:inline">Vienne (86) • Naintré</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md mt-1">
                    Pétanque Naintreénne
                  </h1>
                  <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl line-clamp-2 drop-shadow">
                    Bienvenue sur le portail en direct de notre club : classements CDC, équipes, calendrier et vie sportive.
                  </p>
                </div>
              </div>

              {/* Fast Call to Actions */}
              <div className="flex items-center gap-2 sm:self-end">
                <button
                  onClick={() => onNavigateTab("scores")}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Scores & Classements</span>
                </button>

                <button
                  onClick={() => onNavigateTab("licences")}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Nos Licenciés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Dynamic Slides Carousel with Add/Edit/Delete Controls */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Slide Carousel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg font-bold text-sm">📢</span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Actualités & Slides du Club</h3>
              <p className="text-xs text-slate-500">Mises à jour visibles en temps réel par les supporters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Slide Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevSlide}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition"
                aria-label="Slide Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-500 px-1">
                {currentSlideIndex + 1} / {Math.max(slides.length, 1)}
              </span>
              <button
                onClick={nextSlide}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition"
                aria-label="Slide Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Add Slide Button */}
            {isAdmin && (
              <button
                onClick={openAddSlide}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter un Slide</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Slide Display */}
        {activeSlide && (
          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-full md:w-1/2 h-56 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow bg-slate-100 shrink-0">
              <img
                src={activeSlide.imageUrl || DEFAULT_BANNER}
                alt={activeSlide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-teal-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                {activeSlide.badge || "Actualité"}
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">
                {activeSlide.subtitle || "Club Pétanque Naintreénne"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {activeSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeSlide.content}
              </p>

              {/* Actions on this slide */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => onNavigateTab("actualites")}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>Toutes les actualités</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditSlide(activeSlide)}
                      className="p-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 transition"
                      title="Modifier ce slide"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    {slides.length > 1 && (
                      <button
                        onClick={() => handleDeleteSlide(activeSlide.id)}
                        className="p-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition"
                        title="Supprimer ce slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carousel Dots */}
        <div className="p-3 bg-slate-50 flex justify-center items-center gap-2 border-t border-slate-100">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIndex ? "w-8 bg-teal-500" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Prochaines Rencontres CDC / Coupes Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Next Matches Preview */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <h3 className="font-extrabold text-slate-800 text-base">Prochaines Rencontres au Calendrier</h3>
            </div>
            <button
              onClick={() => onNavigateTab("saison")}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Voir tout le calendrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 hover:bg-sky-50/60 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {match.competitionName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(match.matchDate).toLocaleDateString("fr-FR")} à {match.matchTime}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    Pétanque Naintreénne <span className="text-teal-600">vs</span> {match.opponent}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{match.location}</span>
                  </span>
                  <span className="px-2 py-1 bg-white text-slate-700 font-bold border border-slate-200 rounded-md">
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Club Quick Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-[#142332] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Boulodrome Municipal</span>
            </div>
            <h3 className="text-lg font-black">{clubInfo.clubName}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Venez pratiquer la pétanque en loisir ou en compétition au sein de notre club affilié à la FFPJP.
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-slate-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{clubInfo.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{clubInfo.trainingHours}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Comité Vienne 86</span>
            <button
              onClick={() => onNavigateTab("club")}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg shadow-sm"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingSlide ? "Modifier le Slide" : "Ajouter un nouveau Slide"}
              </h3>
              <button onClick={() => setShowSlideModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre Principal *</label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="Ex: Victoire en championnat CDC..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sous-titre</label>
                  <input
                    type="text"
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    placeholder="Ex: Division 1 - Rencontre Châtellerault"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={slideBadge}
                    onChange={(e) => setSlideBadge(e.target.value)}
                    placeholder="À la Une, Compétition, Événement..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Texte / Contenu du slide *</label>
                <textarea
                  rows={3}
                  value={slideContent}
                  onChange={(e) => setSlideContent(e.target.value)}
                  placeholder="Détails de l'actualité..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={slideImage}
                  onChange={setSlideImage}
                  label="Image du Slide (Téléchargement)"
                  helperText="Téléchargez l'illustration pour ce slide d'accueil"
                  aspectRatio="banner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingSlide ? "Mettre à jour" : "Publier le Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
