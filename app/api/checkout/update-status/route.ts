// /app/api/checkout/update-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "Order ID diperlukan." }, { status: 400 });
    }

    // Update status transaksi
    const { error } = await supabase
      .from("transactions")
      .update({ status: "Sedang Dikemas" })
      .eq("order_id", order_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Status berhasil diperbarui menjadi Sedang Dikemas." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses permintaan." }, { status: 500 });
  }
}
