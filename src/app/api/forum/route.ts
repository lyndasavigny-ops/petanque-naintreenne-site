import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumTopics, forumMessages } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    if (topicId) {
      const messages = await db
        .select()
        .from(forumMessages)
        .where(eq(forumMessages.topicId, Number(topicId)))
        .orderBy(asc(forumMessages.createdAt));
      return NextResponse.json({ success: true, messages });
    }

    const topics = await db.select().from(forumTopics).orderBy(desc(forumTopics.isPinned), desc(forumTopics.createdAt));
    const allMessages = await db.select().from(forumMessages);

    // Compute message counts per topic
    const counts: Record<number, number> = {};
    for (const msg of allMessages) {
      counts[msg.topicId] = (counts[msg.topicId] || 0) + 1;
    }

    const enrichedTopics = topics.map((t) => ({
      ...t,
      messageCount: counts[t.id] || 0,
    }));

    return NextResponse.json({ success: true, topics: enrichedTopics });
  } catch (error) {
    console.error("Forum GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action: reply to a topic
    if (action === "reply" || body.topicId) {
      const { topicId, authorName, content } = body;
      if (!topicId || !content) {
        return NextResponse.json({ error: "Message vide ou sujet introuvable" }, { status: 400 });
      }

      const [msg] = await db
        .insert(forumMessages)
        .values({
          topicId: Number(topicId),
          authorName: (authorName || "Supporter").trim(),
          content: content.trim(),
        })
        .returning();

      return NextResponse.json({ success: true, message: msg });
    }

    // Action: create new topic
    const { title, authorName, category, initialMessage, isPinned } = body;
    if (!title || !initialMessage) {
      return NextResponse.json({ error: "Titre du sujet et message initial requis" }, { status: 400 });
    }

    const [topic] = await db
      .insert(forumTopics)
      .values({
        title: title.trim(),
        authorName: (authorName || "Membre du Club").trim(),
        category: category || "Général",
        isPinned: Boolean(isPinned),
      })
      .returning();

    await db.insert(forumMessages).values({
      topicId: topic.id,
      authorName: (authorName || "Membre du Club").trim(),
      content: initialMessage.trim(),
    });

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error("Forum POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");
    const messageId = searchParams.get("messageId");

    if (messageId) {
      await db.delete(forumMessages).where(eq(forumMessages.id, Number(messageId)));
      return NextResponse.json({ success: true });
    }

    if (topicId) {
      await db.delete(forumMessages).where(eq(forumMessages.topicId, Number(topicId)));
      await db.delete(forumTopics).where(eq(forumTopics.id, Number(topicId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  } catch (error) {
    console.error("Forum DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
