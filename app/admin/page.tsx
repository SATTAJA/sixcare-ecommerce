"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus, SquarePen, Trash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  bpom_number: string;
  image_url: string;
  brand: { name: string };
  category_name: string;
  stock: number;
};

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = (await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          bpom_number,
          image_url,
          stock,
          brand:brands(name),
          category_name
        `)
        .order("created_at", { ascending: false })) as unknown as {
        data: Product[];
        error: any;
      };

      if (data) setProducts(data);
      if (error) console.error("Gagal mengambil produk:", error);

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus produk ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus produk");
    } else {
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  if (loading) return <p className="p-4">Memuat produk...</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">List Products</h1>
        <Link
          href="/admin/products/create"
          className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500 transition-all duration-300 flex gap-2 items-center shadow"
        >
          <CirclePlus />
          Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="shadow-lg p-4 rounded-xl border border-gray-200 flex flex-col gap-3"
            >
              <div className="flex items-center gap-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold break-words whitespace-normal">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-600 break-words whitespace-normal">
                    BPOM: {product.bpom_number}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      product.stock === 0 ? "text-red-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    Stok: {product.stock}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 break-words whitespace-normal">
                <p>
                  <span className="font-semibold text-black">Harga:</span> Rp{product.price.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold text-black">Brand:</span> {product.brand?.name}
                </p>
                <p>
                  <span className="font-semibold text-black">Kategori:</span> {product.category_name}
                </p>
                <p>
                  <span className="font-semibold text-black">Deskripsi:</span>{" "}
                  {product.description.split(" ").slice(0, 3).join(" ") +
                    (product.description.split(" ").length > 3 ? "..." : "")}
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="text-blue-600 hover:underline text-sm flex gap-2 items-center"
                >
                  <SquarePen />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:underline text-sm flex gap-2 items-center"
                >
                  <Trash2 />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
