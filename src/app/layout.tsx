import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const title = Fraunces({ variable: "--font-title", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Postulia — Tes candidatures, rédigées avec l'IA",
  description:
    "Postulia rédige un CV et une lettre de motivation adaptés à chaque offre, et t'aide à suivre toutes tes candidatures au même endroit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${body.variable} ${title.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
