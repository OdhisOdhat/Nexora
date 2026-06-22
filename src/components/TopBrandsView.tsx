import React from "react";

export default function TopBrandsView() {
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-white/[0.04]">
        <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">
          Partner Hardware & Fashion Houses
        </h2>
        <p className="text-xs text-gray-500 mt-1">Discover direct partner design houses and premium engineering labs available at Nexora.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "NEXORA LABS", type: "Computers & Wearables", desc: "Creators of state of the art biometric trackers and opto mechanical mechanical engines.", count: 4 },
          { name: "VORTEX GRAVITY", type: "Athletic Footwear & Apparel", desc: "Engineers of specialized carbon sole structures and micro-foam kinetic rebound units.", count: 3 },
          { name: "LUMA ELEMENTS", type: "Luminescent Interior Design", desc: "Design studio emphasizing clean proximity swipe controllers and natural daylight adapters.", count: 2 },
          { name: "ETERNAL AROMATICS", type: "Aromatic Molecular Science", desc: "Perfume laboratories synthesizing long lasting natural oceanic botanical resins.", count: 1 },
        ].map((house, i) => (
          <div key={i} className="p-6 bg-nexora-surface rounded-3xl border border-white/[0.04] space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-300 font-mono font-bold text-lg">
              0{i + 1}
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-extrabold text-sm text-white tracking-wide uppercase">{house.name}</h4>
              <span className="text-[10px] text-nexora-primary font-mono block tracking-wider uppercase">{house.type}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{house.desc}</p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-gray-500 font-mono">({house.count} Articles Registered)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
