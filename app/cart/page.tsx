'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ChevronLeft, Trash2 } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  stock: number
  brand: { name: string } | null
  category_name: string | null
}

type CartItem = {
  id: string
  quantity: number
  product: Product
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/sign-in')
      return
    }

    const { data } = await supabase
      .from('cart_items')
      .select('id, quantity, product:product_id(id, name, price, image_url, stock, category_name, brand:brands(name))')
      .eq('user_id', user.id)

    if (data) {
      const normalizedData = data.map(item => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product
      }))
      setItems(normalizedData)
      setSelectedIds(normalizedData.map(item => item.id))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCart()
  }, [router])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map(item => item.id))
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item || newQuantity < 1 || newQuantity > item.product.stock) return
    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId)
    fetchCart()
  }

  const handleDelete = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    fetchCart()
  }

  const selectedItems = items.filter(i => selectedIds.includes(i.id))
  const total = selectedItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0)

  const handleGoToCheckout = () => {
    if (selectedIds.length === 0) {
      alert("Pilih minimal satu produk untuk checkout.")
      return
    }
    localStorage.setItem("selectedCartIds", JSON.stringify(selectedIds))
    router.push("/checkout")
  }

  if (loading) return <p className="p-4">Memuat keranjang...</p>

  return (
    <div className="max-w-5xl mx-auto p-4 pb-[100px]">
      <button onClick={() => router.back()} className="flex items-center gap-1 mt-5 mb-5 hover:cursor-pointer">
        <ChevronLeft size={15} /> Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>

      <div className="flex items-center mb-4 gap-2">
        <input type="checkbox" checked={selectedIds.length === items.length} onChange={toggleSelectAll} />
        <label className="text-sm">Checklist Semua</label>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Daftar Item */}
        <div className="flex-1 space-y-4">
          {items.map(({ id, quantity, product }) => (
            <div key={id} className={`flex items-center gap-4 shadow p-2 rounded-lg ${quantity > product.stock ? 'border border-red-500' : ''}`}>
              <input type="checkbox" checked={selectedIds.includes(id)} onChange={() => toggleSelect(id)} />
              <Link href={`/products/${product.id}`} className="shrink-0">
                <img src={product.image_url || "/placeholder-image.png"} alt={product.name} className="w-16 h-16 object-cover rounded" />
              </Link>
              <div className="flex-1">
                <Link href={`/products/${product.id}`}>
                  <p className="font-medium">
                    {product.brand?.name ?? "Tanpa Brand"} • {product.category_name ?? "Tanpa Kategori"}
                  </p>
                  <p className="text-sm text-gray-700">{product.name}</p>
                </Link>
                <p className="text-sm text-gray-500">
                  Stok: {product.stock}
                  {quantity > product.stock && (
                    <span className="text-red-500 ml-1">(Stok max: {product.stock})</span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => handleUpdateQuantity(id, quantity - 1)} className="px-2 bg-gray-200 rounded-full hover:bg-gray-300">-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleUpdateQuantity(id, quantity + 1)} className="px-2 bg-gray-200 rounded-full hover:bg-gray-300">+</button>
                  <button onClick={() => handleDelete(id)} className="ml-7 text-red-500 text-sm hover:underline flex items-center gap-1">
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
              <p className="font-semibold whitespace-nowrap">Rp {product.price.toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>

        {/* Ringkasan Desktop */}
        <div className="hidden md:block w-[300px] shadow rounded-lg p-4 h-fit self-start">
          <h2 className="text-lg font-semibold mb-4">Ringkasan</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span className="font-bold">Rp {total.toLocaleString("id-ID")}</span>
          </div>
          <button
            disabled={selectedItems.length === 0}
            className={`w-full mt-4 transition-all duration-300 ${
              selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-pink-400 hover:bg-pink-500"
            } text-white font-semibold py-2 rounded`}
            onClick={handleGoToCheckout}
          >
            Beli Sekarang
          </button>
        </div>
      </div>

      {/* Sticky Footer Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="font-bold text-lg">Rp {total.toLocaleString("id-ID")}</p>
          </div>
          <button
            disabled={selectedItems.length === 0}
            className={`${
              selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-pink-400 hover:bg-pink-500"
            } text-white font-semibold px-4 py-2 rounded`}
            onClick={handleGoToCheckout}
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
