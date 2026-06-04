import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { productService, categoryService } from '../services/productService';
import { orderService } from '../services/orderService';
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function Dashboard() {
  const { user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAndFetch = async () => {
      try {
        if (!user) {
          const token = localStorage.getItem('token')!;
          const refreshToken = localStorage.getItem('refreshToken')!;
          const meRes = await authService.me();
          setAuth(token, refreshToken, meRes.data.data);
        }

        // Fetch dashboard statistics in parallel
        const [prodRes, catRes, ordRes] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
          orderService.getOrders(),
        ]);

        const products = (prodRes.data.data || []).filter(p => !p.isDeleted);
        const categories = (catRes.data.data || []).filter(c => !c.isDeleted);
        const orders = ordRes.data.data || [];

        const lowStock = products.filter(p => p.stock < 10).length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        setStats({
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          lowStock,
          pendingOrders,
        });
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
        console.error('Error fetching dashboard stats:', err);
        // logout();
      } finally {
        setLoading(false);
      }
    };

    initAndFetch();
  }, [user, setAuth, logout]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Gradient Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl shadow-xl shadow-indigo-200/50 p-8 sm:p-10 mb-8 text-white">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/95 text-xs font-semibold backdrop-blur-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live & Ready
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome back, {user?.fullName || 'User'}!
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base mb-0">
            Monitor and manage your warehouse catalog, real-time stock levels, and order pipelines with precision.
          </p>
        </div>
        {/* Background decorative visual details */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-y-12 translate-x-12 hidden md:block">
          <TrendingUp size={280} />
        </div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-400 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric Card: Catalog Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Products</span>
            <span className="text-3xl font-extrabold text-slate-800">{stats.products}</span>
            <span className="block text-xs text-slate-500 mt-1">Cataloged items</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
            <Package size={22} />
          </div>
        </div>

        {/* Metric Card: Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Categories</span>
            <span className="text-3xl font-extrabold text-slate-800">{stats.categories}</span>
            <span className="block text-xs text-slate-500 mt-1">Product families</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Layers size={22} />
          </div>
        </div>

        {/* Metric Card: Active Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Orders</span>
            <span className="text-3xl font-extrabold text-slate-800">{stats.orders}</span>
            <span className="block text-xs text-emerald-600 font-semibold mt-1">
              {stats.pendingOrders} Pending approval
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Metric Card: Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stock Alerts</span>
            <span className="text-3xl font-extrabold text-slate-800">{stats.lowStock}</span>
            {stats.lowStock > 0 ? (
              <span className="block text-xs text-rose-500 font-semibold mt-1 animate-pulse">
                Needs restocking
              </span>
            ) : (
              <span className="block text-xs text-slate-500 mt-1">Inventory healthy</span>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.lowStock > 0 ? 'bg-rose-50 text-rose-500 animate-pulse-glow' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Section Header */}
      <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <ClipboardList className="text-primary" size={20} />
        Quick Action Hub
      </h2>

      {/* Interactive Quick Actions Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: New Order */}
        <div
          onClick={() => navigate('/orders')}
          className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
              Create New Order
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Access the interactive checkout desk, configure custom cart selections, and post instant distribution orders.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            Open Desk <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Manage Products */}
        <div
          onClick={() => navigate('/products')}
          className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
              Inventory Catalog
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Examine live units in stock, edit pricing details, create new entries, and restock low catalog items instantly.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            Go to Products <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Manage Categories */}
        <div
          onClick={() => navigate('/categories')}
          className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:border-violet-300 hover:shadow-md hover:shadow-violet-50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-violet-700 transition-colors">
              Product Categories
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Add descriptive tags, create grouping hierarchies, and cluster products to maintain high order classification metrics.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600">
            Browse Categories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Admin Panel Promo */}
      {user?.role === 'Admin' && (
        <div className="mt-8 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Admin Control Center</h4>
              <p className="text-xs text-slate-500">Authorized: Access security logging, user administration, and backend system logs.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Manage System
          </button>
        </div>
      )}
    </div>
  );
}
