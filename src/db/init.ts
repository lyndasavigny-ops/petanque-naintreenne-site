import { pool } from "./index";

let isInitialized = false;

export async function ensureDatabaseTables() {
  if (isInitialized) return true;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS club_info (
          id SERIAL PRIMARY KEY,
          club_name TEXT NOT NULL DEFAULT 'Pétanque Naintreénne',
          address TEXT NOT NULL DEFAULT 'Boulodrome Municipal, Avenue de la Gare, 86530 Naintré',
          email TEXT NOT NULL DEFAULT 'petanque.naintreenne86@gmail.com',
          phone TEXT NOT NULL DEFAULT '06 82 14 35 90',
          training_hours TEXT NOT NULL DEFAULT 'Mardi & Jeudi : 14h00 - 19h00 | Vendredi : 18h00 - 22h00 | Concours : Samedi & Dimanche',
          description TEXT DEFAULT 'Club dynamique et convivial de la Vienne (86), affilié FFPJP.',
          points_victory INTEGER NOT NULL DEFAULT 3,
          points_draw INTEGER NOT NULL DEFAULT 2,
          points_defeat INTEGER NOT NULL DEFAULT 1,
          points_forfeit INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS visit_logs (
          id SERIAL PRIMARY KEY,
          page TEXT NOT NULL DEFAULT '/',
          ip_hash TEXT DEFAULT 'anonymous',
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL DEFAULT 'Mickey',
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          security_question TEXT DEFAULT 'Quelle est la ville du club ?',
          security_answer TEXT DEFAULT 'Naintré',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS news_slides (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          subtitle TEXT,
          content TEXT NOT NULL,
          image_url TEXT,
          badge TEXT DEFAULT 'Actualité',
          is_slide BOOLEAN DEFAULT TRUE,
          is_urgent BOOLEAN DEFAULT FALSE,
          order_num INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          gender TEXT NOT NULL DEFAULT 'Masculin',
          birth_date TEXT,
          category TEXT NOT NULL DEFAULT 'Promotion',
          photo_url TEXT,
          license_number TEXT,
          is_highlighted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS club_members (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'bureau',
          photo_url TEXT,
          phone TEXT,
          email TEXT,
          order_num INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS competitions (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          season TEXT DEFAULT '2025-2026',
          points_victory INTEGER DEFAULT 3,
          points_draw INTEGER DEFAULT 2,
          points_defeat INTEGER DEFAULT 1,
          points_forfeit INTEGER DEFAULT 0,
          order_num INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS standings (
          id SERIAL PRIMARY KEY,
          competition_id INTEGER NOT NULL,
          club_name TEXT NOT NULL,
          is_pn BOOLEAN DEFAULT FALSE,
          played INTEGER DEFAULT 0,
          won INTEGER DEFAULT 0,
          drawn INTEGER DEFAULT 0,
          lost INTEGER DEFAULT 0,
          forfeit INTEGER DEFAULT 0,
          boules_pour INTEGER DEFAULT 0,
          boules_contre INTEGER DEFAULT 0,
          points INTEGER DEFAULT 0,
          position INTEGER DEFAULT 1,
          manual_rank TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS championship_rounds (
          id SERIAL PRIMARY KEY,
          competition_id INTEGER NOT NULL,
          round_number INTEGER NOT NULL DEFAULT 1,
          name TEXT NOT NULL DEFAULT 'Journée 1',
          is_validated BOOLEAN DEFAULT TRUE,
          order_num INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS championship_matches (
          id SERIAL PRIMARY KEY,
          round_id INTEGER NOT NULL,
          competition_id INTEGER NOT NULL,
          team_a TEXT NOT NULL,
          team_b TEXT NOT NULL,
          score_a INTEGER,
          score_b INTEGER,
          forfeit_a BOOLEAN DEFAULT FALSE,
          forfeit_b BOOLEAN DEFAULT FALSE,
          parties_won_a INTEGER,
          parties_won_b INTEGER,
          is_saved BOOLEAN DEFAULT TRUE,
          order_num INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS teams (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          division TEXT NOT NULL,
          player_names TEXT NOT NULL,
          captain_name TEXT,
          season TEXT DEFAULT '2025-2026',
          photo_url TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS calendar_matches (
          id SERIAL PRIMARY KEY,
          competition_name TEXT NOT NULL,
          match_date TEXT NOT NULL,
          match_time TEXT DEFAULT '14:30',
          opponent TEXT NOT NULL,
          location TEXT NOT NULL DEFAULT 'Domicile (Naintré)',
          address TEXT,
          score_pn INTEGER,
          score_opponent INTEGER,
          status TEXT DEFAULT 'À venir',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS media_items (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'photo',
          url TEXT NOT NULL,
          description TEXT,
          category TEXT DEFAULT 'Événement',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS partners (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          logo_url TEXT NOT NULL,
          website_url TEXT,
          description TEXT,
          order_num INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS forum_topics (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          author_name TEXT NOT NULL,
          category TEXT DEFAULT 'Général',
          is_pinned BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS forum_messages (
          id SERIAL PRIMARY KEY,
          topic_id INTEGER NOT NULL,
          author_name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS subscribers (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS urgent_announcements (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          sent_emails_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // Ensure default Mickey & admin user exist in table
      await client.query(`
        INSERT INTO users (username, display_name, password, email, role, security_question, security_answer)
        VALUES 
          ('Mickey', 'Mickey (Président)', 'admin', 'president@petanque-naintre.fr', 'admin', 'Quelle est la ville du club ?', 'Naintré'),
          ('admin', 'Administrateur PN', 'admin', 'admin@petanque-naintre.fr', 'admin', 'Quelle est la ville du club ?', 'Naintré')
        ON CONFLICT (username) DO NOTHING;
      `);

      isInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn("Database initialization skipped or failed:", error);
    return false;
  }
}
