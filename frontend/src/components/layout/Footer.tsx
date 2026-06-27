import { Link } from "react-router-dom";

const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2.3 5.4 3 4.6 3.8 3.7 4.7 3.7 5.2 3.6 8.3 3.4 12 3.4 12 3.4s3.7 0 6.8.2c.4 0 1.4 0 2.2.9.6.8.8 2.5.8 2.5s.2 2 .2 4.1v1.6c0 2.1-.2 4.1-.2 4.1s-.2 1.7-.8 2.5c-.8.9-1.9.8-2.4.9-3.4.2-6.6.2-6.6.2s-3.7 0-6.8-.2c-.5 0-1.4 0-2.2-.9-.6-.8-.8-2.5-.8-2.5s-.2-2-.2-4.1V11.2c0-2.1.2-4.1.2-4.1z"/><polygon points="9.7,15.5 15.7,11.5 9.7,7.5"/></svg>;

const socialIcons = [
  { name: "Facebook", icon: <FacebookIcon />, href: "#" },
  { name: "Instagram", icon: <InstagramIcon />, href: "#" },
  { name: "Twitter", icon: <TwitterIcon />, href: "#" },
  { name: "Youtube", icon: <YoutubeIcon />, href: "#" },
];

const footerLinks = {
  Tentang: [
    { label: "Tentang SEAPEDIA", href: "/coming-soon" },
    { label: "Karier",           href: "/coming-soon" },
    { label: "Blog",             href: "/coming-soon" },
    { label: "Pusat Media",      href: "/coming-soon" },
  ],
  Layanan: [
    { label: "Bantuan",           href: "/coming-soon" },
    { label: "Cara Berjualan",    href: "/coming-soon" },
    { label: "Cara Pengiriman",   href: "/coming-soon" },
    { label: "Affiliate",         href: "/coming-soon" },
  ],
  Hukum: [
    { label: "Kebijakan Privasi",      href: "/coming-soon" },
    { label: "Syarat & Ketentuan",     href: "/coming-soon" },
    { label: "Kebijakan Pengembalian", href: "/coming-soon" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-nb-black text-white border-t-4 border-nb-black mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo-seapedia.png" alt="SEAPEDIA" className="h-14 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-[200px]">
              Marketplace multi-peran terpercaya. Belanja apa saja, kirim ke mana saja.
            </p>
            <div className="flex items-center gap-2">
              {socialIcons.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="w-9 h-9 flex items-center justify-center border-2 border-gray-600 text-gray-400 hover:border-nb-yellow hover:text-nb-yellow hover:bg-gray-800 transition-colors"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-extrabold text-nb-yellow tracking-wider mb-4 pb-2 border-b-2 border-gray-700">
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

        {}
        <div className="mt-10 pt-6 border-t-2 border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} SEAPEDIA. Hak cipta dilindungi. 
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Tugas Peserta (Soal Seleksi) Software Engineering Academy COMPFEST 18
            </p>
          </div>
          <div className="text-xs text-gray-500 font-medium mt-2 md:mt-0">
            Dibuat oleh <a href="https://linkedin.com/in/raffi-rabbani-widyputra" target="_blank" rel="noopener noreferrer" className="text-nb-yellow hover:underline font-bold">Raffi Rabbani Widyputra</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
