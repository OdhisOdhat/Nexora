import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, User, Lock, Mail, ArrowRight, Truck, Store, Sparkles, MapPin, Eye, EyeOff } from "lucide-react";

interface AuthOverlayProps {
  onAuthSuccess: (user: {
    email: string;
    name: string;
    role: "customer" | "merchant" | "rider" | "admin";
    locality?: string;
    brandName?: string;
  }) => void;
  onClose?: () => void;
}

export default function AuthOverlay({ onAuthSuccess, onClose }: AuthOverlayProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "merchant" | "rider" | "admin">("customer");
  
  // Role specific states
  const [locality, setLocality] = useState("Midtown");
  const [brandName, setBrandName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in email and password.");
      return;
    }
    if (isSignUp && !name) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (isSignUp && role === "merchant" && !brandName) {
      setErrorMsg("Please enter your brand/merchant name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const body = isSignUp 
      ? { email, password, name, role, locality: role === "rider" ? locality : undefined, brandName: role === "merchant" ? brandName : undefined }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        setErrorMsg(data.error || "Authentication procedure failed.");
      } else {
        setSuccessMsg(isSignUp ? "Account initialized successfully! Authorizing..." : "Welcome back! Connecting core...");
        setTimeout(() => {
          onAuthSuccess(data.user);
          if (onClose) onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to the authentication sub-system.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900/90 rounded-2xl border border-gray-100 dark:border-white/[0.06] p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Abstract background gradient decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-xl text-purple-500 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white tracking-tight">
            {isSignUp ? "Create Nexora Account" : "Access Nexora Network"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {isSignUp ? "Unlock sovereign categories & quantum-level logistics" : "Authenticate to access client catalog, hubs and logistics"}
          </p>
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 dark:text-rose-400 text-xs font-medium"
          >
            {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 dark:text-emerald-400 text-xs font-semibold"
          >
            {successMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Your Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450">
                  <User className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-200 dark:border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-sans"
                  placeholder="e.g. Liam Vance"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Email Node Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450">
                <Mail className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-200 dark:border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-sans"
                placeholder="name@nexus.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Sovereign Password</label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450">
                <Lock className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-gray-200 dark:border-white/[0.06] rounded-xl py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-sans"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Sign Up User Category Selector */}
          {isSignUp && (
            <div className="pt-2 space-y-3">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Select User Category</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "customer", label: "Customer", icon: User, desc: "Aesthetic Shopper" },
                  { id: "merchant", label: "Merchant", icon: Store, desc: "Sovereign Brands" },
                  { id: "rider", label: "Local Rider", icon: Truck, desc: "Active Courier" },
                  { id: "admin", label: "Admin Node", icon: ShieldCheck, desc: "Observatory" }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = role === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRole(cat.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-purple-550 border-purple-500/80 text-white bg-purple-600 dark:bg-purple-900/60 shadow-lg shadow-purple-550/10" 
                          : "bg-slate-50 dark:bg-slate-955/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-white" : "text-gray-450 text-purple-400"}`} />
                      <span className="text-[11px] font-bold block leading-none">{cat.label}</span>
                      <span className="text-[8px] opacity-75 mt-0.5 leading-none block font-semibold">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic properties field depending on selected category */}
              <AnimatePresence mode="wait">
                {role === "merchant" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 block uppercase tracking-wider">Merchant Brand Name</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                        <Store className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full bg-purple-500/[0.02] border border-purple-550/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 block"
                        placeholder="e.g. Apex Cyberware"
                      />
                    </div>
                  </motion.div>
                )}

                {role === "rider" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 block uppercase tracking-wider">Your Working Locality</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <select
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full bg-purple-500/[0.02] border border-purple-555/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Midtown">Midtown (Tech Sector)</option>
                          <option value="Downtown">Downtown (Hub Sector)</option>
                          <option value="Uptown">Uptown (Residential)</option>
                          <option value="Westside">Westside (Coastal Core)</option>
                          <option value="Northside">Northside (Indo-Core Lab)</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">You will filter bought items that require delivery within this area.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-650 to-indigo-650 bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-purple-500/20 mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <SpinnerIcon className="animate-spin w-4 h-4" />
                Working...
              </span>
            ) : (
              <>
                <span>{isSignUp ? "Initialize Protocol" : "Authorize Node Connection"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {isSignUp ? "Already have an active node?" : "New to Nexora Network?"} (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer inline"
            >
              {isSignUp ? "Sign In Here" : "Register Node Category"}
            </button>
            )
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
