'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [displayname, setDisplayname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignUpForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Sign up user ke Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:3000/sign-in',
        data: {
          display_name: displayname, // dikirim ke trigger melalui metadata
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Tidak perlu insert ke tabel profiles, karena trigger handle_new_user sudah mengurusnya

    router.push('/sign-in')
  }

  return (
    <main>
      <form
        className="flex items-center justify-center min-h-screen bg-gray-100"
        onSubmit={handleSignUpForm}
      >
        <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-4xl md:flex-row md:space-y-0">
          <div className="bg-neutral-300 rounded-l-4xl hidden lg:block">
            <img src="/auth.png" alt="Auth Image" />
          </div>

          <div className="flex flex-col justify-center px-20">
            <div className="mb-3 pb-10 mx-auto w-62">
              <img src="/logoblack.png" alt="Logo" />
            </div>

            <h1 className="items-center mx-auto font-bold text-3xl font-serif">
              Welcome!
            </h1>
            <p className="mx-auto">Please sign-up or create new account</p>

            <div className="pt-4">
              <p className="mb-2 text-md">Display Name</p>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                placeholder="Create your Display Name"
                value={displayname}
                onChange={(e) => setDisplayname(e.target.value)}
              />
            </div>

            <div className="py-4 -mt-4">
              <p className="mb-2 text-md">Email</p>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="py-4 -mt-5">
              <p className="mb-2 text-md">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            

            <button
              type="submit"
              className="mt-5 w-full bg-black text-white p-2 rounded-xl mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 duration-200 font-bold shadow-md"
            >
              Sign Up
            </button>

            <div className="text-center text-gray-400 flex gap-2 mx-auto">
              Already have an account?
              <Link href="/sign-in" className="font-bold text-black">
                Sign In Now
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <p className="absolute bottom-5 text-red-600 text-sm font-semibold">
            {error}
          </p>
        )}
      </form>
    </main>
  )
}
