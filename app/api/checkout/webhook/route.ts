import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fungsi verifikasi signature key
function verifySignature(body: any, serverKey: string) {
  const input = body.order_id + body.status_code + body.gross_amount + serverKey;
  const expectedSignature = crypto.createHash("sha512").update(input).digest("hex");
  return body.signature_key === expectedSignature;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  
  // Verifikasi Signature Key
  if (!verifySignature(body, serverKey)) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 403 });
  }

  const { order_id, transaction_status, fraud_status } = body;

  // Ambil id transaksi dari order_id
  const original_order_id = order_id.split("-")[0];

  if (transaction_status === "capture" || transaction_status === "settlement") {
    // Update status transaksi ke "Sedang Dikemas"
    const { error } = await supabase
      .from("transactions")
      .update({ status: "Sedang Dikemas" })
      .eq("order_id", original_order_id);

    if (error) {
      return NextResponse.json({ error: "Gagal update status." }, { status: 500 });
    }

    return NextResponse.json({ message: "Status diperbarui ke Sedang Dikemas." });
  }

  // Jika pembayaran gagal atau dibatalkan, status tidak berubah
  return NextResponse.json({ message: "Notifikasi diterima, tidak ada update status." });
}
