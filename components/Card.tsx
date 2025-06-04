"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  bpom_number: string;
  image_url: string;
  stock: number;
  brand: { name: string } | null;
  category_name: string | null;
};

export default function Card() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          bpom_number,
          image_url,
          stock,
          category_name,
          brand:brands(name)
        `)
        .order("created_at", { ascending: false }) as unknown as {
          data: Product[];
          error: any;
        };

      if (data) setProducts(data);
      if (error) console.error("Gagal mengambil produk:", error);

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="p-4">Memuat produk...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Semua Produk</h1>

      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex flex-col justify-between h-full bg-white rounded-xl shadow hover:shadow-xl transition duration-300 p-2"
            >
              <div>
                {/* Brand dan kategori */}
                <p className="md:text-lg text-sm text-black font-semibold">
                  {product.brand?.name ?? "Tanpa Brand"} • {product.category_name ?? "Tanpa Kategori"}
                </p>

                {/* Nama produk dibatasi satu baris dan diberi ... jika panjang */}
                <p className="text-xs md:font-normal font-light text-black mt-1 mb-2 truncate">
                  {product.name}
                </p>

                {/* Gambar produk */}
                <img
                  src={product.image_url || "/placeholder-image.png"}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded mb-2"
                />
              </div>

              {/* Harga selalu di bawah */}
              <p className="text-pink-500 font-bold md:text-xl text-lg mt-auto">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
