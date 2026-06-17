import { Router, Route } from 'preact-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav class="bg-primary text-white p-4 shadow-md flex justify-between items-center">
        <div class="font-bold text-xl tracking-tight">SEAPEDIA</div>
        <div class="flex gap-4">
          <a href="/login" class="hover:text-gray-200 transition-colors">Masuk</a>
          <a href="/register" class="bg-white text-primary px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">Daftar</a>
        </div>
      </nav>
      
      <main class="flex-grow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </Router>
      </main>
      
      <footer class="bg-secondary text-tertiary p-6 text-center text-sm">
        &copy; 2026 SEAPEDIA. All rights reserved.
      </footer>
    </div>
  )
}
