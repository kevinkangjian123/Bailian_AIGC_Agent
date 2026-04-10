import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export function CalculatingOverlay({ auditLogs }: { auditLogs: string[] }) {
  return (
    <motion.div
      key="calculating"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 flex flex-col items-center justify-center space-y-6"
    >
      <div className="relative">
        <Loader2 className="w-12 h-12 text-[#C8102E] animate-spin" />
        <div className="absolute inset-0 bg-[#C8102E]/10 rounded-full animate-ping" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">数字大脑正在推演...</h3>
        <div className="flex flex-col items-center gap-1">
          {auditLogs.map((log, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-mono text-gray-400"
            >
              {`> ${log}`}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
