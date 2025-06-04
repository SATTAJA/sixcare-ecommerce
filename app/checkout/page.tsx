'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

// Tambahkan deklarasi global untuk Snap.js
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: () => void
        onPending?: () => void
        onError?: (error: any) => void
        onClose?: () => void
      }) => void
    }
  }
}

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [buyNowItems, setBuyNowItems] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single()
        if (profile) {
          setDisplayName(profile.display_name || '')
          setEmail(profile.email || '')
        }
      }
    }

    const savedSelected = localStorage.getItem("selectedCartIds")
    if (savedSelected) {
      setSelectedIds(JSON.parse(savedSelected))
    }

    const savedBuyNow = localStorage.getItem("buyNowItems")
    if (savedBuyNow) {
      setBuyNowItems(JSON.parse(savedBuyNow))
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
    if (clientKey && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', clientKey)
      script.async = true
      document.body.appendChild(script)
    } else {
      console.error("MIDTRANS CLIENT KEY tidak tersedia.")
    }

    loadUser()
  }, [])

  const handlePay = async () => {
    if (!fullName || !address) {
      alert("Nama lengkap dan alamat wajib diisi.")
      return
    }

    if ((selectedIds.length === 0) && (buyNowItems.length === 0)) {
      alert("Tidak ada produk yang dipilih.")
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          selectedIds,
          buyNowItems,
          display_name: displayName,
          full_name: fullName,
          email,
          address,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.token) {
        throw new Error(data?.error || "Gagal memproses transaksi.")
      }

      // Panggil Snap.js Midtrans
      if (typeof window !== 'undefined' && window.snap && typeof window.snap.pay === 'function') {
        window.snap.pay(data.token, {
          onSuccess: () => {
            localStorage.removeItem("selectedCartIds")
            localStorage.removeItem("buyNowItems")
            window.location.href = '/orders'
          },
          onPending: () => {
            window.location.href = '/checkout/pending'
          },
          onError: (error: any) => {
            console.error('Midtrans Error:', error)
            alert("Terjadi kesalahan saat pembayaran.")
          },
          onClose: () => {
            console.log("Pembayaran dibatalkan.")
          }
        })
      } else {
        alert("Midtrans Snap belum siap. Coba refresh halaman.")
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Terjadi kesalahan saat proses pembayaran.")
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 mt-5 mb-5 hover:cursor-pointer">
        <ChevronLeft size={15} /> Kembali
      </button>
      <h2 className="text-xl font-bold mb-4">Isi Data Diri</h2>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Display Name"
          value={displayName}
          readOnly
        />
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Nama Lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="email"
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          readOnly
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Alamat Lengkap"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 transition-all duration-300 text-white font-bold py-2 rounded"
        >
          Lanjutkan Pembayaran
        </button>
      </form>
    </div>
  )
}
