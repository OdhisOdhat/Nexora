import React from "react";
import { Search } from "lucide-react";
import { Product, CATEGORY_SUBCATEGORIES, FASHION_SUBCATEGORY_TYPES } from "../data/products";
import ProductCard from "./ProductCard";

interface BrowseViewProps {
  currentSection: "categories" | "deals";
  categoriesList: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (sub: string) => void;
  selectedSubCategoryType: string;
  setSelectedSubCategoryType: (type: string) => void;
  filteredProducts: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAddToCart: (product: Product) => void;
  setSelectedProduct: (product: Product) => void;
  handleToggleWishlist: (product: Product) => void;
  wishlist: string[];
  currency?: string;
}

export default function BrowseView({
  currentSection,
  categoriesList,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  selectedSubCategoryType,
  setSelectedSubCategoryType,
  filteredProducts,
  searchQuery,
  setSearchQuery,
  handleAddToCart,
  setSelectedProduct,
  handleToggleWishlist,
  wishlist,
  currency = "USD"
}: BrowseViewProps) {
  const isDeals = currentSection === "deals";

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="pb-4 border-b border-white/[0.04] flex flex-col justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">
              {isDeals ? "Authorized Discount Offers" : "Browse Inventory"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isDeals 
                ? "Get up to 50% flat discount on selected electronic gadgets, shoes, and luxury items." 
                : "Discover dynamic futurist tech, fashion drops and home elements."}
            </p>
          </div>
          
          {/* Horizontal Category Tab triggers */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                id={`page-category-tab-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-4 py-2 text-xs font-semibold rounded-xl border shrink-0 transition-all cursor-pointer
                  ${selectedCategory === cat
                    ? "bg-nexora-primary border-nexora-primary text-white glow-primary"
                    : "bg-nexora-surface border-white/[0.04] text-gray-400 hover:text-white"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Subcategories sub-bar */}
        {selectedCategory !== "All" && CATEGORY_SUBCATEGORIES[selectedCategory] && (
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar select-none">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Sub Sectors:
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {["All", ...CATEGORY_SUBCATEGORIES[selectedCategory]].map((sub) => (
                <button
                  key={sub}
                  id={`page-subcategory-tab-${sub.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`
                    px-3.5 py-1.5 text-[11px] font-mono rounded-lg border shrink-0 transition-all cursor-pointer
                    ${selectedSubCategory === sub
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                      : "bg-nexora-surface/60 border-white/[0.04] text-gray-400 hover:text-white hover:border-purple-500/20"
                    }
                  `}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Fashion Subcategory Types sub-bar */}
        {selectedCategory === "Fashion" && selectedSubCategory !== "All" && FASHION_SUBCATEGORY_TYPES[selectedSubCategory] && (
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar select-none">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Types:
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {["All", ...FASHION_SUBCATEGORY_TYPES[selectedSubCategory]].map((type) => (
                <button
                  key={type}
                  id={`page-subcategory-type-tab-${type.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSelectedSubCategoryType(type)}
                  className={`
                    px-3 py-1.5 text-[11px] font-mono rounded-lg border shrink-0 transition-all cursor-pointer
                    ${selectedSubCategoryType === type
                      ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200"
                      : "bg-nexora-surface/60 border-white/[0.04] text-gray-400 hover:text-white hover:border-fuchsia-500/20"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Query list feedback stats output */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-nexora-surface/30 rounded-3xl border border-white/[0.04]">
          <Search className="w-14 h-14 text-slate-700 stroke-1 mx-auto mb-4" />
          <h4 className="font-bold text-gray-300">No items detected</h4>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            There are no items matching "{searchQuery}" under {selectedCategory} sector.
          </p>
          <button
            id="reset-search-btn"
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-6 px-4 py-2.5 bg-slate-900 border border-white/[0.04] hover:text-white rounded-xl text-xs font-semibold text-nexora-primary cursor-pointer"
          >
            Reset Filter Query
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
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
      )}
    </div>
  );
}
