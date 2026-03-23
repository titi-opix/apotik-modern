import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apotik Modern",
  description: "Sistem Manajemen Apotik Terintegrasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
