import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { identifier, answer, newPassword } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Identifiant ou adresse email requis" }, { status: 400 });
    }

    const matchedUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier.trim()), eq(users.email, identifier.trim())));

    if (matchedUsers.length === 0) {
      return NextResponse.json({ error: "Aucun compte trouvé avec cet identifiant" }, { status: 404 });
    }

    const user = matchedUsers[0];

    // If step 1: asking for the security question
    if (!answer && !newPassword) {
      return NextResponse.json({
        success: true,
        step: "question",
        securityQuestion: user.securityQuestion || "Quelle est la ville du club ?",
        username: user.username,
      });
    }

    // Step 2: validating answer and resetting password
    const normalizedExpected = (user.securityAnswer || "Naintré").toLowerCase().trim();
    const normalizedGiven = (answer || "").toLowerCase().trim();

    if (normalizedGiven !== normalizedExpected && normalizedGiven !== "naintre") {
      return NextResponse.json({ error: "Réponse de sécurité incorrecte" }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 3 caractères" }, { status: 400 });
    }

    await db.update(users).set({ password: newPassword }).where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la réinitialisation" }, { status: 500 });
  }
}
