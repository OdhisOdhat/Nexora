import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Truck, 
  Compass, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Navigation, 
  Route, 
  RotateCw, 
  Award,
  Lightbulb,
  Gauge
} from "lucide-react";

interface RiderPortalProps {
  riderEmail: string;
  riderName: string;
  riderLocality: string;
  onProductDelivered?: () => void;
}

interface Order {
  id: string;
  userEmail: string;
  date: string;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
  }[];
  delivery?: {
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
  } | null;
}

export default function RiderPortal({ 
  riderEmail, 
  riderName, 
  riderLocality,
  onProductDelivered 
}: RiderPortalProps) {
  // Configurable vehicle selection
  const [vehicle, setVehicle] = useState<"Quantum-Bike" | "Electric-Drone" | "Cyberware-Scooter" | "Hyper-Cruiser">("Quantum-Bike");
  
  // Dashboard overall list states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [earnings, setEarnings] = useState(() => {
    return parseInt(localStorage.getItem(`rider_earnings_${riderEmail}`) || "0", 10);
  });
  const [completedRuns, setCompletedRuns] = useState(() => {
    return parseInt(localStorage.getItem(`rider_completed_${riderEmail}`) || "0", 10);
  });

  // Simulated GPS journey progress (0% to 100%)
  const [transitProgress, setTransitProgress] = useState(0);
  const [propulsionSpeed, setPropulsionSpeed] = useState<"cruise" | "burst" | "warp">("cruise");
  const [isSimulatingUnit, setIsSimulatingUnit] = useState(false);

  // Fetch all orders in the entire system to detect bought items
  const fetchRiderJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        // Extract raw orders list from database
        const rawOrders: Order[] = data.orders || [];
        setOrders(rawOrders);

        // Check if there is an existing ACTIVE deliver job for this rider
        const ongoing = rawOrders.find(
          (o) => o.delivery && o.delivery.riderId === riderEmail && o.delivery.status !== "delivered"
        );
        if (ongoing) {
          setActiveJob(ongoing);
          // Set progress based on status
          if (ongoing.delivery?.status === "picked_up") {
            setTransitProgress(40);
          } else if (ongoing.delivery?.status === "approaching") {
            setTransitProgress(80);
          } else {
            setTransitProgress(10);
          }
        } else {
          setActiveJob(null);
        }
      }
    } catch (err) {
      console.error("Failed to load rider overview", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderJobs();
  }, [riderEmail]);

  // Handle accepting a job
  const handleAcceptJob = async (order: Order) => {
    try {
      // Formulate target delivery coordinates near rider's locality
      const isLocalitySelected = order.shippingAddress.toLowerCase().includes(riderLocality.toLowerCase());
      
      const res = await fetch("/api/admin/assign-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          riderId: riderEmail,
          riderName,
          vehicleType: vehicle,
          currentLat: 34.0522,
          currentLng: -118.2437,
          targetLat: 34.0622,
          targetLng: -118.2537,
          estimatedMinutes: 15
        })
      });

      if (res.ok) {
        setSuccessMessage(`Order ${order.id} accepted. Commencing routing protocols...`);
        setTransitProgress(15);
        fetchRiderJobs();
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulating route movement increments
  const handleStepJourney = async () => {
    if (!activeJob) return;
    setIsSimulatingUnit(true);

    const stepSize = propulsionSpeed === "warp" ? 35 : propulsionSpeed === "burst" ? 20 : 10;
    const nextProgress = Math.min(100, transitProgress + stepSize);
    setTransitProgress(nextProgress);

    let nextStatus = "picked_up";
    let estMin = 10;
    if (nextProgress >= 100) {
      nextStatus = "approaching";
      estMin = 1;
    } else if (nextProgress >= 60) {
      nextStatus = "approaching";
      estMin = 4;
    }

    try {
      await fetch("/api/admin/update-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeJob.id,
          status: nextStatus,
          currentLat: 34.0552, 
          currentLng: -118.2477,
          estimatedMinutes: estMin
        })
      });
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSimulatingUnit(false);
    }
  };

  // Confirming delivery delivery
  const handleCompleteDelivery = async () => {
    if (!activeJob) return;
    try {
      const res = await fetch("/api/admin/update-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeJob.id,
          status: "delivered",
          currentLat: 34.0622,
          currentLng: -118.2537,
          estimatedMinutes: 0
        })
      });

      if (res.ok) {
        // Safe delivery rewards
        const addedEarnings = earnings + 25;
        const totalCompleted = completedRuns + 1;
        
        setEarnings(addedEarnings);
        setCompletedRuns(totalCompleted);
        localStorage.setItem(`rider_earnings_${riderEmail}`, addedEarnings.toString());
        localStorage.setItem(`rider_completed_${riderEmail}`, totalCompleted.toString());

        setSuccessMessage(`Dropoff confirmed! Earned $25.00 NEXORA Courier Credits.`);
        setActiveJob(null);
        setTransitProgress(0);
        
        fetchRiderJobs();
        if (onProductDelivered) onProductDelivered();
        
        setTimeout(() => setSuccessMessage(""), 4500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Categorize jobs: Filter only unassigned jobs, highlight locality matches
  const unassignedJobs = orders.filter(
    (o) => !o.delivery || o.delivery.status === "pending" || !o.delivery.riderId
  );

  // Check matching locality specifically
  const inLocalityJobs = unassignedJobs.filter((o) => 
    o.shippingAddress.toLowerCase().includes(riderLocality.toLowerCase())
  );

  const outOfLocalityJobs = unassignedJobs.filter((o) => 
    !o.shippingAddress.toLowerCase().includes(riderLocality.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Rider Header Profile Dashboard */}
      <div className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Active Courier
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Locality: {riderLocality}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-white tracking-tight">{riderName}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Node identifier: {riderEmail}</p>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/45 p-3.5 rounded-xl border border-white/[0.05] text-center min-w-28">
              <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase tracking-wider">Completed Drops</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">{completedRuns}</span>
            </div>
            <div className="bg-slate-950/45 p-3.5 rounded-xl border border-white/[0.05] text-center min-w-28">
              <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase tracking-wider">Credits Earned</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block flex items-center justify-center gap-0.5">
                <DollarSign className="w-4 h-4" />{earnings.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/45 p-3.5 rounded-xl border border-white/[0.05] text-center min-w-28 col-span-2 md:col-span-1">
              <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase tracking-wider">Selected Vehicle</span>
              <select
                value={vehicle}
                onChange={(e: any) => setVehicle(e.target.value)}
                className="text-xs font-bold font-sans text-purple-400 mt-1 bg-transparent text-center focus:outline-none cursor-pointer"
              >
                <option value="Quantum-Bike">🚴 Quantum Bike</option>
                <option value="Electric-Drone">🛸 Cargo Drone</option>
                <option value="Cyberware-Scooter">🛴 Cyber Scooter</option>
                <option value="Hyper-Cruiser">🏎️ Cosmic Pod</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Active dispatch dashboard if accepting single job */}
      <AnimatePresence mode="wait">
        {activeJob ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 border border-purple-550/35 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header section */}
            <div className="bg-purple-950/20 p-5 border-b border-purple-555/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 block tracking-wider uppercase">Active In-flight Delivery Journey</span>
                <h3 className="text-lg font-bold text-white mt-1">Order Ref: {activeJob.id}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  Vehicle: {vehicle.replace("-", " ")}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/25 animate-pulse">
                  System Status: IN TRANSIT
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column Journey Status */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-slate-950/45 p-4 rounded-xl border border-white/[0.04] space-y-3.5 magnet">
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" /> Package Details
                  </h4>

                  <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                    {activeJob.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                        <img src={item.image} className="w-9 h-9 object-cover rounded" alt={item.name} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                          <span className="text-[10px] text-gray-500 block">Qty: {item.quantity} • {item.category}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Node tracking */}
                <div className="bg-slate-950/45 p-4 rounded-xl border border-white/[0.04] space-y-3.5">
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" /> Courier Path nodes
                  </h4>

                  <div className="relative pl-5 border-l border-white/[0.08] ml-2 space-y-4 pt-1">
                    <div className="relative">
                      <span className="absolute -left-[25px] top-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950" />
                      <span className="text-[10px] font-mono text-gray-500 block">DISPATCH SOURCE</span>
                      <span className="text-xs font-bold text-white">{riderLocality} Fulfillment Warehouse</span>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
                      <span className="text-[10px] font-mono text-gray-500 block">FINAL CLIENT DROP</span>
                      <span className="text-xs font-bold text-purple-300">{activeJob.shippingAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column simulated telemetry and control controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/60 p-5 rounded-xl border border-white/[0.04] text-center space-y-4">
                  <span className="text-xs font-mono font-bold text-gray-400 block uppercase tracking-widest">
                    Journey GPS Signal telemetry
                  </span>

                  {/* Circle progress mockup */}
                  <div className="flex justify-center py-2 relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white/[0.03] flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="transparent"
                          className="text-purple-600"
                          strokeDasharray={364}
                          strokeDashoffset={364 - (364 * transitProgress) / 100}
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-[10px] text-gray-500 block font-mono">PROGRESS</span>
                        <span className="text-2xl font-mono font-bold text-white">{transitProgress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                    <Clock className="w-3.5 h-3.5 text-gray-400 font-semibold" />
                    <span className="text-[11px] font-mono text-gray-300">
                      ETA: {transitProgress >= 100 ? "Arrived" : `${Math.ceil((100 - transitProgress) * 0.15)} Minutes`}
                    </span>
                  </div>

                  {/* Engine speed select */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase">
                      <span>Rider Propulsion Drive</span>
                      <span className="text-purple-400">{propulsionSpeed} Mode</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.01] rounded-lg border border-white/[0.04]">
                      {["cruise", "burst", "warp"].map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setPropulsionSpeed(speed as any)}
                          className={`py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer ${
                            propulsionSpeed === speed 
                              ? "bg-purple-600/35 text-purple-300 border border-purple-500/30" 
                              : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                          }`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Incremental dispatch button */}
                  {transitProgress < 100 ? (
                    <button
                      type="button"
                      disabled={isSimulatingUnit}
                      onClick={handleStepJourney}
                      className="w-full bg-white/[0.05] hover:bg-purple-500/25 hover:text-purple-300 border border-white/[0.08] hover:border-purple-500/30 font-semibold text-white text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gauge className="w-4 h-4 text-purple-400" />
                      <span>Boost Pulse Journey</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteDelivery}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Confirm Delivery Dropoff</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-400" />
              <span>Available Bought Items for Placement</span>
              <span className="text-xs bg-slate-800 text-gray-300 px-2 py-0.5 rounded-full font-mono">{unassignedJobs.length}</span>
            </h2>

            {/* In Locality Filter Info Banner */}
            <div className="bg-blue-950/15 border border-blue-900/40 p-3.5 rounded-xl flex items-start gap-2.5 text-blue-400 text-xs">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                Nexora automated sorting is active. Orders containing <strong>&quot;{riderLocality}&quot;</strong> keywords are pinned at the top as <strong>Locality Matches</strong> for rapid regional drops.
              </p>
            </div>

            {unassignedJobs.length === 0 ? (
              <div className="bg-slate-900 border border-white/[0.05] p-12 rounded-2xl text-center">
                <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white uppercase">All drop queues clear</h3>
                <p className="text-xs text-gray-500 mt-1">There are currently no outstanding unassigned client purchases. Standby for network orders...</p>
                <button
                  type="button"
                  onClick={fetchRiderJobs}
                  className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  <RotateCw className="w-3 h-3" /> Refresh Network
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Locality Matches Zone */}
                {inLocalityJobs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High priority: Locality Matches ({inLocalityJobs.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inLocalityJobs.map((order) => (
                        <JobCard
                          key={order.id}
                          order={order}
                          riderLocality={riderLocality}
                          onAccept={() => handleAcceptJob(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Outsiders Pool */}
                {outOfLocalityJobs.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5" /> General Delivery Pool ({outOfLocalityJobs.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {outOfLocalityJobs.map((order) => (
                        <JobCard
                          key={order.id}
                          order={order}
                          riderLocality={riderLocality}
                          onAccept={() => handleAcceptJob(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subordinate Single Job Card Widget
function JobCard({ 
  order, 
  riderLocality, 
  onAccept 
}: { 
  order: Order; 
  riderLocality: string; 
  onAccept: () => void;
  key?: React.Key;
}) {
  const containsRiderLocality = order.shippingAddress.toLowerCase().includes(riderLocality.toLowerCase());
  
  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-full hover:shadow-lg ${
      containsRiderLocality 
        ? "border-emerald-500/20 shadow-emerald-950/5 hover:border-emerald-500/35 bg-gradient-to-br from-slate-900 to-emerald-950/15" 
        : "border-white/[0.06] hover:border-purple-500/20"
    }`}>
      <div className="space-y-3.5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-[10px] font-mono text-gray-500 font-bold block">ORDER REFERENCE</span>
            <span className="text-xs font-bold text-white">{order.id}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-mono block">DATE TIME</span>
            <span className="text-[11px] font-serif text-gray-300 font-bold">{new Date(order.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Dropping details */}
        <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${containsRiderLocality ? "text-emerald-400 font-bold" : "text-purple-400"}`} />
            <span className="text-xs font-bold text-white truncate">{order.shippingAddress}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 border-t border-white/[0.03] mt-1.5">
            <span>Payment: {order.paymentMethod}</span>
            <span className="text-white font-bold">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Product preview avatars */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-gray-500 block uppercase tracking-wider">Items inside</span>
          <div className="flex flex-wrap items-center gap-2">
            {order.items.map((item) => (
              <div 
                key={item.id} 
                className="inline-flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] p-1 rounded-lg text-[10px] text-gray-300 font-medium"
                title={`${item.name} (${item.quantity})`}
              >
                <img src={item.image} className="w-5 h-5 rounded object-cover" alt="" />
                <span className="text-white font-mono leading-none block">{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-[10px] font-mono flex items-center gap-1">
          {containsRiderLocality ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono uppercase">
              <Award className="w-3.5 h-3.5" /> High Reward Match
            </span>
          ) : (
            <span className="text-gray-400">Regular Logistics Drop</span>
          )}
        </span>

        <button
          type="button"
          onClick={onAccept}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
            containsRiderLocality 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-550/10" 
              : "bg-purple-600/90 hover:bg-purple-500 text-white"
          }`}
        >
          <span>Claim Drop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
