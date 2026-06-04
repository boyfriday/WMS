import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productService, categoryService } from "../services/productService";
import type { Product, Category } from "../types";
import { useAuthStore } from "../store/authStore";
import {
  Package,
  Plus,
  X,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Boxes,
  PlusCircle,
} from "lucide-react";

export default function Products() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    categoryId: "",
    isDeleted: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Receive stock modal states
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveProduct, setReceiveProduct] = useState<Product | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState(0);

  const handleReceiveStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveProduct || receiveQuantity <= 0) return;
    try {
      await productService.receiveStock(receiveProduct.id, receiveQuantity);
      toast.success(
        `Received ${receiveQuantity} units for ${receiveProduct.name}`,
      );
      setShowReceiveModal(false);
      setReceiveProduct(null);
      setReceiveQuantity(0);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to receive stock.");
      console.error("Error receiving stock:", err);
    }
  };

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err: any) {
      toast.error("Failed to load catalog data.");
      console.error("Error fetching catalog data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.updateProduct(editingId, form);
        toast.success("Product updated successfully!");
      } else {
        await productService.createProduct(form);
        toast.success("Product created successfully!");
      }
      setForm({ name: "", price: 0, stock: 0, categoryId: "", isDeleted: false });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product.");
      console.error("Error saving product:", err);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({ ...p });
    setEditingId(p.id);
    setShowForm(true);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "" || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Banner and Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="text-primary" size={24} />
            Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and manage your warehouse products.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", price: 0, stock: 0, categoryId: "", isDeleted: false });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5
            ${
              showForm
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none"
                : "bg-primary text-white hover:bg-primary-dark shadow-primary/10 hover:shadow-primary/20"
            }`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close Form" : "Add Product"}
        </button>
      </div>

      {/* Accordion / Drawer style Creation and Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md mb-8 animate-slide-up">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            {editingId ? (
              <Edit2 size={16} className="text-primary" />
            ) : (
              <Plus size={18} className="text-primary" />
            )}
            {editingId ? "Edit Catalog Entry" : "Create Catalog Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Keyboard"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(c => !c.isDeleted || c.id === form.categoryId).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Stock Level
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.isDeleted ? "deleted" : "active"}
                  onChange={(e) =>
                    setForm({ ...form, isDeleted: e.target.value === "deleted" })
                  }
                >
                  <option value="active">Active</option>
                  <option value="deleted">Deleted (Hidden on other pages)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ name: "", price: 0, stock: 0, categoryId: "", isDeleted: false });
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary/10"
              >
                {editingId ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filtering Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search products by name..."
            className="w-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <Filter
            size={15}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <select
            className="w-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none bg-white appearance-none"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.filter(c => !c.isDeleted).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Product Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
                        <Boxes size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          {p.name}
                          {p.isDeleted && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50">
                              Deleted
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium font-mono">
                          ID: #{p.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${p.category?.isDeleted ? 'bg-rose-50 text-rose-700 border border-rose-100/50' : 'bg-slate-100 text-slate-700'}`}>
                      {p.category?.name || "Uncategorized"}
                      {p.category?.isDeleted && " (Deleted)"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    ${p.price.toFixed(2)}
                  </td>

                  {/* Stock Level Badge */}
                  <td className="px-6 py-4">
                    {p.stock < 10 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        Low Stock: {p.stock}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        In Stock: {p.stock}
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {(user?.role === "Admin" ||
                        user?.role === "Warehouse") && (
                        <button
                          onClick={() => {
                            setReceiveProduct(p);
                            setReceiveQuantity(0);
                            setShowReceiveModal(true);
                          }}
                          title="Receive Stock"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <PlusCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(p)}
                        title="Edit entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Delete product"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={28} className="text-slate-300" />
                      <span className="text-sm font-medium">
                        No products found
                      </span>
                      <span className="text-xs text-slate-400">
                        Try adjusting your search criteria.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {showReceiveModal && receiveProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Boxes className="text-primary" size={20} />
                Receive Inventory Stock
              </h3>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReceiveStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Product
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium">
                  {receiveProduct.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Current Stock
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-semibold font-mono">
                    {receiveProduct.stock}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Qty to Receive
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800 font-mono"
                    value={receiveQuantity || ""}
                    onChange={(e) =>
                      setReceiveQuantity(parseInt(e.target.value) || 0)
                    }
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/10"
                >
                  Receive Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
