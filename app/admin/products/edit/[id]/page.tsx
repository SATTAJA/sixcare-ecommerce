"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { cropImageToSquare } from "@/utils/imageCrop";
import { Trash2 } from "lucide-react";

type Brand = { id: string; name: string };
type Category = { name: string };

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bpomNumber, setBpomNumber] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        alert("Gagal memuat data produk");
        console.error(productError);
        return;
      }

      const { data: brandList } = await supabase.from("brands").select("id, name");
      const { data: categoryList } = await supabase.from("categories").select("name");

      setBrands(brandList || []);
      setCategories(categoryList || []);

      setName(productData.name || "");
      setDescription(productData.description || "");
      setPrice(productData.price?.toString() || "");
      setBpomNumber(productData.bpom_number || "");
      setImageUrl(productData.image_url || "");
      setCategoryName(productData.category_name || "");
      setStock(productData.stock?.toString() || "");

      const brand = brandList?.find((b) => b.id === productData.brand_id);
      setBrandName(brand?.name || "");
    };

    fetchData();
  }, [productId]);

  const getOrCreateBrand = async (name: string): Promise<string | null> => {
    const { data: existing, error: findError } = await supabase
      .from("brands")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (findError) return null;
    if (existing) return existing.id;

    const { data: inserted, error: insertError } = await supabase
      .from("brands")
      .insert({ name })
      .select("id")
      .single();

    if (insertError) return null;
    return inserted.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const filePath = `products/${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (error) {
        alert("Gagal upload gambar");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData?.publicUrl || "";
    }

    const brandId = await getOrCreateBrand(brandName);
    if (!brandId || !categoryName) {
      alert("Gagal menentukan brand atau kategori");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        bpom_number: bpomNumber.trim() === "" ? "-" : bpomNumber,
        image_url: finalImageUrl,
        brand_id: brandId,
        category_name: categoryName,
        stock: Number(stock),
      })
      .eq("id", productId);

    if (error) {
      alert("Gagal memperbarui produk");
    } else {
      router.push("/admin");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl p-4 mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nama Produk"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Deskripsi"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <select
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Brand (pilih dari list atau ketik baru)"
          className="w-full border p-2 rounded"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          list="brand-options"
          required
        />
        <datalist id="brand-options">
          {brands.map((brand) => (
            <option key={brand.id} value={brand.name} />
          ))}
        </datalist>

        <input
          type="number"
          placeholder="Stok"
          className="w-full border p-2 rounded"
          value={stock}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value <= 10000) setStock(e.target.value);
          }}
          max={10000}
          required
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="Rp 0"
          className="w-full border p-2 rounded"
          value={`Rp ${Number(price).toLocaleString("id-ID")}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const numeric = Number(raw);
            if (numeric <= 1_000_000) setPrice(numeric.toString());
          }}
          required
        />

        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          placeholder="Nomor BPOM (opsional)"
          className="w-full border p-2 rounded"
          value={bpomNumber}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length <= 11) setBpomNumber(raw);
          }}
        />

        <div className="w-full">
          {(imageFile || imageUrl) ? (
            <div className="relative w-full max-w-xs">
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                alt="Preview"
                className="w-40 h-40 rounded shadow mb-2 aspect-square object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImageUrl("");
                }}
                className="absolute top-18 left-16 bg-red-500 text-white text-xs px-1 py-1 rounded opacity-50 hover:opacity-100"
              >
                <Trash2 />
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];

                  if (file.size > 2 * 1024 * 1024) {
                    alert("Ukuran gambar maksimal 2MB");
                    return;
                  }

                  try {
                    const cropped = await cropImageToSquare(file);
                    setImageFile(cropped);
                  } catch (err) {
                    alert("Gagal memproses gambar");
                  }
                }
              }}
              className="w-full border p-2 rounded"
              required={!imageUrl}
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Perbarui Produk"}
        </button>
      </form>
    </div>
  );
}
