import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      selectedIds = [],
      buyNowItems = null,
      userId,
      display_name,
      full_name,
      email,
      address,
    } = body;

    if ((!selectedIds || selectedIds.length === 0) && (!buyNowItems || buyNowItems.length === 0)) {
      return NextResponse.json({ error: "Tidak ada produk yang dipilih." }, { status: 400 });
    }

    let items: {
      product: { id: string; name: string; price: number; stock: number };
      quantity: number;
    }[] = [];

    if (buyNowItems && buyNowItems.length > 0) {
      if (!Array.isArray(buyNowItems)) {
        return NextResponse.json({ error: "Format data beli sekarang tidak valid." }, { status: 400 });
      }

      const productIds = buyNowItems.map((item: any) => item.id).filter(Boolean);
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .in("id", productIds);

      if (error) return NextResponse.json({ error: "Gagal mengambil data produk." }, { status: 500 });
      if (!products || products.length === 0) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 400 });

      items = buyNowItems.map((item: any) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
        return { product, quantity: item.quantity };
      });
    } else {
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:product_id(id, name, price, stock)")
        .in("id", selectedIds)
        .eq("user_id", userId);

      if (error || !cartItems || cartItems.length === 0) {
        return NextResponse.json({ error: "Data keranjang tidak ditemukan." }, { status: 400 });
      }

      items = cartItems.map((item) => ({
        product: item.product as unknown as { id: string; name: string; price: number; stock: number },
        quantity: item.quantity,
      }));
    }

    const gross_amount = items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    if (gross_amount <= 0) {
      return NextResponse.json({ error: "Total harga tidak valid." }, { status: 400 });
    }

    const order_id = uuidv4();

    // Buat transaksi dengan status "Menunggu Pembayaran"
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        order_id,
        display_name,
        full_name,
        email,
        address,
        total: gross_amount,
        status: "Menunggu Pembayaran",
      })
      .select()
      .single();

    if (insertError || !insertedTransaction) {
      return NextResponse.json({ error: insertError?.message || "Gagal membuat transaksi." }, { status: 500 });
    }

    const transaction_id = insertedTransaction.id;

    const transactionItemsPayload = items.map((item) => ({
      transaction_id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(transactionItemsPayload);

    if (itemsError) {
      return NextResponse.json({ error: "Gagal menyimpan detail item transaksi." }, { status: 500 });
    }

    // Jangan update stok dan jangan hapus keranjang di sini!
    // Nanti dilakukan di webhook Midtrans.

    // Payload Midtrans
    const item_details = items.map((item) => ({
      id: item.product.id,
      name: item.product.name.substring(0, 50),
      price: item.product.price,
      quantity: item.quantity,
    }));

    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          transaction_details: {
            order_id,
            gross_amount,
          },
          item_details,
          customer_details: {
            first_name: full_name,
            email,
            billing_address: {
              address,
            },
          },
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
            unfinish: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failed`,
            error: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/error`,
          },
        }),
      }
    );

    if (!midtransResponse.ok) {
      const errorText = await midtransResponse.text();
      console.error("Midtrans Error:", errorText);
      return NextResponse.json({ error: "Gagal membuat transaksi Midtrans." }, { status: 500 });
    }

    const snap = await midtransResponse.json();

    if (!snap.token) {
      return NextResponse.json({ error: "Token pembayaran tidak ditemukan." }, { status: 500 });
    }

    return NextResponse.json({
      token: snap.token,
      redirect_url: snap.redirect_url,
    });
  } catch (err: any) {
    console.error("Checkout Error:", err.message || err);
    return NextResponse.json(
      { error: err?.message || "Gagal memproses transaksi." },
      { status: 500 }
    );
  }
}
