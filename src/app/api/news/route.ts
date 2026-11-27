import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsSlides } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";

export async function GET() {
  try {
    try {
      await ensureDatabaseTables();
    } catch {}
    const list = await db.select().from(newsSlides).orderBy(desc(newsSlides.isUrgent), desc(newsSlides.createdAt));
    return NextResponse.json({ success: true, news: list });
  } catch (error) {
    console.error("News GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, content, imageUrl, badge, isSlide, isUrgent } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu sont requis" }, { status: 400 });
    }

    const [item] = await db
      .insert(newsSlides)
      .values({
        title: title.trim(),
        subtitle: subtitle || "",
        content: content.trim(),
        imageUrl: imageUrl || "/images/banner.jpg",
        badge: badge || "Actualité",
        isSlide: isSlide !== undefined ? Boolean(isSlide) : true,
        isUrgent: Boolean(isUrgent),
      })
      .returning();

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("News POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, subtitle, content, imageUrl, badge, isSlide, isUrgent } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(newsSlides)
      .set({
        title: title ? title.trim() : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        content: content ? content.trim() : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        badge: badge !== undefined ? badge : undefined,
        isSlide: isSlide !== undefined ? Boolean(isSlide) : undefined,
        isUrgent: isUrgent !== undefined ? Boolean(isUrgent) : undefined,
      })
      .where(eq(newsSlides.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("News PUT error:", error);
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

    await db.delete(newsSlides).where(eq(newsSlides.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("News DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
