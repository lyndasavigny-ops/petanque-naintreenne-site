"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  Clock,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Award,
  X,
  CheckCircle,
} from "lucide-react";
import { ClubMember, ClubInfo } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import { DEFAULT_LOGO } from "@/assets/defaultImages";

interface ClubTabProps {
  clubInfo: ClubInfo;
  members: ClubMember[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function ClubTab({ clubInfo, members, isAdmin, onRefresh }: ClubTabProps) {
  // Club Info Edit State
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoAddress, setInfoAddress] = useState(clubInfo.address);
  const [infoEmail, setInfoEmail] = useState(clubInfo.email);
  const [infoPhone, setInfoPhone] = useState(clubInfo.phone);
  const [infoHours, setInfoHours] = useState(clubInfo.trainingHours);
  const [infoDesc, setInfoDesc] = useState(clubInfo.description || "");

  // Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
  const [formCategory, setFormCategory] = useState<"bureau" | "arbitre">("bureau");
  const [formFullName, setFormFullName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const bureauMembers = members.filter((m) => m.category === "bureau");
  const arbitres = members.filter((m) => m.category === "arbitre");

  // Save club information
  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: infoAddress,
          email: infoEmail,
          phone: infoPhone,
          trainingHours: infoHours,
          description: infoDesc,
        }),
      });
      setEditingInfo(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Open add member
  const openAddMember = (cat: "bureau" | "arbitre") => {
    setEditingMember(null);
    setFormCategory(cat);
    setFormFullName("");
    setFormRole(cat === "bureau" ? "Membre du Bureau" : "Arbitre Club");
    setFormPhotoUrl("");
    setFormPhone("");
    setFormEmail("");
    setShowMemberModal(true);
  };

  // Open edit member
  const openEditMember = (member: ClubMember) => {
    setEditingMember(member);
    setFormCategory(member.category);
    setFormFullName(member.fullName);
    setFormRole(member.role);
    setFormPhotoUrl(member.photoUrl || "");
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setShowMemberModal(true);
  };

  // Save member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formRole.trim()) return;

    try {
      if (editingMember) {
        await fetch("/api/club-members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMember.id,
            fullName: formFullName.trim(),
            role: formRole.trim(),
            category: formCategory,
            photoUrl: formPhotoUrl,
            phone: formPhone,
            email: formEmail,
          }),
        });
      } else {
        await fetch("/api/club-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formFullName.trim(),
            role: formRole.trim(),
            category: formCategory,
            photoUrl: formPhotoUrl,
            phone: formPhone,
            email: formEmail,
          }),
        });
      }
      setShowMemberModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete member
  const handleDeleteMember = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre / arbitre ?")) return;
    try {
      await fetch(`/api/club-members?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#112438] via-sky-800 to-[#144256] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-teal-300 shadow-xl bg-slate-900 shrink-0 flex items-center justify-center">
              <img src={DEFAULT_LOGO} alt="Logo Pétanque Naintreénne" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-400/30">
                Comité de la Vienne (86) • FFPJP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">Pétanque Naintreénne</h2>
              <p className="text-sky-200 text-xs sm:text-sm mt-1 max-w-xl">
                {clubInfo.description || "Club sportif et convivial de pétanque à Naintré."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Coordonnées & Informations Pratiques */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Informations Pratiques du Club</h3>
          </div>

          {isAdmin && (
            <button
              onClick={() => setEditingInfo(!editingInfo)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{editingInfo ? "Fermer l'édition" : "Modifier les infos"}</span>
            </button>
          )}
        </div>

        {editingInfo ? (
          <form onSubmit={handleSaveClubInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse du Boulodrome</label>
                <input
                  type="text"
                  value={infoAddress}
                  onChange={(e) => setInfoAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Officiel</label>
                <input
                  type="email"
                  value={infoEmail}
                  onChange={(e) => setInfoEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone Club / Contact</label>
                <input
                  type="text"
                  value={infoPhone}
                  onChange={(e) => setInfoPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Horaires des Entraînements & Concours</label>
                <input
                  type="text"
                  value={infoHours}
                  onChange={(e) => setInfoHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description / Présentation du club</label>
              <textarea
                rows={2}
                value={infoDesc}
                onChange={(e) => setInfoDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingInfo(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
              >
                Enregistrer les informations
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Adresse</div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{clubInfo.address}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</div>
                <div className="text-xs font-semibold text-slate-800 mt-1 break-all">{clubInfo.email}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Téléphone</div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{clubInfo.phone}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Entraînements</div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{clubInfo.trainingHours}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Organigramme du Bureau */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm">👑</span>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Organigramme du Bureau</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Président, Vice-Président, Secrétaire, Trésorier et Membres</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => openAddMember("bureau")}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter au Bureau</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bureauMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow shrink-0 bg-slate-100">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-700 font-bold text-lg">
                      {member.fullName[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wide">
                    {member.role}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{member.fullName}</h4>
                </div>
              </div>

              {(member.phone || member.email) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  {member.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              )}

              {isAdmin && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditMember(member)}
                    className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Arbitres du Club */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 font-bold text-sm">⚖️</span>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Arbitres Officiels du Club</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Officiels FFPJP & Ligue Nouvelle-Aquitaine / Comité 86</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => openAddMember("arbitre")}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter un Arbitre</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {arbitres.map((arbitre) => (
            <div
              key={arbitre.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow shrink-0 bg-slate-100">
                  {arbitre.photoUrl ? (
                    <img src={arbitre.photoUrl} alt={arbitre.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700 font-bold text-lg">
                      {arbitre.fullName[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                    {arbitre.role}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{arbitre.fullName}</h4>
                </div>
              </div>

              {(arbitre.phone || arbitre.email) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  {arbitre.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{arbitre.phone}</span>
                    </div>
                  )}
                  {arbitre.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{arbitre.email}</span>
                    </div>
                  )}
                </div>
              )}

              {isAdmin && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditMember(arbitre)}
                    className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(arbitre.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Member Modal (Bureau / Arbitre) */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingMember ? "Modifier le membre" : `Ajouter un ${formCategory === "bureau" ? "membre du bureau" : "arbitre"}`}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as "bureau" | "arbitre")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="bureau">Bureau Dirigeant</option>
                  <option value="arbitre">Corps Arbitral</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ex: Michel Dupont"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fonction / Rôle *</label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Ex: Président, Trésorier, Arbitre Départemental..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <ImageUpload
                  value={formPhotoUrl}
                  onChange={setFormPhotoUrl}
                  label="Photo du Dirigeant / Arbitre (Téléchargement)"
                  helperText="Téléchargez une photo depuis votre téléphone ou PC"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="06 XX XX XX XX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingMember ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
