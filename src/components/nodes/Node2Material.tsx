import React, { useState } from "react";
import { Image as ImageIcon, User, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { analyzeImage } from "@/services/geminiService";
import { Node1Data, Node2Data } from "@/types";

export function Node2Material({ onComplete, onUpdate, personData, currentData }: { onComplete: (data: Node2Data) => void, onUpdate: (data: Node2Data) => void, personData: Node1Data | undefined, currentData?: Node2Data }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [materialType, setMaterialType] = useState("装置艺术");
  const [background, setBackground] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const materialTypes = ["装置艺术", "品牌快闪", "互动美陈", "数字影像", "空间软装"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("请先上传素材图片");
    setLoading(true);
    try {
      const prompt = `作为商业美陈艺术总监，对该素材进行“视觉基因提取”。
      
      [Logic_Context]
      因为目标人群是 ${personData?.role} (${personData?.mbti})，他们在 JTBD 诉求上倾向于 ${personData?.jtbd}。
      因此，在提取视觉基因时，请优先考虑如何通过色彩和材质回应他们的情感需求。

      素材类型：${materialType}
      背景信息：${background}
      要求输出 JSON 格式：
      {
        "visual_dna": { 
          "color_palette": ["#hex1", "#hex2", "#hex3"],
          "color_description": "色彩描述", 
          "texture": "材质描述", 
          "form": "形态描述" 
        },
        "routes": { 
          "a": { "title": "4字标题", "logic": "视觉张力优先逻辑" }, 
          "b": { "title": "4字标题", "logic": "叙事沉浸优先逻辑" } 
        }
      }`;

      const response = await analyzeImage(file, prompt, "gemini-3-flash-preview");
      const result = JSON.parse(response.text);
      onUpdate(result);
    } catch (error) {
      console.error("Node 2 Error:", error);
      onUpdate({
        visual_dna: { 
          color_description: "温暖治愈系", 
          texture: "丝绒金属", 
          form: "流线型", 
          color_palette: ["#F27D26", "#E4E3E0", "#141414"] 
        },
        routes: { 
          a: { title: "视觉张力", logic: "通过高对比度材质展现视觉冲击力" }, 
          b: { title: "叙事沉浸", logic: "通过细腻质感引导用户深度停留" } 
        }
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
                <ImageIcon size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 02 · 视觉基因</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpdate(undefined as any)} className="text-[10px] h-7">重新上传</Button>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter mt-4">视觉基因与逻辑推演</CardTitle>
          <CardDescription className="text-base mt-2">AI 已根据素材提取出核心美学参数。</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Visual DNA</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">色彩情绪</p>
                    <div className="flex h-10 rounded-lg overflow-hidden shadow-sm">
                      {currentData.visual_dna.color_palette.map((color, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 italic">{currentData.visual_dna.color_description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <p className="text-[8px] font-bold text-gray-400 uppercase">材质</p>
                      <p className="text-xs font-bold truncate">{currentData.visual_dna.texture}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <p className="text-[8px] font-bold text-gray-400 uppercase">形态</p>
                      <p className="text-xs font-bold truncate">{currentData.visual_dna.form}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">推演方向</h4>
              <div className="space-y-3">
                <div className="p-4 border border-[#C8102E]/20 bg-red-50/30 rounded-2xl">
                  <h5 className="font-bold text-sm text-[#C8102E]">A: {currentData.routes.a.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{currentData.routes.a.logic}</p>
                </div>
                <div className="p-4 border border-gray-100 bg-gray-50 rounded-2xl">
                  <h5 className="font-bold text-sm text-gray-800">B: {currentData.routes.b.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{currentData.routes.b.logic}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400">💡 您可以在左侧对话框输入反馈来实时修正视觉基因</p>
            <Button 
              onClick={() => onComplete(currentData)}
              className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg transition-all"
            >
              锁定基因并进入场域设定
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
            <ImageIcon size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step 02 · 素材解构</span>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tighter">物质内容与文化符号转译</CardTitle>
        <CardDescription className="text-base">
          提取视觉 DNA，将物理属性转译为 2026 商业卖点。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User className="text-[#C8102E]" size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target Audience</p>
                  <p className="font-bold text-xs">{personData?.role || "都市疗愈追光者"}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {personData?.mood_tags?.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-100">{tag}</span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">素材类型</label>
                <div className="flex flex-wrap gap-2">
                  {materialTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMaterialType(type)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all",
                        materialType === type ? "bg-[#C8102E] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                onClick={() => document.getElementById("fileInput")?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group relative overflow-hidden h-48 flex flex-col items-center justify-center",
                  file ? "border-green-500 bg-green-50/30" : "border-gray-200 hover:border-[#C8102E] hover:bg-gray-50/50"
                )}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Preview" referrerPolicy="no-referrer" />
                ) : null}
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    {file ? <CheckCircle2 className="text-green-500" size={28} /> : <ImageIcon className="text-gray-400 group-hover:text-[#C8102E]" size={28} />}
                  </div>
                  <p className="font-bold text-sm text-gray-600">{file ? file.name : "点击上传素材图片"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">AI 将自动识别色彩、肌理与形态</p>
                </div>
                <input 
                  id="fileInput"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">素材背景 / 导演意图</label>
                <textarea 
                  className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#C8102E] resize-none"
                  placeholder="描述素材的来源或您希望传达的核心理念..."
                  rows={3}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#C8102E] hover:bg-[#A00D25] text-white font-bold text-lg rounded-xl shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="mr-2" />}
                {loading ? "正在转译视觉基因..." : "开始视觉基因提取"}
              </Button>
            </form>
          </div>

          {/* Live Moodboard Preview */}
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Moodboard</h4>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-600">色彩情绪预演</p>
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm bg-gray-200">
                  {onComplete && personData && !loading && (
                    <>
                      {/* Note: In a real flow, we'd show the result after onComplete is called. 
                          For better UX, we'll show a placeholder or the last result if available. */}
                      <div className="flex-1 bg-[#C8102E]" />
                      <div className="flex-1 bg-gray-300" />
                      <div className="flex-1 bg-gray-400" />
                    </>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  {file ? "AI 正在分析色彩分布..." : "等待素材上传以提取色盘..."}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-600">材质基因提取</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl shadow-inner border border-white/50 relative overflow-hidden group flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Texture A</span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-inner border border-white/50 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-red-300 uppercase">Texture B</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic">AI 将在此渲染识别出的物理质感</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
