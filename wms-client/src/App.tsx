import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Admin from './pages/Admin';
import PrintOrder from './pages/PrintOrder';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';

function App() {
  const { init, setAuth, logout } = useAuthStore();

  useEffect(() => {
    init();
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token && refreshToken) {
      authService.me()
        .then((res) => setAuth(token, refreshToken, res.data.data))
        .catch(() => logout());
    }
  }, [init, setAuth, logout]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute allowedRoles={['Admin', 'Operator', 'Warehouse']}><Products /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute allowedRoles={['Admin', 'Operator', 'Warehouse']}><Categories /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['Admin', 'Operator']}><Orders /></ProtectedRoute>} />
        <Route path="/orders/print/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Operator']}><PrintOrder /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Operator']}><Customers /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><Admin /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
