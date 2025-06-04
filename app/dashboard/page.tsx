"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect } from 'react';

export default function Page() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.replace('/');
    }
  }, [role, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (role !== 'admin') return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <img src="logoblack.png" alt="logo sixcare" className="mb-8 -mt-10"/>
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/admin"
          className="text-center bg-black text-white font-medium py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Admin Panel
        </Link>
        <Link
          href="/"
          className="text-center bg-black text-white font-medium py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Home Page
        </Link>
      </div>
    </main>
  );
}
