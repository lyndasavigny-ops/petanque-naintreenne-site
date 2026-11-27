import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";

export async function GET() {
  try {
    try {
      await ensureDatabaseTables();
    } catch {}
    const list = await db.select().from(teams).orderBy(desc(teams.createdAt));
    return NextResponse.json({ success: true, teams: list });
  } catch (error) {
    console.error("Teams GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, division, playerNames, captainName, season, notes, photoUrl } = body;

    if (!name || !division) {
      return NextResponse.json({ error: "Nom de l'équipe et division/coupe requis" }, { status: 400 });
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        name: name.trim(),
        division: division.trim(),
        playerNames: playerNames ? playerNames.trim() : "",
        captainName: captainName ? captainName.trim() : "",
        season: season || "2025-2026",
        notes: notes || "",
        photoUrl: photoUrl || "",
      })
      .returning();

    return NextResponse.json({ success: true, team: newTeam });
  } catch (error) {
    console.error("Teams POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, division, playerNames, captainName, season, notes, photoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant équipe manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(teams)
      .set({
        name: name ? name.trim() : undefined,
        division: division ? division.trim() : undefined,
        playerNames: playerNames !== undefined ? playerNames.trim() : undefined,
        captainName: captainName !== undefined ? captainName.trim() : undefined,
        season: season !== undefined ? season : undefined,
        notes: notes !== undefined ? notes : undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
      })
      .where(eq(teams.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, team: updated });
  } catch (error) {
    console.error("Teams PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant équipe manquant" }, { status: 400 });
    }

    await db.delete(teams).where(eq(teams.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Teams DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
