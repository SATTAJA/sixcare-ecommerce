'use client'; // Menandakan bahwa komponen ini dijalankan di sisi klien

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import client Supabase
import { useRouter } from 'next/navigation'; // Untuk navigasi ke halaman lain
import { Eye, EyeOff } from 'lucide-react'; // Ikon untuk toggle password visibility
import Link from 'next/link'; // Navigasi antar halaman

export default function SignInForm() {
  // State untuk menampilkan atau menyembunyikan password
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter(); // Inisialisasi router untuk redirect
  const [email, setEmail] = useState(''); // State input email
  const [password, setPassword] = useState(''); // State input password
  const [error, setError] = useState<string | null>(null); // State untuk pesan error

  // Fungsi yang dijalankan saat form dikirim
  const handleSignInForm = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman default saat submit

    // Melakukan autentikasi menggunakan Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Jika gagal, tampilkan pesan error
    if (error) setError(error.message);
    // Jika berhasil, arahkan ke dashboard
    else router.push('/dashboard');
  };

  return (
    <main>
      {/* Form login utama */}
      <form
        onSubmit={handleSignInForm}
        className="flex items-center justify-center min-h-screen bg-gray-100"
      >
        {/* Container utama */}
        <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-4xl md:flex-row md:space-y-0">
          {/* Gambar samping kiri (hanya ditampilkan di layar besar) */}
          <div className="bg-neutral-300 rounded-l-4xl hidden lg:block">
            <img src="/auth.png" alt="Auth Illustration" />
          </div>

          {/* Form sisi kanan */}
          <div className="flex flex-col justify-center px-8">
            {/* Logo aplikasi */}
            <div className="mb-3 pb-10 mx-auto w-62">
              <img src="/logoblack.png" alt="Logo" />
            </div>

            {/* Judul & subjudul */}
            <h1 className="mx-auto font-bold text-3xl font-serif">Welcome Back!</h1>
            <p className="mx-auto">Please sign-in to your account</p>

            {/* Input Email */}
            <div className="py-4">
              <p className="mb-2 text-md">Email</p>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              />
            </div>

            {/* Input Password dengan toggle visibility */}
            <div className="py-4 -mt-5">
              <p className="mb-2 text-md">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500 pr-10"
                />
                {/* Tombol toggle tampil/sembunyi password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Opsi 'Remember me' dan 'Forgot password' */}
            <div className="flex justify-between w-full py-4 -mt-5">
              <div className="mr-24">
                <input type="checkbox" id="ch" name="ch" className="mr-2" />
                <span className="text-md">Remember for 30 days</span>
              </div>
              <Link href="/forgot-password" className="font-bold text-md">
                Forgot password
              </Link>
            </div>

            {/* Tombol submit */}
            <button
              type="submit"
              className="mt-5 w-full bg-black text-white p-2 rounded-xl mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 duration-200 font-bold shadow-md"
            >
              Sign in
            </button>

            {/* Link ke halaman register */}
            <div className="text-center text-gray-400 flex gap-2 mx-auto">
              Don't have an account?
              <Link href="/sign-up" className="font-bold text-black">
                Sign Up for free
              </Link>
            </div>
          </div>
        </div>

        {/* Tampilkan pesan error jika ada */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}
