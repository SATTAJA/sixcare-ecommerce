'use client'; // Menandakan bahwa komponen ini dijalankan di sisi klien (client-side)

import {
  LayoutDashboard,
  LogOut,
  PackageOpen,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
} from 'lucide-react'; // Import ikon dari lucide-react
import Link from 'next/link'; // Untuk navigasi internal di Next.js
import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Hook untuk mengambil path URL dan routing
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Supabase client untuk logout

const SideBar = () => {
  const pathname = usePathname(); // Mengambil path saat ini untuk menandai menu aktif
  const router = useRouter(); // Untuk redirect setelah logout
  const supabase = createClientComponentClient(); // Inisialisasi Supabase client

  // Daftar menu navigasi sidebar
  const menuList = [
    { name: 'Products', link: '/admin', icon: <ShoppingCart size={20} /> },
    { name: 'Orders', link: '/admin/orders', icon: <PackageOpen size={20} /> },
    { name: 'Admins', link: '/admin/admins', icon: <ShieldCheck size={20} /> },
  ];

  // Fungsi logout Supabase
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Proses logout Supabase
    router.push('/sign-in'); // Redirect ke halaman login
  };

  return (
    <section className="fixed top-0 left-0 h-screen w-[260px] bg-white flex flex-col rounded-r-xl items-center text-md text-black shadow-lg shadow-gray-400 z-50">
      {/* Logo di bagian atas sidebar */}
      <div className="flex items-center justify-center">
        <img className="h-25 py-5 mt-5" src="/logoblack.png" alt="Logo" />
      </div>

      {/* Daftar menu navigasi */}
      <ul className="flex-1 flex h-full overflow-y-auto flex-col mt-15 font-semibold gap-5">
        {menuList.map((item) => {
          const isActive = pathname === item.link; // Cek apakah menu sedang aktif (berada di halaman tersebut)
          return (
            <Link key={item.name} href={item.link}>
              <div
                className={`flex items-center gap-3 px-10 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-pink-400 text-white shadow' // Gaya untuk menu aktif
                    : 'hover:bg-neutral-300 hover:text-black' // Gaya saat hover
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </ul>

        <div>
          <Link href={'/'}>
          <button className='bg-black px-5 py-2 text-white rounded-xl mb-8 hover:bg-gray-800 hover:cursor-pointer'>HomePage</button>
          </Link>
        </div>
      {/* Tombol logout */}
      <div className="flex justify-center w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mb-4 justify-center text-red-600 rounded-xl px-3 py-2 hover:bg-neutral-300 transition-all duration-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </section>
  );
};

export default SideBar;
