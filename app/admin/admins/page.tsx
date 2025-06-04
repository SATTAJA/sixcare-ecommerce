import React from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
import { CircleMinus, CirclePlus } from 'lucide-react';

// Inisialisasi Supabase Client di server-side menggunakan ANON key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page() {
  try {
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('role', 'admin');

    if (error) throw error;

    return (
      <main className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">List of Admin</h1>
          <div className="flex gap-3">
            <Link href="/admin/admins/add">
              <button className="bg-pink-400 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-pink-500">
                <CirclePlus /> Add Admin
              </button>
            </Link>
            <Link href="/admin/admins/revoke">
              <button className="bg-[#313131] text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-black">
                <CircleMinus /> Revoke Admin
              </button>
            </Link>
          </div>
        </div>

        {admins && admins.length > 0 ? (
          <ul className="list-disc ml-6 space-y-2">
            {admins.map((user) => (
              <li key={user.id}>
                <span className="font-semibold">{user.display_name}</span> — {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No admin found.</p>
        )}
      </main>
    );
  } catch (err: any) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error fetching admins: {err.message}</p>
      </div>
    );
  }
}
