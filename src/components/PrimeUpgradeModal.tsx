import { X, Sparkles, CheckCircle, Zap, Shield, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface PrimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PrimeUpgradeModal({
  isOpen,
  onClose,
  onUpgrade
}: PrimeUpgradeModalProps) {
  const [upgraded, setUpgraded] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    setUpgraded(true);
    setTimeout(() => {
      onUpgrade();
      setUpgraded(false);
      onClose();
    }, 2800);
  };

  const primeBenefits = [
    {
      title: "FREE Instant Priority Delivery",
      desc: "Instant dispatch via autonomous Nexora air drones. Products arrive within 1 hour.",
      icon: Zap,
    },
    {
      title: "5% Cashback Smart Rewards",
      desc: "Earn 5% flat cashback credits paid in Nexora tokens on every catalog purchase.",
      icon: Sparkles,
    },
    {
      title: "Elite Release VIP Drops",
      desc: "Unlock immediate premium purchase privileges to limited edition tech and fashion items.",
      icon: Shield,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          id="prime-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal content container */}
        <motion.div
          id="prime-modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-indigo-950/90 to-slate-950/95 rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl z-10 p-6 md:p-8"
        >
          {/* Close trigger button */}
          <button
            id="prime-modal-close-btn"
            aria-label="Close Prime upgrade panel"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {upgraded ? (
            /* Upgrading congratulations notice animation */
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <motion.div
                initial={{ rotate: 0, scale: 0.8 }}
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-20 h-20 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-yellow-400 glow-accent"
              >
                <Zap className="w-10 h-10" />
              </motion.div>
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-xl text-white tracking-widest uppercase">UPGRADING YOUR PROFILE...</h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  Synchronizing quantum priority accounts with drones and cashbacks. Welcome to Nexora Prime!
                </p>
              </div>
              <div className="w-full max-w-xs h-1 rounded-full bg-slate-850 overflow-hidden relative">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-1/3 bg-purple-500 glow-accent"
                />
              </div>
            </div>
          ) : (
            /* Prime Benefits Panel */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-mono tracking-widest font-bold rounded-lg uppercase">
                  Elite VIP Privileges
                </span>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight mt-1.5 uppercase">
                  UNLEASH NEXORA PRIME
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Step into the future of retail. Priority drone deliveries, unlimited cashbacks, and exclusive early catalog releases!
                </p>
              </div>

              {/* list of benefits */}
              <div className="space-y-4 pt-2">
                {primeBenefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-purple-500/10 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-purple-100">{benefit.title}</h5>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action operations and billing simulation details */}
              <div className="pt-4 border-t border-white/[0.04] text-center space-y-3.5">
                <div>
                  <span className="font-mono text-xl font-bold text-purple-300">$0.00</span>
                  <span className="text-xs text-gray-500 font-medium"> for the first 30 days, then $9.99/mo. Cancel anytime.</span>
                </div>
                <button
                  id="prime-modal-confirm-upgrade-btn"
                  onClick={handleUpgradeClick}
                  className="w-full py-4.5 bg-gradient-to-r from-nexora-primary to-nexora-accent text-white text-xs font-extrabold rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer uppercase tracking-wider active:scale-95"
                >
                  Activate Your 30-Day Free Trial
                </button>
                <p className="text-[10px] text-gray-500 font-mono">
                  By clicking, you authorize quantum mock simulations of recurring payment protocols.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
