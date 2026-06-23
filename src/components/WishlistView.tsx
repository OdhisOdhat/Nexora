import React from "react";
import { Heart } from "lucide-react";
import { Product } from "../data/products";
import ProductCard from "./ProductCard";

interface WishlistViewProps {
  productsList: Product[];
  wishlist: string[];
  handleAddToCart: (product: Product) => void;
  setSelectedProduct: (product: Product) => void;
  handleToggleWishlist: (product: Product) => void;
  setCurrentSection: (section: any) => void;
  currency?: string;
}

export default function WishlistView({
  productsList,
  wishlist,
  handleAddToCart,
  setSelectedProduct,
  handleToggleWishlist,
  setCurrentSection,
  currency = "USD"
}: WishlistViewProps) {
  const wishlistedProducts = productsList.filter(p => wishlist.includes(p.id));

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-white/[0.04]">
        <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">Favorited Items</h2>
        <p className="text-xs text-gray-500 mt-1">Keep track of items you look to deploy in future operations.</p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 bg-nexora-surface/30 rounded-3xl border border-white/[0.04]">
          <Heart className="w-14 h-14 text-slate-700 stroke-1 mx-auto mb-4" />
          <h4 className="font-bold text-gray-300">Wishlist empty</h4>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">Click the heart selector icon on product cards to store items.</p>
          <button
            id="wishlist-browse-btn"
            onClick={() => setCurrentSection("categories")}
            className="mt-6 px-4 py-2.5 bg-slate-900 border border-white/[0.04] text-xs font-semibold text-nexora-primary hover:text-white rounded-xl cursor-pointer"
          >
            Examine Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={true}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
