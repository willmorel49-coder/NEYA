import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEYA",
  description: "Reconnaître, nommer, réguler — un geste à la fois.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
