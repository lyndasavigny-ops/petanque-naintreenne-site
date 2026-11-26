import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mediaItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt));
    return NextResponse.json({ success: true, media: list });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, url, description, category } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Titre et URL sont requis" }, { status: 400 });
    }

    const [item] = await db
      .insert(mediaItems)
      .values({
        title: title.trim(),
        type: type === "video" ? "video" : "photo",
        url: url.trim(),
        description: description || "",
        category: category || "Club",
      })
      .returning();

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, type, url, description, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(mediaItems)
      .set({
        title: title ? title.trim() : undefined,
        type: type ? (type === "video" ? "video" : "photo") : undefined,
        url: url ? url.trim() : undefined,
        description: description !== undefined ? description : undefined,
        category: category !== undefined ? category : undefined,
      })
      .where(eq(mediaItems.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Media PUT error:", error);
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

    await db.delete(mediaItems).where(eq(mediaItems.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
