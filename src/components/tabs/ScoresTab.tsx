"use client";

import React, { useState } from "react";
import {
  Trophy,
  Plus,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { Competition, Standing, ChampionshipRound, ChampionshipMatch } from "@/types";

interface ScoresTabProps {
  competitions: Competition[];
  standings: Standing[];
  rounds: ChampionshipRound[];
  matches: ChampionshipMatch[];
  rules: {
    pointsVictory: number;
    pointsDraw: number;
    pointsDefeat: number;
    pointsForfeit: number;
  };
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function ScoresTab({
  competitions,
  standings,
  rounds = [],
  matches = [],
  rules,
  isAdmin,
  onRefresh,
}: ScoresTabProps) {
  const [selectedCompId, setSelectedCompId] = useState<number>(competitions[0]?.id || 1);
  const [activeRules, setActiveRules] = useState(rules);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  // Local optimistic state for matches to ensure instant auto-filling of both scores
  const [localMatches, setLocalMatches] = useState<ChampionshipMatch[]>(matches);

  React.useEffect(() => {
    setLocalMatches(matches);
  }, [matches]);

  // New match form
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  // New round form
  const [showAddRoundModal, setShowAddRoundModal] = useState(false);
  const [newRoundNum, setNewRoundNum] = useState(1);

  // New competition form
  const [showNewCompModal, setShowNewCompModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompSeason, setNewCompSeason] = useState("2025-2026");

  // New club form
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [newClubName, setNewClubName] = useState("");

  // Saving notification message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Active competition
  const currentComp = competitions.find((c) => c.id === selectedCompId) || competitions[0];
  const currentCompId = currentComp ? currentComp.id : selectedCompId;

  // Filter rounds for this competition
  const compRounds = rounds.filter((r) => r.competitionId === currentCompId);
  const activeRound = compRounds.find((r) => r.id === selectedRoundId) || compRounds[0];

  // Matches for active round (using local optimistic matches)
  const roundMatches = activeRound ? localMatches.filter((m) => m.roundId === activeRound.id) : [];

  // Standings for current competition: sort by points DESC, then Diff DESC, then Boules Pour DESC
  const currentStandings = standings
    .filter((s) => s.competitionId === currentCompId)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffB = (b.boulesPour || 0) - (b.boulesContre || 0);
      const diffA = (a.boulesPour || 0) - (a.boulesContre || 0);
      if (diffB !== diffA) return diffB - diffA;
      return (b.boulesPour || 0) - (a.boulesPour || 0);
    });

  // Calculate completed matches for active round
  const completedMatchesCount = roundMatches.filter((m) => m.scoreA !== null && m.scoreB !== null).length;

  // Save rules changes
  const handleSaveRules = async (newR: typeof activeRules) => {
    setActiveRules(newR);
    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_rules",
          competitionId: currentCompId,
          ...newR,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to update rules", e);
    }
  };

  // Instant score input change: when you enter a score, the other auto-fills so the sum is 36 points max!
  const handleScoreChange = async (matchId: number, field: "scoreA" | "scoreB", value: string) => {
    const targetMatch = localMatches.find((m) => m.id === matchId) || matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    let updatedSA: number | null = null;
    let updatedSB: number | null = null;

    if (value === "") {
      updatedSA = null;
      updatedSB = null;
    } else {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        updatedSA = null;
        updatedSB = null;
      } else {
        // Total points max is 36 in pétanque CDC encounters
        const clamped = Math.max(0, Math.min(36, parsed));
        if (field === "scoreA") {
          updatedSA = clamped;
          updatedSB = 36 - clamped;
        } else {
          updatedSB = clamped;
          updatedSA = 36 - clamped;
        }
      }
    }

    // Instantly update local state so both inputs show immediately
    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, scoreA: updatedSA, scoreB: updatedSB } : m
      )
    );

    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_round_match",
          matchId,
          scoreA: updatedSA,
          scoreB: updatedSB,
          forfeitA: targetMatch.forfeitA,
          forfeitB: targetMatch.forfeitB,
          partiesWonA: targetMatch.partiesWonA,
          partiesWonB: targetMatch.partiesWonB,
        }),
      });
      setFeedbackMsg(
        updatedSA !== null
          ? `✓ Score calculé automatiquement sur 36 pts (${updatedSA} - ${updatedSB}) & Classement mis à jour !`
          : "✓ Score effacé"
      );
      setTimeout(() => setFeedbackMsg(null), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle forfeit
  const handleForfeitToggle = async (matchId: number, team: "A" | "B", checked: boolean) => {
    const targetMatch = localMatches.find((m) => m.id === matchId) || matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedFA = team === "A" ? checked : targetMatch.forfeitA;
    const updatedFB = team === "B" ? checked : targetMatch.forfeitB;

    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, forfeitA: updatedFA, forfeitB: updatedFB } : m
      )
    );

    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_round_match",
          matchId,
          scoreA: targetMatch.scoreA,
          scoreB: targetMatch.scoreB,
          forfeitA: updatedFA,
          forfeitB: updatedFB,
          partiesWonA: targetMatch.partiesWonA,
          partiesWonB: targetMatch.partiesWonB,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Parties Won change (ex: sur 11 parties)
  const handlePartiesChange = async (matchId: number, team: "A" | "B", val: string) => {
    const targetMatch = localMatches.find((m) => m.id === matchId) || matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const valNum = val === "" ? null : Number(val);
    const updatedPA = team === "A" ? valNum : targetMatch.partiesWonA;
    const updatedPB = team === "B" ? valNum : targetMatch.partiesWonB;

    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, partiesWonA: updatedPA, partiesWonB: updatedPB } : m
      )
    );

    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_round_match",
          matchId,
          scoreA: targetMatch.scoreA,
          scoreB: targetMatch.scoreB,
          forfeitA: targetMatch.forfeitA,
          forfeitB: targetMatch.forfeitB,
          partiesWonA: updatedPA,
          partiesWonB: updatedPB,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Erase score
  const handleClearScore = async (matchId: number) => {
    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              scoreA: null,
              scoreB: null,
              forfeitA: false,
              forfeitB: false,
              partiesWonA: null,
              partiesWonB: null,
            }
          : m
      )
    );

    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear_round_match",
          matchId,
        }),
      });
      setFeedbackMsg("✓ Rencontre remise à zéro");
      setTimeout(() => setFeedbackMsg(null), 2000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Manual Rank update
  const handleManualRankChange = async (standingId: number, rankStr: string) => {
    try {
      await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_manual_rank",
          standingId,
          manualRank: rankStr,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Add Match to Round
  const handleAddRoundMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim() || !activeRound) return;

    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_round_match",
          roundId: activeRound.id,
          competitionId: currentCompId,
          teamA: teamA.trim(),
          teamB: teamB.trim(),
        }),
      });
      setShowAddMatchModal(false);
      setTeamA("");
      setTeamB("");
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Add new round
  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    const roundNumber = compRounds.length + 1;
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_round",
          competitionId: currentCompId,
          roundNumber,
          name: `Journée ${roundNumber}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.round) {
        setSelectedRoundId(data.round.id);
        setShowAddRoundModal(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add new club
  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim() || !currentCompId) return;

    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_club",
          competitionId: currentCompId,
          clubName: newClubName.trim(),
          isPn: newClubName.toLowerCase().includes("naintre"),
          won: 0,
          drawn: 0,
          lost: 0,
          forfeit: 0,
          boulesPour: 0,
          boulesContre: 0,
        }),
      });
      setShowAddClubModal(false);
      setNewClubName("");
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Create new competition
  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_competition",
          name: newCompName.trim(),
          season: newCompSeason,
        }),
      });
      const data = await res.json();
      if (data.success && data.competition) {
        setSelectedCompId(data.competition.id);
        setShowNewCompModal(false);
        setNewCompName("");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Clt", "Equipe", "Joues", "Pts", "G", "N", "P", "Forf", "Pour", "Contre", "Diff", "OrdreManuel"];
    const rows = currentStandings.map((s, idx) => [
      idx === 0 ? "1er" : `${idx + 1}ème`,
      `"${s.clubName}"`,
      s.played,
      s.points,
      s.won,
      s.drawn,
      s.lost,
      s.forfeit,
      s.boulesPour,
      s.boulesContre,
      (s.boulesPour || 0) - (s.boulesContre || 0),
      `"${s.manualRank || "—"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Classement_${currentComp?.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Barème des points (Photo 1 Replica) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">⚙️</span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Barème des points{" "}
              <span className="text-xs font-normal text-slate-500">
                {isAdmin ? "(modifiez les valeurs directement)" : "(barème officiel de la compétition)"}
              </span>
            </h3>
          </div>
          {feedbackMsg && (
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" /> {feedbackMsg}
            </span>
          )}
        </div>

        {/* 4 Point System Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Victoire */}
          <div className="bg-white rounded-2xl border-2 border-emerald-400 p-3 sm:p-4 text-center shadow-sm hover:border-emerald-500 transition">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <span>🏆</span>
              <span>Victoire</span>
            </div>
            <input
              type="number"
              min="0"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              value={activeRules.pointsVictory}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                handleSaveRules({ ...activeRules, pointsVictory: val });
              }}
              className={`w-full text-center text-3xl sm:text-4xl font-black text-slate-800 bg-transparent focus:outline-none rounded-lg ${
                isAdmin ? "focus:ring-2 focus:ring-emerald-400 cursor-text" : "cursor-default"
              }`}
            />
          </div>

          {/* Match nul */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-3 sm:p-4 text-center shadow-sm hover:border-amber-400 transition">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <span>🤝</span>
              <span>Match nul</span>
            </div>
            <input
              type="number"
              min="0"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              value={activeRules.pointsDraw}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                handleSaveRules({ ...activeRules, pointsDraw: val });
              }}
              className={`w-full text-center text-3xl sm:text-4xl font-black text-slate-800 bg-transparent focus:outline-none rounded-lg ${
                isAdmin ? "focus:ring-2 focus:ring-amber-300 cursor-text" : "cursor-default"
              }`}
            />
          </div>

          {/* Défaite */}
          <div className="bg-white rounded-2xl border-2 border-rose-300 p-3 sm:p-4 text-center shadow-sm hover:border-rose-400 transition">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <span>❌</span>
              <span>Défaite</span>
            </div>
            <input
              type="number"
              min="0"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              value={activeRules.pointsDefeat}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                handleSaveRules({ ...activeRules, pointsDefeat: val });
              }}
              className={`w-full text-center text-3xl sm:text-4xl font-black text-slate-800 bg-transparent focus:outline-none rounded-lg ${
                isAdmin ? "focus:ring-2 focus:ring-rose-300 cursor-text" : "cursor-default"
              }`}
            />
          </div>

          {/* Forfait */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 text-center shadow-sm hover:border-slate-400 transition">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <span>🚫</span>
              <span>Forfait</span>
            </div>
            <input
              type="number"
              min="0"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              value={activeRules.pointsForfeit}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                handleSaveRules({ ...activeRules, pointsForfeit: val });
              }}
              className={`w-full text-center text-3xl sm:text-4xl font-black text-slate-800 bg-transparent focus:outline-none rounded-lg ${
                isAdmin ? "focus:ring-2 focus:ring-slate-300 cursor-text" : "cursor-default"
              }`}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
          <span className="text-amber-500">💡</span>
          <span>Le classement se recalcule dès que vous changez un chiffre ou que vous saisissez un score ci-dessous.</span>
        </p>
      </div>

      {/* 2. Competition Pills Selector */}
      <div className="flex flex-wrap items-center gap-2.5">
        {competitions.map((comp) => {
          const isSelected = comp.id === currentCompId;
          return (
            <button
              key={comp.id}
              onClick={() => {
                setSelectedCompId(comp.id);
                setSelectedRoundId(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-sm ${
                isSelected
                  ? "bg-teal-600 text-white shadow-teal-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {comp.name}
            </button>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => setShowNewCompModal(true)}
            className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouvelle compétition</span>
          </button>
        )}
      </div>

      {/* 3. Section Saisie des Scores par Rencontres (Style PHOTO 1 EXACT) */}
      <div className="bg-[#f0fbf8] border-2 border-[#a3e4d7] rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        {/* Header Journée */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#c8f0e7]">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeRound ? activeRound.name : "Journée 1"}
            </h3>

            {/* Rounds switcher pills */}
            <div className="flex items-center gap-1.5 ml-2">
              {compRounds.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoundId(r.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeRound?.id === r.id
                      ? "bg-teal-700 text-white"
                      : "bg-white/80 hover:bg-white text-slate-700 border border-teal-200"
                  }`}
                >
                  {r.name}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={handleAddRound}
                  title="Ajouter une nouvelle journée"
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-300 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Journée</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Journée Validée Badge */}
            <div className="bg-[#009665] text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="bg-white/20 p-0.5 rounded">✓</span>
              <span>Journée validée</span>
            </div>

            {/* Rencontres Counter Badge */}
            <div className="bg-[#bbf0e2] text-[#00694a] font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-[#7ed8c2]">
              {completedMatchesCount}/{roundMatches.length} rencontres
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddMatchModal(true)}
                className="bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Rencontre</span>
              </button>
            )}
          </div>
        </div>

        {/* Info banner explaining the 36-point auto-completion */}
        <div className="bg-[#e4f8f2] border border-[#a3e4d7] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-900 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-teal-600 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Règle CDC 36 Pts
            </span>
            <span>
              <strong>Remplissage automatique :</strong> tapez le score d'une équipe (sur 36 max), l'autre équipe se remplit toute seule (ex : <strong>26</strong> ➔ <strong>10</strong>). Le classement se recalcule en direct !
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold bg-white/80 px-2 py-0.5 rounded border border-teal-200">
            Total toujours égal à 36 points
          </span>
        </div>

        {/* List of Match Score Boxes (STYLE PHOTO 1 EXACT) */}
        <div className="space-y-3.5 pt-1">
          {roundMatches.length === 0 ? (
            <div className="bg-white/80 p-8 rounded-2xl text-center text-slate-500 border border-teal-200">
              <p className="font-semibold text-sm">Aucune rencontre programmée pour cette journée.</p>
              <button
                onClick={() => setShowAddMatchModal(true)}
                className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                + Ajouter une rencontre
              </button>
            </div>
          ) : (
            roundMatches.map((m) => {
              const scoreAVal = m.scoreA !== null ? m.scoreA : "";
              const scoreBVal = m.scoreB !== null ? m.scoreB : "";
              const totalPoints = (Number(scoreAVal) || 0) + (Number(scoreBVal) || 0);

              return (
                <div
                  key={m.id}
                  className="bg-white border-2 border-[#b5ebd2] hover:border-teal-400 rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-3"
                >
                  {/* Row 1: Team A - Score A [vs] Score B - Team B */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Team A */}
                    <div className="font-extrabold text-slate-800 text-sm sm:text-base flex-1 text-left truncate w-full sm:w-auto">
                      <span className={m.teamA.toLowerCase().includes("naintre") ? "text-teal-800 font-black" : ""}>
                        {m.teamA}
                      </span>
                    </div>

                    {/* Scores Inputs: [ Score A ] vs [ Score B ] */}
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="36"
                        readOnly={!isAdmin}
                        disabled={!isAdmin}
                        value={scoreAVal}
                        onChange={(e) => handleScoreChange(m.id, "scoreA", e.target.value)}
                        placeholder="0"
                        className={`w-16 h-11 text-center font-black text-xl text-slate-800 bg-[#fafafa] border border-slate-300 rounded-lg shadow-inner ${
                          isAdmin
                            ? "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-text"
                            : "cursor-default opacity-95"
                        }`}
                      />
                      <span className="text-slate-400 font-bold text-xs uppercase px-1">vs</span>
                      <input
                        type="number"
                        min="0"
                        max="36"
                        readOnly={!isAdmin}
                        disabled={!isAdmin}
                        value={scoreBVal}
                        onChange={(e) => handleScoreChange(m.id, "scoreB", e.target.value)}
                        placeholder="0"
                        className={`w-16 h-11 text-center font-black text-xl text-slate-800 bg-[#fafafa] border border-slate-300 rounded-lg shadow-inner ${
                          isAdmin
                            ? "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-text"
                            : "cursor-default opacity-95"
                        }`}
                      />
                    </div>

                    {/* Team B */}
                    <div className="font-extrabold text-slate-800 text-sm sm:text-base flex-1 text-right truncate w-full sm:w-auto">
                      <span className={m.teamB.toLowerCase().includes("naintre") ? "text-teal-800 font-black" : ""}>
                        {m.teamB}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Forfaits checkboxes, Parties sur 11, Total 36/36, Enregistré, Effacer */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Forfait Team A */}
                      <label className={`flex items-center gap-1.5 ${isAdmin ? "cursor-pointer hover:text-slate-900" : "cursor-default"}`}>
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={m.forfeitA}
                          onChange={(e) => handleForfeitToggle(m.id, "A", e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                        />
                        <span>Forfait {m.teamA.split("-")[1] || m.teamA}</span>
                      </label>

                      {/* Forfait Team B */}
                      <label className={`flex items-center gap-1.5 ${isAdmin ? "cursor-pointer hover:text-slate-900" : "cursor-default"}`}>
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={m.forfeitB}
                          onChange={(e) => handleForfeitToggle(m.id, "B", e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                        />
                        <span>Forfait {m.teamB.split("-")[1] || m.teamB}</span>
                      </label>

                      {/* Parties facultatives : ex [ - ] / [ - ] (sur 11, optionnel) */}
                      <div className="flex items-center gap-1 text-slate-500 hidden md:flex">
                        <span>Parties :</span>
                        <input
                          type="number"
                          readOnly={!isAdmin}
                          disabled={!isAdmin}
                          value={m.partiesWonA !== null ? m.partiesWonA : ""}
                          onChange={(e) => handlePartiesChange(m.id, "A", e.target.value)}
                          placeholder="—"
                          className="w-9 h-7 text-center text-xs border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                        <span>/</span>
                        <input
                          type="number"
                          readOnly={!isAdmin}
                          disabled={!isAdmin}
                          value={m.partiesWonB !== null ? m.partiesWonB : ""}
                          onChange={(e) => handlePartiesChange(m.id, "B", e.target.value)}
                          placeholder="—"
                          className="w-9 h-7 text-center text-xs border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                        <span className="text-[11px] text-slate-400">(sur 11, optionnel)</span>
                      </div>

                      {/* Total : XX/36 */}
                      {totalPoints > 0 && (
                        <div className="font-extrabold text-[#008f5e] bg-[#e6f8f1] px-2 py-0.5 rounded text-xs">
                          Total : {totalPoints}/36
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Enregistré indicator */}
                      {(scoreAVal !== "" || scoreBVal !== "") && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                          ✓ Enregistré
                        </span>
                      )}

                      {/* Effacer button */}
                      {isAdmin && (
                        <button
                          onClick={() => handleClearScore(m.id)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Tableau du Classement Officiel (Style PHOTO 2 EXACT) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h4 className="font-black text-slate-900 text-base sm:text-lg">
                Classement en Direct — {currentComp?.name}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Recalcul automatique instantané dès saisie des scores ci-dessus
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-sm flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAddClubModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter une équipe</span>
              </button>
            )}
          </div>
        </div>

        {/* Table with EXACT PHOTO 2 Header & Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
            <thead>
              <tr className="bg-[#007b53] text-white font-extrabold text-xs tracking-wide">
                <th className="py-3 px-3 w-16">Clt</th>
                <th className="py-3 px-4 min-w-[200px]">Équipe</th>
                <th className="py-3 px-3 text-center w-14">Joués</th>
                <th className="py-3 px-3 text-center w-14 text-[#9effd0]">Pts</th>
                <th className="py-3 px-3 text-center w-12">G</th>
                <th className="py-3 px-3 text-center w-12">N</th>
                <th className="py-3 px-3 text-center w-12">P</th>
                <th className="py-3 px-3 text-center w-14">Forf.</th>
                <th className="py-3 px-3 text-center w-14">Pour</th>
                <th className="py-3 px-3 text-center w-14">Contre</th>
                <th className="py-3 px-3 text-center w-16">Diff.</th>
                {/* Yellow/Orange Ordre Manuel Header column matching Photo 2 */}
                <th className="py-3 px-3 text-center w-28 bg-[#f59e0b] text-white font-black">
                  ✋ Ordre manuel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStandings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    Aucun club dans ce classement. Cliquez sur "+ Ajouter une équipe" pour commencer.
                  </td>
                </tr>
              ) : (
                currentStandings.map((s, idx) => {
                  const isPn = s.isPn || s.clubName.toLowerCase().includes("naintre");
                  const diff = (s.boulesPour || 0) - (s.boulesContre || 0);
                  const cltLabel = idx === 0 ? "1er" : `${idx + 1}ème`;

                  return (
                    <tr
                      key={s.id}
                      className={`transition ${
                        isPn
                          ? "bg-[#eafbf4] font-semibold"
                          : idx % 2 === 0
                          ? "bg-[#fffef7]"
                          : "bg-white"
                      } hover:bg-teal-50/50`}
                    >
                      {/* Clt */}
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        {cltLabel}
                      </td>

                      {/* Équipe */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className={isPn ? "text-teal-900 font-black" : "text-slate-800"}>
                          {s.clubName}
                        </span>
                      </td>

                      {/* Joués */}
                      <td className="py-3.5 px-3 text-center text-slate-700 font-bold">
                        {s.played}
                      </td>

                      {/* Pts (Green bold matching photo 2) */}
                      <td className="py-3.5 px-3 text-center font-black text-[#007b53] text-sm sm:text-base">
                        {s.points}
                      </td>

                      {/* G (Victoires) */}
                      <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                        {s.won}
                      </td>

                      {/* N (Nuls) */}
                      <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                        {s.drawn}
                      </td>

                      {/* P (Pertes / Défaites) */}
                      <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                        {s.lost}
                      </td>

                      {/* Forf. */}
                      <td className="py-3.5 px-3 text-center text-slate-600">
                        {s.forfeit}
                      </td>

                      {/* Pour */}
                      <td className="py-3.5 px-3 text-center text-slate-800 font-semibold">
                        {s.boulesPour}
                      </td>

                      {/* Contre */}
                      <td className="py-3.5 px-3 text-center text-slate-800 font-semibold">
                        {s.boulesContre}
                      </td>

                      {/* Diff. (+40, -38 with color) */}
                      <td className="py-3.5 px-3 text-center font-black">
                        <span
                          className={
                            diff > 0
                              ? "text-[#008f5e]"
                              : diff < 0
                              ? "text-rose-600"
                              : "text-slate-500"
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>

                      {/* Ordre manuel input matching photo 2 */}
                      <td className="py-3.5 px-3 text-center bg-amber-50/40">
                        <input
                          type="text"
                          readOnly={!isAdmin}
                          disabled={!isAdmin}
                          defaultValue={s.manualRank || "—"}
                          onBlur={(e) => isAdmin && handleManualRankChange(s.id, e.target.value)}
                          placeholder="—"
                          className={`w-14 h-7 text-center text-xs font-bold text-slate-700 bg-white border border-amber-300 rounded-md shadow-sm mx-auto block ${
                            isAdmin ? "focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-text" : "cursor-default"
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Match to Round */}
      {showAddMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Ajouter une rencontre à {activeRound?.name}</span>
            </h3>
            <form onSubmit={handleAddRoundMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Équipe Réception (A)</label>
                <input
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Ex: 02-Pétanque Naintreénne"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Équipe Visiteur (B)</label>
                <input
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Ex: 04-Buxerolles Pétanque"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMatchModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Programmer la rencontre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Club */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Ajouter une équipe au classement</span>
            </h3>
            <form onSubmit={handleAddClub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'équipe / club</label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Ex: 09-Club de Neuville"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Ajouter l'équipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Competition */}
      {showNewCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-teal-600" />
              <span>Créer une nouvelle compétition</span>
            </h3>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de la compétition (ex: Division 4 – Poule A...)
                </label>
                <input
                  type="text"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="Ex: Division 4 – Poule C"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Saison</label>
                <input
                  type="text"
                  value={newCompSeason}
                  onChange={(e) => setNewCompSeason(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCompModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Créer la compétition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
