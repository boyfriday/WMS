import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { AlertTriangle, Clock, RefreshCw, LogOut } from "lucide-react";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function TokenExpiryMonitor() {
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRenewing, setIsRenewing] = useState(false);
  const timerRef = useRef<any>(null);

  // Warning threshold in seconds
  const WARNING_THRESHOLD = 60;

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const checkTokenExpiry = () => {
      // Read directly from localStorage to sync token refreshes across tabs
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        handleAutoLogout("No session token found. Please log in.");
        return;
      }

      const decoded = parseJwt(currentToken);
      if (!decoded || !decoded.exp) {
        handleAutoLogout("Invalid session token. Please log in again.");
        return;
      }

      const expTime = decoded.exp; // Unix timestamp in seconds
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingSeconds = expTime - currentTime;

      if (remainingSeconds <= 0) {
        handleAutoLogout("Session expired. You have been logged out.");
      } else if (remainingSeconds <= WARNING_THRESHOLD) {
        setTimeLeft(remainingSeconds);
        setIsOpen(true);
      } else {
        // If token was refreshed in another tab/request, close the warning modal
        setIsOpen(false);
      }
    };

    // Run initial check
    checkTokenExpiry();

    // Check every second
    timerRef.current = setInterval(checkTokenExpiry, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, logout, navigate]);

  const handleAutoLogout = (message: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    logout();
    setIsOpen(false);
    toast.error(message, { duration: 5000 });
    navigate("/login");
  };

  const handleRenew = async () => {
    const activeToken = localStorage.getItem("token");
    const activeRefreshToken = localStorage.getItem("refreshToken");

    if (!activeToken || !activeRefreshToken) {
      handleAutoLogout("Session tokens missing. Please log in.");
      return;
    }

    setIsRenewing(true);
    try {
      const res = await authService.refresh(activeToken, activeRefreshToken);
      if (res.data.success && res.data.data) {
        const { token: newToken, refreshToken: newRefreshToken, user: updatedUser } = res.data.data;
        setAuth(newToken, newRefreshToken, updatedUser || user);
        setIsOpen(false);
        toast.success("Session extended successfully!");
      } else {
        handleAutoLogout("Failed to renew session. Please log in again.");
      }
    } catch (err: any) {
      console.error("Error renewing token:", err);
      handleAutoLogout("Session renewal failed. Please log in again.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleLogoutClick = () => {
    handleAutoLogout("Logged out successfully.");
  };

  if (!isOpen) return null;

  // Percentage of remaining time (for warning bar)
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / WARNING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-auto animate-scale-up relative overflow-hidden">
        {/* Expiring Visual Progress Alert Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 30 ? "bg-amber-500" : "bg-rose-600 animate-pulse"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              timeLeft > 30
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-rose-50 text-rose-600 border border-rose-100 animate-bounce"
            }`}
          >
            {timeLeft > 30 ? <Clock size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Session Expiring Soon
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your security session token is about to expire. To protect your data, you will be automatically logged out unless you extend your session.
            </p>
          </div>
        </div>

        {/* Time Remaining Counter */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between mb-5">
          <span className="text-xs font-semibold text-slate-500">Auto logout in:</span>
          <span
            className={`text-lg font-black font-mono tracking-tight flex items-center gap-1 ${
              timeLeft > 10 ? "text-slate-800" : "text-rose-600 animate-pulse"
            }`}
          >
            <Clock size={16} />
            {timeLeft}s
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleLogoutClick}
            disabled={isRenewing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <LogOut size={14} />
            Log Out
          </button>
          <button
            onClick={handleRenew}
            disabled={isRenewing}
            className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-primary/20"
          >
            {isRenewing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {isRenewing ? "Renewing..." : "Extend Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
