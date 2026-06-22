import { Link } from "react-router-dom";

const footerLinks = {
  Tentang: [
    { label: "Tentang SEAPEDIA", href: "/about" },
    { label: "Karier",           href: "/careers" },
    { label: "Blog",             href: "/blog" },
    { label: "Pusat Media",      href: "/media" },
  ],
  Layanan: [
    { label: "Bantuan",           href: "/help" },
    { label: "Cara Berjualan",    href: "/seller-guide" },
    { label: "Cara Pengiriman",   href: "/driver-guide" },
    { label: "Affiliate",         href: "/affiliate" },
  ],
  Hukum: [
    { label: "Kebijakan Privasi",      href: "/privacy" },
    { label: "Syarat & Ketentuan",     href: "/terms" },
    { label: "Kebijakan Pengembalian", href: "/returns" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-nb-black text-white border-t-4 border-nb-black mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              {/* White-ish logo on dark background */}
              <div className="bg-nb-yellow inline-block px-3 py-1.5 border-2 border-white">
                <span className="font-extrabold text-nb-black text-lg tracking-tight">SEAPEDIA</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-[200px]">
              Marketplace multi-peran terpercaya. Belanja apa saja, kirim ke mana saja.
            </p>
            <div className="flex items-center gap-2">
              {["FB", "IG", "TW", "YT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center border-2 border-gray-600 text-gray-400 font-bold text-xs hover:border-nb-yellow hover:text-nb-yellow hover:bg-gray-800 transition-colors"
                  aria-label={s}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-extrabold text-nb-yellow uppercase tracking-widest mb-4 pb-2 border-b-2 border-gray-700">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-nb-yellow transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t-2 border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SEAPEDIA. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-nb-yellow inline-block" />
            <span className="text-xs text-gray-500 font-medium">Made with passion in Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
