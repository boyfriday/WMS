import { useEffect, useState } from 'react';
import { categoryService } from '../services/productService';
import type { Category } from '../types';

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
      setCategories(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await categoryService.updateCategory(editingId, form);
    } else {
      await categoryService.createCategory(form);
    }
    setForm({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    fetchCategories();
  };

  const handleEdit = (c: Category) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await categoryService.deleteCategory(id);
    fetchCategories();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '' }); }}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" className="bg-success text-white px-4 py-2 rounded hover:opacity-90">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.description || '-'}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-primary hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-danger hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
