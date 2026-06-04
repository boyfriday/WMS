import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import { Printer, ArrowLeft, Receipt, Calendar, Users, MapPin } from 'lucide-react';

export default function PrintOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService.getOrder(id)
      .then(res => {
        setOrder(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading order for printing:', err);
        setLoading(false);
      });
  }, [id]);

  // Trigger print dialog once data is loaded and rendered
  useEffect(() => {
    if (!loading && order) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm">Preparing printable manifest...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Receipt size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
          <p className="text-sm text-slate-500">The order you are trying to print could not be located in the database.</p>
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/10 hover:bg-primary-dark transition-all"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      {/* Control Panel (Hidden on print) */}
      <div className="max-w-4xl mx-auto px-6 mb-6 print:hidden">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Registry
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Printer size={14} />
            Print Document
          </button>
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/60 shadow-md print:shadow-none print:border-none print:p-0 print:max-w-none">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-extrabold text-base print:bg-black">
                W
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800">WMS Distribution</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Warehouse Management System Inc.<br />
              123 Logistics Blvd, Suite 400<br />
              Bangkok, TH 10110<br />
              contact@wms-distribution.com
            </p>
          </div>
          
          <div className="text-left sm:text-right">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">Sales Invoice</h1>
            <div className="mt-3 space-y-1 text-xs text-slate-600 font-medium">
              <div>Invoice #: <span className="font-bold text-slate-800 font-mono">INV-{order.id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex items-center gap-1 sm:justify-end">
                <Calendar size={12} className="text-slate-400" />
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div>Status: <span className="font-bold text-emerald-600 uppercase">Paid / Completed</span></div>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b-2 border-slate-100">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Billing & Delivery Target</span>
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                {order.customerName}
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span>{order.customerAddress}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 print:bg-white print:border-none print:p-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Internal Logistics Details</span>
            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <div>Dispatcher Operator ID: <span className="font-bold font-mono">{order.userId.slice(0, 8)}</span></div>
              <div>Fulfillment Exchange: <span className="font-bold">RabbitMQ (stock.deduct)</span></div>
              <div>System Node: <span className="font-bold">wms-order-api-service</span></div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 pr-4">Item Manifest</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Purchased</th>
                <th className="py-3 px-4 text-center">Returned</th>
                <th className="py-3 pl-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => {
                const activeQuantity = item.quantity - item.returnedQuantity;
                const subtotal = item.unitPrice * activeQuantity;

                return (
                  <tr key={idx} className="text-xs text-slate-700 font-medium">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Product ID: #{item.productId.slice(0, 8)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-600">{item.returnedQuantity || '-'}</td>
                    <td className="py-3.5 pl-4 text-right font-bold text-slate-800 font-mono">
                      ${subtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end border-t-2 border-slate-100 pt-6">
          <div className="w-72 space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Gross Total Billing:</span>
              <span className="font-mono text-slate-800">${order.totalAmount.toFixed(2)}</span>
            </div>
            
            {/* Calculate returned amount deduction */}
            {order.items.some(item => item.returnedQuantity > 0) && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Returns Deductions:</span>
                <span className="font-mono">
                  -${order.items.reduce((sum, item) => sum + (item.unitPrice * item.returnedQuantity), 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            
            <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-100 pt-2">
              <span>Net Payable Amount:</span>
              <span className="text-base text-indigo-600 font-black font-mono">
                ${(order.totalAmount - order.items.reduce((sum, item) => sum + (item.unitPrice * item.returnedQuantity), 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-16 text-center border-t border-slate-100 pt-8 text-[10px] text-slate-400 font-medium leading-relaxed">
          <p>Thank you for choosing WMS Distribution. If you have any questions regarding this invoice, please contact support.</p>
          <p className="mt-2 font-semibold">WMS • Warehouse Management System • Automated Logistics</p>
        </div>

      </div>
    </div>
  );
}
