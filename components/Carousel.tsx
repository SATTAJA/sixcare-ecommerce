'use client'

import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface CarouselProps {
  images: string[]
}

export default function Carousel({ images }: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto slide tiap 5 detik
  useEffect(() => {
    resetAutoSlide()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [current])

  const resetAutoSlide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
  }

  const goToSlide = (index: number) => setCurrent(index)
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length)

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl shadow-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Slide ${idx}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Tombol kiri */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow transition"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Tombol kanan */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow transition"
      >
        <ArrowRight size={20} />
      </button>

      {/* Dot navigasi */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full ${
              idx === current ? 'bg-pink-400' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
