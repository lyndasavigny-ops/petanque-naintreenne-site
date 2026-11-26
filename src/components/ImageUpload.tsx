"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "banner";
}

export default function ImageUpload({
  value,
  onChange,
  label = "Photo / Image",
  helperText = "Téléchargez une image depuis votre ordinateur ou téléphone (PNG, JPG, WebP)",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";
    setError(null);

    // Read local file as Data URL immediately for instant feedback
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // Also send to server upload endpoint
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Keep the local dataUrl since the user already sees their photo
        console.warn("Upload fallback to dataUrl:", data.error);
      } else {
        onChange(data.url);
      }
    } catch (err) {
      console.warn("Upload network error, using local dataUrl:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
          <div
            className={`relative w-full ${
              aspectRatio === "banner" ? "h-36 sm:h-44" : "h-32 sm:h-36"
            }`}
          >
            {/* Using native img to reliably support data URLs, blob URLs, and server URLs */}
            <img
              src={value}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow hover:bg-slate-50 transition"
            >
              Changer la photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition"
              title="Supprimer la photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50/80 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
              <span className="text-xs font-semibold text-sky-700">
                Téléchargement de la photo en cours...
              </span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-900">
                  Cliquez ici pour sélectionner une photo sur votre appareil
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
