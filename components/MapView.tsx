'use client'; // Menandakan bahwa komponen ini dijalankan di sisi klien (client-side)

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Import komponen peta dari react-leaflet
import 'leaflet/dist/leaflet.css'; // Import style bawaan leaflet agar peta dapat ditampilkan dengan benar

import L from 'leaflet'; // Import Leaflet untuk konfigurasi manual ikon marker
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'; // Gambar marker untuk retina display
import markerIcon from 'leaflet/dist/images/marker-icon.png'; // Gambar marker default
import markerShadow from 'leaflet/dist/images/marker-shadow.png'; // Gambar bayangan marker

// ✅ Perbaikan agar ikon marker muncul dengan benar saat digunakan di Next.js
// Karena Next.js tidak secara otomatis menangani file statis dari leaflet,
// kita perlu mengatur ulang path ikon marker secara manual.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src, // Ikon untuk layar retina
  iconUrl: markerIcon.src,         // Ikon default
  shadowUrl: markerShadow.src,     // Bayangan ikon
});

// Interface untuk mendefinisikan props dari komponen MapView
interface MapViewProps {
  lat: number; // Latitude untuk posisi marker dan peta
  lng: number; // Longitude untuk posisi marker dan peta
}

// Komponen utama peta
export default function MapView({ lat, lng }: MapViewProps) {
  return (
    // Kontainer peta dengan ukuran tinggi tetap dan styling responsif
    <div className="w-full h-[400px] overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lng]} // Posisi awal peta difokuskan pada latitude dan longitude yang diberikan
        zoom={15}           // Level zoom default saat peta dimuat
        scrollWheelZoom={false} // Menonaktifkan zoom dengan scroll mouse
        style={{ height: '100%', width: '100%' }} // Ukuran peta disesuaikan dengan kontainer
      >
        {/* TileLayer menyediakan layer dasar peta menggunakan OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' // Sumber data peta
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // URL tile layer dari OpenStreetMap
        />

        {/* Marker ditampilkan pada koordinat yang diberikan */}
        <Marker position={[lat, lng]}>
          {/* Popup muncul saat marker diklik */}
          <Popup>
            Toko Sejati <br /> Semarang Timur
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
