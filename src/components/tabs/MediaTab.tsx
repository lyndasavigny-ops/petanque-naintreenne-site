"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Video, Plus, Edit, Trash2, Play, X, ExternalLink } from "lucide-react";
import { MediaItem } from "@/types";
import ImageUpload from "@/components/ImageUpload";

interface MediaTabProps {
  media: MediaItem[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function MediaTab({ media, isAdmin, onRefresh }: MediaTabProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "photo" | "video">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"photo" | "video">("photo");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Club");

  const filtered = media.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditingItem(null);
    setTitle("");
    setType("photo");
    setUrl("/images/banner.jpg");
    setDescription("");
    setCategory("Club");
    setShowModal(true);
  };

  const openEdit = (item: MediaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setType(item.type);
    setUrl(item.url);
    setDescription(item.description || "");
    setCategory(item.category);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    try {
      if (editingItem) {
        await fetch("/api/media", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            title: title.trim(),
            type,
            url: url.trim(),
            description: description.trim(),
            category,
          }),
        });
      } else {
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            type,
            url: url.trim(),
            description: description.trim(),
            category,
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
    if (!confirm("Voulez-vous supprimer ce média ?")) return;
    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" });
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
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Galerie Médias du Club</h2>
            <p className="text-xs text-slate-500">Photos des concours, entraînements et vidéos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Tous ({media.length})
            </button>
            <button
              onClick={() => setTypeFilter("photo")}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === "photo" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setTypeFilter("video")}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === "video" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Vidéos
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter Photo / Vidéo</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-900 group">
                {item.type === "photo" ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-xs text-slate-300 mt-2">Vidéo Pétanque Naintreénne</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  {item.type === "photo" ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3 text-rose-400" />}
                  <span>{item.category}</span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              {item.type === "video" ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 text-xs"
                >
                  <span>Visionner</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-400">Pétanque Naintreénne</span>
              )}

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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? "Modifier le média" : "Ajouter un média"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre du média *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Concours du club 2025"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "photo" | "video")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Club, Concours, Entraînement..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                {type === "photo" ? (
                  <ImageUpload
                    value={url}
                    onChange={setUrl}
                    label="Photo à ajouter (Téléchargement)"
                    helperText="Téléchargez une photo depuis votre appareil"
                    aspectRatio="banner"
                  />
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Lien de la Vidéo (YouTube / MP4) *
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Légende de la photo ou du match..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
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
                  {editingItem ? "Mettre à jour" : "Ajouter le Média"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
