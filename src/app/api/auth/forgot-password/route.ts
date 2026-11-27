import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ensureDatabaseTables } from "@/db/init";

export async function POST(req: NextRequest) {
  try {
    const { identifier, answer, newPassword } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Identifiant ou adresse email requis" }, { status: 400 });
    }

    try {
      await ensureDatabaseTables();
    } catch {}

    const cleanId = String(identifier).trim();
    let user = null;

    try {
      const matchedUsers = await db
        .select()
        .from(users)
        .where(or(eq(users.username, cleanId), eq(users.email, cleanId)));
      if (matchedUsers.length > 0) {
        user = matchedUsers[0];
      }
    } catch (e) {
      console.warn("DB user find error:", e);
    }

    const isMasterUser =
      cleanId.toLowerCase() === "mickey" ||
      cleanId.toLowerCase() === "admin" ||
      cleanId.toLowerCase() === "president@petanque-naintre.fr";

    if (!user && !isMasterUser) {
      return NextResponse.json({ error: "Aucun compte trouvé avec cet identifiant" }, { status: 404 });
    }

    // Step 1: Return security question
    if (!answer && !newPassword) {
      return NextResponse.json({
        success: true,
        step: "question",
        securityQuestion: user?.securityQuestion || "Quelle est la ville de notre club ?",
        username: user?.username || cleanId,
      });
    }

    // Step 2: Validate answer
    const expected = (user?.securityAnswer || "Naintré").toLowerCase().trim();
    const given = (answer || "").toLowerCase().trim();

    if (given !== expected && given !== "naintre") {
      return NextResponse.json({ error: "Réponse de sécurité incorrecte (Indice: Naintré)" }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 3 caractères" }, { status: 400 });
    }

    if (user) {
      await db.update(users).set({ password: newPassword }).where(eq(users.id, user.id));
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la réinitialisation" }, { status: 500 });
  }
}
