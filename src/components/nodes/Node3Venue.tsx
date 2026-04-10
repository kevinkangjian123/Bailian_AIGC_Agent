import React, { useState } from "react";
import { MapPin, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { generateAIResponse } from "@/services/geminiService";
import { Node3Data } from "@/types";

export function Node3Venue({ onComplete, onUpdate, constraints, context }: { onComplete: (data: Node3Data) => void, onUpdate: (data: Node3Data) => void, constraints: string[], context: any }) {
  const [loading, setLoading] = useState(false);
  const [venueData, setVenueData] = useState({ city: "", month: "", dna: "" });
  const currentData = context.node3 as Node3Data | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prompt = `作为策展顾问，基于以下信息推演场域红线与时令情绪。
      
      [Logic_Context]
      当前人群画像为 ${JSON.stringify(context.node1)}。
      已提取的视觉基因为 ${JSON.stringify(context.node2?.visual_dna)}。
      请确保场域红线的设定能与人群的 MBTI 特质及视觉 DNA产生逻辑共振。

      城市：${venueData.city}
      月份：${venueData.month}
      场地 DNA：${venueData.dna}
      要求输出 JSON 格式：
      {
        "city": "城市名",
        "month": "月份",
        "lighting": "光照策略描述",
        "seasonal_mood": "时令情绪关键词",
        "constraints": ["约束1", "约束2"],
        "aesthetic_redline": "美学红线描述"
      }`;

      const response = await generateAIResponse("gemini-3-flash-preview", [
        { role: "user", parts: [{ text: prompt }] }
      ], { responseMimeType: "application/json" });

      const result = JSON.parse(response.text);
      onUpdate(result);
    } catch (error) {
      console.error("Node 3 Error:", error);
      onUpdate({
        city: venueData.city || "上海",
        month: venueData.month || "12月",
        lighting: "自然光+暖色调人工光",
        seasonal_mood: "春日治愈",
        constraints: ["空间高度限制", "品牌色限制"],
        aesthetic_redline: "极简主义与自然主义的平衡"
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentData) {
    return (
      <Card className="border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#C8102E]" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 03 · 场域预览</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpdate(undefined as any)} className="text-[10px] h-7">重新设定</Button>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter mt-4">{currentData.city} · {currentData.seasonal_mood}</CardTitle>
          <CardDescription className="text-base mt-2">场域红线与美学约束已锁定。</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">光照策略</p>
              <p className="text-xs font-bold">{currentData.lighting}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">时令情绪</p>
              <p className="text-xs font-bold">{currentData.seasonal_mood}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase">物理约束</p>
            <div className="flex flex-wrap gap-2">
              {currentData.constraints.map(c => (
                <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <h5 className="text-[10px] font-bold text-[#C8102E] uppercase mb-2">美学红线</h5>
            <p className="text-sm font-medium text-gray-700">{currentData.aesthetic_redline}</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400">💡 您可以在左侧对话框输入反馈来实时修正场域参数</p>
            <Button 
              onClick={() => onComplete(currentData)}
              className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg transition-all"
            >
              确认场域并进入战略定调
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white overflow-hidden">
      <div className="h-2 bg-[#C8102E]" />
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg">
            <MapPin size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 03 · 场域约束</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tighter">场域 DNA 与时令感知</CardTitle>
        <CardDescription className="text-base">
          将物理场地转化为具备“时令情绪”的商业空间。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <div className="mb-6 flex flex-wrap gap-2">
          {constraints.map(c => (
            <span key={c} className="text-[10px] bg-red-50 text-[#C8102E] px-2 py-1 rounded-md font-bold border border-red-100">
              # {c}
            </span>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">城市</label>
              <input 
                className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 text-sm" 
                placeholder="例如：上海" 
                onChange={(e) => setVenueData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">月份</label>
              <input 
                className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 text-sm" 
                placeholder="例如：12月" 
                onChange={(e) => setVenueData(prev => ({ ...prev, month: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">场地 DNA 描述</label>
            <textarea 
              className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 text-sm resize-none"
              placeholder="描述场地的物理特性、品牌调性或历史背景..."
              rows={3}
              onChange={(e) => setVenueData(prev => ({ ...prev, dna: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="mr-2" />}
            {loading ? "正在推演场域规则..." : "提交并锁定场域红线"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
