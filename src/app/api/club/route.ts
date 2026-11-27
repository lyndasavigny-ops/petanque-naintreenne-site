import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clubInfo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    try {
      await ensureDatabaseTables();
    } catch {}
    let list = await db.select().from(clubInfo).limit(1);
    if (list.length === 0) {
      try {
        await seedDatabase();
        list = await db.select().from(clubInfo).limit(1);
      } catch {}
    }
    if (list.length === 0) {
      return NextResponse.json({
        success: true,
        club: {
          clubName: "Pétanque Naintreénne",
          address: "Boulodrome Municipal, Avenue de la Gare, 86530 Naintré",
          email: "petanque.naintreenne86@gmail.com",
          phone: "06 82 14 35 90",
          trainingHours: "Mardi & Jeudi : 14h00 - 19h00 | Vendredi : 18h00 - 22h00 | Concours : Samedi & Dimanche",
          description: "Club dynamique de pétanque à Naintré (86). Convivialité, CDC et passion du sport.",
        },
      });
    }
    return NextResponse.json({ success: true, club: list[0] });
  } catch (error) {
    console.error("Club info GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { clubName, address, email, phone, trainingHours, description } = body;

    const list = await db.select().from(clubInfo).limit(1);
    let updated;

    if (list.length === 0) {
      const [inserted] = await db
        .insert(clubInfo)
        .values({
          clubName: clubName || "Pétanque Naintreénne",
          address: address || "Boulodrome Municipal, 86530 Naintré",
          email: email || "petanque.naintreenne86@gmail.com",
          phone: phone || "06 82 14 35 90",
          trainingHours: trainingHours || "Mardi & Jeudi 14h-19h",
          description: description || "",
        })
        .returning();
      updated = inserted;
    } else {
      const [res] = await db
        .update(clubInfo)
        .set({
          clubName: clubName ?? undefined,
          address: address ?? undefined,
          email: email ?? undefined,
          phone: phone ?? undefined,
          trainingHours: trainingHours ?? undefined,
          description: description ?? undefined,
        })
        .where(eq(clubInfo.id, list[0].id))
        .returning();
      updated = res;
    }

    return NextResponse.json({ success: true, club: updated });
  } catch (error) {
    console.error("Club info PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
