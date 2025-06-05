"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import { ChevronLeft } from "lucide-react";
import { addToCart } from "@/lib/cart";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  bpom_number: string;
  image_url: string;
  stock: number;
  brand: { name: string }[] | null;  // ✅ Ubah menjadi array
  category_name: string | null;
};

const Page = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      setIsLoggedIn(true);

      if (!productId) {
        console.error("Product ID tidak ditemukan di URL.");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          description,
          price,
          bpom_number,
          image_url,
          stock,
          category_name,
          brand:brands(name)
        `
        )
        .eq("id", productId)
        .single();

      if (data) setProduct(data as Product);
      if (error) console.error("Gagal mengambil produk:", error);
      setLoading(false);
    };

    checkAuthAndFetch();
  }, [router, productId]);

  if (!isLoggedIn || loading) return <p className="p-4">Memuat halaman...</p>;
  if (!product) return <p className="p-4">Produk tidak ditemukan.</p>;

  return (
    <main className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-grow">
        <div className="max-w-screen-lg mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 mt-6 mb-4 hover:cursor-pointer md:-ml-30"
          >
            <ChevronLeft size={15} />
            Kembali
          </button>

          <div className="md:flex gap-10">
            <img
              src={product.image_url || "/placeholder-image.png"}
              alt={product.name}
              className="h-full md:h-120 aspect-square object-cover"
            />
            <div className="mt-5 md:mt-0 flex-1">
              
              <p className="text-lg">{product.name}</p>
              <p className="text-sm font-extralight mb-2">
                No BPOM: {product.bpom_number}
              </p>
              <p className="text-xs bg-gray-100 text-gray-500 rounded-full inline-block px-2 py-1 mb-4">
                Kategori: {product.category_name}
              </p>

              <p className="text-pink-500 font-bold text-2xl md:text-3xl mb-2">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p
                className={`text-sm mb-4 ${
                  product.stock === 0 ? "text-red-600" : "text-gray-500"
                }`}
              >
                Stok: {product.stock}
              </p>

              <div className="flex items-center gap-3 mb-6">
                <p>Jumlah:</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((prev) =>
                        prev < product.stock ? prev + 1 : prev
                      )
                    }
                    className="bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-5 mb-6">
                <button
                  onClick={async () => {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) return;

                    const result = await addToCart(user.id, product.id, quantity);
                    if (result.error) {
                      alert(result.error);
                    } else {
                      alert("Berhasil ditambahkan ke keranjang");
                    }
                  }}
                  className="bg-white text-black border text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded flex items-center gap-1 transition-all duration-300"
                >
                  <img
                    className="h-7"
                    src="/addcart.png"
                    alt="tambah ke keranjang"
                  />
                  Tambah ke Keranjang
                </button>

                <button
                  onClick={async () => {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) return;

                    const buyNowItem = [
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url,
                        quantity,
                      },
                    ];

                    localStorage.setItem("buyNowItems", JSON.stringify(buyNowItem));
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    router.push("/checkout");
                  }}
                  className="bg-pink-400 px-6 py-2 rounded text-white hover:bg-pink-500 transition-all duration-300 font-semibold"
                >
                  Beli Sekarang
                </button>
              </div>

              <div className="border-t border-gray-500 pt-4 w-[372px]">
                <h1 className="font-semibold text-lg mb-2">Deskripsi</h1>
                <p className="text-sm break-words whitespace-normal">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Page;
