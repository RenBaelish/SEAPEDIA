import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
