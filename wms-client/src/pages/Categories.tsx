import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { categoryService } from '../services/productService';
import type { Category } from '../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Bookmark,
  Search,
  X,
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Category>>({ name: '', description: '', isDeleted: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load categories.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, form);
        toast.success('Category updated successfully!');
      } else {
        await categoryService.createCategory(form);
        toast.success('Category created successfully!');
      }
      setForm({ name: '', description: '', isDeleted: false });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (c: Category) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
    // Smooth scroll to top/form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
      console.error('Error deleting category:', err);
    }
  };

  if (loading) {
    return (
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
    );
  }

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-primary" size={24} />
            Product Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Group your warehouse products into structural hierarchies.
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', description: '', isDeleted: false });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5
            ${showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none'
              : 'bg-primary text-white hover:bg-primary-dark shadow-primary/10 hover:shadow-primary/20'
            }`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Close Form' : 'Add Category'}
        </button>
      </div>

      {/* Accordion / Drawer style Creation and Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md mb-8 animate-slide-up">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={16} className="text-primary" /> : <Plus size={18} className="text-primary" />}
            {editingId ? 'Edit Grouping Tag' : 'Create Grouping Tag'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Peripherals"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core inventory types grouped under this tag..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.isDeleted ? 'deleted' : 'active'}
                  onChange={e => setForm({ ...form, isDeleted: e.target.value === 'deleted' })}
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
                  setEditingId(null);
                  setForm({ name: '', description: '', isDeleted: false });
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary/10"
              >
                {editingId ? 'Save Changes' : 'Create Category'}
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
            placeholder="Search categories by name or description..."
            className="w-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table Display */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Category Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCategories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Category Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
                        <Bookmark size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          {c.name}
                          {c.isDeleted && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50">
                              Deleted
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium font-mono">ID: #{c.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Description */}
                  <td className="px-6 py-4">
                    <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                      {c.description || 'No description provided for this family tag.'}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        title="Edit category"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete category"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={28} className="text-slate-300 animate-pulse" />
                      <span className="text-sm font-semibold">No categories found</span>
                      <span className="text-xs text-slate-400">Add a structural category classification using the "Add Category" button.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
