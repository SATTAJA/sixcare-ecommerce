"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function CardByCategory() {
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState("Semua Produk");

  const slugToCategoryMap: Record<string, string> = {
    skincare: "SkinCare",
    makeup: "MakeUp",
    "bath&body": "Bath&Body",
    hair: "Hair",
    "tools&brushes": "Tools&Brushes",
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const match = pathname.match(/^\/categories\/([^\/?#]+)/);
      const slug = match?.[1];
      const categoryName = slug ? slugToCategoryMap[slug] : null;

      if (categoryName) {
        setCategoryTitle(`${categoryName} Produk`);
      } else {
        setCategoryTitle("Semua Produk");
      }

      let query = supabase
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
        .order("created_at", { ascending: false });

      if (categoryName) {
        query = query.eq("category_name", categoryName);
      }

      const { data, error } = await query.returns<Product[]>();

      if (error) {
        console.error("Gagal mengambil produk:", error);
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [pathname]);

  if (loading) return <p className="p-4">Memuat produk...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{categoryTitle}</h1>

      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block bg-white rounded-xl shadow hover:shadow-xl transition duration-300 p-2"
            >
              <div className="mt-2 px-1">
                <p className="md:text-lg text-sm text-black font-semibold -mt-3 truncate">
                  {product.brand?.name ?? "Tanpa Brand"} • {product.category_name ?? "Tanpa Kategori"}
                </p>

                <p className="text-xs md:font-normal font-light text-black -mt-1 md:-mt-2 mb-1 md:mb-2 truncate">
                  {product.name}
                </p>

                <img
                  src={product.image_url || "/placeholder-image.png"}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded"
                />

                <p className="text-pink-500 font-bold md:text-xl text-lg">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
