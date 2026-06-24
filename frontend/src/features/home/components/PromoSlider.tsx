import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { id: 1, imageUrl: "/hero-1.png" },
  { id: 2, imageUrl: "/hero-2.png" },
  { id: 3, imageUrl: "/hero-3.png" }
];

export function PromoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentIndex(i => i === 0 ? slides.length - 1 : i - 1);
  const nextSlide = () => setCurrentIndex(i => i === slides.length - 1 ? 0 : i + 1);

  return (
    <div className="relative w-full h-[180px] md:h-[320px] lg:h-[400px] border-3 border-nb-black shadow-[6px_6px_0px_#0A0A0A] overflow-hidden group bg-nb-yellow" style={{ borderWidth: '3px' }}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={`Promo ${slide.id}`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
