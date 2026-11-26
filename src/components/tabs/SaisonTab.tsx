"use client";

import React, { useState } from "react";
import {
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  Trophy,
  Download,
  Upload,
  Clock,
  MapPin,
  CheckCircle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Team, CalendarMatch } from "@/types";

interface SaisonTabProps {
  teams: Team[];
  matches: CalendarMatch[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export const DIVISION_OPTIONS = [
  "CDC Division 1 Poule A",
  "CDC Division 2 Poule A",
  "CDC Division 2 Poule B",
  "CDC Division 3 Poule A",
  "CDC Division 3 Poule B",
  "CDC Division 3 Poule C",
  "CDC Division 3 Poule D",
  "CDC Division 4 Poule A",
  "CDC Division 4 Poule B",
  "CDC Division 4 Poule C",
  "CDC Division 4 Poule D",
  "CDC Division 4 Poule E",
  "CDC Division 4 Poule F",
  "CDC Division 4 Poule G",
  "CDC Division 4 Poule H",
  "Coupe de la Vienne",
  "Coupe de France",
  "Coupe Bardin",
];

export default function SaisonTab({ teams, matches, isAdmin, onRefresh }: SaisonTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"equipes" | "calendrier">("equipes");

  // Team Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDivision, setTeamDivision] = useState(DIVISION_OPTIONS[0]);
  const [teamCaptain, setTeamCaptain] = useState("");
  const [teamPlayers, setTeamPlayers] = useState("");
  const [teamSeason, setTeamSeason] = useState("2025-2026");
  const [teamNotes, setTeamNotes] = useState("");

  // Match Modal State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<CalendarMatch | null>(null);
  const [matchCompetition, setMatchCompetition] = useState(DIVISION_OPTIONS[0]);
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("14:30");
  const [matchOpponent, setMatchOpponent] = useState("");
  const [matchLocation, setMatchLocation] = useState("Domicile (Naintré)");
  const [matchAddress, setMatchAddress] = useState("");
  const [matchScorePn, setMatchScorePn] = useState<string>("");
  const [matchScoreOpponent, setMatchScoreOpponent] = useState<string>("");
  const [matchStatus, setMatchStatus] = useState("À venir");

  // Import / Export
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Open team modal
  const openAddTeam = () => {
    setEditingTeam(null);
    setTeamName("");
    setTeamDivision(DIVISION_OPTIONS[0]);
    setTeamCaptain("");
    setTeamPlayers("");
    setTeamSeason("2025-2026");
    setTeamNotes("");
    setShowTeamModal(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDivision(team.division);
    setTeamCaptain(team.captainName || "");
    setTeamPlayers(team.playerNames);
    setTeamSeason(team.season);
    setTeamNotes(team.notes || "");
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      if (editingTeam) {
        await fetch("/api/teams", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTeam.id,
            name: teamName.trim(),
            division: teamDivision,
            captainName: teamCaptain.trim(),
            playerNames: teamPlayers.trim(),
            season: teamSeason,
            notes: teamNotes.trim(),
          }),
        });
      } else {
        await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: teamName.trim(),
            division: teamDivision,
            captainName: teamCaptain.trim(),
            playerNames: teamPlayers.trim(),
            season: teamSeason,
            notes: teamNotes.trim(),
          }),
        });
      }
      setShowTeamModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette équipe ?")) return;
    try {
      await fetch(`/api/teams?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Open match modal
  const openAddMatch = () => {
    setEditingMatch(null);
    setMatchCompetition(DIVISION_OPTIONS[0]);
    setMatchDate("");
    setMatchTime("14:30");
    setMatchOpponent("");
    setMatchLocation("Domicile (Naintré)");
    setMatchAddress("Boulodrome Municipal de Naintré");
    setMatchScorePn("");
    setMatchScoreOpponent("");
    setMatchStatus("À venir");
    setShowMatchModal(true);
  };

  const openEditMatch = (m: CalendarMatch) => {
    setEditingMatch(m);
    setMatchCompetition(m.competitionName);
    setMatchDate(m.matchDate);
    setMatchTime(m.matchTime);
    setMatchOpponent(m.opponent);
    setMatchLocation(m.location);
    setMatchAddress(m.address || "");
    setMatchScorePn(m.scorePn !== null ? String(m.scorePn) : "");
    setMatchScoreOpponent(m.scoreOpponent !== null ? String(m.scoreOpponent) : "");
    setMatchStatus(m.status);
    setShowMatchModal(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchOpponent.trim() || !matchDate) return;

    try {
      if (editingMatch) {
        await fetch("/api/calendar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMatch.id,
            competitionName: matchCompetition,
            matchDate,
            matchTime,
            opponent: matchOpponent.trim(),
            location: matchLocation,
            address: matchAddress.trim(),
            scorePn: matchScorePn,
            scoreOpponent: matchScoreOpponent,
            status: matchStatus,
          }),
        });
      } else {
        await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            competitionName: matchCompetition,
            matchDate,
            matchTime,
            opponent: matchOpponent.trim(),
            location: matchLocation,
            address: matchAddress.trim(),
            scorePn: matchScorePn,
            scoreOpponent: matchScoreOpponent,
            status: matchStatus,
          }),
        });
      }
      setShowMatchModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce match du calendrier ?")) return;
    try {
      await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Export Teams
  const handleExportTeams = () => {
    const headers = ["NomEquipe", "Division", "Capitaine", "Joueurs", "Saison"];
    const rows = teams.map((t) => [
      `"${t.name}"`,
      `"${t.division}"`,
      `"${t.captainName || ""}"`,
      `"${t.playerNames.replace(/"/g, "'")}"`,
      `"${t.season}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Equipes_Petanque_Naintreenne_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Teams
  const handleImportTeams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      let parsed;
      try {
        parsed = JSON.parse(importText);
      } catch {
        const lines = importText.trim().split("\n");
        parsed = lines.slice(1).map((line) => {
          const cols = line.split(/[;,]/);
          return {
            name: (cols[0] || "").replace(/"/g, "").trim(),
            division: (cols[1] || "").replace(/"/g, "").trim(),
            captainName: (cols[2] || "").replace(/"/g, "").trim(),
            playerNames: (cols[3] || "").replace(/"/g, "").trim(),
            season: (cols[4] || "2025-2026").replace(/"/g, "").trim(),
          };
        });
      }

      const res = await fetch("/api/export-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "teams",
          items: parsed,
        }),
      });
      const data = await res.json();
      setImportStatus(data.message || "Équipes importées !");
      onRefresh();
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportText("");
      }, 1800);
    } catch {
      setImportStatus("Erreur de format d'import");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Sub Tabs Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Saison Officielle & Équipes</h2>
            <p className="text-xs text-slate-500">Pétanque Naintreénne • CDC & Coupes</p>
          </div>
        </div>

        {/* Sub Tabs Pill */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSubTab("equipes")}
              className={`px-4 py-2 rounded-lg transition ${
                activeSubTab === "equipes"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Équipes ({teams.length})
            </button>
            <button
              onClick={() => setActiveSubTab("calendrier")}
              className={`px-4 py-2 rounded-lg transition ${
                activeSubTab === "calendrier"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Calendrier des Rencontres ({matches.length})
            </button>
          </div>

          {activeSubTab === "equipes" ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportTeams}
                title="Exporter les équipes"
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                title="Importer des équipes"
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={openAddTeam}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter une Équipe</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAddMatch}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Programmer un Match</span>
            </button>
          )}
        </div>
      </div>

      {/* View 1: Équipes */}
      {activeSubTab === "equipes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">Aucune équipe enregistrée</p>
              <p className="text-xs text-slate-400 mt-1">Cliquez sur "+ Ajouter une Équipe" pour configurer vos formations.</p>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 inline-block border border-teal-200">
                        {team.division}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-2">{team.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">Saison {team.season}</div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => openEditTeam(team)}
                        className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                        title="Modifier l'équipe"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Supprimer l'équipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {team.captainName && (
                    <div className="mt-3 p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs flex items-center gap-2 text-amber-900">
                      <span className="font-bold">Capitaine :</span>
                      <span>{team.captainName}</span>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Composition des Joueurs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.playerNames.split(/[,;\n]+/).map((pName, pIdx) => {
                        const clean = pName.trim();
                        if (!clean) return null;
                        return (
                          <span
                            key={pIdx}
                            className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                          >
                            {clean}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {team.notes && (
                    <p className="mt-3 text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      « {team.notes} »
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pétanque Naintreénne</span>
                  <span className="font-semibold text-teal-700">FFPJP • CD 86</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View 2: Calendrier des Rencontres CDC & Coupes */}
      {activeSubTab === "calendrier" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Calendrier Officiel des Matchs du Club</span>
            </h3>
            <span className="text-xs text-slate-500">{matches.length} rencontre(s) programmée(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#243447] text-white text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Compétition</th>
                  <th className="py-3 px-4">Adversaire</th>
                  <th className="py-3 px-4">Lieu</th>
                  <th className="py-3 px-3 text-center">Score PN</th>
                  <th className="py-3 px-3 text-center">Score Adv</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Aucune rencontre au calendrier. Cliquez sur "+ Programmer un Match" !
                    </td>
                  </tr>
                ) : (
                  matches.map((m) => {
                    const isFinished = m.status === "Terminé" && m.scorePn !== null;
                    const won = isFinished && (m.scorePn || 0) > (m.scoreOpponent || 0);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(m.matchDate).toLocaleDateString("fr-FR")}</span>
                            <span className="text-slate-400 font-normal">à {m.matchTime}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                            {m.competitionName}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-800">{m.opponent}</td>

                        <td className="py-3 px-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={m.location.includes("Domicile") ? "font-bold text-teal-800" : ""}>
                              {m.location}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-black text-sm">
                          {m.scorePn !== null ? (
                            <span className={won ? "text-emerald-600" : "text-slate-800"}>{m.scorePn}</span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-black text-sm">
                          {m.scoreOpponent !== null ? (
                            <span className={!won && isFinished ? "text-rose-600" : "text-slate-800"}>
                              {m.scoreOpponent}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === "Terminé"
                                ? "bg-slate-100 text-slate-700"
                                : m.status === "Reporté"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              onClick={() => openEditMatch(m)}
                              className="p-1 hover:bg-sky-50 text-sky-600 rounded transition"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(m.id)}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Team */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingTeam ? "Modifier l'Équipe" : "Ajouter une nouvelle Équipe"}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom de l'équipe *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Équipe 1 Masculine, Équipe Vétérans..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Choisir la Division / Coupe *
                </label>
                <select
                  value={teamDivision}
                  onChange={(e) => setTeamDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {DIVISION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capitaine d'équipe</label>
                  <input
                    type="text"
                    value={teamCaptain}
                    onChange={(e) => setTeamCaptain(e.target.value)}
                    placeholder="Ex: Michel Dupont"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Saison</label>
                  <input
                    type="text"
                    value={teamSeason}
                    onChange={(e) => setTeamSeason(e.target.value)}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Noms des joueurs composant l'équipe * (séparés par des virgules)
                </label>
                <textarea
                  rows={3}
                  value={teamPlayers}
                  onChange={(e) => setTeamPlayers(e.target.value)}
                  placeholder="Ex: Michel Dupont, Jean-Paul Moreau, Sylvie Renard, Patrick Guérin"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarques / Objectifs</label>
                <input
                  type="text"
                  value={teamNotes}
                  onChange={(e) => setTeamNotes(e.target.value)}
                  placeholder="Ex: Matchs le dimanche matin..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingTeam ? "Mettre à jour" : "Créer l'Équipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Match */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingMatch ? "Modifier la Rencontre" : "Programmer une Rencontre"}
              </h3>
              <button onClick={() => setShowMatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compétition</label>
                <select
                  value={matchCompetition}
                  onChange={(e) => setMatchCompetition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  {DIVISION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date du Match *</label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heure</label>
                  <input
                    type="text"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    placeholder="14h30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club Adversaire *</label>
                <input
                  type="text"
                  value={matchOpponent}
                  onChange={(e) => setMatchOpponent(e.target.value)}
                  placeholder="Ex: Club de Châtellerault"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lieu</label>
                  <select
                    value={matchLocation}
                    onChange={(e) => setMatchLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Domicile (Naintré)">Domicile (Naintré)</option>
                    <option value="Extérieur">Extérieur</option>
                    <option value="Terrain Neutre">Terrain Neutre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="À venir">À venir</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Reporté">Reporté</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Score Pétanque Naintreénne</label>
                  <input
                    type="number"
                    value={matchScorePn}
                    onChange={(e) => setMatchScorePn(e.target.value)}
                    placeholder="Ex: 24"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Score Adversaire</label>
                  <input
                    type="number"
                    value={matchScoreOpponent}
                    onChange={(e) => setMatchScoreOpponent(e.target.value)}
                    placeholder="Ex: 12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingMatch ? "Mettre à jour" : "Programmer le Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Teams */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <span>Importer des Équipes (CSV ou JSON)</span>
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
              <form onSubmit={handleImportTeams} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Format attendu :<br />
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] block mt-1">
                    NomEquipe;Division;Capitaine;Joueurs;Saison
                  </code>
                </p>

                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Equipe 1;CDC Division 1 Poule A;Michel Dupont;Michel, Jean-Paul, Sylvie;2025-2026`}
                  required
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
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
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Importer
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
