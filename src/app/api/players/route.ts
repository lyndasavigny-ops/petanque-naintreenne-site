import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db.select().from(players);

    const conditions = [];
    if (gender && gender !== "all") {
      conditions.push(eq(players.gender, gender));
    }
    if (category && category !== "all") {
      conditions.push(eq(players.category, category));
    }
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(players.firstName, s),
          ilike(players.lastName, s),
          ilike(players.licenseNumber, s)
        )
      );
    }

    const rows = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(players.createdAt))
      : await query.orderBy(desc(players.createdAt));

    return NextResponse.json({ success: true, players: rows });
  } catch (error) {
    console.error("Players GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if bulk import
    if (Array.isArray(body)) {
      const inserted = [];
      for (const item of body) {
        if (item.firstName && item.lastName) {
          const [row] = await db
            .insert(players)
            .values({
              firstName: item.firstName.trim(),
              lastName: item.lastName.trim(),
              gender: item.gender === "Féminin" ? "Féminin" : "Masculin",
              birthDate: item.birthDate || "",
              category: ["Élite", "Honneur", "Promotion", "Non classé"].includes(item.category)
                ? item.category
                : "Promotion",
              photoUrl: item.photoUrl || "",
              licenseNumber: item.licenseNumber || "",
            })
            .returning();
          inserted.push(row);
        }
      }
      return NextResponse.json({ success: true, count: inserted.length, players: inserted });
    }

    const { firstName, lastName, gender, birthDate, category, photoUrl, licenseNumber } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Nom et prénom sont obligatoires" }, { status: 400 });
    }

    const [newPlayer] = await db
      .insert(players)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender === "Féminin" ? "Féminin" : "Masculin",
        birthDate: birthDate || "",
        category: category || "Promotion",
        photoUrl: photoUrl || "",
        licenseNumber: licenseNumber || "",
      })
      .returning();

    return NextResponse.json({ success: true, player: newPlayer });
  } catch (error) {
    console.error("Players POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, firstName, lastName, gender, birthDate, category, photoUrl, licenseNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant joueur manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(players)
      .set({
        firstName: firstName ? firstName.trim() : undefined,
        lastName: lastName ? lastName.trim() : undefined,
        gender: gender ? (gender === "Féminin" ? "Féminin" : "Masculin") : undefined,
        birthDate: birthDate !== undefined ? birthDate : undefined,
        category: category || undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined,
      })
      .where(eq(players.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, player: updated });
  } catch (error) {
    console.error("Players PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant joueur manquant" }, { status: 400 });
    }

    await db.delete(players).where(eq(players.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Players DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
