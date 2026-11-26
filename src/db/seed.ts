import { db } from "./index";
import {
  clubInfo,
  users,
  newsSlides,
  players,
  clubMembers,
  competitions,
  standings,
  teams,
  calendarMatches,
  mediaItems,
  partners,
  forumTopics,
  forumMessages,
  subscribers,
  urgentAnnouncements,
  visitLogs,
  championshipRounds,
  championshipMatches,
} from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // 1. Club Info
    const existingClub = await db.select().from(clubInfo).limit(1);
    if (existingClub.length === 0) {
      await db.insert(clubInfo).values({
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
    }

    // 2. Default User (matching Photo 1 crown "Mickey")
    const existingUser = await db.select().from(users).where(eq(users.username, "Mickey"));
    if (existingUser.length === 0) {
      await db.insert(users).values([
        {
          username: "Mickey",
          displayName: "Mickey (Président)",
          password: "admin",
          email: "president@petanque-naintre.fr",
          role: "admin",
          securityQuestion: "Quelle est la ville de notre club ?",
          securityAnswer: "Naintré",
        },
        {
          username: "admin",
          displayName: "Administrateur PN",
          password: "admin",
          email: "admin@petanque-naintre.fr",
          role: "admin",
          securityQuestion: "Quelle est la ville de notre club ?",
          securityAnswer: "Naintré",
        },
      ]);
    }

    // 3. Competitions & Standings matching Photo 1 & Photo 2!
    const existingComps = await db.select().from(competitions).limit(1);
    let comp1Id = 1;

    if (existingComps.length === 0) {
      const [comp1] = await db.insert(competitions).values({
        name: "Division 1 – CDC Masculin",
        season: "2025-2026",
        pointsVictory: 3,
        pointsDraw: 2,
        pointsDefeat: 1,
        pointsForfeit: 0,
        orderNum: 1,
      }).returning();
      comp1Id = comp1.id;

      const [comp2] = await db.insert(competitions).values({
        name: "Division 2 – CDC Féminin",
        season: "2025-2026",
        pointsVictory: 3,
        pointsDraw: 2,
        pointsDefeat: 1,
        pointsForfeit: 0,
        orderNum: 2,
      }).returning();

      const [comp3] = await db.insert(competitions).values({
        name: "Division 3 – Vétérans",
        season: "2025-2026",
        pointsVictory: 3,
        pointsDraw: 2,
        pointsDefeat: 1,
        pointsForfeit: 0,
        orderNum: 3,
      }).returning();

      // Seed Division 1 clubs with the teams
      await db.insert(standings).values([
        { competitionId: comp1.id, clubName: "02-Pétanque Naintreénne", isPn: true, played: 2, won: 2, drawn: 0, lost: 0, forfeit: 0, boulesPour: 56, boulesContre: 16, points: 6, position: 1 },
        { competitionId: comp1.id, clubName: "03-Club de Châtellerault", isPn: false, played: 1, won: 1, drawn: 0, lost: 0, forfeit: 0, boulesPour: 25, boulesContre: 11, points: 3, position: 2 },
        { competitionId: comp1.id, clubName: "07-Club de Poitiers", isPn: false, played: 1, won: 1, drawn: 0, lost: 0, forfeit: 0, boulesPour: 25, boulesContre: 11, points: 3, position: 3 },
        { competitionId: comp1.id, clubName: "06-Club de Loudun", isPn: false, played: 1, won: 1, drawn: 0, lost: 0, forfeit: 0, boulesPour: 22, boulesContre: 14, points: 3, position: 4 },
        { competitionId: comp1.id, clubName: "08-Club de Montmorillon", isPn: false, played: 2, won: 0, drawn: 0, lost: 2, forfeit: 0, boulesPour: 17, boulesContre: 55, points: 2, position: 5 },
        { competitionId: comp1.id, clubName: "01-Club de Civray", isPn: false, played: 1, won: 0, drawn: 0, lost: 1, forfeit: 0, boulesPour: 14, boulesContre: 22, points: 1, position: 6 },
        { competitionId: comp1.id, clubName: "05-Chauvigny Pétanque", isPn: false, played: 1, won: 0, drawn: 0, lost: 1, forfeit: 0, boulesPour: 11, boulesContre: 25, points: 1, position: 7 },
        { competitionId: comp1.id, clubName: "04-Buxerolles Pétanque", isPn: false, played: 1, won: 0, drawn: 0, lost: 1, forfeit: 0, boulesPour: 10, boulesContre: 26, points: 1, position: 8 },
      ]);
    } else {
      comp1Id = existingComps[0].id;
    }

    // Seed Championship Rounds & Matches if empty
    const existingRounds = await db.select().from(championshipRounds).limit(1);
    if (existingRounds.length === 0) {
      const [r1] = await db.insert(championshipRounds).values({
        competitionId: comp1Id,
        roundNumber: 1,
        name: "Journée 1",
        isValidated: true,
        orderNum: 1,
      }).returning();

      // Insert 4 matches matching Photo 1:
      // Match 1: 02 vs 04 (26 vs 10)
      // Match 2: 07 vs 08 (25 vs 11)
      // Match 3: 01 vs 06 (14 vs 22)
      // Match 4: 03 vs 05 (25 vs 11)
      await db.insert(championshipMatches).values([
        {
          roundId: r1.id,
          competitionId: comp1Id,
          teamA: "02-Pétanque Naintreénne",
          teamB: "04-Buxerolles Pétanque",
          scoreA: 26,
          scoreB: 10,
          forfeitA: false,
          forfeitB: false,
          isSaved: true,
          orderNum: 1,
        },
        {
          roundId: r1.id,
          competitionId: comp1Id,
          teamA: "07-Club de Poitiers",
          teamB: "08-Club de Montmorillon",
          scoreA: 25,
          scoreB: 11,
          forfeitA: false,
          forfeitB: false,
          isSaved: true,
          orderNum: 2,
        },
        {
          roundId: r1.id,
          competitionId: comp1Id,
          teamA: "01-Club de Civray",
          teamB: "06-Club de Loudun",
          scoreA: 14,
          scoreB: 22,
          forfeitA: false,
          forfeitB: false,
          isSaved: true,
          orderNum: 3,
        },
        {
          roundId: r1.id,
          competitionId: comp1Id,
          teamA: "03-Club de Châtellerault",
          teamB: "05-Chauvigny Pétanque",
          scoreA: 25,
          scoreB: 11,
          forfeitA: false,
          forfeitB: false,
          isSaved: true,
          orderNum: 4,
        },
      ]);

      // Seed Journée 2
      const [r2] = await db.insert(championshipRounds).values({
        competitionId: comp1Id,
        roundNumber: 2,
        name: "Journée 2",
        isValidated: false,
        orderNum: 2,
      }).returning();

      await db.insert(championshipMatches).values([
        {
          roundId: r2.id,
          competitionId: comp1Id,
          teamA: "02-Pétanque Naintreénne",
          teamB: "08-Club de Montmorillon",
          scoreA: 30,
          scoreB: 6,
          forfeitA: false,
          forfeitB: false,
          isSaved: true,
          orderNum: 1,
        },
        {
          roundId: r2.id,
          competitionId: comp1Id,
          teamA: "03-Club de Châtellerault",
          teamB: "01-Club de Civray",
          scoreA: null,
          scoreB: null,
          forfeitA: false,
          forfeitB: false,
          isSaved: false,
          orderNum: 2,
        },
        {
          roundId: r2.id,
          competitionId: comp1Id,
          teamA: "06-Club de Loudun",
          teamB: "07-Club de Poitiers",
          scoreA: null,
          scoreB: null,
          forfeitA: false,
          forfeitB: false,
          isSaved: false,
          orderNum: 3,
        },
        {
          roundId: r2.id,
          competitionId: comp1Id,
          teamA: "04-Buxerolles Pétanque",
          teamB: "05-Chauvigny Pétanque",
          scoreA: null,
          scoreB: null,
          forfeitA: false,
          forfeitB: false,
          isSaved: false,
          orderNum: 4,
        },
      ]);
    }

    console.log("Database seeded successfully with Championship rounds and matches!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
