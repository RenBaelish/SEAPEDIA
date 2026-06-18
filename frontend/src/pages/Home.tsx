import { useState, useEffect } from 'preact/hooks';
import { ProductCatalog } from '../components/ProductCatalog';
import { ReviewsSection } from '../components/ReviewsSection';

export function Home() {
  return (
    <div class="bg-gray-50 pb-16">
      
      {/* ─── Promo Banner Strip ─────────────────────────────── */}
      <div class="bg-white border-b border-gray-100 mb-6 pb-6 pt-4">
        <div class="page-container">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { gradient: "from-green-500 to-emerald-600", title: "Gratis Ongkir", subtitle: "Setiap Hari!", icon: "🚚" },
              { gradient: "from-purple-500 to-pink-600", title: "Flash Sale", subtitle: "Diskon s.d 90%", icon: "⚡" },
              { gradient: "from-orange-500 to-red-500", title: "Promo Hari Ini", subtitle: "Penawaran Terbatas!", icon: "🔥" },
            ].map((b, i) => (
              <div key={i} class={`bg-gradient-to-r ${b.gradient} rounded-xl p-6 flex items-center gap-4 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm`}>
                <span class="text-4xl">{b.icon}</span>
                <div>
                  <p class="font-bold text-[18px]">{b.title}</p>
                  <p class="text-[14px] opacity-90">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class="page-container space-y-6">
        {/* ─── Produk Incaranmu ─────────────────────────────────── */}
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-[20px] font-bold text-gray-900 mb-5 border-b border-gray-100 pb-4">Katalog Produk</h2>
          <ProductCatalog />
        </div>

        {/* ─── App Reviews ────────────────────────────────────────── */}
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-[20px] font-bold text-gray-900 mb-5 border-b border-gray-100 pb-4">Ulasan Pengguna SEAPEDIA</h2>
          <ReviewsSection />
        </div>
      </div>
    </div>
  );
}
