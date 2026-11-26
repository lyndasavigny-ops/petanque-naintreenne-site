import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers, urgentAnnouncements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const activeAnnouncements = await db
      .select()
      .from(urgentAnnouncements)
      .where(eq(urgentAnnouncements.isActive, true))
      .orderBy(desc(urgentAnnouncements.createdAt));

    const allAnnouncements = await db
      .select()
      .from(urgentAnnouncements)
      .orderBy(desc(urgentAnnouncements.createdAt));

    const subs = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));

    return NextResponse.json({
      success: true,
      active: activeAnnouncements,
      all: allAnnouncements,
      subscribers: subs,
    });
  } catch (error) {
    console.error("Urgent GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Add new email subscriber
    if (action === "subscribe" || body.email) {
      const { email, name } = body;
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
      }

      const existing = await db.select().from(subscribers).where(eq(subscribers.email, email.trim().toLowerCase()));
      if (existing.length > 0) {
        return NextResponse.json({ message: "Cette adresse email est déjà inscrite aux alertes !" });
      }

      const [sub] = await db
        .insert(subscribers)
        .values({
          email: email.trim().toLowerCase(),
          name: name ? name.trim() : "Licencié / Supporter",
        })
        .returning();

      return NextResponse.json({ success: true, subscriber: sub, message: "Inscription aux alertes urgentes réussie !" });
    }

    // Action 2: Publish urgent announcement and broadcast to email subscribers
    if (action === "broadcast") {
      const { title, message } = body;
      if (!title || !message) {
        return NextResponse.json({ error: "Titre et message d'alerte urgents requis" }, { status: 400 });
      }

      const allSubs = await db.select().from(subscribers);
      const emailCount = allSubs.length;

      const [alert] = await db
        .insert(urgentAnnouncements)
        .values({
          title: title.trim(),
          message: message.trim(),
          isActive: true,
          sentEmailsCount: emailCount,
        })
        .returning();

      return NextResponse.json({
        success: true,
        alert,
        broadcastSummary: `Alerte publiée en direct sur le site et diffusée par email à ${emailCount} contact(s) du club !`,
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Urgent POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(urgentAnnouncements)
      .set({
        isActive: Boolean(isActive),
      })
      .where(eq(urgentAnnouncements.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, alert: updated });
  } catch (error) {
    console.error("Urgent PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("alertId");
    const subscriberId = searchParams.get("subscriberId");

    if (alertId) {
      await db.delete(urgentAnnouncements).where(eq(urgentAnnouncements.id, Number(alertId)));
      return NextResponse.json({ success: true });
    }

    if (subscriberId) {
      await db.delete(subscribers).where(eq(subscribers.id, Number(subscriberId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
  } catch (error) {
    console.error("Urgent DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
