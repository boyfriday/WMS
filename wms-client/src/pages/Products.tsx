import { useEffect, useState } from 'react';
import { productService, categoryService } from '../services/productService';
import type { Product, Category } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await productService.updateProduct(editingId, form);
    } else {
      await productService.createProduct(form);
    }
    setForm({ name: '', price: 0, stock: 0, categoryId: '' });
    setEditingId(null);
    setShowForm(false);
    fetchData();
  };

  const handleEdit = (p: Product) => {
    setForm({ ...p });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await productService.deleteProduct(id);
    fetchData();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', price: 0, stock: 0, categoryId: '' }); }}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded px-3 py-2" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" min={0} step={0.01} className="w-full border rounded px-3 py-2" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" min={0} className="w-full border rounded px-3 py-2" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })} required />
            </div>
          </div>
          <button type="submit" className="bg-success text-white px-4 py-2 rounded hover:opacity-90">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.category?.name || '-'}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.stock < 10 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-primary hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-danger hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
