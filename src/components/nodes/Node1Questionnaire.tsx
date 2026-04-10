import React, { useState } from "react";
import { User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateAIResponse } from "@/services/geminiService";
import { Node1Data } from "@/types";

export function Node1Questionnaire({ onComplete, onUpdate, currentData }: { onComplete: (data: Node1Data) => void, onUpdate: (data: Node1Data) => void, currentData?: Node1Data }) {
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    { id: "q1", label: "核心客群画像", placeholder: "例如：25-35岁，精致中产，追求精神消费的互联网从业者" },
    { id: "q2", label: "JTBD 核心诉求", placeholder: "他们来到商场是为了：社交炫耀、情绪逃避、还是家庭陪伴？" },
    { id: "q3", label: "MBTI 倾向倾向", placeholder: "更偏向 I (内向/深度) 还是 E (外向/活力)？" },
    { id: "q4", label: "消费动机切片", placeholder: "是为“仪式感”买单，还是为“实用主义”买单？" },
    { id: "q5", label: "审美偏好红线", placeholder: "向往什么样的视觉风格？（如：极简、复古、赛博、自然）" },
    { id: "q6", label: "生活方式标签", placeholder: "例如：露营爱好者、咖啡精、数字游民..." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < 3) return alert("请至少填写三个维度的信息以确保画像精准度。");
    setLoading(true);
    try {
      const prompt = `基于以下深度问卷回答，生成一份专业的消费者画像报告。
      问卷数据：${JSON.stringify(answers)}
      要求输出 JSON 格式：
      {
        "mbti": "4位大写字母",
        "jtbd": "核心诉求描述",
        "mood_tags": ["标签1", "标签2", "标签3"],
        "role": "4个汉字的名称",
        "analysis": "详细解析",
        "persona_summary": "一句话总结该人群的灵魂特质"
      }`;

      const response = await generateAIResponse("gemini-3-flash-preview", [
        { role: "user", parts: [{ text: prompt }] }
      ], { responseMimeType: "application/json" });

      const result = JSON.parse(response.text);
      onUpdate(result);
    } catch (error) {
      console.error("Node 1 Error:", error);
      onUpdate({
        mbti: "INFP",
        jtbd: "在高压工作中寻找情绪治愈的精神归属",
        mood_tags: ["治愈感", "仪式感", "松弛感"],
        role: "都市疗愈追光者",
        analysis: "该人群在快节奏的都市生活中渴望寻找一片宁静的自留地。",
        persona_summary: "追求精神共鸣与情绪价值的深度体验者"
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
                <User size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 01 · 画像预览</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpdate(undefined as any)} className="text-[10px] h-7">重新填写</Button>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter mt-4">{currentData.role}</CardTitle>
          <CardDescription className="text-base mt-2">{currentData.persona_summary}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">MBTI</p>
              <p className="text-sm font-bold text-[#C8102E]">{currentData.mbti}</p>
            </div>
            <div className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">JTBD</p>
              <p className="text-xs font-medium truncate">{currentData.jtbd}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentData.mood_tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-red-50 text-[#C8102E] text-[10px] font-bold rounded-full border border-red-100">
                #{tag}
              </span>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">深度解析</h5>
            <p className="text-sm leading-relaxed text-gray-600">{currentData.analysis}</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400">💡 您可以在左侧对话框输入反馈来实时修正画像</p>
            <Button 
              onClick={() => onComplete(currentData)}
              className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg transition-all"
            >
              锁定画像并进入素材分析
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
            <User size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 01 · 人群画像</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tighter">消费者空间性格深度分析</CardTitle>
        <CardDescription className="text-base">
          利用 MBTI + JTBD 逻辑，将“随机人群”转化为“逻辑画像”。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map(q => (
              <div key={q.id} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{q.label}</label>
                <textarea 
                  className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#C8102E] transition-all resize-none"
                  placeholder={q.placeholder}
                  rows={2}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg transition-all"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            {loading ? "正在进行因果审计..." : "提交并生成深度画像"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
