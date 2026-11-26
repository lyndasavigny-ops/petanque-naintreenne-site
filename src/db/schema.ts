import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// 1. Club Configuration
export const clubInfo = pgTable("club_info", {
  id: serial("id").primaryKey(),
  clubName: text("club_name").notNull().default("Pétanque Naintreénne"),
  address: text("address").notNull().default("Boulodrome Municipal, Avenue de la Gare, 86530 Naintré"),
  email: text("email").notNull().default("petanque.naintreenne86@gmail.com"),
  phone: text("phone").notNull().default("06 82 14 35 90"),
  trainingHours: text("training_hours").notNull().default("Mardi & Jeudi : 14h00 - 19h00 | Vendredi : 18h00 - 22h00 | Concours : Samedi & Dimanche"),
  description: text("description").default("Club dynamique et convivial de la Vienne (86), affilié FFPJP."),
  pointsVictory: integer("points_victory").notNull().default(3),
  pointsDraw: integer("points_draw").notNull().default(2),
  pointsDefeat: integer("points_defeat").notNull().default(1),
  pointsForfeit: integer("points_forfeit").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Visits & Analytics Tracker
export const visitLogs = pgTable("visit_logs", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().default("/"),
  ipHash: text("ip_hash").default("anonymous"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Admin & Club Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull().default("Mickey"),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"), // "admin" | "president" | "membre"
  securityQuestion: text("security_question").default("Quelle est la ville du club ?"),
  securityAnswer: text("security_answer").default("Naintré"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. News and Carousel Slides
export const newsSlides = pgTable("news_slides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  badge: text("badge").default("Actualité"),
  isSlide: boolean("is_slide").default(true),
  isUrgent: boolean("is_urgent").default(false),
  orderNum: integer("order_num").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Licenciés (Players)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull().default("Masculin"), // "Masculin" | "Féminin"
  birthDate: text("birth_date"), // YYYY-MM-DD
  category: text("category").notNull().default("Promotion"), // "Élite" | "Honneur" | "Promotion" | "Non classé"
  photoUrl: text("photo_url"),
  licenseNumber: text("license_number"),
  isHighlighted: boolean("is_highlighted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Notre Club - Organigramme du bureau & Arbitres
export const clubMembers = pgTable("club_members", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // Président, Vice-Président, Secrétaire, Trésorier, Membre, Arbitre Club, Arbitre Départemental
  category: text("category").notNull().default("bureau"), // "bureau" | "arbitre"
  photoUrl: text("photo_url"),
  phone: text("phone"),
  email: text("email"),
  orderNum: integer("order_num").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Competitions & Ranking (CDC / Coupes)
export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Division 1 – CDC Masculin", "Division 2 – CDC Féminin", "Division 3 – Vétérans", etc.
  season: text("season").default("2025-2026"),
  pointsVictory: integer("points_victory").default(3),
  pointsDraw: integer("points_draw").default(2),
  pointsDefeat: integer("points_defeat").default(1),
  pointsForfeit: integer("points_forfeit").default(0),
  orderNum: integer("order_num").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const standings = pgTable("standings", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull(),
  clubName: text("club_name").notNull(),
  isPn: boolean("is_pn").default(false), // Pétanque Naintreénne flag
  played: integer("played").default(0),
  won: integer("won").default(0),
  drawn: integer("drawn").default(0),
  lost: integer("lost").default(0),
  forfeit: integer("forfeit").default(0),
  boulesPour: integer("boules_pour").default(0),
  boulesContre: integer("boules_contre").default(0),
  points: integer("points").default(0),
  position: integer("position").default(1),
  manualRank: text("manual_rank"), // Optionnel : ordre manuel (ex: "—", "1", "2")
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Journées de Championnat (CDC)
export const championshipRounds = pgTable("championship_rounds", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull(),
  roundNumber: integer("round_number").notNull().default(1), // Journée 1, 2, 3...
  name: text("name").notNull().default("Journée 1"),
  isValidated: boolean("is_validated").default(true),
  orderNum: integer("order_num").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matchs / Rencontres d'une journée CDC
export const championshipMatches = pgTable("championship_matches", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  competitionId: integer("competition_id").notNull(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  scoreA: integer("score_a"), // ex: 26 (sur 36 points max de la rencontre)
  scoreB: integer("score_b"), // ex: 10
  forfeitA: boolean("forfeit_a").default(false),
  forfeitB: boolean("forfeit_b").default(false),
  partiesWonA: integer("parties_won_a"), // facultatif : ex parties gagnées sur 11
  partiesWonB: integer("parties_won_b"),
  isSaved: boolean("is_saved").default(true),
  orderNum: integer("order_num").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Saison - Équipes du club
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Equipe 1 Masculine, Equipe Féminine, etc.
  division: text("division").notNull(), // CDC Division 1 Poule A, Coupe de France, etc.
  playerNames: text("player_names").notNull(), // Comma separated or list
  captainName: text("captain_name"),
  season: text("season").default("2025-2026"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calendrier CDC & Rencontres
export const calendarMatches = pgTable("calendar_matches", {
  id: serial("id").primaryKey(),
  competitionName: text("competition_name").notNull(),
  matchDate: text("match_date").notNull(),
  matchTime: text("match_time").default("14:30"),
  opponent: text("opponent").notNull(),
  location: text("location").notNull().default("Domicile (Naintré)"), // "Domicile (Naintré)" | "Extérieur"
  address: text("address"),
  scorePn: integer("score_pn"),
  scoreOpponent: integer("score_opponent"),
  status: text("status").default("À venir"), // "À venir" | "Terminé" | "Reporté"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Médias (Photos & Vidéos)
export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("photo"), // "photo" | "video"
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").default("Événement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Partenaires & Sponsors
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  description: text("description"),
  orderNum: integer("order_num").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Forum
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull(),
  category: text("category").default("Général"),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumMessages = pgTable("forum_messages", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Email Subscribers & Urgent Alerts
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const urgentAnnouncements = pgTable("urgent_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  sentEmailsCount: integer("sent_emails_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
