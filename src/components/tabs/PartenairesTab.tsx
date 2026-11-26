"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Handshake, Plus, Edit, Trash2, ExternalLink, X } from "lucide-react";
import { Partner } from "@/types";
import ImageUpload from "@/components/ImageUpload";

interface PartenairesTabProps {
  partners: Partner[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function PartenairesTab({ partners, isAdmin, onRefresh }: PartenairesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");

  const openAdd = () => {
    setEditingItem(null);
    setName("");
    setLogoUrl("https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=80");
    setWebsiteUrl("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (item: Partner) => {
    setEditingItem(item);
    setName(item.name);
    setLogoUrl(item.logoUrl);
    setWebsiteUrl(item.websiteUrl || "");
    setDescription(item.description || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !logoUrl.trim()) return;

    try {
      if (editingItem) {
        await fetch("/api/partners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            name: name.trim(),
            logoUrl: logoUrl.trim(),
            websiteUrl: websiteUrl.trim(),
            description: description.trim(),
          }),
        });
      } else {
        await fetch("/api/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            logoUrl: logoUrl.trim(),
            websiteUrl: websiteUrl.trim(),
            description: description.trim(),
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
    if (!confirm("Voulez-vous supprimer ce partenaire ?")) return;
    try {
      await fetch(`/api/partners?id=${id}`, { method: "DELETE" });
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
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Nos Partenaires & Sponsors</h2>
            <p className="text-xs text-slate-500">Ils soutiennent la Pétanque Naintreénne tout au long de la saison</p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter un Partenaire</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 flex items-center justify-center p-2">
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{partner.name}</h3>
              {partner.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{partner.description}</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {partner.websiteUrl && partner.websiteUrl !== "#" ? (
                <a
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                >
                  <span>Visiter</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 text-[11px]">Partenaire Officiel</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(partner)}
                  className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                  title="Modifier"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? "Modifier le Partenaire" : "Ajouter un Partenaire"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du partenaire / Sponsor *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mairie de Naintré, Boulangerie..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={logoUrl}
                  onChange={setLogoUrl}
                  label="Logo du Partenaire / Sponsor (Téléchargement)"
                  helperText="Téléchargez le logo de l'entreprise ou partenaire"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Web (Optionnel)</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.exemple.fr"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Soutien</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fournisseur tenues, soutien concours..."
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
                  {editingItem ? "Mettre à jour" : "Ajouter le Partenaire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
