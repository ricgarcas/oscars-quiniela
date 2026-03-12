import type { Metadata } from "next";
import "./globals.css";
import ConvexProvider from "@/components/ConvexProvider";

export const metadata: Metadata = {
  title: "Quiniela de los Oscars 2026",
  description: "23 categorías. 1 punto cada una. ¿Quién sabe más de cine?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ConvexProvider>{children}</ConvexProvider>
      </body>
    </html>
  );
}
