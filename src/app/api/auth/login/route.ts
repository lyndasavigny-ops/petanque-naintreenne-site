import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Identifiant et mot de passe requis" }, { status: 400 });
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    // 1. Try to ensure database tables and seed if database is connected
    try {
      await ensureDatabaseTables();
    } catch (e) {
      console.warn("DB ensureTables warning:", e);
    }

    // 2. Try looking up in database
    try {
      const matchedUsers = await db
        .select()
        .from(users)
        .where(or(eq(users.username, cleanUser), eq(users.email, cleanUser)));

      if (matchedUsers.length > 0) {
        const user = matchedUsers[0];
        if (user.password === cleanPass) {
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              email: user.email,
              role: user.role,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB user query error, trying master fallback:", dbErr);
    }

    // 3. Fallback master credentials for Mickey & admin (guarantees you NEVER get locked out on Vercel)
    const lowerUser = cleanUser.toLowerCase();
    if (
      (lowerUser === "mickey" && cleanPass === "admin") ||
      (lowerUser === "admin" && cleanPass === "admin") ||
      (lowerUser === "president@petanque-naintre.fr" && cleanPass === "admin")
    ) {
      const fallbackUser = {
        id: 1,
        username: lowerUser === "admin" ? "admin" : "Mickey",
        displayName: lowerUser === "admin" ? "Administrateur PN" : "Mickey (Président)",
        email: lowerUser === "admin" ? "admin@petanque-naintre.fr" : "president@petanque-naintre.fr",
        role: "admin",
      };
      return NextResponse.json({ success: true, user: fallbackUser });
    }

    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
