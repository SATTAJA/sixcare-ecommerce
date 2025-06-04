import Link from "next/link"; // Komponen Link dari Next.js untuk navigasi internal antar halaman
import React from "react";

// Komponen Footer yang ditampilkan di bagian bawah halaman
const Footer = () => {
  return (
    <footer className="py-10 px-6 bg-black font-['Inter'] mt-35">
      {/* Container utama dengan lebar maksimum dan padding. 
          Layoutnya fleksibel: kolom di mobile, baris di desktop. */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start space-y-10 md:space-y-0">

        {/* Bagian pertama: informasi singkat perusahaan atau tim */}
        <div className="flex flex-col space-y-2 text-xs max-w-xs">
          {/* Logo SixCare yang jika diklik akan mengarah ke halaman utama */}
          <Link href="/">
            <img 
              src="/logowhite.png" 
              alt="" 
              className="h-15 w-50 -ml-8 -mt-5" 
            />
          </Link>

          {/* Deskripsi singkat tim pengembang */}
          <p className="text-gray-100">
            PJBL Kelompok 5, X-PPLG-2, SMKN 8 SEMARANG
          </p>
        </div>

        {/* Bagian kedua: Link menuju halaman informasi seperti "Tentang Kami" */}
        <div className="flex flex-col space-y-2 text-xs text-gray-100">
          {/* Judul section */}
          <h4 className="font-semibold text-white mb-2">Informasi</h4>

          {/* Link ke halaman About Us */}
          <Link href="/about-us" className="hover:underline">
            Tentang Kami
          </Link>
        </div>

        {/* Bagian ketiga: Informasi kontak, bisa untuk bantuan atau pertanyaan */}
        <div className="flex flex-col space-y-2 text-xs text-gray-100">
          {/* Judul section */}
          <h4 className="font-semibold text-white mb-2">Bantuan</h4>

          {/* Link ke email yang akan membuka Gmail dengan subject dan body default */}
          <Link
            href="https://mail.google.com/mail/?view=cm&to=sixcareecommerce@gmail.com&su=Pertanyaan, Kritik dan Saran&body=Halo%20Tim Sixcare E-commerce%2C%0ASaya%20ingin..."
            target="_blank" // Buka di tab baru
            rel="noopener noreferrer" // Untuk keamanan membuka tab eksternal
            className="hover:underline"
          >
            sixcareecommerce@gmail.com
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
