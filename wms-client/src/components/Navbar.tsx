import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold">WMS</Link>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/products" className="hover:opacity-80">Products</Link>
                <Link to="/categories" className="hover:opacity-80">Categories</Link>
                <Link to="/orders" className="hover:opacity-80">Orders</Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="hover:opacity-80">Admin</Link>
                )}
                <span className="text-sm opacity-90">{user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-primary px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:opacity-80">Login</Link>
                <Link to="/register" className="hover:opacity-80">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
