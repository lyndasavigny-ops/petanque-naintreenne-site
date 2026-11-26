"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Send, Trash2, Pin, User, Clock, ChevronRight, X } from "lucide-react";
import { ForumTopic, ForumMessage } from "@/types";

interface ForumTabProps {
  topics: ForumTopic[];
  currentUser: any;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function ForumTab({ topics, currentUser, isAdmin, onRefresh }: ForumTabProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(topics[0]?.id || null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New message state
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState(currentUser?.displayName || "Supporter");

  // New topic modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("Vie du Club");
  const [newTopicMessage, setNewTopicMessage] = useState("");
  const [newTopicAuthor, setNewTopicAuthor] = useState(currentUser?.displayName || "Membre PN");

  // Fetch messages when selectedTopicId changes
  useEffect(() => {
    if (!selectedTopicId) return;

    let isMounted = true;
    setLoadingMessages(true);

    fetch(`/api/forum?topicId=${selectedTopicId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setMessages(data.messages || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTopicId]);

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTopicId) return;

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          topicId: selectedTopicId,
          authorName: replyAuthor.trim() || "Supporter PN",
          content: replyContent.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyContent("");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicMessage.trim()) return;

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle.trim(),
          category: newTopicCategory,
          authorName: newTopicAuthor.trim() || "Membre PN",
          initialMessage: newTopicMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.topic) {
        setShowTopicModal(false);
        setNewTopicTitle("");
        setNewTopicMessage("");
        onRefresh();
        setSelectedTopicId(data.topic.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Voulez-vous supprimer ce sujet et tous ses messages ?")) return;
    try {
      await fetch(`/api/forum?topicId=${topicId}`, { method: "DELETE" });
      onRefresh();
      if (selectedTopicId === topicId) {
        setSelectedTopicId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!confirm("Voulez-vous supprimer ce message ?")) return;
    try {
      await fetch(`/api/forum?messageId=${msgId}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
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
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Forum & Échanges des Licenciés</h2>
            <p className="text-xs text-slate-500">Covoiturage, entraînements, convivialité et compétitions</p>
          </div>
        </div>

        <button
          onClick={() => setShowTopicModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau Sujet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Topics List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
            Discussions en cours ({topics.length})
          </h3>

          {topics.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">Aucun sujet de discussion créé pour l'instant.</p>
          ) : (
            topics.map((topic) => {
              const isSelected = topic.id === selectedTopicId;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition text-left flex items-start justify-between gap-2 border ${
                    isSelected
                      ? "bg-teal-50 border-teal-300 shadow-sm"
                      : "bg-slate-50/60 hover:bg-slate-100 border-slate-100"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {topic.isPinned && (
                        <span className="text-amber-500" title="Épinglé">
                          <Pin className="w-3 h-3 inline fill-amber-500" />
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {topic.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2">
                      {topic.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>Par {topic.authorName}</span>
                      <span>•</span>
                      <span>{topic.messageCount} msg</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-teal-600" : "text-slate-300"}`} />
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTopic(topic.id);
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1"
                        title="Supprimer le sujet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Messages Thread & Reply Box */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between min-h-[400px]">
          {activeTopic ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Topic Header */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {activeTopic.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Initié par <strong>{activeTopic.authorName}</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {activeTopic.title}
                </h3>
              </div>

              {/* Message List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
                {loadingMessages ? (
                  <p className="text-center py-8 text-xs text-slate-400">Chargement des messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">Aucun message dans ce fil.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                            {msg.authorName[0]?.toUpperCase() || "U"}
                          </div>
                          <strong className="text-slate-800">{msg.authorName}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{new Date(msg.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="hover:text-rose-600 p-0.5"
                              title="Supprimer ce message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-8">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Répondre en tant que :</span>
                  <input
                    type="text"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="Votre nom..."
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-40 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Écrivez votre message..."
                    required
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              Sélectionnez une discussion à gauche ou créez un nouveau sujet.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Topic */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Ouvrir un nouveau sujet de discussion</h3>
              <button onClick={() => setShowTopicModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre de la discussion *</label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ex: Covoiturage pour samedi, Tenues du club..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Vie du Club">Vie du Club</option>
                    <option value="Compétitions">Compétitions</option>
                    <option value="Covoiturage">Covoiturage</option>
                    <option value="Entraînement">Entraînement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Votre Nom</label>
                  <input
                    type="text"
                    value={newTopicAuthor}
                    onChange={(e) => setNewTopicAuthor(e.target.value)}
                    placeholder="Votre prénom/nom"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premier message *</label>
                <textarea
                  rows={4}
                  value={newTopicMessage}
                  onChange={(e) => setNewTopicMessage(e.target.value)}
                  placeholder="Expliquez votre demande ou information pour les licenciés..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Publier la discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
