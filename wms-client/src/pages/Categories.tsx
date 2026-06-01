import { useEffect, useState } from 'react';
import { categoryService } from '../services/productService';
import type { Category } from '../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  AlertCircle,
  Bookmark,
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Category>>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
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
      } else {
        await categoryService.createCategory(form);
      }
      setForm({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
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
      fetchCategories();
    } catch (err) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-primary" size={24} />
            Product Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Group your warehouse products into structural hierarchies.
          </p>
        </div>
        
        {/* Toggle form button for mobile */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', description: '' });
          }}
          className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all
            ${showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none'
              : 'bg-primary text-white hover:bg-primary-dark shadow-primary/10'
            }`}
        >
          {showForm ? 'Cancel' : <Plus size={16} />}
          {showForm ? '' : 'Add Category'}
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Category Grid Card Display */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Registered Categories ({categories.length})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(c => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/70 p-5 rounded-2xl shadow-xs glow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
                      <Bookmark size={16} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">ID: #{c.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">{c.name}</h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {c.description || 'No description provided for this family tag.'}
                  </p>
                </div>
                
                {/* Actions at the bottom */}
                <div className="flex justify-end gap-1 border-t border-slate-100 mt-4 pt-3">
                  <button
                    onClick={() => handleEdit(c)}
                    title="Edit category"
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete category"
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <AlertCircle size={28} className="text-slate-300 animate-pulse" />
                <span className="text-sm font-semibold">No categories cataloged</span>
                <span className="text-xs text-slate-400">Add a structural category classification on the right.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Add / Edit Form Card */}
        <div className={`lg:block lg:sticky lg:top-24 ${showForm ? 'block' : 'hidden lg:block'} animate-slide-up`}>
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              {editingId ? <Edit2 size={16} className="text-primary" /> : <FolderPlus size={18} className="text-primary" />}
              {editingId ? 'Edit Grouping Tag' : 'Create Grouping Tag'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  rows={4}
                  placeholder="Summarize the core inventory types grouped under this tag..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none text-slate-800"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: '', description: '' });
                      setShowForm(false);
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
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
