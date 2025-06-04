"use client";

import { useRouter } from "next/navigation";
import SmallCarousel from "@/components/SmallCarousel";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

const AboutUsPage = () => {
  const latitude = -6.978838171409974;
  const longitude = 110.43628797975151;
  const router = useRouter();

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      {/* Background Hero */}
      <div className="relative h-80 md:h-screen md:w-full overflow-hidden z-0">
        <img
          src="/hero.png"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Logo dan Text Overlay */}
      <div>
        <Link href="/">
          <img
            src="/logowhite.png"
            alt="logo"
            className="md:h-20 h-15 w-auto absolute top-5 -left-2 md:left-5 z-50 select-none"
          />
        </Link>

        <div className="absolute top-30 md:top-60 left-7 md:left-36 z-50 max-w-2xl">
          <h1 className="text-xl md:text-5xl font-semibold text-white leading-snug">
            Jadikan diri anda lebih cantik <br />
            dan memiliki kulit yang sehat
          </h1>
          <p className="text-white mt-4 md:text-lg text-xs">
            SixCare membantu Anda membeli kebutuhan kecantikan dari rumah
          </p>
          <button
            onClick={() => router.back()}
            className="bg-transparent border-white border font-semibold md:text-lg text-xs text-white px-4 py-2 rounded-lg mt-4 hover:bg-white hover:text-black transition-all duration-300"
          >
            Lanjutkan Berbelanja
          </button>
        </div>
      </div>

{/* Team Kami */}
<section className="py-16 px-4 sm:px-6">
  <h1 className="text-center font-semibold text-3xl mb-12">Team Kami</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
    {[
      {
        nama: "Farel Arka Pratama",
        tugas: "Frontend Developer",
        img: "/farel.jpg",
      },
      {
        nama: "Garneta Karin Srinareswari",
        tugas: "UI/UX Designer",
        img: "/garneta.jpg",
      },
      {
        nama: "Krisna Aji Wicaksono",
        tugas: "Database Designer",
        img: "/krisna.jpg",
      },
      {
        nama: "Labiba Almayra",
        tugas: "UI/UX Designer",
        img: "/labiba.jpg",
      },
      {
        nama: "Nasywa Alifia",
        tugas: "UI/UX Designer",
        img: "/nasywa.jpg",
      },
      {
        nama: "Satrio Aji Kusumo",
        tugas: "Fullstack Developer",
        img: "/satrio.jpg",
      },
    ].map((anggota, index) => (
      <div
        key={index}
        className="flex flex-col items-center text-center transition-all duration-300 p-4" 
      >
        <div className="w-32 h-40 mb-4 rounded-xl overflow-hidden shadow-inner hover:scale-120 transition-all duration-300">
          <img
            src={anggota.img}
            alt={anggota.nama}
            className="w-full h-full object-cover grayscale hover:grayscale-0 size-105 transition duration-300"
          />
        </div>
        <h3 className="text-black text-lg font-semibold">{anggota.nama}</h3>
        <p className="text-zinc-400 text-sm">{anggota.tugas}</p>
      </div>
    ))}
  </div>
</section>


      {/* Visi & Misi */}
      <div className="my-12 px-4 sm:px-6">
        <h1 className="text-center font-semibold text-2xl mb-6">VISI-&-MISI</h1>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch text-white">
          <section className="bg-pink-400 rounded-xl p-6 md:w-1/2 shadow">
            <h2 className="text-xl font-semibold mb-2">Visi</h2>
            <p>
              Menjadi platform e-commerce terdepan yang tidak hanya menyediakan produk
              berkualitas, tetapi juga menghadirkan pengalaman belanja online yang mudah,
              aman, dan memuaskan bagi setiap pelanggan. Kami berkomitmen untuk membangun
              ekosistem digital yang terpercaya, inklusif, dan inovatif di mana kebutuhan
              akan gaya hidup, kesehatan, dan kecantikan terpenuhi dengan pelayanan terbaik,
              teknologi modern, dan sentuhan empati. Dengan berfokus pada kepuasan pelanggan
              dan keberlanjutan jangka panjang, kami ingin menjadi mitra utama dalam
              perjalanan transformasi digital masyarakat.
            </p>
          </section>

          <div className="bg-pink-400 rounded-xl p-6 md:w-1/2 shadow">
            <h2 className="text-xl font-semibold mb-2">Misi</h2>
            <ul className="list-decimal list-inside space-y-2">
              <li>Memberikan pengalaman belanja online yang mudah, cepat, dan aman.</li>
              <li>Menyediakan berbagai pilihan produk berkualitas dan layanan responsif.</li>
              <li>Membangun e-commerce efisien yang menghubungkan penjual dan pembeli.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kerjasama - Carousel + Penjelasan */}
      <div className="px-4 sm:px-6 bg-white relative z-10">
        <h2 className="text-2xl font-semibold mb-8 text-center">Kerjasama</h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mx-auto">
          <div className="w-full md:w-2/4 flex justify-center">
            <SmallCarousel />
          </div>

          <div className="w-full md:w-1/2 text-justif md:mr-10 md:mt-5">
            <p>
              Toko Sejati Cosmetic merupakan toko kosmetik terpercaya yang telah
              melayani pelanggan selama lebih dari 18 tahun. Didirikan dan dikelola
              oleh Bapak Wijaya, Dengan pengalaman yang panjang di bidang
              kecantikan, Toko Sejati menyediakan berbagai produk kosmetik dan
              perawatan kulit yang asli dan berkualitas bagi masyarakat Semarang dan
              sekitarnya. Tim SixCare menjalin kerja sama dengan Toko Sejati
              Cosmetic Semarang dalam menghadirkan platform SixCare E-commerce.
              Produk dan stok dikelola secara langsung oleh Toko Sejati, sehingga
              pelanggan dapat memperoleh produk kecantikan asli dengan mudah, cepat,
              dan terpercaya melalui layanan digital kami.
            </p>
          </div>
        </div>

        {/* Lokasi Toko */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Lokasi Toko Sejati</h2>
          <p>
            Jl. Purwosari Raya No.27c, Rejosari, Kec. Semarang Timur, Kota
            Semarang, Jawa Tengah 50125.
          </p>
          <MapView lat={latitude} lng={longitude} />
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default AboutUsPage;
