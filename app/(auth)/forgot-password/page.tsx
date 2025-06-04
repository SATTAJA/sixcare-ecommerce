'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password/reset`, // arahkan ke halaman reset password (buat nanti)
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset link sent! Check your email.')
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleResetPassword}
        className="bg-white shadow-md rounded-xl px-10 py-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <p className="mb-6 text-gray-600">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <label htmlFor="email" className="block mb-2 text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          Send Reset Link
        </button>

        {message && (
          <p className="mt-4 text-green-600 text-sm font-semibold">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-red-600 text-sm font-semibold">{error}</p>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <Link href="/sign-in" className="hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </main>
  )
}
