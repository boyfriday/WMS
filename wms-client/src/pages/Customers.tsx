import { useEffect, useState } from "react";
import { toast } from "sonner";
import { customerService } from "../services/customerService";
import type { Customer } from "../types";
import { useAuthStore } from "../store/authStore";
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
  Search,
  X,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Customers() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await customerService.getCustomers();
      setCustomers(res.data.data || []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      const errMsg = "Failed to load customer list from core registry.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
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
          const errMsg = res.data.message || "Failed to update customer";
          setErrorMsg(errMsg);
          toast.error(errMsg);
          return;
        }
        toast.success("Customer profile updated successfully!");
      } else {
        const res = await customerService.createCustomer(form);
        if (!res.data.success) {
          const errMsg = res.data.message || "Failed to create customer";
          setErrorMsg(errMsg);
          toast.error(errMsg);
          return;
        }
        toast.success("Customer profile registered successfully!");
      }
      setForm({ name: "", email: "", phone: "", address: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCustomers();
    } catch (err: any) {
      console.error("Error saving customer:", err);
      const errMsg =
        err.response?.data?.message ||
        "Error occurred while saving customer record.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const handleEdit = (c: Customer) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this customer record?",
      )
    )
      return;
    setErrorMsg(null);
    try {
      await customerService.deleteCustomer(id);
      toast.success("Customer record deleted successfully!");
      fetchCustomers();
    } catch (err: any) {
      console.error("Error deleting customer:", err);
      const errMsg =
        err.response?.data?.message || "Failed to delete customer record.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["Admin", "Operator"]}>
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

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q);
  });

  return (
    <ProtectedRoute allowedRoles={["Admin", "Operator"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-primary" size={24} />
              Customers
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add and manage customer shipping profiles for order distribution.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm({ name: "", email: "", phone: "", address: "" });
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5
              ${
                showForm
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none"
                  : "bg-primary text-white hover:bg-primary-dark shadow-primary/10 hover:shadow-primary/20"
              }`}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close Form" : "Add Customer"}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5 animate-shake">
            <AlertCircle size={18} />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Accordion / Drawer style Creation and Edit Form */}
        {showForm && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md mb-8 animate-slide-up">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              {editingId ? (
                <Edit2 size={16} className="text-primary" />
              ) : (
                <UserPlus size={18} className="text-primary" />
              )}
              {editingId ? "Edit Shipping Profile" : "New Shipping Profile"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@acme.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 02-123-4567"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Shipping Address
                </label>
                <textarea
                  rows={2}
                  placeholder="123 Business Rd, Industrial Zone, BKK 10110..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                    });
                    setShowForm(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary/10"
                >
                  {editingId ? "Save Changes" : "Register Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search customers by name, email, phone or address..."
              className="w-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Customers Table Display */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Shipping Address
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
                          <Users size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium font-mono">
                            ID: #{c.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 max-w-xs md:max-w-md">
                        <MapPin
                          size={12}
                          className="text-slate-400 mt-0.5 shrink-0"
                        />
                        <span className="line-clamp-2 leading-relaxed">
                          {c.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        {user?.role === "Admin" && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Delete Customer"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={28} className="text-slate-300 animate-pulse" />
                        <span className="text-sm font-semibold">
                          No customers found
                        </span>
                        <span className="text-xs text-slate-400">
                          Add a customer profile using the button above.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
