import React from "react";
import { Product } from "../data/products";

interface CollectionsViewProps {
  productsList: Product[];
  handleAddToCart: (product: Product) => void;
  notify: (msg: string) => void;
  setCartDrawerOpen: (open: boolean) => void;
}

export default function CollectionsView({
  productsList,
  handleAddToCart,
  notify,
  setCartDrawerOpen
}: CollectionsViewProps) {
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-white/[0.04]">
        <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">
          Curated Catalog Collections
        </h2>
        <p className="text-xs text-gray-500 mt-1">Direct architectural suites bundled for specific lifestyles and workspaces.</p>
      </div>

      {/* Collections bento grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Cyberpunk Synthwave Set */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-950 to-indigo-950 p-6 md:p-10 border border-purple-500/10 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3.5 relative z-10 max-w-md">
            <span className="text-[9px] font-mono font-bold tracking-widest text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md uppercase">Hardware Bundle</span>
            <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight uppercase">CYBER SYNTHWAVE SET</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Accelerate your command deck speed with our heavy mechanical opto-switches keyboard and space-isolated earbuds.</p>
          </div>

          <div className="flex gap-4 items-center justify-between mt-6 pt-6 border-t border-white/[0.04]">
            <div>
              <p className="text-[10px] text-gray-500 font-mono">Consists of: earbuds + nova deck</p>
              <span className="font-mono font-bold text-lg text-purple-200">$229.98</span>
            </div>
            <button
              id="collection-cyberpunk-buy-btn"
              onClick={() => {
                const kw = productsList.find(p => p.id === "key-nova");
                const eb = productsList.find(p => p.id === "audio-earbuds");
                if (kw) handleAddToCart(kw);
                if (eb) handleAddToCart(eb);
                notify("Cyberpunk Bundle items added to cart!");
                setCartDrawerOpen(true);
              }}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
            >
              Add Bundle to Basket
            </button>
          </div>
        </div>

        {/* 2. Apex Athlete Pack */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-950 p-6 md:p-10 border border-white/[0.04] min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3.5 relative z-10 max-w-md">
            <span className="text-[9px] font-mono font-bold tracking-widest text-green-300 bg-green-550/10 px-2 py-0.5 rounded-md uppercase">Active Collection</span>
            <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight uppercase">APEX ATHLETE CORE PACK</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Dampen gravity with Vortex Running Shoes paired with temperature tracking Hydro Bottle hydration flask.</p>
          </div>

          <div className="flex gap-4 items-center justify-between mt-6 pt-6 border-t border-white/[0.04]">
            <div>
              <p className="text-[10px] text-gray-500 font-mono">Consists of: vortex shoes + hydrology flask</p>
              <span className="font-mono font-bold text-lg text-purple-200">$164.98</span>
            </div>
            <button
              id="collection-athletic-buy-btn"
              onClick={() => {
                const sh = productsList.find(p => p.id === "shoes-vortex");
                const bt = productsList.find(p => p.id === "gear-bottle");
                if (sh) handleAddToCart(sh);
                if (bt) handleAddToCart(bt);
                notify("Athlete Core Pack items added to cart!");
                setCartDrawerOpen(true);
              }}
              className="px-5 py-3 bg-nexora-primary hover:bg-nexora-primary-hover text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
            >
              Add Bundle to Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
