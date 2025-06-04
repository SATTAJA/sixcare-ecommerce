'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RoleManagerForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateRole = async (newRole: 'admin' | 'user') => {
    setLoading(true);
    setMessage('');

    // Cari user berdasarkan email
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      setMessage('User not found.');
      setLoading(false);
      return;
    }

    // Update role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (updateError) {
      setMessage(`Failed to update role to ${newRole}.`);
    } else {
      setMessage(`User role updated to '${newRole}' successfully.`);
    }

    setLoading(false);
  };

  const handleMakeAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole('admin');
  };

  const handleMakeUser = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole('user');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage User Role</h2>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <div className="flex gap-4">
          <button
            onClick={handleMakeAdmin}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Make Admin
          </button>
          <button
            onClick={handleMakeUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Make User
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
