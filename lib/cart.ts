import { supabase } from "./supabaseClient";

export async function addToCart(userId: string, productId: string, quantity: number) {
  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Produk tidak ditemukan" };

  // Cek item di keranjang
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  const totalQty = (existingItem?.quantity ?? 0) + quantity;
  if (totalQty > product.stock) {
    return { error: "Jumlah melebihi stok yang tersedia" };
  }

  if (existingItem) {
    // Update quantity
    return await supabase
      .from("cart_items")
      .update({ quantity: totalQty })
      .eq("id", existingItem.id);
  } else {
    // Insert item baru
    return await supabase.from("cart_items").insert([
      {
        user_id: userId,
        product_id: productId,
        quantity,
      },
    ]);
  }
}
