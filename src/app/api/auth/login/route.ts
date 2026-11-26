import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Identifiant et mot de passe requis" }, { status: 400 });
    }

    const matchedUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username.trim()), eq(users.email, username.trim())));

    if (matchedUsers.length === 0) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
    }

    const user = matchedUsers[0];
    if (user.password !== password) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
    }

    // Success response with user profile
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
