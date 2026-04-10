import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PresentationMode({ context, onClose }: { context: any, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto p-10 md:p-20"
    >
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tighter">2026 商业企划结案报告</h1>
            <p className="text-xl text-gray-400 font-mono uppercase tracking-widest">百联 AI 企划助手 · 数字大脑出品</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10 rounded-full w-12 h-12 p-0">
            <X size={32} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-[#C8102E] uppercase tracking-[0.3em]">01 消费者画像</h2>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-3xl font-bold mb-4">{context.node1?.role}</p>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">{context.node1?.mbti}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">{context.node1?.jtbd}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{context.node1?.analysis}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-bold text-[#C8102E] uppercase tracking-[0.3em]">02 视觉 DNA</h2>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
              <div className="flex gap-3">
                {context.node2?.visual_dna?.color_palette?.map((c: string) => (
                  <div key={c} className="w-10 h-10 rounded-full shadow-lg border border-white/20" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">{context.node2?.visual_dna?.texture}</p>
                <p className="text-sm text-gray-400">{context.node2?.visual_dna?.form}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-bold text-[#C8102E] uppercase tracking-[0.3em]">03 场域红线</h2>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-2xl font-bold text-[#C8102E] mb-4">{context.node3?.aesthetic_redline}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{context.node3?.lighting}</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-xs font-bold text-[#C8102E] uppercase tracking-[0.3em] text-center">04 感官剧本分镜</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 bg-white/5 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center font-bold">视</div>
                <h3 className="text-xl font-bold">视觉白描</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">{context.node4?.sensory_script?.visual}</p>
            </div>
            <div className="p-10 bg-white/5 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center font-bold">听</div>
                <h3 className="text-xl font-bold">听觉白描</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">{context.node4?.sensory_script?.auditory}</p>
            </div>
          </div>
        </div>

        <div className="p-20 bg-gradient-to-br from-[#C8102E]/20 to-transparent rounded-[4rem] border border-white/10 text-center space-y-8">
          <h2 className="text-5xl font-bold tracking-tighter">“让每一场策展都能精准击中消费者的潜意识需求”</h2>
          <p className="text-xl text-gray-400 italic">—— 百联 AI 企划助手 2026</p>
        </div>
      </div>
    </motion.div>
  );
}
