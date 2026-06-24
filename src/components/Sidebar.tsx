import { 
  Home, 
  Grid, 
  Layers, 
  Percent, 
  Sparkle, 
  Award, 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  X,
  Zap,
  Store,
  Shield,
  Truck,
  LogOut
} from "lucide-react";
import { motion } from "motion/react";
import { Section } from "../types";

interface SidebarProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  onOpenPrime: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isPrimeUser: boolean;
  userRole?: "customer" | "merchant" | "rider" | "admin" | null;
  onSignOut?: () => void;
}

export default function Sidebar({
  currentSection,
  onSectionChange,
  onOpenPrime,
  isMobileOpen,
  onCloseMobile,
  isPrimeUser,
  userRole = null,
  onSignOut
}: SidebarProps) {
  
  const mainNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "collections", label: "Collections", icon: Layers },
    { id: "deals", label: "Deals & Offers", icon: Percent, badge: "Sale" },
    { id: "new-arrivals", label: "New Arrivals", icon: Sparkle },
    { id: "top-brands", label: "Top Brands", icon: Award },
  ];

  const merchantNavItems = [
    { id: "merchant-portal", label: "Merchant Suite", icon: Store, badge: "Sell" }
  ];

  const riderNavItems = [
    { id: "rider-portal", label: "Rider Logistics", icon: Truck, badge: "Drop" }
  ];

  const adminNavItems = [
    { id: "admin-panel", label: "Admin Observatory", icon: Shield, badge: "Sec" }
  ];

  const accountNavItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (sectionId: Section) => {
    onSectionChange(sectionId);
    onCloseMobile();
  };

  const navClass = (id: Section) => `
    flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
    ${currentSection === id 
      ? 'bg-nexora-primary text-white glow-primary' 
      : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
    }
  `;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-nexora-surface text-gray-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-nexora-primary rounded-xl flex items-center justify-center glow-primary">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-sans font-bold text-xl tracking-wider text-white">NEXORA</span>
            <span className="text-[10px] block text-nexora-primary font-mono tracking-widest font-semibold uppercase">NEXT-GEN RETAIL</span>
          </div>
        </div>
        <button 
          id="sidebar-close-mobile-btn"
          aria-label="Close sidebar"
          onClick={onCloseMobile} 
          className="md:hidden text-gray-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {/* Main Sections */}
        <div>
          <h4 className="px-4 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Shop Discovery</h4>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id as Section)}
                className={navClass(item.id as Section)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-nexora-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rider Suite Section Link */}
        {userRole === "rider" && (
          <div>
            <h4 className="px-4 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Courier Logistics</h4>
            <div className="space-y-1">
              {riderNavItems.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id as Section)}
                  className={navClass(item.id as Section)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Merchant Suite Partner Link */}
        {userRole === "merchant" && (
          <div>
            <h4 className="px-4 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Merchant Node</h4>
            <div className="space-y-1">
              {merchantNavItems.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id as Section)}
                  className={navClass(item.id as Section)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Suite Section Link */}
        {userRole === "admin" && (
          <div>
            <h4 className="px-4 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Admin Suite</h4>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id as Section)}
                  className={navClass(item.id as Section)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Account and profile sections */}
        <div>
          <h4 className="px-4 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Your Account</h4>
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id as Section)}
                className={navClass(item.id as Section)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Callout Card & Active User Badge */}
      <div className="p-4 border-t border-white/[0.04] space-y-3">
        {userRole && onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        )}

        {isPrimeUser ? (
          <div className="p-4 bg-gradient-to-br from-purple-900/40 to-indigo-950/40 rounded-2xl border border-purple-500/30 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full blur-xl"></div>
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce" />
            <h5 className="font-bold text-sm text-purple-200">NEXORA PRIME ACTIVE</h5>
            <p className="text-[10px] text-gray-400 mt-1">Free 1h shipping, 5% Cashback, live drone delivery active.</p>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-white/[0.04] text-center relative overflow-hidden">
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-nexora-primary/10 rounded-full blur-xl"></div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Upgrade to</p>
            <h5 className="font-bold text-sm text-white tracking-widest">NEXORA PRIME</h5>
            
            <div className="my-3 space-y-1.5 text-left text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="text-nexora-primary font-bold">✓</span> Free Ultra-Fast Priority Delivery
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-nexora-primary font-bold">✓</span> Exclusive Smart Rewards
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-nexora-primary font-bold">✓</span> Elite Early Release Drops
              </div>
            </div>

            <button
              id="sidebar-upgrade-prime-btn"
              onClick={onOpenPrime}
              className="w-full py-2.5 bg-nexora-primary hover:bg-nexora-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 glow-primary cursor-pointer active:scale-95"
            >
              Try Prime Free
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 border-r border-white/[0.04] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Back-drop overlay */}
      {isMobileOpen && (
        <div 
          aria-hidden="true"
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Mobile Sidebar Slide Drawer */}
      <motion.aside
        id="sidebar-mobile-drawer"
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden border-r border-white/[0.04]"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
