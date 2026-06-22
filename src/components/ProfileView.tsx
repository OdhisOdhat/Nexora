import React from "react";

interface ProfileViewProps {
  userEmail: string;
  isPrimeUser: boolean;
}

export default function ProfileView({ userEmail, isPrimeUser }: ProfileViewProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="pb-4 border-b border-white/[0.04]">
        <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-wider">Personal Profile</h2>
        <p className="text-xs text-gray-500 mt-1">Manage delivery credentials and payment preferences.</p>
      </div>

      <div className="p-6 md:p-8 bg-nexora-surface rounded-3xl border border-white/[0.04] space-y-6">
        {/* Account card details */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 text-3xl font-bold relative">
            {userEmail ? userEmail[0].toUpperCase() : "U"}
            {isPrimeUser && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-yellow-400 text-slate-950 font-bold text-[9px] rounded-md font-mono uppercase">
                Prime
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-sans font-bold text-lg text-white">{userEmail}</h4>
            <div className="flex gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 h-fit text-[9px] font-mono bg-purple-550/20 text-purple-300 rounded-md border border-purple-500/10">Active Account Developer</span>
              <span className="px-2.5 py-0.5 h-fit text-[9px] font-mono bg-green-550/10 text-green-400 rounded-md border border-green-500/10">Verified Client Core</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/[0.04]">
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase">User Sector:</span>
            <span className="text-xs font-semibold text-gray-300 mt-1 block">Global Cyber Sector 4A</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase">Registered Since:</span>
            <span className="text-xs font-semibold text-gray-300 mt-1 block">June 20, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
