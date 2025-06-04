'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ChevronLeft } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()


  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ambil semua transaksi milik user
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (transError || !transactions) {
        console.error('Error transaksi:', transError)
        setOrders([])
        setLoading(false)
        return
      }

      if (transactions.length === 0) {
        setOrders([])
        setLoading(false)
        return
      }

      const transactionIds = transactions.map(t => t.id)

      // Ambil semua item dari transaksi tersebut
      const { data: items, error: itemError } = await supabase
        .from('transaction_items')
        .select('*, product:product_id(id, name, image_url, category_name)')
        .in('transaction_id', transactionIds)

      if (itemError) {
        console.error('Error items:', itemError)
        setOrders([])
        setLoading(false)
        return
      }

      // Gabungkan item dengan transaksi sesuai ID-nya
      const combined = transactions.map(tx => ({
        ...tx,
        transaction_items: items.filter(i => i.transaction_id === tx.id)
      }))

      setOrders(combined)
      setLoading(false)
    }

    fetchOrders()
  }, [])

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
        <div key={order.id} className=" p-4 rounded-xl shadow space-y-3 bg-white">
          {/* Info Status & Tanggal */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status: <strong className="capitalize">{order.status}</strong></span>
            <span>{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
          </div>

          {/* Info Pemesan */}
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Nama:</strong> {order.full_name}</div>
            <div><strong>Email:</strong> {order.email}</div>
            <div><strong>Alamat:</strong> {order.address}</div>
          </div>

          {/* Daftar Produk */}
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

          {/* Total */}
          <div className="text-right font-bold">
            Total: Rp {order.total.toLocaleString('id-ID')}
          </div>
        </div>
      ))}
    </div>
  )
}
