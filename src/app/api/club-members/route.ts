import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clubMembers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // "bureau" | "arbitre"

    let query = db.select().from(clubMembers);
    const rows = category
      ? await query.where(eq(clubMembers.category, category)).orderBy(asc(clubMembers.orderNum), asc(clubMembers.id))
      : await query.orderBy(asc(clubMembers.orderNum), asc(clubMembers.id));

    return NextResponse.json({ success: true, members: rows });
  } catch (error) {
    console.error("Club members GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, role, category, photoUrl, phone, email, orderNum } = body;

    if (!fullName || !role) {
      return NextResponse.json({ error: "Nom complet et fonction / rôle sont requis" }, { status: 400 });
    }

    const [newMember] = await db
      .insert(clubMembers)
      .values({
        fullName: fullName.trim(),
        role: role.trim(),
        category: category === "arbitre" ? "arbitre" : "bureau",
        photoUrl: photoUrl || "",
        phone: phone || "",
        email: email || "",
        orderNum: Number(orderNum) || 10,
      })
      .returning();

    return NextResponse.json({ success: true, member: newMember });
  } catch (error) {
    console.error("Club members POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, fullName, role, category, photoUrl, phone, email, orderNum } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(clubMembers)
      .set({
        fullName: fullName ? fullName.trim() : undefined,
        role: role ? role.trim() : undefined,
        category: category ? (category === "arbitre" ? "arbitre" : "bureau") : undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        orderNum: orderNum !== undefined ? Number(orderNum) : undefined,
      })
      .where(eq(clubMembers.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error("Club members PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    await db.delete(clubMembers).where(eq(clubMembers.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Club members DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
