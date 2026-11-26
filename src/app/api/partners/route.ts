import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(partners).orderBy(asc(partners.orderNum), asc(partners.id));
    return NextResponse.json({ success: true, partners: list });
  } catch (error) {
    console.error("Partners GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, logoUrl, websiteUrl, description, orderNum } = body;

    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Nom et Logo URL sont requis" }, { status: 400 });
    }

    const [item] = await db
      .insert(partners)
      .values({
        name: name.trim(),
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl || "",
        description: description || "",
        orderNum: Number(orderNum) || 10,
      })
      .returning();

    return NextResponse.json({ success: true, partner: item });
  } catch (error) {
    console.error("Partners POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, logoUrl, websiteUrl, description, orderNum } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const [updated] = await db
      .update(partners)
      .set({
        name: name ? name.trim() : undefined,
        logoUrl: logoUrl ? logoUrl.trim() : undefined,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
        description: description !== undefined ? description : undefined,
        orderNum: orderNum !== undefined ? Number(orderNum) : undefined,
      })
      .where(eq(partners.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, partner: updated });
  } catch (error) {
    console.error("Partners PUT error:", error);
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

    await db.delete(partners).where(eq(partners.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Partners DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
