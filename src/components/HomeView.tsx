import React from "react";
import { ArrowRight, Sparkles, Truck, RefreshCw, Headphones, ShieldCheck, Check, Lock } from "lucide-react";
import { Product } from "../data/products";
import ProductCard from "./ProductCard";

export const SLIDER_HEROES = [
  {
    title: "Sounds Better",
    accentTitle: "The Future",
    subtitle: "Ultra-realistic sound. Timeless design.",
    desc: "Built for the next generation. Features active cloud audio, titanium drivers, and custom noise cancellation.",
    cta: "Shop Now",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "Gravity Suspension",
    accentTitle: "Vortex Loop",
    subtitle: "Run faster. Absorb gravity.",
    desc: "Quantum smart-shocks react in real-time to your stride, returning 99% kinetic velocity energy.",
    cta: "Examine Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200",
  }
];

interface HomeViewProps {
  activeHeroIdx: number;
  setActiveHeroIdx: (idx: number) => void;
  categoriesList: string[];
  setSelectedCategory: (cat: string) => void;
  setCurrentSection: (section: any) => void;
  featuredProducts: Product[];
  trendingProducts: Product[];
  countdown: { hours: number; minutes: number; seconds: number };
  formatTime: (num: number) => string;
  handleAddToCart: (product: Product) => void;
  setSelectedProduct: (product: Product) => void;
  handleToggleWishlist: (product: Product) => void;
  wishlist: string[];
  subscribeEmail: string;
  setSubscribeEmail: React.Dispatch<React.SetStateAction<string>>;
  subscribeStatus: string;
  handleSubscribe: (e: React.FormEvent) => void;
  currency?: string;
}

export default function HomeView({
  activeHeroIdx,
  setActiveHeroIdx,
  categoriesList,
  setSelectedCategory,
  setCurrentSection,
  featuredProducts,
  trendingProducts,
  countdown,
  formatTime,
  handleAddToCart,
  setSelectedProduct,
  handleToggleWishlist,
  wishlist,
  subscribeEmail,
  setSubscribeEmail,
  subscribeStatus,
  handleSubscribe,
  currency = "USD"
}: HomeViewProps) {
  return (
    <>
      {/* Massive futuristic slider hero banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/[0.04] p-6 md:p-12 min-h-[380px] md:min-h-[440px] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-nexora-dark via-nexora-dark/70 to-transparent z-10" />
          <img
            referrerPolicy="no-referrer"
            src={SLIDER_HEROES[activeHeroIdx].image}
            alt="Hero Slide Graphic"
            className="object-cover w-full h-full opacity-35"
          />
          {/* Neon backlight overlay */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-[120px]" />
        </div>

        {/* Subtitle call */}
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3.5 py-1 text-[10px] font-mono leading-none tracking-widest font-bold bg-nexora-primary text-white rounded-lg shadow-lg shadow-nexora-primary/15 uppercase">
            New Launch
          </span>
          
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight leading-tight uppercase">
              {SLIDER_HEROES[activeHeroIdx].accentTitle}
              <span className="block text-nexora-primary glow-text text-2xl sm:text-4xl capitalize font-medium mt-1">
                {SLIDER_HEROES[activeHeroIdx].title}
              </span>
            </h1>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed max-w-md">
            {SLIDER_HEROES[activeHeroIdx].desc}
          </p>

          <div className="pt-2 flex gap-4">
            <button
              id="hero-shop-now-btn"
              onClick={() => {
                setCurrentSection("categories");
                setSelectedCategory("All");
              }}
              className="px-6 py-3 bg-nexora-primary hover:bg-nexora-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 glow-primary cursor-pointer flex items-center gap-2 active:scale-95 uppercase"
            >
              {SLIDER_HEROES[activeHeroIdx].cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slider pagination triggers */}
        <div className="absolute bottom-6 left-6 md:left-12 z-10 flex gap-2">
          {SLIDER_HEROES.map((_, idx) => (
            <button
              key={idx}
              id={`hero-slide-indicator-${idx}`}
              onClick={() => setActiveHeroIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${activeHeroIdx === idx ? 'w-8 bg-nexora-primary' : 'w-2.5 bg-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Category Chips Scroll list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
          <h3 className="font-sans font-extrabold text-base text-white uppercase tracking-wider">Browse Sectors</h3>
          <span className="text-xs text-gray-500 font-mono">Select to filter catalog</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              id={`category-chip-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentSection("categories");
              }}
              className={`
                px-5 py-3 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer border border-white/[0.04]
                ${cat === "All"
                  ? "bg-nexora-surface text-white hover:border-nexora-primary"
                  : "bg-nexora-surface text-gray-400 hover:text-white hover:border-nexora-primary"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured products grid & Deal of the Day widget adjacent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 1. Featured list (Left 9 columns) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <h3 className="font-sans font-extrabold text-lg text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-nexora-primary" />
              Featured Products
            </h3>
            <button
              id="featured-view-all-btn"
              onClick={() => {
                setCurrentSection("categories");
                setSelectedCategory("All");
              }}
              className="text-xs text-nexora-primary hover:text-white font-semibold flex items-center gap-1 transition-colors capitalize cursor-pointer"
            >
              View All Products
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.includes(p.id)}
                currency={currency}
              />
            ))}
          </div>
        </div>

        {/* 2. Countdown Deal of the Day widget (Right 3 columns) */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-b from-indigo-950/80 to-slate-950 rounded-3xl border border-purple-500/20 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[410px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/15 rounded-full blur-[35px]" />
            
            <div className="space-y-4">
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest font-bold bg-purple-500/20 text-purple-300 rounded uppercase">
                Deal of the day
              </span>
              
              <div className="space-y-1.5">
                <h4 className="font-sans font-extrabold text-2xl text-white tracking-tight uppercase leading-tight">
                  Up to 50% Off
                </h4>
                <p className="text-xs text-gray-400">On selected modern audio, lifestyle accessories and gadgets.</p>
              </div>

              {/* Display clock timer countdown */}
              <div className="grid grid-cols-3 gap-2.5 py-4 text-center font-mono select-none">
                <div className="bg-slate-900 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-lg font-bold text-white">{formatTime(countdown.hours)}</span>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">HRS</span>
                </div>
                <div className="bg-slate-900 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-lg font-bold text-white">{formatTime(countdown.minutes)}</span>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">MINS</span>
                </div>
                <div className="bg-slate-900 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-lg font-bold text-purple-300 animate-pulse">{formatTime(countdown.seconds)}</span>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">SECS</span>
                </div>
              </div>
            </div>

            <div className="space-y-4.5 pt-6 border-t border-white/[0.04]">
              <button
                id="countdown-shop-now-btn"
                onClick={() => {
                  setCurrentSection("deals");
                  setSelectedCategory("All");
                }}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-2xl shadow-lg hover:shadow-purple-700/20 transition-all cursor-pointer uppercase active:scale-95"
              >
                Shop Sale Items
              </button>

              <div className="p-3 bg-slate-900 border border-white/[0.04] rounded-xl flex items-center gap-2.5 text-[10px] text-gray-500">
                <Lock className="w-3.5 h-3.5 text-nexora-primary shrink-0" />
                <span>Authenticated transactions processed with SSL.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust assurances element banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-nexora-surface/50 border border-white/[0.04] p-6 rounded-3xl items-center">
        <div className="flex items-center gap-3.5 py-1">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white">Free Priority shipping</h5>
            <p className="text-[10px] text-gray-400 mt-0.5">On all orders exceeding $50</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 py-1">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white">Easy Returns</h5>
            <p className="text-[10px] text-gray-400 mt-0.5">30-day returned guarantee refund</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 py-1">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white">24/7 Smart Support</h5>
            <p className="text-[10px] text-gray-400 mt-0.5">Always synchronized ready helper</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 py-1">
          <div className="w-10 h-10 rounded-xl bg-nexora-primary/10 border border-nexora-primary/20 text-nexora-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white">Secure Payments</h5>
            <p className="text-[10px] text-gray-400 mt-0.5">100% verified SSL checkout</p>
          </div>
        </div>
      </div>

      {/* Trending Now grid list */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <h3 className="font-sans font-extrabold text-lg text-white uppercase tracking-wider">
            Trending Now
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {trendingProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(p.id)}
              currency={currency}
            />
          ))}
        </div>
      </div>

      {/* Footer Information Blocks and subscription community */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/[0.04]">
        
        {/* 1. Why Shop with Nexora */}
        <div className="glass-panel border border-white/[0.04] p-8 rounded-3xl space-y-4">
          <h4 className="font-sans font-extrabold text-base text-white tracking-wide uppercase">Why Shop With Nexora?</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-nexora-primary uppercase">01</span>
              <h5 className="font-bold text-xs text-purple-150">Curated Collections</h5>
              <p className="text-[10px] text-gray-500 leading-relaxed">Handpicked elite tech and luxury wearables.</p>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-purple-400 uppercase">02</span>
              <h5 className="font-bold text-xs text-purple-150">Exclusive Rewards</h5>
              <p className="text-[10px] text-gray-500 leading-relaxed">Direct cashback and member perks.</p>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-yellow-400 uppercase">03</span>
              <h5 className="font-bold text-xs text-purple-150">Fast & Secure</h5>
              <p className="text-[10px] text-gray-500 leading-relaxed">Encrypted accounts and global shipping.</p>
            </div>
          </div>
        </div>

        {/* 2. Join the Nexora Community */}
        <div className="glass-panel border border-white/[0.04] p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-extrabold text-base text-white tracking-wide uppercase">Join The Nexora Community</h4>
            <p className="text-xs text-gray-400 mt-2">Subscribe to get secret giveaways, elite early drops and rewards.</p>
          </div>

          <form id="home-subscribe-form" onSubmit={handleSubscribe} className="flex gap-2 mt-6">
            <input
              id="home-subscribe-email"
              type="email"
              required
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="Enter your cryptographic email"
              className="flex-1 px-4 py-3 bg-slate-900 border border-white/[0.06] focus:border-nexora-primary rounded-xl text-xs text-white focus:outline-none placeholder-gray-500"
            />
            <button
              id="home-subscribe-btn"
              type="submit"
              className="px-5 py-3 bg-nexora-primary hover:bg-nexora-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 text-center"
            >
              {subscribeStatus === "success" ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
