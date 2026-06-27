import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Store, Package, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{ topStores: any[], topProducts: any[] }>({ topStores: [], topProducts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const storeChartData = data.topStores.map(store => ({
    name: store.name,
    Pesanan: store.orderCount
  }));

  const productChartData = data.topProducts.map(product => ({
    name: product.name,
    Terjual: product.sold
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Analitik Lanjutan</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Laporan mendalam mengenai toko dan produk terlaris.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {}
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
          <div className="p-4 border-b-2 border-nb-black flex items-center justify-between bg-[#F7F5F0]">
            <h2 className="text-sm font-black text-nb-black uppercase tracking-wide flex items-center gap-2">
              <div className="w-8 h-8 bg-nb-blue border-2 border-nb-black flex items-center justify-center text-white">
                <Store size={16} strokeWidth={2.5} />
              </div>
              Top Toko Terlaris
            </h2>
            <TrendingUp size={18} className="text-nb-green" strokeWidth={3} />
          </div>
          <div className="p-6 h-[300px]">
            {storeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0A0A0A', fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0A0A0A', fontWeight: 800 }} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '0', border: '2px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', backgroundColor: '#FFFFFF', fontWeight: 800 }}
                  />
                  <Bar dataKey="Pesanan" fill="#0052FF" radius={[0, 0, 0, 0]} barSize={40} stroke="#0A0A0A" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm font-bold text-gray-500">Belum ada data</div>
            )}
          </div>
        </div>

        {}
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
          <div className="p-4 border-b-2 border-nb-black flex items-center justify-between bg-[#F7F5F0]">
            <h2 className="text-sm font-black text-nb-black uppercase tracking-wide flex items-center gap-2">
              <div className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center text-nb-black">
                <Package size={16} strokeWidth={2.5} />
              </div>
              Penjualan Produk (Unit)
            </h2>
            <TrendingUp size={18} className="text-nb-green" strokeWidth={3} />
          </div>
          <div className="p-6 h-[300px]">
            {productChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FCD34D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0A0A0A', fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0A0A0A', fontWeight: 800 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0', border: '2px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', backgroundColor: '#FFFFFF', fontWeight: 800 }}
                  />
                  <Area type="monotone" dataKey="Terjual" stroke="#0A0A0A" strokeWidth={3} fillOpacity={1} fill="url(#colorOrange)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm font-bold text-gray-500">Belum ada data</div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-x-auto">
           <table className="w-full min-w-[400px] text-sm text-left">
              <thead className="bg-nb-yellow text-nb-black font-black uppercase tracking-wide border-b-2 border-nb-black">
                <tr>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Nama Toko</th>
                  <th className="px-5 py-4 text-right">Total Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {data.topStores.length > 0 ? (
                  data.topStores.map((store, i) => (
                    <tr key={store.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-3 flex items-center gap-4 border-r-2 border-nb-black">
                        <div className="w-8 h-8 border-2 border-nb-black bg-white text-nb-black font-black flex items-center justify-center text-xs shadow-[2px_2px_0px_#0A0A0A]">
                          {i + 1}
                        </div>
                        <span className="font-extrabold text-nb-black">{store.name}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-black text-gray-700">
                        {store.orderCount} pesanan
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="p-6 text-center text-sm font-bold text-gray-500">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
        </div>

        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-x-auto">
           <table className="w-full min-w-[400px] text-sm text-left">
              <thead className="bg-nb-yellow text-nb-black font-black uppercase tracking-wide border-b-2 border-nb-black">
                <tr>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Produk Terlaris</th>
                  <th className="px-5 py-4 text-right">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {data.topProducts.length > 0 ? (
                  data.topProducts.map((product, i) => (
                    <tr key={product.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-3 flex items-center gap-4 border-r-2 border-nb-black">
                        <div className="w-8 h-8 border-2 border-nb-black bg-white text-nb-black font-black flex items-center justify-center text-xs shadow-[2px_2px_0px_#0A0A0A] shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          <img src={product.thumbnailUrl} alt={product.name} className="w-10 h-10 border-2 border-nb-black object-cover" />
                          <span className="font-extrabold text-nb-black line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-black text-gray-700">
                        {product.sold} unit
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="p-6 text-center text-sm font-bold text-gray-500">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
