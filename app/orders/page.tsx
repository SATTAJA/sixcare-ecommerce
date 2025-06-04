'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ChevronLeft } from 'lucide-react'

// ✅ Deklarasi window.snap dengan tipe yang sesuai
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: () => void
          onPending?: () => void
          onError?: (error: any) => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (transError || !transactions) {
      setOrders([])
      setLoading(false)
      return
    }

    const transactionIds = transactions.map(t => t.id)

    const { data: items, error: itemError } = await supabase
      .from('transaction_items')
      .select('*, product:product_id(id, name, image_url, category_name)')
      .in('transaction_id', transactionIds)

    if (itemError) {
      setOrders([])
      setLoading(false)
      return
    }

    const combined = transactions.map(tx => ({
      ...tx,
      transaction_items: items.filter(i => i.transaction_id === tx.id)
    }))

    setOrders(combined)
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'Sedang Dikemas' })
      .eq('order_id', orderId)

    if (error) {
      alert('Gagal memperbarui status pesanan: ' + error.message)
      return false
    }
    return true
  }

  const handlePayment = async (order: any) => {
    try {
      const res = await fetch('/api/checkout/payment-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.order_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil token pembayaran.')

      if (!window.snap) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      window.snap.pay(data.token, {
        onSuccess: async () => {
          alert('Pembayaran berhasil')
          const success = await updateOrderStatus(order.order_id)
          if (success) {
            fetchOrders()
          }
        },
        onPending: () => {
          alert('Pembayaran menunggu konfirmasi')
          fetchOrders()
        },
        onError: (error: any) => {
          alert('Pembayaran gagal: ' + error)
        },
        onClose: () => {
          alert('Pembayaran dibatalkan')
        },
      })
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 mt-5 mb-5 hover:cursor-pointer">
        <ChevronLeft size={15} /> Kembali
      </button>
      <h2 className="text-2xl font-bold mb-6">Pesanan Saya</h2>

      {orders.length === 0 && (
        <p className="text-center text-gray-500">Belum ada pesanan.</p>
      )}

      {orders.map(order => (
        <div key={order.id} className="p-4 rounded-xl shadow space-y-3 bg-white">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status: <strong className="capitalize">{order.status}</strong></span>
            <span>{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
          </div>

          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Nama:</strong> {order.full_name}</div>
            <div><strong>Email:</strong> {order.email}</div>
            <div><strong>Alamat:</strong> {order.address}</div>
          </div>

          <div className="divide-y">
            {order.transaction_items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <img src={item.product?.image_url} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{item.product?.name}</div>
                  <div className="text-sm text-gray-500">{item.product?.category_name}</div>
                  <div className="text-sm">Jumlah: {item.quantity}</div>
                  <div className="text-sm font-medium">Subtotal: Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right font-bold">
            Total: Rp {order.total.toLocaleString('id-ID')}
          </div>

          {(order.status === 'Menunggu Pembayaran' || order.status === 'Pembayaran Ditolak' || order.status === 'Pembayaran Kadaluarsa') && (
            <button
              onClick={() => handlePayment(order)}
              className="mt-4 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500"
            >
              Bayar Sekarang
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
