import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, teams, standings, competitions, clubMembers, calendarMatches } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target") || "all";

    if (target === "players") {
      const data = await db.select().from(players);
      return NextResponse.json({ success: true, target, data });
    }

    if (target === "teams") {
      const data = await db.select().from(teams);
      return NextResponse.json({ success: true, target, data });
    }

    if (target === "standings") {
      const comps = await db.select().from(competitions);
      const st = await db.select().from(standings);
      return NextResponse.json({ success: true, target, competitions: comps, standings: st });
    }

    // Export all data
    const allData = {
      exportedAt: new Date().toISOString(),
      club: "Pétanque Naintreénne",
      players: await db.select().from(players),
      teams: await db.select().from(teams),
      competitions: await db.select().from(competitions),
      standings: await db.select().from(standings),
      clubMembers: await db.select().from(clubMembers),
      calendar: await db.select().from(calendarMatches),
    };

    return NextResponse.json({ success: true, data: allData });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Liste d'éléments vide ou invalide" }, { status: 400 });
    }

    let insertedCount = 0;

    if (target === "players") {
      for (const p of items) {
        if (p.firstName && p.lastName) {
          await db.insert(players).values({
            firstName: String(p.firstName).trim(),
            lastName: String(p.lastName).trim(),
            gender: p.gender === "Féminin" ? "Féminin" : "Masculin",
            birthDate: p.birthDate || "",
            category: ["Élite", "Honneur", "Promotion", "Non classé"].includes(p.category)
              ? p.category
              : "Promotion",
            licenseNumber: p.licenseNumber || "",
            photoUrl: p.photoUrl || "",
          });
          insertedCount++;
        }
      }
    } else if (target === "teams") {
      for (const t of items) {
        if (t.name && t.division) {
          await db.insert(teams).values({
            name: String(t.name).trim(),
            division: String(t.division).trim(),
            playerNames: t.playerNames ? String(t.playerNames).trim() : "",
            captainName: t.captainName ? String(t.captainName).trim() : "",
            season: t.season || "2025-2026",
            notes: t.notes || "",
          });
          insertedCount++;
        }
      }
    } else {
      return NextResponse.json({ error: "Cible d'import non reconnue ('players' ou 'teams')" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${insertedCount} élément(s) importé(s) avec succès dans ${target} !`,
      count: insertedCount,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
