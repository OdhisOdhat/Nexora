import { useState, useEffect } from "react";
import { 
  Shield, 
  Store, 
  Users, 
  Truck, 
  TrendingUp, 
  Coins, 
  Search, 
  RefreshCw, 
  Compass, 
  Activity, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Navigation, 
  ChevronRight,
  User,
  ExternalLink,
  MapPin,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MerchantDiag {
  email: string;
  brandName: string;
  description: string;
  logoUrl?: string;
  productCount: number;
  createdAt: string;
}

interface CustomerDiag {
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  chatMessagesCount: number;
}

interface DeliveryInfo {
  orderId: string;
  riderId: string;
  riderName: string;
  vehicleType: string;
  status: string;
  currentLat: number;
  currentLng: number;
  targetLat: number;
  targetLng: number;
  estimatedMinutes: number;
  lastUpdate: string;
}

interface OrderDiag {
  id: string;
  userEmail: string;
  date: string;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  delivery: DeliveryInfo | null;
}

interface AdminOverviewState {
  merchants: MerchantDiag[];
  customers: CustomerDiag[];
  orders: OrderDiag[];
  deliveries: DeliveryInfo[];
}

const RIDERS_POOL = [
  { id: "R-01", name: "Rider Viper Apex", vehicle: "Solar Cycle", rating: 4.9, completed: 42, baseLat: 34.0522, baseLng: -118.2437 },
  { id: "R-02", name: "Rider Echo Swift", vehicle: "Hover Pod", rating: 4.8, completed: 35, baseLat: 34.0582, baseLng: -118.2407 },
  { id: "R-03", name: "Rider Holo Charge", vehicle: "Neon Scooter", rating: 4.7, completed: 29, baseLat: 34.0492, baseLng: -118.2467 },
  { id: "R-04", name: "Rider Vector Drift", vehicle: "Supersonic Drone", rating: 4.95, completed: 88, baseLat: 34.0552, baseLng: -118.2427 },
  { id: "R-05", name: "Rider Zenith Glider", vehicle: "Aero Cruiser", rating: 4.6, completed: 18, baseLat: 34.0612, baseLng: -118.2457 }
];

export default function AdminPanel() {
  const [data, setData] = useState<AdminOverviewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "merchants" | "customers" | "delivery">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Rider dispatch form states
  const [dispatchOrder, setDispatchOrder] = useState<OrderDiag | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState(RIDERS_POOL[0].id);

  // Load Admin diagnostics
  const loadDiagnostics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      } else {
        setErrorMessage("Failure code unauthorized while harvesting metrics.");
      }
    } catch (err: any) {
      setErrorMessage("System communications line failure: " + err.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  // Set up live telemetry updating loop which tracks rider in-transit status and alters coords on standard tick
  useEffect(() => {
    if (!data || data.deliveries.length === 0) return;

    const interval = setInterval(async () => {
      let changed = false;
      const updatedPromises = data.deliveries.map(async (delivery) => {
        if (delivery.status === "completed" || delivery.status === "delivered") return null;

        const rider = RIDERS_POOL.find(r => r.id === delivery.riderId);
        const nextStatus = 
          delivery.status === "assigned" ? "picked_up" :
          delivery.status === "picked_up" ? "in_transit" : "in_transit";

        // Bring current lat, lng closer to target coords
        const latDelta = delivery.targetLat - delivery.currentLat;
        const lngDelta = delivery.targetLng - delivery.currentLng;
        const distance = Math.hypot(latDelta, lngDelta);

        let newLat = delivery.currentLat + latDelta * 0.25;
        let newLng = delivery.currentLng + lngDelta * 0.25;
        let finalStatus = nextStatus;
        let rawMin = Math.max(0, delivery.estimatedMinutes - 3);

        if (distance < 0.005) {
          newLat = delivery.targetLat;
          newLng = delivery.targetLng;
          finalStatus = "delivered";
          rawMin = 0;
        }

        changed = true;

        // Perform async DB write update for tracking persistence
        try {
          await fetch("/api/admin/update-delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: delivery.orderId,
              status: finalStatus,
              currentLat: newLat,
              currentLng: newLng,
              estimatedMinutes: rawMin
            })
          });
        } catch (e) {
          console.error("Telemetry reporting disrupted:", e);
        }
      });

      if (changed) {
        await Promise.all(updatedPromises);
        loadDiagnostics(true);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [data]);

  const handleAssignRider = async () => {
    if (!dispatchOrder) return;
    const rider = RIDERS_POOL.find(r => r.id === selectedRiderId);
    if (!rider) return;

    // Simulate targets coordinates representing delivery locations
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.04;
    const targetLat = 34.0522 + latOffset;
    const targetLng = -118.2437 + lngOffset;

    try {
      const res = await fetch("/api/admin/assign-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: dispatchOrder.id,
          riderId: rider.id,
          riderName: rider.name,
          vehicleType: rider.vehicle,
          currentLat: rider.baseLat,
          currentLng: rider.baseLng,
          targetLat,
          targetLng,
          estimatedMinutes: Math.floor(8 + Math.random() * 12)
        })
      });

      if (res.ok) {
        setSuccessMessage(`Assigned ${rider.name} successfully to order ${dispatchOrder.id}!`);
        setDispatchOrder(null);
        loadDiagnostics(true);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setErrorMessage("Couriers assignment payload rejected by server database.");
      }
    } catch (err: any) {
      setErrorMessage("Error dispatching rider: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
        <span className="text-gray-400 font-mono text-xs tracking-widest uppercase">Syncing administrative secure streams...</span>
      </div>
    );
  }

  // Calculate totals
  const totalWares = data?.merchants.reduce((acc, m) => acc + m.productCount, 0) || 0;
  const totalRevenue = data?.orders.reduce((acc, o) => acc + o.total, 0) || 0;
  const activeDeliveriesCount = data?.deliveries.filter(d => d.status !== "delivered" && d.status !== "completed").length || 0;

  // Filter lists based on query
  const filteredMerchants = data?.merchants.filter(
    m => m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCustomers = data?.customers.filter(
    c => c.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      {/* Dynamic Notifications Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-3 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs flex items-center gap-3 shadow-md"
          >
            <Activity className="w-4 h-4 text-red-500" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Head Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.04] pb-5 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-purple-400 block mb-1">Administrative Center</span>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-purple-500" /> Integrated Observatory Panel
          </h2>
        </div>

        {/* Action controls / search bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter networks (e.g. brand name, user)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-900/40 border border-white/[0.06] rounded-xl text-xs placeholder:text-gray-500 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button
            onClick={() => loadDiagnostics(false)}
            title="Refresh stream metrics"
            className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl text-purple-400 cursor-pointer border border-white/[0.04] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4.5 h-4.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Grid Quick Stats Diagnostics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Merchants Registered</span>
            <Store className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-white block">{data?.merchants.length || 0}</span>
            <span className="text-[9px] text-purple-400 font-mono">Nexora Retail Node partners</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Identified Customers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-white block">{data?.customers.length || 0}</span>
            <span className="text-[9px] text-emerald-400 font-mono">Active shoppers index</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Quantum Orders</span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-white block">{data?.orders.length || 0}</span>
            <span className="text-[9px] text-indigo-400 font-mono">{totalWares} product variants listed</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Active Deliveries</span>
            <Truck className="w-4 h-4 text-pink-400 animate-pulse" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-white block">{activeDeliveriesCount}</span>
            <span className="text-[9px] text-pink-400 font-mono">In flight telemetry signals</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl col-span-2 lg:col-span-1 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Total System GGP</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-white block">${totalRevenue.toFixed(2)}</span>
            <span className="text-[9px] text-amber-400 font-mono">Quantum settlement ledger</span>
          </div>
        </div>
      </div>

      {/* Action / View Tabs selector */}
      <div className="flex border-b border-white/[0.04] pb-px gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "overview" 
              ? "border-purple-500 text-purple-400" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          General Grid
        </button>
        <button
          onClick={() => setActiveTab("merchants")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "merchants" 
              ? "border-purple-500 text-purple-400" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Merchant Observatory ({data?.merchants.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "customers" 
              ? "border-purple-500 text-purple-400" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Customer Hub ({data?.customers.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeTab === "delivery" 
              ? "border-purple-500 text-purple-400" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Rider Command & Tracking
          {activeDeliveriesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
          )}
        </button>
      </div>

      {/* TAB CONTENTS: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders queue */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" /> Recent Settled Transactions
            </h3>
            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl overflow-hidden p-6 space-y-4">
              {data?.orders.length === 0 ? (
                <div className="text-center py-10 font-mono text-xs text-gray-500">
                  No settled orders located in quantum databases logs.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {data?.orders.slice(0, 7).map((order) => (
                    <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-white font-mono">{order.id}</span>
                          <span className="text-[10px] bg-slate-800 text-purple-300 font-mono px-2 py-0.5 rounded">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono">Customer: {order.userEmail}</p>
                        <p className="text-[10px] text-gray-500 leading-normal">{order.shippingAddress}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white block font-mono">${order.total.toFixed(2)}</span>
                          <span className="text-[9px] text-gray-500 block">{new Date(order.date).toLocaleDateString()}</span>
                        </div>

                        {/* Assign Courier vs tracking badge */}
                        <div>
                          {order.delivery ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/10 font-mono text-[10px]">
                              <Truck className="w-3 h-3 text-purple-400" />
                              <span className="capitalize">{order.delivery.status.replace("_", " ")}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setDispatchOrder(order);
                                setActiveTab("delivery");
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] rounded-lg cursor-pointer font-bold uppercase tracking-wider transition-colors"
                            >
                              Dispatch Rider
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity status column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Node Telemetry Logs
            </h3>
            <div className="bg-slate-900/40 border border-white/[0.04] p-6 rounded-3xl space-y-4 font-mono text-xs">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 animate-pulse" />
                  <div>
                    <span className="text-gray-500 text-[10px]">10:41:22 UTC</span>
                    <p className="text-white">Admin session initialized by fodhis1</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 animate-pulse" />
                  <div>
                    <span className="text-gray-500 text-[10px]">10:39:05 UTC</span>
                    <p className="text-white">DB pools verified. Synchronized fallback ledger files.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 animate-pulse" />
                  <div>
                    <span className="text-gray-500 text-[10px]">09:12:15 UTC</span>
                    <p className="text-white">5 active deliveries deployed. Tracking beacons online.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.04] space-y-2.5">
                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block font-bold">Courier Fleet Telemetry</span>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Available Riders:</span>
                  <span className="text-white font-bold">5 agents</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Operational Beacons:</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENTS: 2. MERCHANTS */}
      {activeTab === "merchants" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-400" /> Registered Partner Merchants List
          </h3>

          <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl overflow-hidden p-6">
            {filteredMerchants.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-mono text-xs">
                No matching merchant partner registries on screen.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMerchants.map((merchant) => (
                  <div key={merchant.email} className="bg-slate-950/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {merchant.logoUrl ? (
                          <img src={merchant.logoUrl} alt={merchant.brandName} className="w-12 h-12 rounded-xl object-cover border border-white/[0.05]" />
                        ) : (
                          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/10 shrink-0">
                            <Store className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-sm tracking-wide font-mono">{merchant.brandName}</h4>
                          <span className="text-[10px] text-gray-400 block max-w-[150px] truncate">{merchant.email}</span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded">
                        PRO-STATUS
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed italic truncate">
                      "{merchant.description || "Synthesizing custom cyberware of extreme aesthetic qualities."}"
                    </p>

                    <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-gray-500 block text-[9px]">DIAG_WARES</span>
                        <span className="text-white font-bold">{merchant.productCount} variants listed</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-[9px]">JOINED_DATE</span>
                        <span className="text-gray-400">{new Date(merchant.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENTS: 3. CUSTOMERS */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Active System Customers Directories
          </h3>

          <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl overflow-hidden p-6">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-mono text-xs">
                No matching identified customers index.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {filteredCustomers.map((customer) => (
                  <div key={customer.email} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full border border-emerald-500/25 flex items-center justify-center font-mono text-emerald-400 font-bold text-xs shrink-0 shadow-inner">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{customer.email}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mt-0.5">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-purple-400" /> {customer.chatMessagesCount} system messages
                          </span>
                          <span>•</span>
                          <span>Last orders: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "Never"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right font-mono">
                        <span className="text-xs text-gray-500 block">TRANSACTIONS_COMPLETED</span>
                        <span className="text-xs font-bold text-white">{customer.totalOrders} quantum orders</span>
                      </div>
                      <div className="text-right font-mono min-w-[100px]">
                        <span className="text-xs text-gray-500 block">TOTAL_VOLUME</span>
                        <span className="text-sm font-bold text-emerald-400">${customer.totalSpent.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENTS: 4. RIDER COMMAND & TELEMETRY */}
      {activeTab === "delivery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Assignment Block */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Deployed Riders stats */}
            <div className="bg-slate-900/45 border border-white/[0.05] p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" /> Active Rider Pool
              </h3>

              <div className="space-y-3">
                {RIDERS_POOL.map((rider) => {
                  // Find current rider's live assignment
                  const activeJob = data?.deliveries.find(d => d.riderId === rider.id && d.status !== "delivered");
                  return (
                    <div key={rider.id} className="p-3 bg-slate-950/60 rounded-xl border border-white/[0.03] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${activeJob ? "bg-pink-400 animate-pulse" : "bg-emerald-400"}`} />
                          <span className="text-xs font-bold text-white font-mono">{rider.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{rider.vehicle}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 leading-none">
                        <span>Rating: ⭐ {rider.rating}</span>
                        <span>{activeJob ? `Job: ${activeJob.orderId}` : "Status: IDLE"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deploy courier simulator unit */}
            {dispatchOrder ? (
              <div className="bg-slate-900/60 border border-purple-500/20 shadow-lg p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Assign & Deploy Rider
                  </h3>
                  <button onClick={() => setDispatchOrder(null)} className="text-[10px] text-gray-500 hover:text-white font-mono">
                    Cancel
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/[0.04]">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wide block">Deploying order</span>
                    <span className="font-bold text-white font-mono">{dispatchOrder.id}</span>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate">{dispatchOrder.shippingAddress}</p>
                    <span className="block mt-1.5 text-[9px] font-mono text-purple-400">Ledger value: ${dispatchOrder.total.toFixed(2)}</span>
                  </div>

                  {/* Choose Rider dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider" htmlFor="rider-select">
                      Select Elite Pilot
                    </label>
                    <select
                      id="rider-select"
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl text-white text-xs outline-none focus:border-purple-500 px-3 py-2.5"
                    >
                      {RIDERS_POOL.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} ({r.vehicle})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAssignRider}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-mono text-xs uppercase tracking-widest rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg shadow-purple-600/10 active:scale-[0.98]"
                  >
                    Deploy Rider Beacon
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-white/[0.03] p-6 rounded-3xl text-center text-xs text-gray-400 h-40 flex items-center justify-center">
                <p>Select "Dispatch Rider" on any pending settled transaction card under the General Grid to initiate tracking deployment.</p>
              </div>
            )}
          </div>

          {/* Holographic Radar Tracking Center Map */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-pink-400" /> Dynamic Telemetry Radar Array
            </h3>

            <div className="bg-slate-900/50 backdrop-blur-md border border-white/[0.05] p-6 rounded-3xl space-y-6">
              {/* SVG interactive Radar map representation */}
              <div className="relative aspect-video bg-slate-950/90 rounded-2xl overflow-hidden border border-white/[0.04]">
                {/* SVG lines grid representing geographical topology */}
                <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(108, 99, 255, 0.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Concentric telemetry tracking radar circles */}
                  <circle cx="50%" cy="50%" r="60" fill="none" stroke="rgba(236,72,153,0.06)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(236,72,153,0.04)" strokeWidth="1.5" strokeDasharray="5 5" />
                  <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(236,72,153,0.02)" strokeWidth="2" />
                </svg>

                {/* Tracking radar line sweeping across coordinate grids */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/[0.02] to-transparent animate-[pulse_3s_infinite]" />

                {/* Placing live markers representing Deployed Delivery paths */}
                {data?.deliveries.map((del) => {
                  // Normalize coordinate grids representing offsets for visually appealing placement inside radar box
                  const relativeX = 50 + (del.currentLng - (-118.2437)) * 2500;
                  const relativeY = 50 - (del.currentLat - 34.0522) * 2500;
                  
                  // Targets
                  const targetX = 50 + (del.targetLng - (-118.2437)) * 2500;
                  const targetY = 50 - (del.targetLat - 34.0522) * 2500;

                  return (
                    <div key={del.orderId}>
                      {/* Connection path line */}
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line 
                          x1={`${relativeX}%`} 
                          y1={`${relativeY}%`} 
                          x2={`${targetX}%`} 
                          y2={`${targetY}%`} 
                          stroke="rgba(157, 108, 255, 0.4)" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                      </svg>

                      {/* Moving rider blip indicator */}
                      <div 
                        className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center"
                        style={{ left: `${relativeX}%`, top: `${relativeY}%` }}
                      >
                        <span className="absolute w-3 h-3 bg-pink-500 rounded-full animate-ping opacity-60" />
                        <span className="w-2 h-2 bg-pink-400 rounded-full border border-white" />
                        {/* Display label override */}
                        <span className="absolute left-3 text-[8px] font-mono text-pink-400 font-bold tracking-tight whitespace-nowrap bg-slate-950/80 px-1 py-0.5 rounded">
                          {del.riderId} - In flight
                        </span>
                      </div>

                      {/* Display targets / landing zone marker */}
                      <div 
                        className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center"
                        style={{ left: `${targetX}%`, top: `${targetY}%` }}
                      >
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="absolute left-3 text-[8px] font-mono text-emerald-400 font-bold tracking-tight whitespace-nowrap bg-slate-950/80 px-1 py-0.5 rounded mt-3">
                          {del.orderId} Target
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/90 text-[9px] font-mono border border-white/[0.04] p-1.5 px-2.5 rounded-lg text-gray-500">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full shrink-0" /> Space-Grade Live Beacons Active: {data?.deliveries.length || 0}
                </div>
              </div>

              {/* Listings queue under tracking */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Active Deliveries Logs</span>

                {data?.deliveries.length === 0 ? (
                  <div className="py-6 border border-white/[0.04] p-4 text-center rounded-2xl font-mono text-[10px] text-gray-500">
                    No active telemetry delivery signals found on tracking scanner array. Place an order and assign.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.deliveries.map((del) => (
                      <div key={del.orderId} className="bg-slate-950/80 border border-white/[0.04] p-4 rounded-xl flex items-start gap-3 justify-between">
                        <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{del.orderId}</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-pink-500/15 text-pink-400 font-bold border border-pink-500/10">
                              {del.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[10px]">Pilot: {del.riderName}</p>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[9px]">
                            <Clock className="w-3 h-3 text-pink-400" /> Est: {del.estimatedMinutes || 2} mins remaining
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-mono text-gray-500 block uppercase">Transit Method</span>
                          <span className="text-[10px] font-mono text-gray-300 block font-semibold">{del.vehicleType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
