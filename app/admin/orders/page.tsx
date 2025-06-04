'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import * as XLSX from 'xlsx'

// Definisikan interface untuk item transaksi dan produk
interface Product {
  id: number
  name: string
  image_url: string
  category_name: string
}

interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

interface Order {
  id: number
  created_at: string
  full_name: string
  email: string
  address: string
  status: string
  total: number
  transaction_items: TransactionItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Semua')

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
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

      const combined = transactions.map(tx => ({
        ...tx,
        transaction_items: items.filter(i => i.transaction_id === tx.id)
      }))

      setOrders(combined)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert('Gagal memperbarui status pesanan.')
      console.error(error)
    } else {
      setOrders(prev =>
        prev.map(order =>
          order.id === id ? { ...order, status } : order
        )
      )
    }
  }

  const filteredOrders =
    statusFilter === 'Semua'
      ? orders
      : orders.filter(order => order.status === statusFilter)

  const exportToExcel = () => {
    const dataToExport = filteredOrders.flatMap(order =>
      order.transaction_items.map((item: TransactionItem) => ({
        ID_Pesanan: order.id,
        Tanggal: new Date(order.created_at).toLocaleDateString('id-ID'),
        Nama_Pemesan: order.full_name,
        Email: order.email,
        Alamat: order.address,
        Status: order.status,
        Produk: item.product?.name,
        Kategori: item.product?.category_name,
        Jumlah: item.quantity,
        Harga_Satuan: item.price,
        Subtotal: item.price * item.quantity,
        Total_Transaksi: order.total
      }))
    )

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pesanan')
    XLSX.writeFile(workbook, 'pesanan.xlsx')
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Panel Admin: Semua Pesanan</h2>

      <div className="flex flex-wrap items-center gap-4 justify-between mb-4">
        <div>
          <label className="mr-2 font-medium">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-400 px-3 py-1 rounded"
          >
            <option value="Semua">Semua</option>
            <option value="Sedang Dikemas">Sedang Dikemas</option>
            <option value="Sedang Dikirim">Sedang Dikirim</option>
            <option value="Sudah Diterima/Selesai">Sudah Diterima/Selesai</option>
            <option value="Gagal/Tidak Diterima">Gagal/Tidak Diterima</option>
          </select>
        </div>

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export ke Excel
        </button>
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-500">Tidak ada pesanan dengan status ini.</p>
      )}

      {filteredOrders.map(order => (
        <div key={order.id} className="p-4 rounded-xl shadow space-y-3 bg-white">
          {/* Info Status & Tanggal */}
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <strong>ID:</strong> {order.id}<br />
              <strong>Tanggal:</strong> {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </div>
            <div>
              <label className="mr-2">Status:</label>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="border border-gray-400 px-2 py-1 rounded"
              >
                <option value="Sedang Dikemas">Sedang Dikemas</option>
                <option value="Sedang Dikirim">Sedang Dikirim</option>
                <option value="Sudah Diterima/Selesai">Sudah Diterima/Selesai</option>
                <option value="Gagal/Tidak Diterima">Gagal/Tidak Diterima</option>
              </select>
            </div>
          </div>

          {/* Info Pemesan */}
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Nama:</strong> {order.full_name}</div>
            <div><strong>Email:</strong> {order.email}</div>
            <div><strong>Alamat:</strong> {order.address}</div>
          </div>

          {/* Daftar Produk */}
          <div className="divide-y">
            {order.transaction_items.map((item: TransactionItem) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <img
                  src={item.product?.image_url}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded border"
                />
                <div className="flex-1">
                  <div className="font-semibold">{item.product?.name}</div>
                  <div className="text-sm text-gray-500">{item.product?.category_name}</div>
                  <div className="text-sm">Jumlah: {item.quantity}</div>
                  <div className="text-sm font-medium">
                    Subtotal: Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </div>
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
