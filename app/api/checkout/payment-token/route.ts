import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tipe data item dari Supabase
type ItemRaw = {
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  }[]; // Supabase kemungkinan mengembalikan array
};

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "Order ID diperlukan." }, { status: 400 });
    }

    // Ambil transaksi berdasarkan order_id
    const { data: transaction, error: transError } = await supabase
      .from("transactions")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (transError || !transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Ambil item transaksi
    const { data: itemsRaw, error: itemsError } = await supabase
      .from("transaction_items")
      .select("quantity, price, product:product_id(id, name)")
      .eq("transaction_id", transaction.id);

    if (itemsError || !itemsRaw) {
      return NextResponse.json({ error: "Gagal mengambil detail transaksi." }, { status: 500 });
    }

    const items = itemsRaw as ItemRaw[];

    // Format item_details sesuai kebutuhan Midtrans
    const item_details = items.map((item) => {
      const product = item.product?.[0]; // ambil product pertama jika ada
      return {
        id: product?.id ?? "unknown",
        name: (product?.name ?? "Produk Tidak Dikenal").substring(0, 50),
        price: item.price,
        quantity: item.quantity,
      };
    });

    // Buat order_id unik untuk Midtrans
    const maxLengthOriginal = 30;
    const baseOrderId =
      transaction.order_id.length > maxLengthOriginal
        ? transaction.order_id.substring(0, maxLengthOriginal)
        : transaction.order_id;
    const midtransOrderId = `${baseOrderId}-${Date.now()}`;

    // Panggil Midtrans Snap API
    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: transaction.total,
          },
          item_details,
          customer_details: {
            first_name: transaction.full_name,
            email: transaction.email,
            billing_address: {
              address: transaction.address,
            },
          },
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
            unfinish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
            error: `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
          },
        }),
      }
    );

    if (!midtransResponse.ok) {
      const errorText = await midtransResponse.text();
      return NextResponse.json(
        { error: "Gagal membuat transaksi Midtrans: " + errorText },
        { status: 500 }
      );
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
    return NextResponse.json(
      { error: err.message || "Gagal memproses permintaan." },
      { status: 500 }
    );
  }
}
