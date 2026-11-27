"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { NewsSlide } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import { DEFAULT_BANNER } from "@/assets/defaultImages";

interface NewsTabProps {
  news: NewsSlide[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function NewsTab({ news, isAdmin, onRefresh }: NewsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsSlide | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("Actualité");
  const [isSlide, setIsSlide] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  const openAdd = () => {
    setEditingItem(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setImageUrl("/images/banner.jpg");
    setBadge("Actualité");
    setIsSlide(true);
    setIsUrgent(false);
    setShowModal(true);
  };

  const openEdit = (item: NewsSlide) => {
    setEditingItem(item);
    setTitle(item.title);
    setSubtitle(item.subtitle || "");
    setContent(item.content);
    setImageUrl(item.imageUrl || "/images/banner.jpg");
    setBadge(item.badge || "Actualité");
    setIsSlide(item.isSlide);
    setIsUrgent(item.isUrgent);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingItem) {
        await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            title: title.trim(),
            subtitle: subtitle.trim(),
            content: content.trim(),
            imageUrl: imageUrl.trim(),
            badge: badge.trim(),
            isSlide,
            isUrgent,
          }),
        });
      } else {
        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            subtitle: subtitle.trim(),
            content: content.trim(),
            imageUrl: imageUrl.trim(),
            badge: badge.trim(),
            isSlide,
            isUrgent,
          }),
        });
      }
      setShowModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous supprimer cette actualité ?")) return;
    try {
      await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Dernières Actualités du Club</h2>
            <p className="text-xs text-slate-500">Mises à jour et informations de la Pétanque Naintreénne</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter une Actualité / Slide</span>
          </button>
        )}
      </div>

      {/* Grid of news articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={item.imageUrl || DEFAULT_BANNER}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-teal-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                    {item.badge}
                  </span>
                  {item.isUrgent && (
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-2">
                {item.subtitle && (
                  <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                    {item.subtitle}
                  </div>
                )}
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {item.content}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
              </span>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? "Modifier l'Actualité / Slide" : "Ajouter une Actualité / Slide"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Résultats du concours..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sous-titre</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Samedi au boulodrome"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Actualité, Compétition, Événement..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Texte / Contenu *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez l'actualité..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Image de l'Actualité / Slide (Téléchargement)"
                  helperText="Téléchargez l'illustration depuis votre appareil"
                  aspectRatio="banner"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSlide}
                    onChange={(e) => setIsSlide(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <span className="text-slate-700 font-medium">Afficher dans le carrousel de l'Accueil</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-red-700 font-medium">Marquer comme Urgent</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingItem ? "Mettre à jour" : "Publier l'actualité"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
