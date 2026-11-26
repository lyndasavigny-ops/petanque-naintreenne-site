import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pétanque Naintreénne • Site Officiel du Club (Vienne 86)",
  description:
    "Site officiel de la Pétanque Naintreénne (Vienne - 86). Suivez les championnats CDC en direct, résultats, classements, effectifs des licenciés et vie du club.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
