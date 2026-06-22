import React from "react";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../data/products";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onSelectProduct,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  
  const discountRate = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col justify-between bg-nexora-surface rounded-2xl border border-white/[0.04] p-4 transition-all duration-300 hover:border-nexora-primary/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-nexora-primary/5 select-none"
    >
      {/* Absolute top badge indicators */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 items-start">
        {product.tag && (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest bg-nexora-primary text-white rounded-lg shadow-lg uppercase shadow-nexora-primary/15">
            {product.tag}
          </span>
        )}
        {discountRate > 0 && (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-green-500/10 text-green-400 rounded-md border border-green-500/10">
            -{discountRate}%
          </span>
        )}
      </div>

      <button
        id={`product-card-wishlist-btn-${product.id}`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => onToggleWishlist(product)}
        className="absolute top-6 right-6 z-10 p-2 text-gray-400 bg-slate-900/60 hover:bg-slate-900/90 rounded-xl transition-all"
      >
        <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'hover:text-red-400'}`} />
      </button>

      {/* Product graphics image card wrapper */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center cursor-pointer mb-4 group-hover:scale-[1.02] transition-all"
      >
        <img
          referrerPolicy="no-referrer"
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-all duration-500"
        />
        {/* Hover inspection overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          <button
            id={`product-card-quick-view-btn-${product.id}`}
            aria-label="Quick View product"
            className="px-4 py-2 bg-white text-nexora-dark text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg scale-90 group-hover:scale-100 transition-all pointer-events-none"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick Inspect
          </button>
        </div>
      </div>

      {/* Product metadata block */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-nexora-primary uppercase">
              {product.category}
            </span>
            {product.merchantBrand && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold max-w-[124px] truncate" title={`Sold by ${product.merchantBrand}`}>
                ⚡ {product.merchantBrand}
              </span>
            )}
          </div>
          <h4 
            onClick={() => onSelectProduct(product)}
            className="font-bold text-sm text-white line-clamp-1 mt-1 hover:text-nexora-primary cursor-pointer transition-colors"
          >
            {product.name}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 h-8">
            {product.description}
          </p>
        </div>

        {/* Pricing calculations and add controller */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-base text-purple-200">
                ${product.price ? product.price.toFixed(2) : ""}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xs text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Star ratings */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] font-semibold text-gray-300">{product.rating}</span>
              <span className="text-[9px] text-gray-500 font-mono">({product.ratingCount})</span>
            </div>
          </div>

          <button
            id={`product-card-add-cart-btn-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAddToCart(product)}
            className="p-3 bg-nexora-primary hover:bg-nexora-primary-hover text-white rounded-xl shadow-lg hover:shadow-nexora-primary/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
