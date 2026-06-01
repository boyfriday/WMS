import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export default function Dashboard() {
  const { user, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      authService.me()
        .then((res) => {
          const token = localStorage.getItem('token')!;
          setAuth(token, res.data.data);
        })
        .catch(() => logout());
    }
  }, [user, setAuth, logout]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome, {user?.fullName || 'User'}!
      </h1>
      <p className="text-gray-600 mb-8">
        This is your WMS dashboard. Use the navigation to manage products, categories, and orders.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <p className="text-gray-600 text-sm">Manage your product catalog and inventory.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <p className="text-gray-600 text-sm">Organize products into categories.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-gray-600 text-sm">View and create new orders.</p>
        </div>
      </div>
    </div>
  );
}
