import { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import type { Customer } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Customer>>({ name: '', email: '', phone: '', address: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await customerService.getCustomers();
      setCustomers(res.data.data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setErrorMsg('Failed to load customer list from core registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingId) {
        const res = await customerService.updateCustomer(editingId, form);
        if (!res.data.success) {
          setErrorMsg(res.data.message || 'Failed to update customer');
          return;
        }
      } else {
        const res = await customerService.createCustomer(form);
        if (!res.data.success) {
          setErrorMsg(res.data.message || 'Failed to create customer');
          return;
        }
      }
      setForm({ name: '', email: '', phone: '', address: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCustomers();
    } catch (err: any) {
      console.error('Error saving customer:', err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving customer record.');
    }
  };

  const handleEdit = (c: Customer) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer record?')) return;
    setErrorMsg(null);
    try {
      await customerService.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete customer record.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-28 bg-slate-200 rounded-2xl"></div>
              <div className="h-28 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Title Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-primary" size={24} />
              Customer Master Registry
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add and manage customer shipping profiles for order distribution.
            </p>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm({ name: '', email: '', phone: '', address: '' });
              setErrorMsg(null);
            }}
            className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all
              ${showForm
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none'
                : 'bg-primary text-white hover:bg-primary-dark shadow-primary/10'
              }`}
          >
            {showForm ? 'Cancel' : <Plus size={16} />}
            {showForm ? '' : 'Add Customer'}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5 animate-shake">
            <AlertCircle size={18} />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side: Customers list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Registered Accounts ({customers.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customers.map(c => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200/70 p-5 rounded-2xl shadow-xs glow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-50 pb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">ID: #{c.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">{c.name}</h3>
                    
                    <div className="mt-4 space-y-2 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-normal">{c.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                        <Calendar size={11} />
                        <span>Added: {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-1 border-t border-slate-100 mt-4 pt-3">
                    <button
                      onClick={() => handleEdit(c)}
                      title="Edit Customer"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Customer"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {customers.length === 0 && (
                <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <AlertCircle size={28} className="text-slate-300" />
                  <span className="text-sm font-semibold">No customers cataloged</span>
                  <span className="text-xs text-slate-400">Create a customer profile on the right to start.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className={`lg:block lg:sticky lg:top-24 ${showForm ? 'block' : 'hidden lg:block'} animate-slide-up`}>
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                {editingId ? <Edit2 size={16} className="text-primary" /> : <UserPlus size={18} className="text-primary" />}
                {editingId ? 'Edit Shipping Profile' : 'New Shipping Profile'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@acme.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 02-123-4567"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Shipping Address</label>
                  <textarea
                    rows={4}
                    placeholder="123 Business Rd, Industrial Zone, BKK 10110..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm({ name: '', email: '', phone: '', address: '' });
                        setShowForm(false);
                        setErrorMsg(null);
                      }}
                      className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-3 bg-primary text-white hover:bg-primary-dark px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary/10 w-full"
                  >
                    {editingId ? 'Save Changes' : 'Register Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
