import React, { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { generateAIResponse } from "@/services/geminiService";

export function Node56Output({ onComplete, onUpdate, context, onShowPresentation }: { onComplete: (data: any) => void, onUpdate: (data: any) => void, context: any, onShowPresentation: () => void }) {
  const [loading, setLoading] = useState(!context.node5);
  const prompts = context.node5;

  useEffect(() => {
    if (context.node5) {
      setLoading(false);
      return;
    }

    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const prompt = `基于以下策展方案生成高精度的视觉生图 Prompt 和营销文案 Prompt。
        方案：${JSON.stringify(context.node4)}
        人群：${JSON.stringify(context.node1)}
        要求输出 JSON 格式：
        {
          "visual_prompt": "详细的英文生图指令",
          "copy_prompt": "详细的中文文案指令",
          "marketing_copy": "一段示例营销文案"
        }`;

        const response = await generateAIResponse("gemini-3-flash-preview", [
          { role: "user", parts: [{ text: prompt }] }
        ], { responseMimeType: "application/json" });

        const result = JSON.parse(response.text);
        onUpdate(result);
      } catch (error) {
        console.error("Node 5/6 Error:", error);
        onUpdate({
          visual_prompt: "A high-end commercial installation in Shanghai, warm amber lighting, fluid metallic textures, velvet-like digital projections, healing atmosphere, INFP personality style, cinematic lighting, 8k resolution --ar 16:9",
          copy_prompt: "为'都市疗愈追光者'撰写一段策展导言。语调：温暖、治愈、有质感。",
          marketing_copy: "在快节奏的都市中，为您留存一片精神的自留地。"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [context.node4, context.node5]);

  if (loading) {
    return (
      <Card className="border-none shadow-xl bg-white p-12 text-center">
        <Loader2 className="w-10 h-10 text-[#C8102E] animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold">正在生成最终交付物...</h2>
        <p className="text-gray-500">正在为您构建高精度 Prompt 与营销方案。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#C8102E]" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 05 & 06 · 交付报告</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter">最终策划交付物</CardTitle>
          <CardDescription className="text-base">
            包含视觉生图 Prompt 与营销文案 Prompt，可直接用于生产。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-sm"><ImageIcon size={16} className="text-[#C8102E]" /> 视觉 Prompt</h3>
              <div className="bg-gray-900 text-gray-300 p-6 rounded-2xl font-mono text-[10px] leading-relaxed group relative h-40 overflow-y-auto">
                {prompts?.visual_prompt}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 text-gray-500 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(prompts?.visual_prompt)}
                >
                  复制
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Send size={16} className="text-[#C8102E]" /> 文案 Prompt</h3>
              <div className="bg-gray-900 text-gray-300 p-6 rounded-2xl font-mono text-[10px] leading-relaxed group relative h-40 overflow-y-auto">
                {prompts?.copy_prompt}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 text-gray-500 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(prompts?.copy_prompt)}
                >
                  复制
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
            <h4 className="font-bold text-xs mb-2 text-[#C8102E] uppercase tracking-widest">示例营销文案</h4>
            <p className="text-sm leading-relaxed italic text-gray-700">"{prompts?.marketing_copy}"</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400">💡 您可以在左侧对话框输入反馈来实时优化 Prompt</p>
            <div className="flex gap-4">
              <Button onClick={onShowPresentation} className="flex-1 h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg">
                进入沉浸式演示模式
              </Button>
              <Button onClick={() => window.print()} variant="outline" className="h-14 border-2 border-[#C8102E] text-[#C8102E] font-bold px-8 rounded-xl">
                导出 PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
