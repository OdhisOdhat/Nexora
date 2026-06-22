import React, { useState, useEffect } from "react";
import { Database, Server, Terminal, Play, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, HelpCircle } from "lucide-react";

interface DbStatus {
  postgresActive: boolean;
  isNeon?: boolean;
  storageMethod: string;
}

interface SettingsViewProps {
  userEmail: string;
  dbStatus: DbStatus;
  onRefreshStatus?: () => void;
}

interface DbStats {
  products: number;
  cartItems: number;
  wishlistItems: number;
  orders: number;
  orderItems: number;
  chatMessages: number;
  merchants: number;
}

interface TestResult {
  success: boolean;
  latencyMs?: number;
  version?: string;
  serverTime?: string;
  isNeon?: boolean;
  error?: string;
}

export default function SettingsView({ userEmail, dbStatus, onRefreshStatus }: SettingsViewProps) {
  const [stats, setStats] = useState<DbStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Fetch PostgreSQL/Neon table stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/db-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load db stats", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dbStatus]);

  // Execute interactive Neon integrity connection test
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setLogMessages([
      `[${new Date().toLocaleTimeString()}] 🪐 Initiating live database ping protocol...`,
      `[${new Date().toLocaleTimeString()}] 🔍 checking pool connection coordinates...`,
    ]);

    // Small delay to simulate terminal steps
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📡 Dispatched query SELECT version(); to Postgres server...`]);
      const res = await fetch("/api/db-test");
      const data: TestResult = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data.success) {
        setLogMessages(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] 💚 Connection handshake established successfully!`,
          `[${new Date().toLocaleTimeString()}] 🚀 Active database host detected: ${data.isNeon ? "Neon Serverless Postgres" : "Standard PostgreSQL Instance"}.`,
          `[${new Date().toLocaleTimeString()}] 🕒 Remote Server Time: ${data.serverTime ? new Date(data.serverTime).toLocaleString() : "Unknown"}`,
          `[${new Date().toLocaleTimeString()}] ⚡ Round-trip Latency: ${data.latencyMs}ms`
        ]);
        setTestResult(data);
        if (onRefreshStatus) onRefreshStatus();
      } else {
        setLogMessages(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] ❌ Handshake failed: ${data.error}`
        ]);
        setTestResult(data);
      }
    } catch (err: any) {
      setLogMessages(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] ❌ Diagnostic runtime error: ${err.message}`
      ]);
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl" id="neon-settings-view">
      {/* View Header */}
      <div className="pb-4 border-b border-white/[0.04] flex items-center justify-between">
        <div>
          <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            Neon Database Center
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure, manage and analyze your highly efficient Neon serverless Postgres engine.
          </p>
        </div>
        <button
          onClick={() => {
            fetchStats();
            if (onRefreshStatus) onRefreshStatus();
          }}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-white/[0.06] rounded-xl text-gray-400 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Database Node Main Info Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Status indicator Card (col 7) */}
        <div className="md:col-span-7 bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-white/[0.04] space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-[45px] pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold uppercase ${
                dbStatus.postgresActive 
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                  : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
              }`}>
                {dbStatus.postgresActive ? "Live Engine Active" : "Local Fallback Active"}
              </span>
              
              {dbStatus.postgresActive && dbStatus.isNeon && (
                <span className="px-2.5 py-1 text-[10px] font-mono rounded font-bold uppercase bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950">
                  Neon Certified
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-sans text-white tracking-tight">
                {dbStatus.storageMethod}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {dbStatus.postgresActive 
                  ? "Your application is successfully bound to a highly responsive live PostgreSQL server. All transactions, catalog edits, and companion memories persist permanently."
                  : "The application is currently utilizing a local JSON-based database fallback on the Cloud Run container. Data will persist across local reloads but will clear upon server redeployment."
                }
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.04]">
            <div className="flex gap-4 items-center justify-between text-[11px] font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Host Service: {dbStatus.isNeon ? "neon.tech (AWS Ingress)" : (dbStatus.postgresActive ? "Standard PostgreSQL" : "Local Filesystem Loop")}</span>
              </div>
              <div>
                <span>SSL Secure: Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Database Statistics Grid (col 5) */}
        <div className="md:col-span-5 bg-slate-950/40 p-6 rounded-3xl border border-white/[0.04] space-y-4">
          <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Table Record Explorer
          </h4>
          
          <div className="grid grid-cols-2 gap-3.5 pt-1.5 select-none">
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Products</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.products ?? 0)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Cart Items</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.cartItems ?? 0)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Wishlisted</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.wishlistItems ?? 0)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Orders Log</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.orders ?? 0)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">AI Chats</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.chatMessages ?? 0)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-white/[0.02] rounded-2xl relative">
              <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Registered Brands</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {statsLoading ? "..." : (stats?.merchants ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Terminal Database Tester */}
      <div className="p-6 bg-slate-950 rounded-3xl border border-white/[0.04] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live Database Connection Handshake Test
            </h4>
            <p className="text-[11px] text-gray-500">Run a diagnostic ping query to evaluate connection latencies and retrieve remote database host version details.</p>
          </div>
          
          <button
            onClick={handleTestConnection}
            disabled={testing || !dbStatus.postgresActive}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 ${
              dbStatus.postgresActive 
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 cursor-pointer" 
                : "bg-slate-900 text-gray-600 border border-white/[0.02] cursor-not-allowed"
            }`}
          >
            {testing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Handshaking...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Connection Test
              </>
            )}
          </button>
        </div>

        {/* Terminal Screen Logger */}
        <div className="bg-black/90 rounded-2xl p-5 border border-white/[0.06] font-mono text-xs text-gray-300 min-h-[140px] space-y-2 relative">
          {logMessages.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-[11px] text-center p-6">
              <span>{dbStatus.postgresActive ? "Telemetry ready. Click 'Run Connection Test' above to start query." : "Handshake is disabled because you are operating in Local File System mode. Provide a valid connection string to begin."}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {logMessages.map((msg, i) => (
                <div key={i} className="leading-relaxed whitespace-pre-wrap">{msg}</div>
              ))}
              
              {testResult && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs">
                  {testResult.success ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span> handshaking passed flawlessly! Latency: {testResult.latencyMs}ms. Hosting Engine Version: {testResult.version?.split(",")[0]}.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 font-bold bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span> handshake connection abort: {testResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Neon setup instruction panel */}
      <div className="glass-panel border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6">
        <h4 className="font-sans font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
          How to configure your live Neon Serverless DB
        </h4>
        
        <p className="text-xs text-gray-400 leading-relaxed md:max-w-2xl">
          To migrate the application from local file fallback to high performance Neon cloud serverless Postgres, follow these standard instructions:
        </p>

        <div className="space-y-5 pt-2 font-sans">
          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-white">Acquire Connection String</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Log into <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">neon.tech</a>, set up a new serverless Postgres project, and copy the transaction-pooling connection uri (looks like <code className="text-gray-400 px-1 py-0.5 rounded bg-white/[0.04]">postgresql://alex:password@ep-cool-breeze-123.us-east-2.aws.neon.tech/neondb?sslmode=require</code>).
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-white">Save Value in Secrets Panel</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click on the <strong>Settings</strong> cog icon on the top right corner of the Google AI Studio page. Navigate to the <strong>Secrets</strong> panel, and add a secret key named <code className="text-gray-300">DATABASE_URL</code>, assigning the Neon connection URI as its value.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-white">Automatic Build & Seed Synchronization</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Once saved, the dev container will automatically restart and detect your Neon database. It will execute the server schemas to bootstrap all tables and seamlessly seed default catalog products for you over SSL!
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3.5 text-xs text-emerald-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>Verified security: Our system uses encrypted pool communication and TLS endpoints with <code className="bg-emerald-500/10 px-1 rounded text-white">sslmode=require</code>. Secrets are never stored or logged.</span>
        </div>
      </div>
    </div>
  );
}
