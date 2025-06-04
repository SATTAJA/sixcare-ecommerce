'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import SideBar from "@/components/SideBar";
import HeaderAdmin from "@/components/HeaderAdmin";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.replace("/"); // Redirect ke homepage kalau bukan admin
    }
  }, [role, loading, router]);

  if (loading || role !== "admin") return null; // Bisa tambahkan loading spinner di sini

  return (
    <main className="flex">
      <div className="hidden md:block">
        <SideBar />
      </div>
      <section className="flex-1 flex flex-col min-h-screen top sticky">
        <div className="sm:flex md:hidden">
        <HeaderAdmin />
        </div>
        <section className="flex-1 md:ml-[260px] p-6">{children}</section>
      </section>
    </main>
  );
}
