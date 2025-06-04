'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface Profile {
  id: string
  email: string
  display_name: string
  role: string
}

export default function Page() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [newDisplayName, setNewDisplayName] = useState<string>('')

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      const userId = session?.user?.id

      if (error || !userId) {
        router.push('/') // Redirect jika belum login
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('id', userId)
        .single()

      if (profileError || !profileData) {
        console.error('Gagal mengambil data profil:', profileError?.message)
        router.push('/')
      } else {
        setProfile(profileData)
        setNewDisplayName(profileData.display_name)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDisplayName(event.target.value)
  }

  const handleSaveDisplayName = async () => {
    if (!profile) return

    if (!profile.email || !profile.role) {
      console.error('Email atau role tidak ditemukan di profile.')
      alert('Terjadi kesalahan: data pengguna tidak lengkap.')
      return
    }

    if (newDisplayName === profile.display_name) {
      alert('Display name tidak berubah.')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          display_name: newDisplayName,
        },
        { onConflict: ['id'] }
      )

    if (updateError) {
      console.error('Gagal memperbarui display name di profiles:', updateError.message)
      alert('Gagal menyimpan perubahan ke database.')
      return
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: newDisplayName,
      },
    })

    if (authError) {
      console.error('Gagal memperbarui display name di auth:', authError.message)
      alert('Gagal menyimpan perubahan ke auth.')
    } else {
      setProfile({ ...profile, display_name: newDisplayName })
      alert('Display name berhasil diperbarui!')
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md mt-12">
      <button onClick={() => router.back()} className="flex items-center gap-1 mt-5 mb-5 hover:cursor-pointer">
        <ChevronLeft size={15} /> Kembali
      </button>

      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
        Pengaturan Profil
      </h1>


      {profile ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveDisplayName()
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={newDisplayName}
              onChange={handleDisplayNameChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Masukkan display name baru"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded-md font-semibold hover:bg-pink-600 transition"
          >
            Simpan Display Name
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-3 border border-red-500 text-red-500 py-2 rounded-md font-semibold hover:bg-red-50 transition"
          >
            Logout
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  )
}
