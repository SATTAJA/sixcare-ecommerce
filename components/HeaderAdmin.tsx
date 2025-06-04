"use client";

// Import ikon dari Lucide React
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const HeaderAdmin = () => {
  // State untuk menyimpan status menu (apakah sedang terbuka atau tidak)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ref digunakan untuk mendeteksi klik di luar menu (untuk menutup popup)
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Router dari Next.js untuk navigasi manual
  const router = useRouter();

  // Supabase client untuk autentikasi
  const supabase = createClientComponentClient();

  // Fungsi untuk toggle menu dropdown (buka/tutup)
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Fungsi untuk logout user dari Supabase dan redirect ke halaman sign-in
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Logout dari Supabase
    router.push("/sign-in"); // Redirect ke halaman login
  };

  // Hook untuk menutup menu dropdown jika klik dilakukan di luar elemen popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false); // Tutup menu jika klik dilakukan di luar elemen popup dan tombol
      }
    };

    // Tambahkan event listener jika menu terbuka
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Bersihkan event listener saat komponen dibongkar atau menu ditutup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative">
      {/* Header utama */}
      <header className="border-b border-gray-300 px-4 py-4 flex items-center justify-between md:justify-start md:gap-5">
        {/* Tombol menu hanya tampil di layar kecil (mobile) */}
        <div className="md:hidden">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="hover:cursor-pointer hover:bg-gray-200 rounded-full p-2"
          >
            <Menu />
          </button>
        </div>

        {/* Judul halaman dashboard */}
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
      </header>

      {/* Menu navigasi dropdown (popup) saat tombol menu ditekan) */}
      {isMenuOpen && (
        <div
          ref={popupRef}
          className="absolute top-20 left-4 z-50 bg-white rounded-xl max-w-sm shadow-lg p-6 md:hidden"
        >
          {/* Navigasi admin versi mobile */}
          <nav className="flex flex-col gap-y-2 text-left">
            {/* Link ke dashboard */}
            {/* Link ke produk */}
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="text-base hover:underline flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Products
            </Link>

            {/* Link ke pesanan */}
            <Link
              href="/admin/orders"
              onClick={() => setIsMenuOpen(false)}
              className="text-base hover:underline flex items-center gap-2"
            >
              <PackageOpen size={20} />
              Orders
            </Link>


            {/* Link ke halaman admin */}
            <Link
              href="/admin/admins"
              onClick={() => setIsMenuOpen(false)}
              className="text-base hover:underline flex items-center gap-2"
            >
              <ShieldCheck size={20} />
              Admins
            </Link>

            {/* Tombol logout */}
            <button
              onClick={handleLogout}
              className="flex gap-2 items-center text-red-500 mt-2 hover:underline"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default HeaderAdmin;
