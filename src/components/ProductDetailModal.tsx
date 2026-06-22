import { X, Star, Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../data/products";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}: ProductDetailModalProps) {
  if (!product) return null;

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
                  <span className="text-xs font-mono font-bold text-nexora-primary tracking-widest uppercase">
                    {product.category}
                  </span>
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
                      ${product.price ? product.price.toFixed(2) : ""}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through font-mono">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mt-6 border-t border-white/[0.04] pt-6">
                    {product.description}
                  </p>

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
