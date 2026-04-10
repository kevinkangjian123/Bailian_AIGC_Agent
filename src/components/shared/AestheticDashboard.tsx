import React from "react";

export function AestheticDashboard({ constraints }: { constraints: string[] }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-sm gap-3">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[#C8102E] rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Aesthetic Redlines</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {constraints.length > 0 ? (
          constraints.map(c => (
            <span key={c} className="text-[9px] bg-red-50 text-[#C8102E] px-2 py-0.5 rounded border border-red-100 font-bold whitespace-nowrap">
              {c}
            </span>
          ))
        ) : (
          <span className="text-[9px] text-gray-300 italic">等待逻辑锁定...</span>
        )}
      </div>
    </div>
  );
}
