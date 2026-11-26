"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar, { NavTab } from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import AnalyticsModal from "@/components/AnalyticsModal";
import UrgentAlertBanner from "@/components/UrgentAlertBanner";
import Footer from "@/components/Footer";

// Tabs
import HomeTab from "@/components/tabs/HomeTab";
import NewsTab from "@/components/tabs/NewsTab";
import ClubTab from "@/components/tabs/ClubTab";
import SaisonTab from "@/components/tabs/SaisonTab";
import ScoresTab from "@/components/tabs/ScoresTab";
import LicenciesTab from "@/components/tabs/LicenciesTab";
import MediaTab from "@/components/tabs/MediaTab";
import PartenairesTab from "@/components/tabs/PartenairesTab";
import ForumTab from "@/components/tabs/ForumTab";
import FaqTab from "@/components/tabs/FaqTab";

import {
  User,
  ClubInfo,
  AnalyticsData,
  UrgentAlert,
  Competition,
  Standing,
  Player,
  ClubMember,
  Team,
  CalendarMatch,
  NewsSlide,
  MediaItem,
  Partner,
  ForumTopic,
} from "@/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("accueil");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [urgentAlert, setUrgentAlert] = useState<UrgentAlert | null>(null);

  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    id: 1,
    clubName: "Pétanque Naintreénne",
    address: "Boulodrome Municipal, Avenue de la Gare, 86530 Naintré",
    email: "petanque.naintreenne86@gmail.com",
    phone: "06 82 14 35 90",
    trainingHours: "Mardi & Jeudi : 14h00 - 19h00 | Vendredi : 18h00 - 22h00 | Concours : Samedi & Dimanche",
    description: "Club officiel de la Pétanque Naintreénne (Vienne - 86). Esprit sportif, compétition CDC et convivialité.",
    pointsVictory: 3,
    pointsDraw: 2,
    pointsDefeat: 1,
    pointsForfeit: 0,
  });

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [roundMatches, setRoundMatches] = useState<any[]>([]);
  const [rules, setRules] = useState({
    pointsVictory: 3,
    pointsDraw: 2,
    pointsDefeat: 1,
    pointsForfeit: 0,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [news, setNews] = useState<NewsSlide[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);

  // Restore logged-in user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pn_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Track visit on mount
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: window.location.pathname }),
    }).catch(() => {});
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      // 1. Analytics
      fetch("/api/analytics")
        .then((r) => r.json())
        .then((d) => d.success && setAnalyticsData(d))
        .catch(() => {});

      // 2. Urgent alert
      fetch("/api/urgent")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.active && d.active.length > 0) {
            setUrgentAlert(d.active[0]);
          } else {
            setUrgentAlert(null);
          }
        })
        .catch(() => {});

      // 3. Club info
      fetch("/api/club")
        .then((r) => r.json())
        .then((d) => d.success && d.club && setClubInfo(d.club))
        .catch(() => {});

      // 4. Scores & Competitions
      fetch("/api/scores")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            if (d.competitions) setCompetitions(d.competitions);
            if (d.standings) setStandings(d.standings);
            if (d.rules) setRules(d.rules);
            if (d.rounds) setRounds(d.rounds);
            if (d.matches) setRoundMatches(d.matches);
          }
        })
        .catch(() => {});

      // 5. Players
      fetch("/api/players")
        .then((r) => r.json())
        .then((d) => d.success && d.players && setPlayers(d.players))
        .catch(() => {});

      // 6. Club Members
      fetch("/api/club-members")
        .then((r) => r.json())
        .then((d) => d.success && d.members && setClubMembers(d.members))
        .catch(() => {});

      // 7. Teams
      fetch("/api/teams")
        .then((r) => r.json())
        .then((d) => d.success && d.teams && setTeams(d.teams))
        .catch(() => {});

      // 8. Calendar
      fetch("/api/calendar")
        .then((r) => r.json())
        .then((d) => d.success && d.matches && setMatches(d.matches))
        .catch(() => {});

      // 9. News
      fetch("/api/news")
        .then((r) => r.json())
        .then((d) => d.success && d.news && setNews(d.news))
        .catch(() => {});

      // 10. Media
      fetch("/api/media")
        .then((r) => r.json())
        .then((d) => d.success && d.media && setMedia(d.media))
        .catch(() => {});

      // 11. Partners
      fetch("/api/partners")
        .then((r) => r.json())
        .then((d) => d.success && d.partners && setPartners(d.partners))
        .catch(() => {});

      // 12. Forum
      fetch("/api/forum")
        .then((r) => r.json())
        .then((d) => d.success && d.topics && setTopics(d.topics))
        .catch(() => {});
    } catch (e) {
      console.error("Data refresh error:", e);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live polling every 10 seconds so changes made appear directly!
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("pn_user");
    setCurrentUser(null);
  };

  const isAdmin = Boolean(currentUser && (currentUser.role === "admin" || currentUser.role === "president"));

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Urgent Alert Banner */}
      <UrgentAlertBanner
        urgentAlert={urgentAlert}
        isAdmin={isAdmin}
        onRefresh={fetchData}
      />

      {/* Navigation matching Photo 1 */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        analyticsData={analyticsData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {activeTab === "accueil" && (
          <HomeTab
            slides={news.filter((n) => n.isSlide)}
            matches={matches}
            clubInfo={clubInfo}
            isAdmin={isAdmin}
            onNavigateTab={setActiveTab}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "actualites" && (
          <NewsTab news={news} isAdmin={isAdmin} onRefresh={fetchData} />
        )}

        {activeTab === "club" && (
          <ClubTab
            clubInfo={clubInfo}
            members={clubMembers}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "saison" && (
          <SaisonTab
            teams={teams}
            matches={matches}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "scores" && (
          <ScoresTab
            competitions={competitions}
            standings={standings}
            rounds={rounds}
            matches={roundMatches}
            rules={rules}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "licences" && (
          <LicenciesTab
            players={players}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "medias" && (
          <MediaTab
            media={media}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "partenaires" && (
          <PartenairesTab
            partners={partners}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "forum" && (
          <ForumTab
            topics={topics}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "faq" && <FaqTab />}
      </main>

      {/* Footer */}
      <Footer
        clubInfo={clubInfo}
        analyticsData={analyticsData}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Login & Forgot Password Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Private Analytics Chart Modal (Reserved to club admin) */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analyticsData={analyticsData}
        isAdmin={isAdmin}
      />
    </div>
  );
}
