import { 
  Search, 
  Bell, 
  Heart, 
  ShoppingBag, 
  Menu, 
  User,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onToggleMobileSidebar: () => void;
  userEmail: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  user?: {
    email: string;
    name: string;
    role: "customer" | "merchant" | "rider";
    locality?: string;
    brandName?: string;
  } | null;
  onOpenAuth?: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onToggleMobileSidebar,
  userEmail,
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  user = null,
  onOpenAuth
}: HeaderProps) {
  
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-nexora-dark/85 backdrop-blur-md border-b border-white/[0.04]">
      {/* Brand logo on mobile + Burger toggle */}
      <div className="flex items-center gap-3">
        <button
          id="header-mobile-sidebar-toggle-btn"
          aria-label="Toggle navigation menu"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 bg-nexora-primary rounded-lg flex items-center justify-center glow-primary">
            <span className="font-bold text-white text-xs">N</span>
          </div>
          <span className="font-sans font-bold text-md tracking-wider text-white">NEXORA</span>
        </div>
      </div>

      {/* Futuristic search box with scanning icon design */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-6 relative">
        <span className="absolute left-4 text-gray-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          id="header-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items, categories, collections..."
          className="w-full pl-11 pr-4 py-2.5 bg-nexora-surface text-white text-sm rounded-xl border border-white/[0.08] focus:border-nexora-primary focus:ring-1 focus:ring-nexora-primary focus:outline-none transition-all duration-200 placeholder-gray-500"
        />
        <div className="absolute right-3.5 px-1.5 py-0.5 rounded bg-slate-850 border border-white/[0.04] text-[10px] text-gray-500 font-mono select-none">
          ⌘K
        </div>
      </div>

      {/* Header Utilities bar */}
      <div className="flex items-center gap-1.5 md:gap-3.5">
        {/* Dynamic Light/Dark Theme Toggle */}
        <button
          id="header-theme-toggle-btn"
          aria-label="Toggle visual theme"
          onClick={onToggleTheme}
          className="relative p-2.5 text-gray-400 hover:text-white hover:bg-slate-800/10 rounded-xl transition-all active:scale-95"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Simple Notification simulator */}
        <button
          id="header-notification-btn"
          aria-label="Open notifications"
          className="relative p-2.5 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-nexora-primary rounded-full animate-ping" />
        </button>

        {/* Wishlist triggers */}
        <button
          id="header-wishlist-btn"
          aria-label="Open wishlist"
          onClick={onOpenWishlist}
          className="relative p-2.5 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group"
        >
          <Heart className="w-5 h-5 group-hover:scale-110 group-hover:text-red-400 transition-colors" />
          {wishlistCount > 0 && (
            <motion.span
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-mono font-bold px-1 glow-accent border border-slate-900"
            >
              {wishlistCount}
            </motion.span>
          )}
        </button>

        {/* Shopping Cart button */}
        <button
          id="header-cart-btn"
          aria-label="Open shopping cart"
          onClick={onOpenCart}
          className="relative flex items-center gap-2 p-2 px-3 bg-nexora-surface/60 border border-white/[0.05] hover:border-nexora-primary text-gray-200 hover:text-white rounded-xl transition-all group cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-nexora-primary group-hover:scale-105 transition-all" />
          <span className="hidden sm:inline text-xs font-semibold">Cart</span>
          <span className="min-w-5 h-5 bg-nexora-primary text-white rounded-full flex items-center justify-center text-[11px] font-mono font-bold px-1 glow-primary">
            {cartCount}
          </span>
        </button>

        {/* Dynamic Global Currency Selector */}
        <div className="relative">
          <select
            id="currency-selector"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="px-2.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-gray-300 hover:text-white text-xs font-bold font-mono border border-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-all duration-200"
            title="Convert marketplace prices based on merchant base currency"
          >
            <option value="USD" className="bg-slate-950 text-white">🇺🇸 USD ($)</option>
            <option value="GBP" className="bg-slate-950 text-white">🇬🇧 GBP (£)</option>
            <option value="EUR" className="bg-slate-950 text-white">🇪🇺 EUR (€)</option>
            <option value="JPY" className="bg-slate-950 text-white">🇯🇵 JPY (¥)</option>
            <option value="KES" className="bg-slate-950 text-white">🇰🇪 KES (KSh)</option>
            <option value="CAD" className="bg-slate-950 text-white">🇨🇦 CAD (C$)</option>
            <option value="AUD" className="bg-slate-950 text-white">🇦🇺 AUD (A$)</option>
            <option value="LOCAL" className="bg-slate-950 text-purple-300 font-bold">🌍 Local Currency</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/[0.08]" />

        {/* Profile Avatar / User identifier or Sign In Control */}
        {user ? (
          <div className="flex items-center gap-2 group cursor-pointer" title="Manage connection node">
            <div className={`w-10 h-10 rounded-xl border transition-all overflow-hidden bg-slate-800 flex items-center justify-center relative ${
              user.role === "merchant" 
                ? "border-purple-500/50 group-hover:border-purple-400" 
                : user.role === "rider" 
                  ? "border-emerald-500/50 group-hover:border-emerald-400" 
                  : "border-white/[0.08] group-hover:border-nexora-primary"
            }`}>
              <User className="w-5 h-5 text-gray-300" />
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                user.role === "merchant" 
                  ? "bg-purple-500" 
                  : user.role === "rider" 
                    ? "bg-emerald-500" 
                    : "bg-nexora-primary"
              }`} />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-200 truncate max-w-28">{user.name}</p>
              <p className="text-[9px] text-gray-400 font-mono truncate max-w-28 uppercase tracking-wider font-bold">
                {user.role} {user.brandName ? `(${user.brandName})` : user.locality ? `[${user.locality}]` : ""}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
