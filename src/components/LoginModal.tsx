"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { User as UserType } from "@/types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("Mickey");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanU = username.trim();
    const cleanP = password.trim();
    const lowerU = cleanU.toLowerCase();

    // Client-side instant bypass for Mickey / admin so you can ALWAYS connect seamlessly
    if ((lowerU === "mickey" || lowerU === "admin" || lowerU === "president@petanque-naintre.fr") && cleanP === "admin") {
      const adminUser: UserType = {
        id: 1,
        username: lowerU === "admin" ? "admin" : "Mickey",
        displayName: lowerU === "admin" ? "Administrateur PN" : "Mickey (Président)",
        email: "president@petanque-naintre.fr",
        role: "admin",
      };
      localStorage.setItem("pn_user", JSON.stringify(adminUser));
      onLoginSuccess(adminUser);
      setLoading(false);
      onClose();
      // Also notify server in background
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanU, password: cleanP }),
      }).catch(() => {});
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanU, password: cleanP }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Identifiant ou mot de passe incorrect");
      } else {
        localStorage.setItem("pn_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      }
    } catch {
      setError("Erreur réseau lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Compte introuvable");
      } else if (data.step === "question") {
        setSecurityQuestion(data.securityQuestion);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier,
          answer: securityAnswer,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Erreur de réinitialisation");
      } else {
        setForgotSuccess("Votre mot de passe a bien été mis à jour ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => {
          setIsForgotMode(false);
          setSecurityQuestion(null);
          setForgotSuccess(null);
          setPassword(newPassword);
          setUsername(forgotIdentifier);
        }, 2200);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-sky-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-sky-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-sky-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {isForgotMode ? "Mot de passe oublié" : "Espace Club & Gestion"}
              </h3>
              <p className="text-sky-200 text-xs mt-0.5">Pétanque Naintreénne • Administration</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {!isForgotMode ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Identifiant / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Mickey ou admin..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError(null);
                      setForgotIdentifier(username);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe..."
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-label="Voir le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-600" />}
                  </button>
                </div>
              </div>

              {/* Quick Preset helper button for Mickey */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("Mickey");
                    setPassword("admin");
                  }}
                  className="w-full text-xs text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <span>👑 Remplir avec le compte de test : <strong>Mickey / admin</strong></span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <div>
              {!securityQuestion ? (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Saisissez votre identifiant ou votre adresse email pour réinitialiser votre mot de passe.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Identifiant ou Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="Mickey..."
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="w-1/3 py-2.5 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-xs transition"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50"
                    >
                      {loading ? "Recherche..." : "Continuer"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
                    <p className="text-xs font-medium text-sky-900">Question de sécurité :</p>
                    <p className="text-sm font-semibold text-sky-700 mt-0.5">{securityQuestion}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Votre Réponse
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="Ex: Naintré"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Nouveau Mot de passe
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe..."
                        required
                        className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-600" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSecurityQuestion(null)}
                      className="w-1/3 py-2.5 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-xs transition"
                    >
                      Précédent
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50"
                    >
                      {loading ? "Modification..." : "Valider le mot de passe"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
