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
    return <div className="p-8 text-center text-gray-500">Memuat data analitik...</div>;
  }

  // Format data for Recharts
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
          <h1 className="text-2xl font-bold text-gray-800">Analitik Lanjutan</h1>
          <p className="text-sm text-gray-500 mt-1">Laporan mendalam mengenai toko dan produk terlaris.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Store size={18} className="text-purple-600" /> Top Toko Terlaris
            </h2>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div className="p-6 h-[300px]">
            {storeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Pesanan" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Belum ada data</div>
            )}
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-orange-600" /> Penjualan Produk (Unit)
            </h2>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div className="p-6 h-[300px]">
            {productChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="Terjual" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrange)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Belum ada data</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Tables as fallbacks below charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Nama Toko</th>
                  <th className="px-5 py-3 text-right">Total Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topStores.length > 0 ? (
                  data.topStores.map((store, i) => (
                    <tr key={store.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          {i + 1}
                        </div>
                        <span className="font-bold text-gray-800">{store.name}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-700">
                        {store.orderCount} pesanan
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Produk Terlaris</th>
                  <th className="px-5 py-3 text-right">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topProducts.length > 0 ? (
                  data.topProducts.map((product, i) => (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <img src={product.thumbnailUrl} alt={product.name} className="w-8 h-8 rounded border border-gray-200 object-cover" />
                          <span className="font-bold text-gray-800 line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-700">
                        {product.sold} unit
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
