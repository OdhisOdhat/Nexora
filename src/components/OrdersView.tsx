import React from "react";
import { ShoppingBag } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
}

interface OrdersViewProps {
  ordersLog: Order[];
}

export default function OrdersView({ ordersLog }: OrdersViewProps) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="pb-4 border-b border-white/[0.04]">
        <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">Purchase History</h2>
        <p className="text-xs text-gray-500 mt-1">Records of transaction receipts dispatched with Nexora.</p>
      </div>

      {ordersLog.length === 0 ? (
        <div className="text-center py-16 bg-nexora-surface/30 rounded-3xl border border-white/[0.04]">
          <ShoppingBag className="w-14 h-14 text-slate-700 stroke-1 mx-auto mb-4" />
          <h4 className="font-bold text-gray-300">No Orders logged</h4>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">Your orders processed through the secure cart panel checkout will display here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersLog.map((order, i) => (
            <div key={i} className="p-6 bg-nexora-surface rounded-3xl border border-white/[0.04] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase">Order ID:</span>
                  <span className="text-xs font-bold text-purple-300 font-mono">{order.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase">Dispatched On:</span>
                  <span className="text-xs font-semibold text-gray-300">{order.date}</span>
                </div>
              </div>

              {/* Purchased articles listing */}
              <div className="space-y-3">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 items-center justify-between text-xs text-gray-300">
                    <div className="flex gap-3 items-center">
                      <span className="text-gray-500 font-mono">[{it.quantity}x]</span>
                      <span className="font-semibold">{it.name}</span>
                    </div>
                    <span className="font-mono text-purple-200">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-white/[0.04]">
                <span className="text-xs text-gray-400 font-semibold">Grand Total:</span>
                <span className="text-sm font-mono font-bold text-white">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
