"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  CircleUserRound,
  Menu,
  PackageOpen,
  Search,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Tipe data untuk profil pengguna
interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

// Tipe data untuk kategori
interface Category {
  name: string;
}

// Tipe data untuk produk (hasil pencarian)
interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk menyimpan data pengguna
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // State untuk input pencarian
  const [search, setSearch] = useState("");

  // State untuk daftar kategori dan kategori yang dipilih
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Ref untuk dropdown kategori agar bisa ditutup saat klik di luar
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // State dan ref untuk dropdown menu hamburger (mobile)
  const [isOpen, setIsOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // State dan ref untuk dropdown user (icon profil)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // State untuk hasil pencarian
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Ambil semua kategori dari Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("name");
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Ambil data profil user jika sudah login
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;

      if (userId) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profile && !error) setUserProfile(profile);
      }
    };

    fetchUserProfile();

    // Perbarui data user jika status auth berubah
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profile }) => {
              setUserProfile(profile ?? null);
            });
        } else {
          setUserProfile(null);
        }
      }
    );

    // Cleanup listener saat komponen di-unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Deteksi klik di luar dropdown dan tutup dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }

      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }

      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update kategori yang ditampilkan berdasarkan URL
  useEffect(() => {
    const match = pathname.match(/^\/categories\/([^\/?#]+)/);
    const slug = match?.[1];

    const slugToNameMap: Record<string, string> = {
      skincare: "SkinCare",
      makeup: "MakeUp",
      "bath&body": "Bath&Body",
      hair: "Hair",
      "tools&brushes": "Tools&Brushes",
    };

    if (pathname === "/") {
      setSelectedCategory("Semua");
    } else if (slug && slugToNameMap[slug]) {
      setSelectedCategory(slugToNameMap[slug]);
    } else {
      setSelectedCategory("Semua");
    }
  }, [pathname]);

  // Aksi saat kategori dipilih
  const handleCategorySelect = (categoryName: string) => {
    setCategoryDropdownOpen(false);

    const nameToSlugMap: Record<string, string> = {
      SkinCare: "skincare",
      MakeUp: "makeup",
      "Bath&Body": "bath&body",
      Hair: "hair",
      "Tools&Brushes": "tools&brushes",
      All: "",
    };

    const slug = nameToSlugMap[categoryName];

    if (!slug) {
      router.push("/");
    } else {
      router.push(`/categories/${slug}`);
    }
  };

  // Ambil hasil pencarian saat input berubah
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, price")
        .ilike("name", `%${search}%`);

      if (!error && data) {
        setSearchResults(data);
        setShowResults(true);
      }
    };

    const delay = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <nav className="sticky top-0 z-50 bg-white py-3 px-6 md:px-14 border-b border-gray-300 flex items-center">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <img src="/logoblack.png" alt="Logo" className="h-9 md:h-12" />
      </Link>

      {/* Link dan Dropdown Kategori */}
      <div className="flex items-center gap-4 ml-4 relative" ref={categoryDropdownRef}>
        <Link href="/about-us" className="font-semibold hidden md:flex">
          Tentang Kami
        </Link>

        <button
          onClick={() => setCategoryDropdownOpen((prev) => !prev)}
          className="font-semibold items-center relative hidden md:flex"
        >
          {selectedCategory} <ChevronDown size={16} className="ml-1" />
        </button>

        {categoryDropdownOpen && (
          <div className="absolute top-full mt-2 bg-white rounded-lg shadow z-50 w-38 text-sm">
            <button
              onClick={() => handleCategorySelect("Semua")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-lg"
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-lg"
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Search Bar */}
      <div ref={searchRef} className="relative w-64 -left-7 md:-left-2">
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-3xl">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none px-2 w-full text-sm"
          />
        </div>

        {/* Dropdown hasil pencarian */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto z-50">
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block hover:bg-gray-100"
                onClick={() => {
                  setSearch("");
                  setShowResults(false);
                }}
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tombol Login / Dropdown User */}
      {!userProfile ? (
        <div className="hidden md:flex gap-4">
          <Link href="/sign-in">
            <button className="bg-black text-white px-5 py-2 rounded-3xl hover:bg-gray-800 transition text-sm">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="bg-black text-white px-5 py-2 rounded-3xl hover:bg-gray-800 transition text-sm">
              Sign Up
            </button>
          </Link>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-3 relative" ref={userDropdownRef}>
          <Link href="/cart" className="hover:cursor-pointer hover:bg-gray-100 p-1 rounded-full">
            <ShoppingCart />
          </Link>
          <button onClick={() => setUserDropdownOpen((prev) => !prev)} className="p-1 hover:bg-gray-100 rounded-full">
            <CircleUserRound />
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 text-sm">
              <Link href="/profile-setting" className="block px-4 py-2 hover:bg-gray-100">
                Pengaturan Profil
              </Link>
              <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100">
                Pesanan Saya
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Hamburger Menu untuk mobile */}
      <div className="relative md:hidden" ref={menuDropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="hover:bg-gray-100 p-2 rounded-full">
          <Menu />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <div className="py-2 text-sm text-black">
              {!userProfile ? (
                <>
                  <Link href="/sign-in" className="block px-4 py-2 hover:bg-gray-100">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="block px-4 py-2 hover:bg-gray-100">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile-setting" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <CircleUserRound size={20} /> Pengaturan Profil
                  </Link>
                  <Link href="/cart" className="flex px-4 py-2 hover:bg-gray-100 items-center gap-2">
                    <ShoppingCart size={20} /> Keranjang
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <PackageOpen size={20} /> Pesanan Saya
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "").replace("&", "")}`}
                      className="flex items-center gap-1 px-4 py-2 hover:bg-gray-100"
                    >
                      <h1 className="font-semibold">Kategori:</h1>
                      <p className="text-xs">{category.name}</p>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Komponen untuk hasil pencarian produk
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b">
      <img
        src={product.image_url}
        alt={product.name}
        width={50}
        height={50}
        className="rounded-md object-cover"
      />
      <div>
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-xs text-gray-500">Rp{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
