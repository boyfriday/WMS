import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import type { Order, Product } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
      ]);
      setOrders(oRes.data.data);
      setProducts(pRes.data.data.filter(p => p.stock > 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (productId: string) => {
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(c => c.productId !== productId));
    } else {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return alert('Please add items to cart');
    await orderService.createOrder({ items: cart });
    setCart([]);
    setShowForm(false);
    fetchData();
  };

  const statusColor: Record<string, string> = {
    Pending: 'bg-warning/10 text-warning',
    Confirmed: 'bg-primary/10 text-primary',
    Shipped: 'bg-secondary/10 text-secondary',
    Delivered: 'bg-success/10 text-success',
    Cancelled: 'bg-danger/10 text-danger',
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => { setShowForm(!showForm); setCart([]); }}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          {showForm ? 'Cancel' : 'New Order'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-4">Create Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Available Products</h4>
              <div className="border rounded max-h-64 overflow-y-auto">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">${p.price} | Stock: {p.stock}</div>
                    </div>
                    <button onClick={() => addToCart(p.id)} className="text-primary text-sm font-medium hover:underline">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Cart</h4>
              {cart.length === 0 ? (
                <div className="text-gray-500 text-sm">No items added</div>
              ) : (
                <div className="space-y-2">
                  {cart.map(c => {
                    const p = products.find(x => x.id === c.productId);
                    return (
                      <div key={c.productId} className="flex justify-between items-center border rounded px-3 py-2">
                        <span className="text-sm">{p?.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(c.productId, c.quantity - 1)} className="w-6 h-6 bg-gray-100 rounded">-</button>
                          <span className="text-sm w-6 text-center">{c.quantity}</span>
                          <button onClick={() => updateQty(c.productId, c.quantity + 1)} className="w-6 h-6 bg-gray-100 rounded">+</button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={handleSubmit} className="w-full bg-success text-white py-2 rounded hover:opacity-90 mt-2">
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold">Order #{o.id.slice(0, 8)}</div>
                <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[o.status] || 'bg-gray-100'}`}>
                {o.status}
              </span>
            </div>
            <div className="space-y-1">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName} x {item.quantity}</span>
                  <span className="text-gray-600">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>${o.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-center text-gray-500 py-8">No orders found</div>}
      </div>
    </div>
  );
}
