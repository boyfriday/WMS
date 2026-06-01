import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from '../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { token, user } = res.data.data;
      setAuth(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 sm:px-6">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl shadow-slate-100/50 w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand visual header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 mb-4 animate-bounce">
            <span className="text-white font-extrabold text-2xl">W</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">WMS Gateway</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Sign in to control warehouse operations</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-2xl mb-5 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="developer@wms.com"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authorizing Portal...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Enter System</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="text-center mt-6 text-xs font-medium text-slate-500">
          New to the distributed console?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create an Operator Account
          </Link>
        </p>
      </div>
    </div>
  );
}
