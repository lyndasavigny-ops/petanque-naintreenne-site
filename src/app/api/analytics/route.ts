import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visitLogs } from "@/db/schema";
import { gte, sql } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";

export async function POST(req: NextRequest) {
  try {
    try {
      await ensureDatabaseTables();
    } catch {}

    const body = await req.json().catch(() => ({}));
    const page = body.page || "/";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "local";
    const ipHash = ip.split(",")[0].trim();

    await db.insert(visitLogs).values({
      page,
      ipHash,
      userAgent: userAgent.slice(0, 255),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total visits
    const [totalRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitLogs);

    // Today visits
    const [todayRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitLogs)
      .where(gte(visitLogs.createdAt, startOfToday));

    // Month visits
    const [monthRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitLogs)
      .where(gte(visitLogs.createdAt, startOfMonth));

    // Year visits
    const [yearRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitLogs)
      .where(gte(visitLogs.createdAt, startOfYear));

    // Daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyRows = await db
      .select({
        dateStr: sql<string>`to_char(${visitLogs.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(gte(visitLogs.createdAt, thirtyDaysAgo))
      .groupBy(sql`to_char(${visitLogs.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${visitLogs.createdAt}, 'YYYY-MM-DD')`);

    // Monthly stats for the current year
    const monthlyRows = await db
      .select({
        monthStr: sql<string>`to_char(${visitLogs.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(gte(visitLogs.createdAt, startOfYear))
      .groupBy(sql`to_char(${visitLogs.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${visitLogs.createdAt}, 'YYYY-MM')`);

    // Ensure all 30 days are filled in chart series
    const chartDaily: Array<{ date: string; label: string; count: number }> = [];
    const dailyMap = new Map(dailyRows.map((r) => [r.dateStr, r.count]));

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const shortLabel = `${dd}/${mm}`;
      chartDaily.push({
        date: key,
        label: shortLabel,
        count: dailyMap.get(key) || 0,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        today: todayRes?.count ?? 0,
        thisMonth: monthRes?.count ?? 0,
        thisYear: yearRes?.count ?? 0,
        total: totalRes?.count ?? 0,
      },
      chartDaily,
      chartMonthly: monthlyRows,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
