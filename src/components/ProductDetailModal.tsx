import React, { useState } from "react";
import { X, Star, Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw, Zap, MapPin, Copy, Share2, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, MERCHANT_LOCATIONS } from "../data/products";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  currency?: string;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  currency = "USD"
}: ProductDetailModalProps) {
  if (!product) return null;

  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?product=${product.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const formatPrice = (priceUSD: number, merchantLoc?: string) => {
    let targetCurrencyCode = currency;
    if (currency === "LOCAL") {
      const loc = merchantLoc || "US";
      const locInfo = MERCHANT_LOCATIONS[loc] || MERCHANT_LOCATIONS.US;
      targetCurrencyCode = locInfo.code;
    }

    const info = Object.values(MERCHANT_LOCATIONS).find(m => m.code === targetCurrencyCode) || MERCHANT_LOCATIONS.US;
    const converted = priceUSD * info.rate;
    return `${info.symbol}${converted.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div
          id="detail-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Panel content Container */}
        <motion.div
          id={`detail-modal-panel-${product.id}`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-4xl bg-nexora-surface rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Actions */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              id="detail-modal-wishlist-toggle"
              aria-label="Toggle wishlist status"
              onClick={() => onToggleWishlist(product)}
              className="p-2.5 text-gray-400 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-white/[0.04] transition-all"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "text-red-500 fill-red-500" : "hover:text-red-400"}`} />
            </button>
            <button
              id="detail-modal-close-btn"
              aria-label="Close product view"
              onClick={onClose}
              className="p-2.5 text-gray-400 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-white/[0.04] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column: Graphics Media Box */}
              <div className="flex flex-col gap-4">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.04] flex items-center justify-center relative">
                  {product.tag && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-nexora-primary text-white font-mono font-bold text-[10px] uppercase rounded-lg shadow-lg tracking-wider">
                      {product.tag}
                    </span>
                  )}
                  <img
                    referrerPolicy="no-referrer"
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
                {/* Secondary product shots list (decorative layout) */}
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-900 rounded-xl overflow-hidden border border-white/[0.04] flex items-center justify-center cursor-pointer hover:border-nexora-primary/40 transition-colors">
                      <img
                        referrerPolicy="no-referrer"
                        src={product.image}
                        alt={`thumbnail-${i}`}
                        className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Specification panel */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-nexora-primary tracking-widest uppercase">
                      {product.category}{product.subCategory ? ` // ${product.subCategory}` : ""}
                    </span>
                    {product.merchantLocation && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        {MERCHANT_LOCATIONS[product.merchantLocation]?.flag || "📍"} {MERCHANT_LOCATIONS[product.merchantLocation]?.name || product.merchantLocation} Storefront Node
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-1.5 leading-snug">
                    {product.name}
                  </h2>

                  {/* Rating Stars indicators */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-yellow-500 font-mono">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      Based on {product.ratingCount} certified buyer ratings
                    </span>
                  </div>

                  {/* Pricing labels */}
                  <div className="flex items-baseline gap-3 mt-6">
                    <span className="text-3xl font-mono font-bold text-purple-300">
                      {formatPrice(product.price, product.merchantLocation)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through font-mono">
                        {formatPrice(product.originalPrice, product.merchantLocation)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mt-6 border-t border-white/[0.04] pt-6">
                    {product.description}
                  </p>

                  {/* Share item row */}
                  <div className="mt-6 pt-6 border-t border-white/[0.04] space-y-3">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      Share & Broadcast Node
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Copy Link Action Button */}
                      <button
                        id="share-copy-link-btn"
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 active:scale-95 rounded-xl text-xs text-purple-300 hover:text-purple-200 transition-all cursor-pointer font-mono font-semibold"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400 font-bold" />
                            <span className="text-green-400 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      {/* Social sharing anchors */}
                      <a
                        id="share-twitter-link"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this incredible futuristic item on Nexora: ${product.name}`)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-gray-400 hover:text-white border border-white/[0.04] hover:border-white/[0.08] active:scale-95 rounded-xl text-xs font-mono transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>X / Twitter</span>
                      </a>

                      <a
                        id="share-telegram-link"
                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Nexora premium node: ${product.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-gray-400 hover:text-white border border-white/[0.04] hover:border-white/[0.08] active:scale-95 rounded-xl text-xs font-mono transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span>Telegram</span>
                      </a>
                    </div>
                  </div>

                  {/* Specifications table */}
                  <div className="mt-6 space-y-2 text-xs">
                    <div className="flex py-2 border-b border-white/[0.04]">
                      <span className="text-gray-500 font-mono w-28 shrink-0">Carrier:</span>
                      <span className="text-gray-300">
                        {product.isDigital ? "Instant Cloud Node / Download Link (Courier Free)" : "Free / Works globally"}
                      </span>
                    </div>
                    <div className="flex py-2 border-b border-white/[0.04]">
                      <span className="text-gray-500 font-mono w-28 shrink-0">Model Code:</span>
                      <span className="text-gray-300 font-mono">
                        {product.isDigital ? `ART-${product.id.toUpperCase()}` : `NX-${product.id.toUpperCase()}`}
                      </span>
                    </div>
                    <div className="flex py-2">
                      <span className="text-gray-500 font-mono w-28 shrink-0">
                        {product.isDigital ? "Licensing:" : "Warranty:"}
                      </span>
                      <span className="text-gray-300">
                        {product.isDigital ? "Personal scarce license & certified auth record" : "3-Yr Limited warranty"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order triggers */}
                <div className="mt-8 border-t border-white/[0.04] pt-6">
                  <div className="grid grid-cols-1 gap-3 py-1 mb-4">
                    <div className="flex items-center gap-2.5 text-xs text-gray-400">
                      <ShieldCheck className="w-4 h-4 text-nexora-primary" />
                      <span>Certified Nexora Authentic with Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-400">
                      {product.isDigital ? (
                        <>
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                          <span>Instant Digital Beam: Download links provisioned on payment</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-purple-400" />
                          <span>Free Standard Delivery on order and priority dispatcher processing</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    id="detail-modal-add-cart-btn"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full py-4 bg-nexora-primary hover:bg-nexora-primary-hover text-white text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-nexora-primary/15 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Place Item in Shopping Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
