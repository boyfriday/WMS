import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import type { Order, Product, Customer } from '../types';
import {
  ShoppingBag,
  Plus,
  X,
  Search,
  ShoppingCart,
  Minus,
  Check,
  Calendar,
  AlertCircle,
  Truck,
  CheckCircle2,
  Hourglass,
  Receipt,
  Tag,
  Users,
  MapPin,
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  
  // Search products inside checkout
  const [searchQuery, setSearchQuery] = useState('');

  // Claim modal states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimOrder, setClaimOrder] = useState<Order | null>(null);
  const [claimQuantities, setClaimQuantities] = useState<Record<string, number>>({});

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handlePrintInvoice = (id: string) => {
    window.open(`/orders/print/${id}`, '_blank');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOrder) return;
    const itemsToClaim = Object.entries(claimQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (itemsToClaim.length === 0) {
      alert('Please enter a claim quantity for at least one item.');
      return;
    }

    try {
      await orderService.claimItems(claimOrder.id, itemsToClaim);
      setShowClaimModal(false);
      setClaimOrder(null);
      setClaimQuantities({});
      fetchData();
    } catch (err) {
      console.error('Error submitting claim:', err);
      alert('Failed to process claim. Make sure you are not claiming more than the remaining purchasable quantity.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, pRes, cRes] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
        customerService.getCustomers(),
      ]);
      setOrders(oRes.data.data || []);
      setProducts((pRes.data.data || []).filter(p => p.stock > 0));
      setCustomers(cRes.data.data || []);
    } catch (err) {
      console.error('Error loading order data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      if (existing.quantity >= p.stock) {
        alert(`Cannot add more. Only ${p.stock} units available in inventory.`);
        return;
      }
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const updateQty = (productId: string, qty: number) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    if (qty > p.stock) {
      alert(`Only ${p.stock} units available in stock.`);
      return;
    }
    if (qty <= 0) {
      setCart(cart.filter(c => c.productId !== productId));
    } else {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return alert('Please add items to cart');
    if (!selectedCustomerId) return alert('Please select a shipping customer');
    try {
      await orderService.createOrder({ items: cart, customerId: selectedCustomerId });
      setCart([]);
      setSelectedCustomerId('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Error placing order:', err);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    ordering: 'bg-blue-50 text-blue-700 border-blue-100',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Hourglass size={14} />,
    ordering: <Truck size={14} />,
    completed: <CheckCircle2 size={14} />,
    rejected: <X size={14} />,
  };

  const statusThaiLabels: Record<string, string> = {
    pending: 'รอขนส่ง',
    ordering: 'กำลังขนส่ง',
    completed: 'สำเร็จ',
    rejected: 'ถูกยกเลิก',
  };

  // Get status stage step index for tracking line
  const getStatusStepIndex = (status: string) => {
    const steps = ['pending', 'ordering', 'completed'];
    return steps.indexOf(status);
  };

  // Filter products by checkout search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart total calculator
  const cartSubtotal = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.productId);
    return sum + (p?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary" size={24} />
            Order Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer distribution orders and launch checkout workflows.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setCart([]);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5
            ${showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none'
              : 'bg-primary text-white hover:bg-primary-dark shadow-primary/10 hover:shadow-primary/20'
            }`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Close Sales Desk' : 'New Order'}
        </button>
      </div>

      {/* Interactive Checkout Drawer / Sales Desk */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
          <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingCart size={18} className="text-primary animate-bounce" />
            Interactive Sales Desk & Checkout
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column (3/5 width): Catalog Picker */}
            <div className="lg:col-span-3 space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick lookup items in stock..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all text-slate-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border border-slate-100 rounded-2xl max-h-[360px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 hover:bg-white transition-colors">
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        ${p.price.toFixed(2)} | <span className="font-semibold text-slate-500">In Stock: {p.stock}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-1.5">
                    <AlertCircle size={22} className="text-slate-300" />
                    <span className="text-xs font-semibold">No available items found</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (2/5 width): Glassmorphic Cart Sidebar */}
            <div className="lg:col-span-2 bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Shopping Cart ({cart.length})
                </h4>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map(item => {
                    const p = products.find(x => x.id === item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-2xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">${p.price.toFixed(2)} / unit</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {cart.length === 0 && (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-1">
                      <ShoppingBag size={24} className="text-slate-300 animate-pulse" />
                      <span className="text-xs font-medium">Cart is empty</span>
                      <span className="text-[10px] text-slate-400">Select items from the catalog.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Calculation and Button */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200/80 mt-5 pt-4 space-y-3">
                  {/* Customer Picker */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Users size={12} className="text-slate-400" />
                      Shipping Target Customer
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all text-slate-800 font-semibold"
                      required
                    >
                      <option value="">-- Choose Shipping Target --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 font-medium pt-2 border-t border-dashed border-slate-200">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-dashed border-slate-200 pt-2">
                    <span>Total Amount</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full mt-2 bg-success text-white hover:opacity-90 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-success/15 flex items-center justify-center gap-1.5"
                  >
                    <Receipt size={14} />
                    Place Distribution Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List Display */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
          Active Invoices & Logs ({orders.length})
        </h2>

        {orders.map(o => (
          <div
            key={o.id}
            className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-800 tracking-tight">Invoice #{o.id.slice(0, 8)}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                    <Calendar size={11} />
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor[o.status] || 'bg-slate-50'}`}>
                  {statusIcons[o.status]}
                  {statusThaiLabels[o.status] || o.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline Tracker (For active non-cancelled stages) */}
            {o.status !== 'rejected' && (
              <div className="mb-6 max-w-xl mx-auto px-4">
                <div className="relative flex justify-between items-center w-full">
                  {/* Background Progress Bar */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
                  
                  {/* Colored active fill line */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-500"
                    style={{
                      width: `${(getStatusStepIndex(o.status) / 2) * 100}%`,
                    }}
                  ></div>

                  {/* Stepper points */}
                  {['pending', 'ordering', 'completed'].map((step, idx) => {
                    const stepIdx = getStatusStepIndex(o.status);
                    const isCompleted = idx <= stepIdx;
                    const isActive = idx === stepIdx;

                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300
                            ${isCompleted
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
                              : 'bg-white border-slate-200 text-slate-400'
                            }
                            ${isActive ? 'scale-120 ring-4 ring-primary/10' : ''}`}
                        >
                          {isCompleted ? <Check size={10} /> : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-1.5 ${isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                          {statusThaiLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split layout for manifest and shipping info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Item lists */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-2.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Itemized Manifest</span>
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-none">{item.productName}</span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-md bg-white border border-slate-100 font-semibold font-mono">
                        x{item.quantity}
                      </span>
                      {item.returnedQuantity > 0 && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-100/60 font-semibold">
                          Returned: {item.returnedQuantity}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-800 font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Details */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-2.5 text-xs text-slate-600">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Truck size={12} className="text-slate-400" />
                  Shipping Destination
                </span>
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users size={12} className="text-slate-400" />
                  {o.customerName || 'N/A'}
                </div>
                <div className="flex items-start gap-1.5 mt-1 leading-relaxed">
                  <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{o.customerAddress || 'No shipping address provided.'}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3.5 mt-3.5">
              <div className="flex flex-wrap gap-2">
                {o.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'ordering')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                    >
                      <Truck size={12} />
                      Ship Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 border border-rose-100"
                    >
                      <X size={12} />
                      Cancel Order
                    </button>
                  </>
                )}
                {o.status === 'ordering' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-100"
                    >
                      <CheckCircle2 size={12} />
                      Complete Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 border border-rose-100"
                    >
                      <X size={12} />
                      Cancel Order
                    </button>
                  </>
                )}
                {o.status === 'completed' && (
                  <button
                    onClick={() => handlePrintInvoice(o.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-1 border border-indigo-100"
                  >
                    <Receipt size={12} />
                    Print Invoice
                  </button>
                )}
                {(o.status === 'ordering' || o.status === 'completed') && (
                  <button
                    onClick={() => {
                      setClaimOrder(o);
                      setClaimQuantities(o.items.reduce((acc, item) => ({ ...acc, [item.productId]: 0 }), {}));
                      setShowClaimModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1 border border-amber-100"
                  >
                    <AlertCircle size={12} />
                    Claim Items (Returns)
                  </button>
                )}
              </div>
              
              <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Grand Total:</span>
                <span className="text-base text-slate-900 font-black">${o.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <ShoppingBag size={28} className="text-slate-300" />
            <span className="text-sm font-semibold">No orders in pipeline</span>
            <span className="text-xs text-slate-400">Launch checkout by clicking 'New Order' above.</span>
          </div>
        )}
      </div>

      {/* Claim Items Return Modal */}
      {showClaimModal && claimOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4 animate-scale-up">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={20} />
                Return Claim items - Invoice #{claimOrder.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Specify returned quantities for items in this order. Returned items will be added back to the inventory stock.
              </p>
              
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-[250px] overflow-y-auto bg-slate-50/50">
                {claimOrder.items.map((item) => {
                  const claimable = item.quantity - item.returnedQuantity;
                  return (
                    <div key={item.productId} className="flex justify-between items-center p-3 text-xs bg-white">
                      <div>
                        <div className="font-semibold text-slate-800">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Purchased: {item.quantity} | Returned: {item.returnedQuantity} | <span className="font-bold text-slate-500">Remaining: {claimable}</span>
                        </div>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min={0}
                          max={claimable}
                          placeholder="0"
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono text-center"
                          value={claimQuantities[item.productId] || ''}
                          onChange={(e) => {
                            const val = Math.min(claimable, Math.max(0, parseInt(e.target.value) || 0));
                            setClaimQuantities({
                              ...claimQuantities,
                              [item.productId]: val
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 text-white hover:bg-amber-700 px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/10"
                >
                  Submit Claims
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
