import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarMatches } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(calendarMatches).orderBy(asc(calendarMatches.matchDate));
    return NextResponse.json({ success: true, matches: list });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionName, matchDate, matchTime, opponent, location, address, scorePn, scoreOpponent, status } = body;

    if (!competitionName || !matchDate || !opponent) {
      return NextResponse.json({ error: "Compétition, date et adversaire sont requis" }, { status: 400 });
    }

    const [item] = await db
      .insert(calendarMatches)
      .values({
        competitionName: competitionName.trim(),
        matchDate: matchDate.trim(),
        matchTime: matchTime || "14:30",
        opponent: opponent.trim(),
        location: location || "Domicile (Naintré)",
        address: address || "",
        scorePn: scorePn !== undefined && scorePn !== "" ? Number(scorePn) : null,
        scoreOpponent: scoreOpponent !== undefined && scoreOpponent !== "" ? Number(scoreOpponent) : null,
        status: status || "À venir",
      })
      .returning();

    return NextResponse.json({ success: true, match: item });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, competitionName, matchDate, matchTime, opponent, location, address, scorePn, scoreOpponent, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant match manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(calendarMatches)
      .set({
        competitionName: competitionName ? competitionName.trim() : undefined,
        matchDate: matchDate ? matchDate.trim() : undefined,
        matchTime: matchTime !== undefined ? matchTime : undefined,
        opponent: opponent ? opponent.trim() : undefined,
        location: location !== undefined ? location : undefined,
        address: address !== undefined ? address : undefined,
        scorePn: scorePn !== undefined && scorePn !== "" ? Number(scorePn) : null,
        scoreOpponent: scoreOpponent !== undefined && scoreOpponent !== "" ? Number(scoreOpponent) : null,
        status: status !== undefined ? status : undefined,
      })
      .where(eq(calendarMatches.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error("Calendar PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant match manquant" }, { status: 400 });
    }

    await db.delete(calendarMatches).where(eq(calendarMatches.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
