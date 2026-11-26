"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Player } from "@/types";
import ImageUpload from "@/components/ImageUpload";

interface LicenciesTabProps {
  players: Player[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function LicenciesTab({ players, isAdmin, onRefresh }: LicenciesTabProps) {
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Form inputs
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formGender, setFormGender] = useState<"Masculin" | "Féminin">("Masculin");
  const [formBirthDate, setFormBirthDate] = useState("");
  const [formCategory, setFormCategory] = useState<"Élite" | "Honneur" | "Promotion" | "Non classé">("Promotion");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formLicenseNumber, setFormLicenseNumber] = useState("");

  // Filtering
  const filteredPlayers = players.filter((p) => {
    if (genderFilter !== "all" && p.gender !== genderFilter) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      const matchLic = p.licenseNumber?.toLowerCase().includes(q);
      if (!matchName && !matchLic) return false;
    }
    return true;
  });

  const countMasculin = players.filter((p) => p.gender === "Masculin").length;
  const countFeminin = players.filter((p) => p.gender === "Féminin").length;

  const openAddModal = () => {
    setEditingPlayer(null);
    setFormFirstName("");
    setFormLastName("");
    setFormGender("Masculin");
    setFormBirthDate("");
    setFormCategory("Promotion");
    setFormPhotoUrl("");
    setFormLicenseNumber("");
    setShowAddModal(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormFirstName(player.firstName);
    setFormLastName(player.lastName);
    setFormGender(player.gender);
    setFormBirthDate(player.birthDate || "");
    setFormCategory(player.category);
    setFormPhotoUrl(player.photoUrl || "");
    setFormLicenseNumber(player.licenseNumber || "");
    setShowAddModal(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) return;

    try {
      if (editingPlayer) {
        // Update
        await fetch("/api/players", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPlayer.id,
            firstName: formFirstName.trim(),
            lastName: formLastName.trim(),
            gender: formGender,
            birthDate: formBirthDate,
            category: formCategory,
            photoUrl: formPhotoUrl,
            licenseNumber: formLicenseNumber,
          }),
        });
      } else {
        // Create
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formFirstName.trim(),
            lastName: formLastName.trim(),
            gender: formGender,
            birthDate: formBirthDate,
            category: formCategory,
            photoUrl: formPhotoUrl,
            licenseNumber: formLicenseNumber,
          }),
        });
      }
      setShowAddModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlayer = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce licencié ?")) return;
    try {
      await fetch(`/api/players?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Export
  const handleExportCSV = () => {
    const headers = ["Nom", "Prenom", "Genre", "Categorie", "DateNaissance", "NumeroLicence"];
    const rows = players.map((p) => [
      `"${p.lastName}"`,
      `"${p.firstName}"`,
      `"${p.gender}"`,
      `"${p.category}"`,
      `"${p.birthDate || ""}"`,
      `"${p.licenseNumber || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Licencies_Petanque_Naintreenne_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    try {
      let parsed;
      try {
        parsed = JSON.parse(importJsonText);
      } catch {
        // Try simple CSV parsing if not JSON
        const lines = importJsonText.trim().split("\n");
        parsed = lines.slice(1).map((line) => {
          const cols = line.split(/[;,]/);
          return {
            lastName: (cols[0] || "").replace(/"/g, "").trim(),
            firstName: (cols[1] || "").replace(/"/g, "").trim(),
            gender: cols[2]?.includes("F") ? "Féminin" : "Masculin",
            category: cols[3]?.replace(/"/g, "").trim() || "Promotion",
            birthDate: (cols[4] || "").replace(/"/g, "").trim(),
            licenseNumber: (cols[5] || "").replace(/"/g, "").trim(),
          };
        });
      }

      const res = await fetch("/api/export-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "players",
          items: parsed,
        }),
      });
      const data = await res.json();
      setImportStatus(data.message || "Importation réussie !");
      onRefresh();
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportJsonText("");
      }, 1800);
    } catch {
      setImportStatus("Format non reconnu. Utilisez JSON ou CSV.");
    }
  };

  // Calculate age helper
  const getAge = (birthDateString: string | null) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 && age < 120 ? age : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-teal-800 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/10 rounded-xl">
              <Users className="w-6 h-6 text-sky-200" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">Licenciés du Club</h2>
              <p className="text-sky-200 text-xs sm:text-sm">
                Pétanque Naintreénne • Effectif officiel FFPJP
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
            <div className="text-xl font-black text-white">{players.length}</div>
            <div className="text-[10px] text-sky-200 font-bold uppercase">Total</div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
            <div className="text-xl font-black text-cyan-300">{countMasculin}</div>
            <div className="text-[10px] text-sky-200 font-bold uppercase">Masculins</div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
            <div className="text-xl font-black text-rose-300">{countFeminin}</div>
            <div className="text-[10px] text-sky-200 font-bold uppercase">Féminins</div>
          </div>
        </div>
      </div>

      {/* Control Filters & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher nom, prénom, licence..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setGenderFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              genderFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setGenderFilter("Masculin")}
            className={`px-3 py-1.5 rounded-lg transition ${
              genderFilter === "Masculin" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Masculin
          </button>
          <button
            onClick={() => setGenderFilter("Féminin")}
            className={`px-3 py-1.5 rounded-lg transition ${
              genderFilter === "Féminin" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Féminin
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 font-medium text-slate-700"
        >
          <option value="all">Toutes Catégories</option>
          <option value="Élite">Élite</option>
          <option value="Honneur">Honneur</option>
          <option value="Promotion">Promotion</option>
          <option value="Non classé">Non classé</option>
        </select>

        {/* Action Buttons: Add, Export, Import */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Exporter la liste en Excel/CSV"
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            title="Importer des licenciés"
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Joueur</span>
          </button>
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">Aucun licencié trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez vos critères de recherche ou cliquez sur "Ajouter un Joueur".
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const age = getAge(player.birthDate);
            return (
              <div
                key={player.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="p-4 bg-gradient-to-b from-slate-50 to-white flex items-center gap-3 border-b border-slate-100">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-sky-100 shadow shrink-0 bg-slate-100">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-600">
                          <User className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            player.gender === "Féminin"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {player.gender}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            player.category === "Élite"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : player.category === "Honneur"
                              ? "bg-purple-100 text-purple-800"
                              : player.category === "Promotion"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {player.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1 truncate">
                        {player.firstName} {player.lastName}
                      </h4>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-2 text-xs text-slate-600">
                    {player.licenseNumber && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Licence : <strong>{player.licenseNumber}</strong>
                        </span>
                      </div>
                    )}

                    {player.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Né(e) le :{" "}
                          <strong>
                            {new Date(player.birthDate).toLocaleDateString("fr-FR")}
                          </strong>
                          {age && <span className="text-slate-400 ml-1">({age} ans)</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Pétanque Naintreénne</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(player)}
                      title="Modifier le joueur et sa photo"
                      className="p-1.5 hover:bg-sky-100 text-sky-700 rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      title="Supprimer ce joueur"
                      className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add / Edit Player */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingPlayer ? "Modifier le Licencié" : "Ajouter un nouveau Licencié"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Ex: Michel"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Ex: Dupont"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Genre *</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as "Masculin" | "Féminin")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(
                        e.target.value as "Élite" | "Honneur" | "Promotion" | "Non classé"
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Honneur">Honneur</option>
                    <option value="Élite">Élite</option>
                    <option value="Non classé">Non classé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de Naissance</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro de Licence</label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="Ex: 08601245"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  value={formPhotoUrl}
                  onChange={setFormPhotoUrl}
                  label="Photo du Joueur (Téléchargement direct)"
                  helperText="Cliquez pour importer la photo du joueur depuis votre appareil"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingPlayer ? "Mettre à jour" : "Ajouter le Joueur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <span>Importer des Licenciés (JSON ou CSV)</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStatus ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleImport} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Collez ci-dessous votre fichier exporté ou vos données CSV au format :<br />
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] block mt-1">
                    Nom;Prenom;Genre;Categorie;DateNaissance;NumeroLicence
                  </code>
                </p>

                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`Dupont;Michel;Masculin;Honneur;1968-05-14;08601245\nMoreau;Jean-Paul;Masculin;Élite;1972-11-20;08601246`}
                  required
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Importer les données
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
