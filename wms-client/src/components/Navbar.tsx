import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  Package,
  Layers,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Users,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinkClass = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${
      isActive(path)
        ? "bg-primary/10 text-primary font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }
  `;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:scale-102"
          >
            {/* <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-xl shadow-md shadow-primary/20">
              <span className="text-white font-extrabold text-lg">W</span>
            </div> */}
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-primary to-primary-dark bg-clip-text text-transparent">
              WMS
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-3">
            {user ? (
              <>
                <Link to="/" className={navLinkClass("/")}>
                  <LayoutDashboard size={17} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <Link to="/products" className={navLinkClass("/products")}>
                  <Package size={17} />
                  <span className="hidden md:inline">Products</span>
                </Link>
                <Link to="/categories" className={navLinkClass("/categories")}>
                  <Layers size={17} />
                  <span className="hidden md:inline">Categories</span>
                </Link>
                {(user.role === "Admin" ||
                  user.role === "Operator" ||
                  user.role === "Customer") && (
                  <Link to="/orders" className={navLinkClass("/orders")}>
                    <ShoppingBag size={17} />
                    <span className="hidden md:inline">Orders</span>
                  </Link>
                )}
                {(user.role === "Admin" || user.role === "Operator") && (
                  <Link to="/customers" className={navLinkClass("/customers")}>
                    <Users size={17} />
                    <span className="hidden md:inline">Customers</span>
                  </Link>
                )}
                {user.role === "Admin" && (
                  <Link to="/admin" className={navLinkClass("/admin")}>
                    <ShieldCheck size={17} />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                {/* User Profile Summary */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-primary font-bold text-xs shadow-xs">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-tight">
                      <span className="text-xs font-semibold text-slate-800">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
