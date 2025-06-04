'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Daftar gambar yang akan ditampilkan di dalam carousel
const images = [
  '/foto-toko1.jpg',
  '/foto-toko2.jpg',
  '/foto-toko3.jpg',
];

export default function SmallCarousel() {
  // State untuk melacak indeks gambar yang sedang ditampilkan
  const [current, setCurrent] = useState(0);

  // Ref untuk menyimpan timeout auto-slide agar bisa dibersihkan saat perlu
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs untuk melacak posisi sentuhan awal dan akhir (untuk swipe)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fungsi untuk menampilkan gambar berikutnya, melingkar ke awal jika di akhir
  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  // Fungsi untuk menampilkan gambar sebelumnya, melingkar ke akhir jika di awal
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  // Efek untuk mengatur auto-slide setiap 3 detik
  useEffect(() => {
    // Bersihkan timeout sebelumnya jika ada
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Atur timeout baru untuk pindah ke gambar selanjutnya
    timeoutRef.current = setTimeout(next, 3000);

    // Bersihkan timeout saat komponen di-unmount atau `current` berubah
    return () => clearTimeout(timeoutRef.current!);
  }, [current]);

  // Fungsi untuk menangani awal sentuhan (touch start)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // Fungsi untuk menangani gerakan sentuhan (touch move)
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  // Fungsi untuk menangani akhir sentuhan (touch end) dan menentukan arah swipe
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    // Jika swipe kiri cukup jauh, tampilkan gambar berikutnya
    if (distance > 50) next();
    // Jika swipe kanan cukup jauh, tampilkan gambar sebelumnya
    else if (distance < -50) prev();
  };

  return (
    <div
      // Kontainer utama carousel, mendeteksi gesture sentuhan
      className="relative mt-4 w-full max-w-xl overflow-hidden rounded-lg shadow-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-64 w-full select-none pointer-events-none">
        {/* Gambar yang sedang aktif ditampilkan */}
        <Image
          src={images[current]} // Sumber gambar berdasarkan indeks saat ini
          alt={`Foto toko ${current + 1}`} // Teks alternatif gambar
          fill // Mengisi seluruh kontainer gambar
          className="object-cover rounded-lg" // Gambar menyesuaikan proporsi dan sudut membulat
          priority // Prioritaskan loading gambar ini
        />
      </div>

      {/* Tombol navigasi kiri (gambar sebelumnya) */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Tombol navigasi kanan (gambar berikutnya) */}
      <button
        onClick={next}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
