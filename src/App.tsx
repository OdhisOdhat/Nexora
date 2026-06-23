import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Truck, 
  RefreshCw, 
  Headphones, 
  ShieldCheck, 
  Star, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Search,
  Bell,
  Trash2,
  Lock,
  User,
  LogOut,
  Sliders,
  Send,
  Check,
  X,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { PRODUCTS, Product, MERCHANT_LOCATIONS } from "./data/products";
import { Section, CartItem } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import PrimeUpgradeModal from "./components/PrimeUpgradeModal";
import AICompanion from "./components/AICompanion";
import MerchantPortal from "./components/MerchantPortal";
import AdminPanel from "./components/AdminPanel";

import HomeView from "./components/HomeView";
import BrowseView from "./components/BrowseView";
import CollectionsView from "./components/CollectionsView";
import TopBrandsView from "./components/TopBrandsView";
import ProfileView from "./components/ProfileView";
import WishlistView from "./components/WishlistView";
import OrdersView from "./components/OrdersView";
import SettingsView from "./components/SettingsView";
import AuthOverlay from "./components/AuthOverlay";
import RiderPortal from "./components/RiderPortal";

// User email injected from development metadata context
const DEFAULT_USER_EMAIL = "fodhis1@gmail.com";

export default function App() {
  // Navigation Routing States
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");

  useEffect(() => {
    setSelectedSubCategory("All");
  }, [selectedCategory]);

  // Dynamic Authenticated User State
  const [user, setUser] = useState<{
    email: string;
    name: string;
    role: "customer" | "merchant" | "rider";
    locality?: string;
    brandName?: string;
  } | null>(() => {
    const stored = localStorage.getItem("nexora_auth_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [authOpen, setAuthOpen] = useState(false);
  const currentUserEmail = user?.email || DEFAULT_USER_EMAIL;

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    localStorage.setItem("nexora_auth_user", JSON.stringify(authUser));
    setAuthOpen(false);
    notify(`Connected node successfully as ${authUser.name}!`);
    if (authUser.role === "rider") {
      setCurrentSection("rider-portal");
    } else if (authUser.role === "merchant") {
      setCurrentSection("merchant-portal");
    } else {
      setCurrentSection("home");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("nexora_auth_user");
    notify("Session cleared. Connection dropped.");
    setCurrentSection("home");
  };
  
  // Interactive Overlays
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [primeOpen, setPrimeOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Cart Data States
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  // Global Currency conversion state
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("nexora_selected_currency") || "USD";
  });

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem("nexora_selected_currency", newCurrency);
  };

  // Prime status state
  const [isPrimeUser, setIsPrimeUser] = useState(() => {
    return localStorage.getItem("nexora_prime") === "true";
  });

  // Visual Theme Mode State (light vs dark)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("nexora_theme") as "light" | "dark") || "dark";
  });

  // Apply theme class to root html/documentElement on change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("nexora_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Database Connection Status Information
  const [dbStatus, setDbStatus] = useState({ postgresActive: false, storageMethod: "Connecting..." });

  // Hero Slider Ticker
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Active Deals Countdown States (08h : 45m : 32s)
  const [countdown, setCountdown] = useState({ hours: 8, minutes: 45, seconds: 32 });

  // News subscription states
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success">("idle");

  // Notifications logging
  const [notifications, setNotifications] = useState<string[]>([]);
  const [ordersLog, setOrdersLog] = useState<any[]>([]);

  // Full-stack database initialization synchronizer
  const syncWithDatabase = useCallback(async () => {
    try {
      const statusRes = await fetch("/api/db-status");
      if (statusRes.ok) {
        const statusObj = await statusRes.json();
        setDbStatus(statusObj);
      }

      // Fetch products dynamically to display newly listed merchant wares
      const productsRes = await fetch("/api/products");
      if (productsRes.ok) {
        const loadedProducts = await productsRes.json();
        if (loadedProducts && loadedProducts.length > 0) {
          setProductsList(loadedProducts);
        }
      }

      const cartRes = await fetch(`/api/cart?email=${encodeURIComponent(currentUserEmail)}`);
      if (cartRes.ok) {
        const cartItems = await cartRes.json();
        setCart(cartItems);
      }

      const wishlistRes = await fetch(`/api/wishlist?email=${encodeURIComponent(currentUserEmail)}`);
      if (wishlistRes.ok) {
        const wlList = await wishlistRes.json();
        setWishlist(wlList);
      }

      const ordersRes = await fetch(`/api/orders?email=${encodeURIComponent(currentUserEmail)}`);
      if (ordersRes.ok) {
        const list = await ordersRes.json();
        setOrdersLog(list);
      }
    } catch (err) {
      console.error("Database initial sync failed:", err);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  // Check URL query parameters on startup to auto-open shared products
  useEffect(() => {
    if (productsList && productsList.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("product");
      if (productId) {
        const found = productsList.find((p) => p.id === productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [productsList]);

  // Deal of the Day active ticker loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Restart countdown
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown outputs to string (double zero buffers)
  const formatTime = (num: number) => num.toString().padStart(2, "0");

  const notify = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
  };

  // Add Item to cart quantity selector
  const handleAddToCart = async (product: Product) => {
    // Optimistic state update
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: 1
      }];
    });

    notify(`Added ${product.name} to your basket.`);

    // Persist to server db
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, productId: product.id, quantity: 1 })
      });
    } catch (err) {
      console.error("DB cart add operation failed:", err);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    // Optimistic update
    setCart((prev) => 
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    try {
      await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, productId: id, quantity })
      });
    } catch (err) {
      console.error("DB cart update operation failed:", err);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setCart((prev) => {
      const removedItem = prev.find(item => item.id === id);
      if (removedItem) notify(`Removed ${removedItem.name} from cart.`);
      return prev.filter((item) => item.id !== id);
    });

    try {
      await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, productId: id })
      });
    } catch (err) {
      console.error("DB cart remove operation failed:", err);
    }
  };

  const handleClearCart = async () => {
    setCart([]);
    try {
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail })
      });

      // Reload order list from database to register the purchase
      const ordersRes = await fetch(`/api/orders?email=${encodeURIComponent(currentUserEmail)}`);
      if (ordersRes.ok) {
        const list = await ordersRes.json();
        setOrdersLog(list);
      }
    } catch (err) {
      console.error("DB clear operation failed:", err);
    }
  };

  // Wishlist actions toggle
  const handleToggleWishlist = async (product: Product) => {
    const exists = wishlist.includes(product.id);
    setWishlist((prev) => {
      if (exists) {
        notify(`Removed ${product.name} from wishlist.`);
        return prev.filter((id) => id !== product.id);
      } else {
        notify(`Added ${product.name} to wishlist.`);
        return [...prev, product.id];
      }
    });

    try {
      await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, productId: product.id })
      });
    } catch (err) {
      console.error("DB wishlist operation failed:", err);
    }
  };

  const handleUpgradePrimeUser = () => {
    setIsPrimeUser(true);
    localStorage.setItem("nexora_prime", "true");
    notify("Upgraded to NEXORA PRIME! Priority drone delivery is now open.");
  };

  // Newsletter action
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribeStatus("success");
    notify("Thank you! You are locked into Nexora community rewards.");
    setTimeout(() => {
      setSubscribeEmail("");
      setSubscribeStatus("idle");
    }, 4000);
  };

  // Safe category filter matching list matches
  const categoriesList = ["All", "Electronics", "Sports", "Home & Living", "Beauty", "Lifestyle", "Fashion", "Digital Art"];

  // Perform search and filter calculations
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // 1. Term check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === "" || 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query) || 
        (product.subCategory && product.subCategory.toLowerCase().includes(query)) ||
        product.description.toLowerCase().includes(query) ||
        (product.merchantBrand && product.merchantBrand.toLowerCase().includes(query));

      // 2. Category check
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

      // 3. Subcategory check
      const matchesSubCategory = selectedSubCategory === "All" || product.subCategory === selectedSubCategory;

      // 4. Page specific filters checks
      let matchesPage = true;
      if (currentSection === "deals") {
        matchesPage = !!product.originalPrice;
      } else if (currentSection === "new-arrivals") {
        matchesPage = product.tag === "New" || product.tag === "Limited" || product.merchantEmail !== undefined;
      } else if (currentSection === "collections") {
        // High priority collections subset list
        matchesPage = true;
      }

      return matchesSearch && matchesCategory && matchesSubCategory && matchesPage;
    });
  }, [searchQuery, selectedCategory, selectedSubCategory, currentSection, productsList]);

  // Derived featured list outputs
  const featuredProducts = useMemo(() => {
    return productsList.filter((p) => p.isFeatured);
  }, [productsList]);

  const trendingProducts = useMemo(() => {
    return productsList.filter((p) => p.isTrending);
  }, [productsList]);

  // Quick navigation helpers from bot chips
  const handleBotSuggestNav = (type: string, param?: string) => {
    if (type === "section" && param) {
      setCurrentSection(param as Section);
    }
    if (type === "category" && param) {
      setCurrentSection("categories");
      setSelectedCategory(param);
    }
  };

  return (
    <div className="flex bg-nexora-dark min-h-screen text-gray-200">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onOpenPrime={() => setPrimeOpen(true)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isPrimeUser={isPrimeUser}
        userRole={user?.role}
        onSignOut={handleSignOut}
      />

      {/* 2. Main content framework viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header containing search triggers, wishlist indicators, and cart buttons */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          onOpenCart={() => setCartDrawerOpen(true)}
          onOpenWishlist={() => setWishlistDrawerOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          userEmail={currentUserEmail}
          theme={theme}
          onToggleTheme={toggleTheme}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          user={user}
          onOpenAuth={() => setAuthOpen(true)}
        />

        {/* Fullstack SQL Database Connectivity Indicator Ribbon */}
        <div className="mx-4 md:mx-8 mt-4 p-3.5 bg-slate-900/50 border border-white/[0.04] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${dbStatus.postgresActive ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-purple-400 shadow-[0_0_10px_#a855f7]"} shrink-0 animate-ping`} />
            <span className="font-bold text-gray-300 tracking-wide uppercase text-[10px] font-mono">Nexora Database Node:</span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] text-purple-300 font-mono text-[10px] uppercase font-bold tracking-wider border border-white/[0.02]">
              {dbStatus.storageMethod}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-extrabold">✓</span> Tables: products, cart, wishlist, orders, order_items, chats
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <span className="text-emerald-400">●</span> Synced
            </span>
          </div>
        </div>

        {/* Global Floating Toast indicators */}
        <div className="fixed top-20 right-6 z-40 space-y-2 pointer-events-none max-w-sm">
          <AnimatePresence>
            {notifications.slice(0, 3).map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="p-3.5 bg-slate-900/95 border border-purple-500/20 rounded-xl shadow-lg flex items-center gap-2.5 text-xs text-white"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                <span>{note}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Main interactive Viewport Section router router */}
        <main className="flex-1 p-4 md:p-8 space-y-10 md:space-y-12">
          
          {currentSection === "home" ? (
            <HomeView
              activeHeroIdx={activeHeroIdx}
              setActiveHeroIdx={setActiveHeroIdx}
              categoriesList={categoriesList}
              setSelectedCategory={setSelectedCategory}
              setCurrentSection={setCurrentSection}
              featuredProducts={featuredProducts}
              trendingProducts={trendingProducts}
              countdown={countdown}
              formatTime={formatTime}
              handleAddToCart={handleAddToCart}
              setSelectedProduct={setSelectedProduct}
              handleToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
              subscribeEmail={subscribeEmail}
              setSubscribeEmail={setSubscribeEmail}
              subscribeStatus={subscribeStatus}
              handleSubscribe={handleSubscribe}
              currency={currency}
            />
          ) : currentSection === "categories" || currentSection === "deals" ? (
            <BrowseView
              currentSection={currentSection}
              categoriesList={categoriesList}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              filteredProducts={filteredProducts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleAddToCart={handleAddToCart}
              setSelectedProduct={setSelectedProduct}
              handleToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
              currency={currency}
            />
          ) : currentSection === "collections" ? (
            <CollectionsView
              productsList={productsList}
              handleAddToCart={handleAddToCart}
              notify={notify}
              setCartDrawerOpen={setCartDrawerOpen}
            />
          ) : currentSection === "top-brands" ? (
            <TopBrandsView />
          ) : currentSection === "profile" ? (
            !user ? (
              <AuthOverlay onAuthSuccess={handleAuthSuccess} />
            ) : (
              <ProfileView 
                userEmail={currentUserEmail} 
                isPrimeUser={isPrimeUser} 
              />
            )
          ) : currentSection === "wishlist" ? (
            <WishlistView
              productsList={productsList}
              wishlist={wishlist}
              handleAddToCart={handleAddToCart}
              setSelectedProduct={setSelectedProduct}
              handleToggleWishlist={handleToggleWishlist}
              setCurrentSection={setCurrentSection}
              currency={currency}
            />
          ) : currentSection === "orders" ? (
            !user ? (
              <AuthOverlay onAuthSuccess={handleAuthSuccess} />
            ) : (
              <OrdersView ordersLog={ordersLog} />
            )
          ) : currentSection === "merchant-portal" ? (
            !user || user.role !== "merchant" ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center text-xs font-semibold text-purple-450">
                  Please log in as a Merchant Node to list products & configure prices.
                </div>
                <AuthOverlay onAuthSuccess={handleAuthSuccess} />
              </div>
            ) : (
              <MerchantPortal 
                userEmail={currentUserEmail} 
                onProductAdded={async () => {
                  const refreshedRes = await fetch("/api/products");
                  if (refreshedRes.ok) {
                    const items = await refreshedRes.json();
                    if (items && items.length > 0) {
                      setProductsList(items);
                    }
                  }
                }} 
              />
            )
          ) : currentSection === "rider-portal" ? (
            !user || user.role !== "rider" ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-semibold text-emerald-400">
                  Authentication Required: Connect active local Rider credentials to inspect regional logistics tasks.
                </div>
                <AuthOverlay onAuthSuccess={handleAuthSuccess} />
              </div>
            ) : (
              <RiderPortal 
                riderEmail={currentUserEmail} 
                riderName={user.name} 
                riderLocality={user.locality || "Midtown"} 
                onProductDelivered={syncWithDatabase} 
              />
            )
          ) : currentSection === "settings" ? (
            <SettingsView
              userEmail={currentUserEmail}
              dbStatus={dbStatus}
              onRefreshStatus={syncWithDatabase}
            />
          ) : currentSection === "admin-panel" ? (
            <AdminPanel />
          ) : (
            /* =======================================================
               OTHER PLACEHOLDERS (addresses, payment)
               ======================================================= */
            <div className="space-y-8 max-w-xl">
              <div className="pb-4 border-b border-white/[0.04]">
                <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider capitalize">
                  {currentSection.replace("-", " ")} Page
                </h2>
              </div>

              <div className="p-6 bg-nexora-surface rounded-3xl border border-white/[0.04] space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-wider">
                  Nexora Cyber Systems {currentSection} Configuration.
                </p>
                <div className="p-4 bg-slate-900 border border-white/[0.04] rounded-2xl text-xs space-y-1.5 text-gray-500 leading-relaxed">
                  <span>No custom settings edits required for generic mockups. Live e-commerce databases, trackers and drone indicators are operational.</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. Immersive Interactive Overlays & Drawers */}
      
      {/* Product View inspection card Details Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        currency={currency}
      />

      {/* Shopping Cart Drawer panel */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        isPrimeUser={isPrimeUser}
        currency={currency}
      />

      {/* Wishlist Drawer slide-out */}
      <AnimatePresence>
        {wishlistDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              id="wishlist-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWishlistDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                id="wishlist-drawer-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="w-screen max-w-md bg-nexora-surface border-l border-white/[0.04] p-0 flex flex-col h-full shadow-2xl"
              >
                <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <h3 className="font-sans font-bold text-base text-white tracking-wide uppercase">Your Favorites ({wishlist.length})</h3>
                  </div>
                  <button onClick={() => setWishlistDrawerOpen(false)} className="p-1.5 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-white">
                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full py-20 text-gray-500">
                      <Heart className="w-12 h-12 stroke-1 mb-3" />
                      <p className="text-xs">No favorites added yet.</p>
                    </div>
                  ) : (
                    PRODUCTS.filter(p => wishlist.includes(p.id)).map(item => (
                      <div key={item.id} className="flex gap-4 p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04] items-center justify-between">
                        <div className="flex gap-3 items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0" />
                          <div>
                            <h5 className="font-bold text-xs text-white line-clamp-1">{item.name}</h5>
                            <span className="font-mono text-[10px] text-purple-200">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <button
                            id={`wishlist-drawer-add-cart-${item.id}`}
                            onClick={() => { handleAddToCart(item); setWishlistDrawerOpen(false); setCartDrawerOpen(true); }}
                            className="px-3 py-1.5 bg-nexora-primary hover:bg-nexora-primary-hover text-[10px] font-bold rounded-lg text-white transition-opacity shrink-0 uppercase"
                          >
                            Add To Cart
                          </button>
                          <button
                            id={`wishlist-drawer-delete-${item.id}`}
                            onClick={() => handleToggleWishlist(item)}
                            className="p-1 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Elite VIP Prime promo popup */}
      <PrimeUpgradeModal
        isOpen={primeOpen}
        onClose={() => setPrimeOpen(false)}
        onUpgrade={handleUpgradePrimeUser}
      />

      {/* Authentic Auth modal popup overlay */}
      <AnimatePresence>
        {authOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div
              id="auth-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              id="auth-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md"
            >
              <button
                id="auth-modal-close"
                onClick={() => setAuthOpen(false)}
                className="absolute right-4 top-4 text-gray-450 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <AuthOverlay onAuthSuccess={handleAuthSuccess} onClose={() => setAuthOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI chatbot assistant recommendations bubble */}
      <AICompanion onSuggestAction={handleBotSuggestNav} />

    </div>
  );
}
