import type { Metadata } from "next";
import "./globals.css";
import { DashboardLayout } from "@/components/DashboardLayout";

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
      <body className="antialiased font-sans flex min-h-screen bg-slate-50">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
