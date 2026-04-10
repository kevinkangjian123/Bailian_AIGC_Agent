import React, { useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { generateAIResponse } from "@/services/geminiService";
import { Node4Data } from "@/types";

export function Node4Strategy({ onComplete, onUpdate, context }: { onComplete: (data: Node4Data) => void, onUpdate: (data: Node4Data) => void, context: any }) {
  const [loading, setLoading] = useState(false);
  const currentData = context.node4 as Node4Data | undefined;

  const handleSubmit = async (strategyTitle: string) => {
    setLoading(true);
    try {
      const prompt = `作为执行导演，基于以下“因果审计”后的信息生成一份具备“感官呼吸感”的策展剧本。
      
      [Logic_Context]
      人群画像：${JSON.stringify(context.node1)}
      视觉基因：${JSON.stringify(context.node2)}
      场域红线：${JSON.stringify(context.node3)}
      选定方向：${strategyTitle}
      美学约束：${context.aesthetic_constraints?.join(", ")}
      
      [Negative_Constraints]
      1. 禁止使用与人群 MBTI 冲突的色彩（如为 I 型人格时禁止使用过于跳跃的荧光色）。
      2. 禁止使用违背场域红线的材质。
      3. 避免空洞的形容词，必须转化为具体的物理参数描述。

      要求输出 JSON 格式，剧本描述必须包含：
      1. 视觉：灯光在特定材质上的偏振、色彩的流动感。
      2. 听觉：环境音的频率与节奏。
      3. 触觉：材质的温度与质感。
      4. 心理：进入空间前3秒的心理压力变化。
      5. 压力曲线：提供 5 个 0-100 之间的数值，代表从入口到出口的心理压力变化。
      
      {
        "strategy": "${strategyTitle}",
        "concept": "核心概念描述",
        "sensory_script": {
          "visual": "视觉白描",
          "auditory": "听觉白描",
          "tactile": "触觉白描",
          "psychological": "心理压力曲线描述"
        },
        "pressure_points": [number, number, number, number, number],
        "director_note": "导演手记"
      }`;

      const response = await generateAIResponse("gemini-3-flash-preview", [
        { role: "user", parts: [{ text: prompt }] }
      ], { responseMimeType: "application/json" });

      const result = JSON.parse(response.text);
      onUpdate(result); 
    } catch (error) {
      console.error("Node 4 Error:", error);
      onUpdate({
        strategy: strategyTitle,
        concept: "默认概念",
        sensory_script: { 
          visual: "流动的光影", 
          auditory: "白噪音", 
          tactile: "丝绒触感",
          psychological: "平稳进入"
        },
        pressure_points: [80, 40, 60, 30, 50],
        director_note: "默认手记"
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentData) {
    return (
      <Card className="border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#C8102E]" />
        <CardHeader className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg">
                <Target size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 04 · 方案预览</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpdate(undefined as any)} className="text-[10px] h-7">重新选择</Button>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter mt-4">{currentData.strategy}</CardTitle>
          <CardDescription className="text-base mt-2">{currentData.concept}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">视觉叙事</h5>
                <p className="text-sm leading-relaxed">{currentData.sensory_script.visual}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">听觉节奏</h5>
                <p className="text-sm leading-relaxed">{currentData.sensory_script.auditory}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">触觉基因</h5>
                <p className="text-sm leading-relaxed">{currentData.sensory_script.tactile}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">心理压力</h5>
                <p className="text-sm leading-relaxed">{currentData.sensory_script.psychological}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-900 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Psychological Pressure Curve</h4>
              <span className="text-[10px] text-[#C8102E] font-bold">实时拟合数据</span>
            </div>
            <div className="h-32 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path 
                  d={`M 0 ${100 - currentData.pressure_points[0]} 
                     L 100 ${100 - currentData.pressure_points[1]} 
                     L 200 ${100 - currentData.pressure_points[2]} 
                     L 300 ${100 - currentData.pressure_points[3]} 
                     L 400 ${100 - currentData.pressure_points[4]}`} 
                  fill="none" 
                  stroke="#C8102E" 
                  strokeWidth="2"
                  className="transition-all duration-1000"
                />
                {[0, 100, 200, 300, 400].map((x, i) => (
                  <circle 
                    key={x} 
                    cx={x} 
                    cy={100 - currentData.pressure_points[i]} 
                    r="3" 
                    fill="#C8102E" 
                    className="transition-all duration-1000"
                  />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-gray-500 font-mono mt-2">
                <span>ENTRY</span>
                <span>IMMERSION</span>
                <span>CLIMAX</span>
                <span>RETENTION</span>
                <span>EXIT</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <h5 className="text-[10px] font-bold text-[#C8102E] uppercase mb-2">导演手记</h5>
            <p className="text-sm italic text-gray-700">"{currentData.director_note}"</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400">💡 您可以在左侧对话框输入反馈（如“再温暖一点”）来实时修正剧本</p>
            <Button 
              onClick={() => onComplete(currentData)}
              className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg transition-all"
            >
              确认方案并生成 AI Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white overflow-hidden">
      <div className="h-2 bg-[#C8102E]" />
      <CardHeader className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg">
            <Target size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 04</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tighter">战略定调与感官剧本</CardTitle>
        <CardDescription className="text-base">
          整合人、货、场要素，生成具有冲击力的策展方案。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Person</p>
            <p className="text-xs font-bold">{context.node1?.role}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Material</p>
            <p className="text-xs font-bold">{context.node2?.visual_dna?.texture}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Venue</p>
            <p className="text-xs font-bold">{context.node3?.city} · {context.node3?.lighting}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => handleSubmit(context.node2?.routes?.a?.title || "愈见之境")}
            className="p-6 border-2 border-[#C8102E] rounded-2xl bg-red-50/30 relative cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-4 right-4 bg-[#C8102E] text-white text-[10px] px-2 py-1 rounded font-bold">推荐方案</div>
            <h3 className="font-bold text-xl mb-2">方案 A：{context.node2?.routes?.a?.title || "愈见之境"}</h3>
            <p className="text-sm text-gray-600">{context.node2?.routes?.a?.logic || "利用流体金属材质与温暖光影，为 INFP 人群打造一个都市中的情绪避风港。"}</p>
          </div>
          <div 
            onClick={() => handleSubmit(context.node2?.routes?.b?.title || "数字丝绒")}
            className="p-6 border border-gray-200 rounded-2xl hover:border-[#C8102E] transition-colors cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <h3 className="font-bold text-xl mb-2">方案 B：{context.node2?.routes?.b?.title || "数字丝绒"}</h3>
            <p className="text-sm text-gray-600">{context.node2?.routes?.b?.logic || "强调触感与叙事，通过丝绒质感的数字投影，拉长用户的停留与沉浸时间。"}</p>
          </div>
        </div>

        {/* Psychological Pressure Chart Preview */}
        <div className="mt-10 p-8 bg-gray-900 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Psychological Pressure Curve</h4>
            <span className="text-[10px] text-[#C8102E] font-bold">导演分镜预演</span>
          </div>
          <div className="h-32 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              {/* Dynamic Path based on AI data or default */}
              <path 
                d={`M 0 ${100 - (context.node4?.pressure_points?.[0] || 80)} 
                   L 100 ${100 - (context.node4?.pressure_points?.[1] || 40)} 
                   L 200 ${100 - (context.node4?.pressure_points?.[2] || 60)} 
                   L 300 ${100 - (context.node4?.pressure_points?.[3] || 30)} 
                   L 400 ${100 - (context.node4?.pressure_points?.[4] || 50)}`} 
                fill="none" 
                stroke="#C8102E" 
                strokeWidth="2"
                className="transition-all duration-1000"
              />
              {[0, 100, 200, 300, 400].map((x, i) => (
                <circle 
                  key={x} 
                  cx={x} 
                  cy={100 - (context.node4?.pressure_points?.[i] || [80, 40, 60, 30, 50][i])} 
                  r="3" 
                  fill="#C8102E" 
                  className="transition-all duration-1000"
                />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-gray-500 font-mono mt-2">
              <span>ENTRY</span>
              <span>IMMERSION</span>
              <span>CLIMAX</span>
              <span>RETENTION</span>
              <span>EXIT</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 italic text-center">AI 将根据选定方案实时拟合 2026 心理压力曲线</p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-4">
          点击上方方案卡片以确认并生成详细剧本
        </div>
      </CardContent>
    </Card>
  );
}
