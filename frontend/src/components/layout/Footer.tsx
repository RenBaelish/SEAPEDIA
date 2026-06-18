import { Link } from "react-router-dom";
import { Circle } from "lucide-react";

const footerLinks = {
  Tentang: [
    { label: "Tentang SEAPEDIA", href: "/about" },
    { label: "Karier", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Pusat Media", href: "/media" },
  ],
  Layanan: [
    { label: "Bantuan", href: "/help" },
    { label: "Cara Berjualan", href: "/seller-guide" },
    { label: "Cara Pengiriman", href: "/driver-guide" },
    { label: "SEAPEDIA Affiliate", href: "/affiliate" },
  ],
  Hukum: [
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Syarat & Ketentuan", href: "/terms" },
    { label: "Kebijakan Pengembalian", href: "/returns" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface border-t border-muted mt-auto">
      <div className="page-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-3">
              <img src="/logo-name.png" alt="SEAPEDIA Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-[12px] text-tertiary leading-relaxed mb-4">
              Marketplace multi-peran terpercaya. Belanja apa saja, kirim ke mana saja.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[Circle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-tertiary hover:border-primary hover:text-primary transition-colors"
                  aria-label="Social media"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[12px] font-bold text-secondary mb-3">{section}</h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[12px] text-tertiary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-8 mb-4" />
        <p className="text-[11px] text-tertiary text-center">
           {new Date().getFullYear()} SEAPEDIA. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
