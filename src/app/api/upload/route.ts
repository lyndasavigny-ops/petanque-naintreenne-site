import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // Validate mime type (allow images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Seuls les fichiers images sont autorisés (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "L'image ne doit pas dépasser 10 Mo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean file extension & generate unique name
    const ext = path.extname(file.name) || ".jpg";
    const cleanExt = ext.toLowerCase().replace(/[^.a-z0-9]/g, "");
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${cleanExt}`;
    const filePath = path.join(uploadsDir, safeName);

    await fs.writeFile(filePath, buffer);

    // Also support base64 fallback for small images (< 1MB) or direct route URL
    const publicUrl = `/api/uploads/${safeName}`;

    // If small image (< 800KB), generate data URL as an alternate immediately usable format
    let dataUrl: string | undefined = undefined;
    if (file.size < 800 * 1024) {
      const mime = file.type || "image/jpeg";
      dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: dataUrl || publicUrl,
      publicUrl,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur lors du téléchargement de l'image" }, { status: 500 });
  }
}
