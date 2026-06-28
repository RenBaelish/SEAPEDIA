import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { ShoppingBag, Ticket, CheckCircle2, Package, Truck, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'PROMO' | 'ORDER';
  title: string;
  message: string;
  date: string;
  read: boolean;
  orderId?: string;
  status?: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch orders to simulate dynamic notifications
    api.get('/orders')
      .then(res => {
        const orders = res.data.data;
        const generatedNotifs: Notification[] = [];
        
        // Static Promos
        generatedNotifs.push({
          id: 'promo-1',
          type: 'PROMO',
          title: 'Diskon Spesial 50%!',
          message: 'Gunakan kode SEAPEDIA50 untuk mendapatkan potongan harga hingga Rp 50.000 pada pembelian pertamamu.',
          date: new Date().toISOString(),
          read: false
        });

        // Dynamic Orders
        orders.forEach((order: any) => {
          let title = '';
          let message = '';
          if (order.status === 'PENDING_PAYMENT') {
            title = 'Menunggu Pembayaran';
            message = `Pesanan #${order.id.slice(0, 8).toUpperCase()} menunggu pembayaran Anda.`;
          } else if (order.status === 'PROCESSING') {
            title = 'Pesanan Diproses';
            message = `Pesanan #${order.id.slice(0, 8).toUpperCase()} sedang dikemas oleh penjual.`;
          } else if (order.status === 'SHIPPED') {
            title = 'Pesanan Dikirim';
            message = `Pesanan #${order.id.slice(0, 8).toUpperCase()} sedang dalam perjalanan ke alamat Anda.`;
          } else if (order.status === 'COMPLETED') {
            title = 'Pesanan Selesai';
            message = `Pesanan #${order.id.slice(0, 8).toUpperCase()} telah selesai. Jangan lupa berikan ulasan!`;
          } else {
            return; // Skip others
          }

          generatedNotifs.push({
            id: order.id,
            type: 'ORDER',
            title,
            message,
            date: order.createdAt,
            read: true,
            orderId: order.id,
            status: order.status
          });
        });

        setNotifications(generatedNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .catch(() => {
        // Fallback promos if not logged in or error
        setNotifications([
          {
            id: 'promo-1',
            type: 'PROMO',
            title: 'Diskon Spesial 50%!',
            message: 'Gunakan kode SEAPEDIA50 untuk mendapatkan potongan harga hingga Rp 50.000 pada pembelian pertamamu.',
            date: new Date().toISOString(),
            read: false
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string, status?: string) => {
    if (type === 'PROMO') return <Ticket size={24} className="text-white" />;
    if (status === 'PROCESSING') return <Package size={24} className="text-white" />;
    if (status === 'SHIPPED') return <Truck size={24} className="text-white" />;
    if (status === 'COMPLETED') return <CheckCircle2 size={24} className="text-white" />;
    return <ShoppingBag size={24} className="text-white" />;
  };

  const getBgColor = (type: string, status?: string) => {
    if (type === 'PROMO') return 'bg-nb-red';
    if (status === 'PROCESSING') return 'bg-nb-blue';
    if (status === 'SHIPPED') return 'bg-nb-green';
    if (status === 'COMPLETED') return 'bg-nb-black';
    return 'bg-gray-600';
  };

  return (
    <div className="bg-[#F7F5F0] min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-nb-black">
          <div>
            <h1 className="text-3xl font-black text-nb-black tracking-tight nb-section-title">Notifikasi</h1>
            <p className="text-sm font-bold text-gray-500 mt-2">Pembaruan pesanan & promo terbaru</p>
          </div>
          <div className="p-3 bg-nb-yellow border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
            <BellIcon size={32} strokeWidth={2.5} className="text-nb-black" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-500">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 font-bold text-gray-500 border-3 border-dashed border-gray-400">Belum ada notifikasi.</div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex gap-4 p-5 bg-white border-3 border-nb-black transition-all hover:-translate-x-1 hover:-translate-y-1 ${!notif.read ? 'shadow-[5px_5px_0px_#FFE600]' : 'shadow-[4px_4px_0px_#0A0A0A] opacity-90'}`}
                style={{ borderWidth: '3px' }}
              >
                <div className={`w-14 h-14 shrink-0 flex items-center justify-center border-2 border-nb-black ${getBgColor(notif.type, notif.status)}`}>
                  {getIcon(notif.type, notif.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-extrabold text-nb-black text-lg line-clamp-1">{notif.title}</h3>
                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap mt-1">
                      {new Date(notif.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  
                  {notif.type === 'PROMO' && (
                    <button className="mt-3 px-4 py-1.5 bg-nb-yellow border-2 border-nb-black text-xs font-black shadow-[2px_2px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_#0A0A0A] transition-all">
                      Gunakan Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// Inline Bell icon since it's missing in import block
function BellIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
