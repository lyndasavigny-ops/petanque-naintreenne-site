import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitions, standings, clubInfo, championshipRounds, championshipMatches } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

// Helper: recalculate standings from all validated rounds/matches of a competition
export async function recalculateCompetitionStandings(competitionId: number) {
  const club = await db.select().from(clubInfo).limit(1);
  const vPts = club[0]?.pointsVictory ?? 3;
  const nPts = club[0]?.pointsDraw ?? 2;
  const dPts = club[0]?.pointsDefeat ?? 1;
  const fPts = club[0]?.pointsForfeit ?? 0;

  // Get all existing standings rows for this competition
  const currentRows = await db.select().from(standings).where(eq(standings.competitionId, competitionId));
  
  // Get all matches for this competition
  const matches = await db.select().from(championshipMatches).where(eq(championshipMatches.competitionId, competitionId));

  // Build map of team stats
  const statsMap: Record<string, {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    forfeit: number;
    pour: number;
    contre: number;
    points: number;
  }> = {};

  // Initialize for all known clubs in standings
  for (const r of currentRows) {
    statsMap[r.clubName] = {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      forfeit: 0,
      pour: 0,
      contre: 0,
      points: 0,
    };
  }

  // Iterate over matches with scores
  for (const m of matches) {
    if (!statsMap[m.teamA]) {
      statsMap[m.teamA] = { played: 0, won: 0, drawn: 0, lost: 0, forfeit: 0, pour: 0, contre: 0, points: 0 };
    }
    if (!statsMap[m.teamB]) {
      statsMap[m.teamB] = { played: 0, won: 0, drawn: 0, lost: 0, forfeit: 0, pour: 0, contre: 0, points: 0 };
    }

    const sA = m.scoreA;
    const sB = m.scoreB;
    const forfA = m.forfeitA;
    const forfB = m.forfeitB;

    // Only compute if scores are entered or forfeiture is checked
    if (sA !== null || sB !== null || forfA || forfB) {
      const numA = sA !== null ? Number(sA) : 0;
      const numB = sB !== null ? Number(sB) : 0;

      statsMap[m.teamA].played += 1;
      statsMap[m.teamB].played += 1;
      statsMap[m.teamA].pour += numA;
      statsMap[m.teamA].contre += numB;
      statsMap[m.teamB].pour += numB;
      statsMap[m.teamB].contre += numA;

      if (forfA && !forfB) {
        statsMap[m.teamA].forfeit += 1;
        statsMap[m.teamA].points += fPts;
        statsMap[m.teamB].won += 1;
        statsMap[m.teamB].points += vPts;
      } else if (forfB && !forfA) {
        statsMap[m.teamB].forfeit += 1;
        statsMap[m.teamB].points += fPts;
        statsMap[m.teamA].won += 1;
        statsMap[m.teamA].points += vPts;
      } else if (forfA && forfB) {
        statsMap[m.teamA].forfeit += 1;
        statsMap[m.teamA].points += fPts;
        statsMap[m.teamB].forfeit += 1;
        statsMap[m.teamB].points += fPts;
      } else if (numA > numB) {
        statsMap[m.teamA].won += 1;
        statsMap[m.teamA].points += vPts;
        statsMap[m.teamB].lost += 1;
        statsMap[m.teamB].points += dPts;
      } else if (numB > numA) {
        statsMap[m.teamB].won += 1;
        statsMap[m.teamB].points += vPts;
        statsMap[m.teamA].lost += 1;
        statsMap[m.teamA].points += dPts;
      } else {
        // Tie / Match Nul
        statsMap[m.teamA].drawn += 1;
        statsMap[m.teamA].points += nPts;
        statsMap[m.teamB].drawn += 1;
        statsMap[m.teamB].points += nPts;
      }
    }
  }

  // Sort all clubs by Points DESC, Diff DESC, Boules Pour DESC
  const sortedClubs = Object.entries(statsMap).sort(([, a], [, b]) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffB = b.pour - b.contre;
    const diffA = a.pour - a.contre;
    if (diffB !== diffA) return diffB - diffA;
    return b.pour - a.pour;
  });

  // Update standings rows in DB with position
  let pos = 1;
  for (const [clubName, st] of sortedClubs) {
    const existing = currentRows.find((r) => r.clubName === clubName);
    if (existing) {
      await db
        .update(standings)
        .set({
          played: st.played,
          won: st.won,
          drawn: st.drawn,
          lost: st.lost,
          forfeit: st.forfeit,
          boulesPour: st.pour,
          boulesContre: st.contre,
          points: st.points,
          position: pos,
        })
        .where(eq(standings.id, existing.id));
    } else {
      await db.insert(standings).values({
        competitionId,
        clubName,
        isPn: clubName.toLowerCase().includes("naintre"),
        played: st.played,
        won: st.won,
        drawn: st.drawn,
        lost: st.lost,
        forfeit: st.forfeit,
        boulesPour: st.pour,
        boulesContre: st.contre,
        points: st.points,
        position: pos,
      });
    }
    pos++;
  }
}

export async function GET(req: NextRequest) {
  try {
    const comps = await db.select().from(competitions).orderBy(asc(competitions.orderNum), asc(competitions.id));
    const allStandings = await db.select().from(standings).orderBy(asc(standings.position), desc(standings.points));
    const allRounds = await db.select().from(championshipRounds).orderBy(asc(championshipRounds.orderNum), asc(championshipRounds.id));
    const allMatches = await db.select().from(championshipMatches).orderBy(asc(championshipMatches.orderNum), asc(championshipMatches.id));
    const club = await db.select().from(clubInfo).limit(1);

    const defaultRules = {
      pointsVictory: club[0]?.pointsVictory ?? 3,
      pointsDraw: club[0]?.pointsDraw ?? 2,
      pointsDefeat: club[0]?.pointsDefeat ?? 1,
      pointsForfeit: club[0]?.pointsForfeit ?? 0,
    };

    return NextResponse.json({
      success: true,
      rules: defaultRules,
      competitions: comps,
      standings: allStandings,
      rounds: allRounds,
      matches: allMatches,
    });
  } catch (error) {
    console.error("Scores GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action: create new competition
    if (action === "create_competition" || body.type === "competition") {
      const { name, season } = body;
      if (!name) {
        return NextResponse.json({ error: "Nom de compétition requis" }, { status: 400 });
      }

      const [newComp] = await db
        .insert(competitions)
        .values({
          name: name.trim(),
          season: season || "2025-2026",
          pointsVictory: body.pointsVictory ?? 3,
          pointsDraw: body.pointsDraw ?? 2,
          pointsDefeat: body.pointsDefeat ?? 1,
          pointsForfeit: body.pointsForfeit ?? 0,
        })
        .returning();

      // Automatically add "Pétanque Naintreénne" as default club
      await db.insert(standings).values({
        competitionId: newComp.id,
        clubName: "Pétanque Naintreénne",
        isPn: true,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        forfeit: 0,
        boulesPour: 0,
        boulesContre: 0,
        points: 0,
        position: 1,
      });

      // Automatically create Journée 1
      await db.insert(championshipRounds).values({
        competitionId: newComp.id,
        roundNumber: 1,
        name: "Journée 1",
        isValidated: false,
        orderNum: 1,
      });

      return NextResponse.json({ success: true, competition: newComp });
    }

    // Action: add club to competition
    if (action === "add_club" || body.competitionId) {
      const { competitionId, clubName, isPn, played, won, drawn, lost, forfeit, boulesPour, boulesContre } = body;
      if (!competitionId || !clubName) {
        return NextResponse.json({ error: "Compétition et nom du club requis" }, { status: 400 });
      }

      const [newRow] = await db
        .insert(standings)
        .values({
          competitionId: Number(competitionId),
          clubName: clubName.trim(),
          isPn: Boolean(isPn),
          played: Number(played) || 0,
          won: Number(won) || 0,
          drawn: Number(drawn) || 0,
          lost: Number(lost) || 0,
          forfeit: Number(forfeit) || 0,
          boulesPour: Number(boulesPour) || 0,
          boulesContre: Number(boulesContre) || 0,
          points: Number(body.points) || 0,
        })
        .returning();

      return NextResponse.json({ success: true, standing: newRow });
    }

    // Action: Add new round (Journée)
    if (action === "add_round") {
      const { competitionId, roundNumber, name } = body;
      const [newRound] = await db
        .insert(championshipRounds)
        .values({
          competitionId: Number(competitionId),
          roundNumber: Number(roundNumber) || 1,
          name: name || `Journée ${roundNumber || 1}`,
          isValidated: false,
          orderNum: Number(roundNumber) || 1,
        })
        .returning();

      return NextResponse.json({ success: true, round: newRound });
    }

    // Action: Add match to a round
    if (action === "add_round_match") {
      const { roundId, competitionId, teamA, teamB, scoreA, scoreB } = body;
      const [newMatch] = await db
        .insert(championshipMatches)
        .values({
          roundId: Number(roundId),
          competitionId: Number(competitionId),
          teamA: teamA.trim(),
          teamB: teamB.trim(),
          scoreA: scoreA !== undefined && scoreA !== "" ? Number(scoreA) : null,
          scoreB: scoreB !== undefined && scoreB !== "" ? Number(scoreB) : null,
          isSaved: true,
        })
        .returning();

      await recalculateCompetitionStandings(Number(competitionId));

      return NextResponse.json({ success: true, match: newMatch });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Scores POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action: update match score and recalculate classement instantly!
    if (action === "update_round_match") {
      const { matchId, scoreA, scoreB, forfeitA, forfeitB, partiesWonA, partiesWonB } = body;
      
      const [match] = await db
        .select()
        .from(championshipMatches)
        .where(eq(championshipMatches.id, Number(matchId)));

      if (!match) {
        return NextResponse.json({ error: "Rencontre introuvable" }, { status: 404 });
      }

      await db
        .update(championshipMatches)
        .set({
          scoreA: scoreA !== undefined && scoreA !== "" && scoreA !== null ? Number(scoreA) : null,
          scoreB: scoreB !== undefined && scoreB !== "" && scoreB !== null ? Number(scoreB) : null,
          forfeitA: Boolean(forfeitA),
          forfeitB: Boolean(forfeitB),
          partiesWonA: partiesWonA !== undefined && partiesWonA !== "" ? Number(partiesWonA) : null,
          partiesWonB: partiesWonB !== undefined && partiesWonB !== "" ? Number(partiesWonB) : null,
          isSaved: true,
        })
        .where(eq(championshipMatches.id, Number(matchId)));

      // Directly recalculate whole standings table for this competition
      await recalculateCompetitionStandings(match.competitionId);

      return NextResponse.json({ success: true, message: "Score enregistré et classement mis à jour en direct !" });
    }

    // Action: clear match score
    if (action === "clear_round_match") {
      const { matchId } = body;
      const [match] = await db
        .select()
        .from(championshipMatches)
        .where(eq(championshipMatches.id, Number(matchId)));

      if (match) {
        await db
          .update(championshipMatches)
          .set({
            scoreA: null,
            scoreB: null,
            forfeitA: false,
            forfeitB: false,
            partiesWonA: null,
            partiesWonB: null,
          })
          .where(eq(championshipMatches.id, Number(matchId)));

        await recalculateCompetitionStandings(match.competitionId);
      }

      return NextResponse.json({ success: true });
    }

    // Action: validate round
    if (action === "toggle_round_validation") {
      const { roundId, isValidated } = body;
      await db
        .update(championshipRounds)
        .set({ isValidated: Boolean(isValidated) })
        .where(eq(championshipRounds.id, Number(roundId)));

      return NextResponse.json({ success: true });
    }

    // Action: update manual rank in standings table
    if (action === "update_manual_rank") {
      const { standingId, manualRank } = body;
      await db
        .update(standings)
        .set({ manualRank: manualRank || "—" })
        .where(eq(standings.id, Number(standingId)));

      return NextResponse.json({ success: true });
    }

    // Action: update rules
    if (action === "update_rules") {
      const { pointsVictory, pointsDraw, pointsDefeat, pointsForfeit, competitionId } = body;

      const club = await db.select().from(clubInfo).limit(1);
      if (club.length > 0) {
        await db
          .update(clubInfo)
          .set({
            pointsVictory: Number(pointsVictory),
            pointsDraw: Number(pointsDraw),
            pointsDefeat: Number(pointsDefeat),
            pointsForfeit: Number(pointsForfeit),
          })
          .where(eq(clubInfo.id, club[0].id));
      }

      if (competitionId) {
        await recalculateCompetitionStandings(Number(competitionId));
      }

      return NextResponse.json({ success: true, message: "Barème mis à jour" });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("Scores PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const standingId = searchParams.get("standingId");
    const competitionId = searchParams.get("competitionId");
    const matchId = searchParams.get("matchId");
    const roundId = searchParams.get("roundId");

    if (matchId) {
      const [m] = await db.select().from(championshipMatches).where(eq(championshipMatches.id, Number(matchId)));
      await db.delete(championshipMatches).where(eq(championshipMatches.id, Number(matchId)));
      if (m) await recalculateCompetitionStandings(m.competitionId);
      return NextResponse.json({ success: true });
    }

    if (roundId) {
      await db.delete(championshipMatches).where(eq(championshipMatches.roundId, Number(roundId)));
      await db.delete(championshipRounds).where(eq(championshipRounds.id, Number(roundId)));
      return NextResponse.json({ success: true });
    }

    if (standingId) {
      await db.delete(standings).where(eq(standings.id, Number(standingId)));
      return NextResponse.json({ success: true });
    }

    if (competitionId) {
      await db.delete(championshipMatches).where(eq(championshipMatches.competitionId, Number(competitionId)));
      await db.delete(championshipRounds).where(eq(championshipRounds.competitionId, Number(competitionId)));
      await db.delete(standings).where(eq(standings.competitionId, Number(competitionId)));
      await db.delete(competitions).where(eq(competitions.id, Number(competitionId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
  } catch (error) {
    console.error("Scores DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
