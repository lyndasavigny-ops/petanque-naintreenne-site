export interface ClubInfo {
  id: number;
  clubName: string;
  address: string;
  email: string;
  phone: string;
  trainingHours: string;
  description: string;
  pointsVictory: number;
  pointsDraw: number;
  pointsDefeat: number;
  pointsForfeit: number;
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: string;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Masculin" | "Féminin";
  birthDate: string | null;
  category: "Élite" | "Honneur" | "Promotion" | "Non classé";
  photoUrl: string | null;
  licenseNumber: string | null;
  isHighlighted?: boolean;
}

export interface ClubMember {
  id: number;
  fullName: string;
  role: string;
  category: "bureau" | "arbitre";
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  orderNum?: number;
}

export interface Competition {
  id: number;
  name: string;
  season: string;
  pointsVictory: number;
  pointsDraw: number;
  pointsDefeat: number;
  pointsForfeit: number;
  orderNum?: number;
}

export interface Standing {
  id: number;
  competitionId: number;
  clubName: string;
  isPn: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  forfeit: number;
  boulesPour: number;
  boulesContre: number;
  points: number;
  position: number;
  manualRank?: string | null;
}

export interface ChampionshipRound {
  id: number;
  competitionId: number;
  roundNumber: number;
  name: string;
  isValidated: boolean;
  orderNum: number;
}

export interface ChampionshipMatch {
  id: number;
  roundId: number;
  competitionId: number;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  forfeitA: boolean;
  forfeitB: boolean;
  partiesWonA: number | null;
  partiesWonB: number | null;
  isSaved: boolean;
  orderNum: number;
}

export interface Team {
  id: number;
  name: string;
  division: string;
  playerNames: string;
  captainName: string | null;
  season: string;
  notes: string | null;
  photoUrl?: string | null;
}

export interface CalendarMatch {
  id: number;
  competitionName: string;
  matchDate: string;
  matchTime: string;
  opponent: string;
  location: string;
  address: string | null;
  scorePn: number | null;
  scoreOpponent: number | null;
  status: string;
}

export interface NewsSlide {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  imageUrl: string | null;
  badge: string;
  isSlide: boolean;
  isUrgent: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: number;
  title: string;
  type: "photo" | "video";
  url: string;
  description: string | null;
  category: string;
}

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  description: string | null;
  orderNum: number;
}

export interface ForumTopic {
  id: number;
  title: string;
  authorName: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  messageCount: number;
}

export interface ForumMessage {
  id: number;
  topicId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface UrgentAlert {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  sentEmailsCount: number;
  createdAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AnalyticsData {
  stats: {
    today: number;
    thisMonth: number;
    thisYear: number;
    total: number;
  };
  chartDaily: Array<{ date: string; label: string; count: number }>;
  chartMonthly: Array<{ monthStr: string; count: number }>;
}
