import { Router, Route } from 'preact-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleSelection } from './pages/RoleSelection';
import { SellerDashboard } from './pages/dashboard/SellerDashboard';
import { DriverDashboard } from './pages/dashboard/DriverDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Wallet } from './pages/Wallet';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Account } from './pages/Account';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div class="min-h-screen bg-bg flex flex-col font-sans">
      <Navbar />
      
      <main class="flex-grow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/role-selection" component={RoleSelection} />
          <Route path="/seller-dashboard" component={SellerDashboard} />
          <Route path="/driver-dashboard" component={DriverDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/cart" component={Cart} />
          <Route path="/orders" component={Orders} />
          <Route path="/account" component={Account} />
        </Router>
      </main>
      
      <Footer />
    </div>
  )
}
