import { Router, Route } from 'preact-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleSelection } from './pages/RoleSelection';
import { SellerDashboard } from './pages/dashboard/SellerDashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Wallet } from './pages/Wallet';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Account } from './pages/Account';

export function App() {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav class="bg-white p-4 shadow-sm flex justify-between items-center border-b border-gray-100">
        <a href="/">
          <img src="/logo-name.png" alt="SEAPEDIA" class="h-8 w-auto" />
        </a>
        <div class="flex gap-4 items-center">
          <a href="/seller-dashboard" class="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">Toko Saya</a>
          <a href="/wallet" class="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">Wallet</a>
          <a href="/cart" class="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">Keranjang</a>
          <a href="/orders" class="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">Pesanan</a>
          <a href="/account" class="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">Akun</a>
          <a href="/login" class="text-gray-600 font-semibold hover:text-primary transition-colors">Masuk</a>
          <a href="/register" class="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">Daftar</a>
        </div>
      </nav>
      
      <main class="flex-grow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/role-selection" component={RoleSelection} />
          <Route path="/seller-dashboard" component={SellerDashboard} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/cart" component={Cart} />
          <Route path="/orders" component={Orders} />
          <Route path="/account" component={Account} />
        </Router>
      </main>
      
      <footer class="bg-secondary text-tertiary p-6 text-center text-sm">
        &copy; 2026 SEAPEDIA. All rights reserved.
      </footer>
    </div>
  )
}
