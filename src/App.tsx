import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { NodeID, WorkflowState, INITIAL_STATE, Persona } from "./types";
import { Header } from "@/components/layout/Header";
import { LeftRail } from "@/components/layout/LeftRail";
import { AestheticDashboard } from "@/components/shared/AestheticDashboard";
import { CalculatingOverlay } from "@/components/shared/CalculatingOverlay";
import { BentoGrid } from "@/components/shared/BentoGrid";
import { Node1Questionnaire } from "@/components/nodes/Node1Questionnaire";
import { Node2Material } from "@/components/nodes/Node2Material";
import { Node3Venue } from "@/components/nodes/Node3Venue";
import { Node4Strategy } from "@/components/nodes/Node4Strategy";
import { Node56Output } from "@/components/nodes/Node56Output";
import { PresentationMode } from "@/components/shared/PresentationMode";
import { getNodeTitle, getPersonaForNode, getTransitionMessage } from "@/lib/workflow-utils";
import { Card } from "@/components/ui/Card";
import { generateAIResponse } from "@/services/geminiService";

export default function App() {
  const [state, setState] = useState<WorkflowState>(INITIAL_STATE);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
    { role: "ai", content: "欢迎来到百联 AI 企划助手。我是您的智能大脑，将协助您完成从人群画像到策展方案的全过程。让我们从第一步：消费者画像深度分析开始吧。" }
  ]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const progressValue = (Object.values(state.lock_chain).filter(Boolean).length / 6) * 100;

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content }]);
    setUserInput("");
    setIsTyping(true);

    try {
      let refinementPrompt = "";
      let targetNodeKey: keyof WorkflowState["data_locker"] | null = null;
      let successMessage = "";

      // Determine refinement logic based on current node
      switch (state.current_node) {
        case NodeID.NODE_1:
          if (state.data_locker.node1) {
            targetNodeKey = "node1";
            refinementPrompt = `
              你现在是消费者访谈助手。用户对当前的画像提出了修改建议：
              "${content}"
              
              请基于以下原始画像和用户反馈，返回修正后的画像数据：
              [Current_Data]: ${JSON.stringify(state.data_locker.node1)}
              
              要求输出 JSON 格式，包含 mbti, role, jtbd, mood_tags, analysis, persona_summary。
            `;
            successMessage = "画像已根据您的反馈进行了深度修正。";
          }
          break;

        case NodeID.NODE_2:
          if (state.data_locker.node2) {
            targetNodeKey = "node2";
            refinementPrompt = `
              你现在是策展顾问。用户对素材分析提出了新的侧重点：
              "${content}"
              
              请基于以下原始分析和用户反馈，重新定义视觉基因和逻辑：
              [Current_Data]: ${JSON.stringify(state.data_locker.node2)}
              
              要求输出 JSON 格式，包含 visual_dna (color_palette, color_description, texture, form), routes (a, b 两个方案，每个包含 title, logic)。
            `;
            successMessage = "视觉基因提取已重新聚焦，方案逻辑已更新。";
          }
          break;

        case NodeID.NODE_3:
          if (state.data_locker.node3) {
            targetNodeKey = "node3";
            refinementPrompt = `
              你现在是空间架构师。用户对场域约束提出了调整：
              "${content}"
              
              请基于以下原始场域数据和用户反馈，修正场域约束：
              [Current_Data]: ${JSON.stringify(state.data_locker.node3)}
              
              要求输出 JSON 格式，包含 city, month, lighting, seasonal_mood, constraints, aesthetic_redline。
            `;
            successMessage = "场域约束与美学红线已实时调整。";
          }
          break;

        case NodeID.NODE_4:
          if (state.data_locker.node4) {
            targetNodeKey = "node4";
            refinementPrompt = `
              你现在是执行导演。用户对刚才生成的方案 "${state.data_locker.node4.strategy}" 提出了反馈：
              "${content}"
              
              请基于以下原始上下文和用户反馈，修正你的剧本和压力曲线：
              [Logic_Context]: ${JSON.stringify(state.data_locker)}
              
              要求输出 JSON 格式，保持原有的结构 (strategy, concept, sensory_script, pressure_points, director_note)，但根据反馈调整内容和 pressure_points。
            `;
            successMessage = "导演剧本与感官压力曲线已完成实时重绘。";
          }
          break;

        case NodeID.NODE_5:
          if (state.data_locker.node5) {
            targetNodeKey = "node5";
            refinementPrompt = `
              你现在是 AI 提示词专家。用户对生成的 Prompt 提出了修改：
              "${content}"
              
              请基于以下原始 Prompt 和用户反馈，优化 Prompt：
              [Current_Data]: ${JSON.stringify(state.data_locker.node5)}
              
              要求输出 JSON 格式，包含 prompt, negative_prompt, settings。
            `;
            successMessage = "AI 提示词已根据您的反馈完成高阶优化。";
          }
          break;
      }

      if (refinementPrompt && targetNodeKey) {
        const response = await generateAIResponse("gemini-3-flash-preview", [{ role: "user", parts: [{ text: refinementPrompt }] }]);
        const updatedData = JSON.parse(response.text);
        
        setState(prev => ({
          ...prev,
          data_locker: { ...prev.data_locker, [targetNodeKey!]: updatedData }
        }));
        
        addAIMessage(successMessage);
      } else {
        addAIMessage("收到您的指令。请继续完成当前环节的操作，我将根据您的输入进行深度推演。");
      }
    } catch (error) {
      console.error("Refinement failed:", error);
      addAIMessage("抱歉，我在处理您的指令时遇到了点小麻烦，请再试一次。");
    } finally {
      setIsTyping(false);
    }
  };

  const updateNodeData = (nodeId: NodeID, data: any) => {
    const nodeKey = `node${nodeId.split("_")[1]}` as keyof WorkflowState["data_locker"];
    setState(prev => ({
      ...prev,
      data_locker: { ...prev.data_locker, [nodeKey]: data }
    }));
  };

  const handleNodeComplete = (nodeId: NodeID, data: any) => {
    const nodes = Object.values(NodeID);
    const index = nodes.indexOf(nodeId);
    const nextNode = nodes[index + 1] || nodeId;
    const nextPersona = getPersonaForNode(nextNode);
    
    setState(prev => ({ ...prev, is_calculating: true, audit_logs: ["正在执行因果审计...", "锁定美学红线..."] }));

    let newConstraints = [...state.aesthetic_constraints];
    if (nodeId === NodeID.NODE_1) {
      if (data.mbti?.includes("I")) newConstraints.push("Intimate Space", "Soft Lighting", "Minimal Noise");
      if (data.role?.includes("疗愈")) newConstraints.push("Healing Textures", "Organic Shapes");
    }
    if (nodeId === NodeID.NODE_3) {
      if (data.aesthetic_redline) newConstraints.push(data.aesthetic_redline);
    }

    setTimeout(() => {
      setState(prev => ({ ...prev, audit_logs: [...prev.audit_logs, "同步时令情绪参数...", "构建感官剧本框架..."] }));
    }, 800);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        lock_chain: { ...prev.lock_chain, [nodeId]: true },
        data_locker: { ...prev.data_locker, [`node${nodeId.split("_")[1]}`]: data },
        current_node: nextNode,
        active_persona: nextPersona,
        aesthetic_constraints: Array.from(new Set(newConstraints)),
        is_calculating: false,
        audit_logs: []
      }));
      
      addAIMessage(getTransitionMessage(nodeId, nextPersona));
    }, 2000);
  };

  const renderNodeContent = () => {
    switch (state.current_node) {
      case NodeID.NODE_1: 
        return <Node1Questionnaire 
          onComplete={(data) => handleNodeComplete(NodeID.NODE_1, data)} 
          onUpdate={(data) => updateNodeData(NodeID.NODE_1, data)}
          currentData={state.data_locker.node1}
        />;
      case NodeID.NODE_2: 
        return <Node2Material 
          onComplete={(data) => handleNodeComplete(NodeID.NODE_2, data)} 
          onUpdate={(data) => updateNodeData(NodeID.NODE_2, data)}
          personData={state.data_locker.node1} 
          currentData={state.data_locker.node2}
        />;
      case NodeID.NODE_3: 
        return <Node3Venue 
          onComplete={(data) => handleNodeComplete(NodeID.NODE_3, data)} 
          onUpdate={(data) => updateNodeData(NodeID.NODE_3, data)}
          constraints={state.aesthetic_constraints} 
          context={state.data_locker} 
        />;
      case NodeID.NODE_4: 
        return <Node4Strategy 
          onComplete={(data) => handleNodeComplete(NodeID.NODE_4, data)} 
          onUpdate={(data) => updateNodeData(NodeID.NODE_4, data)}
          context={{ ...state.data_locker, aesthetic_constraints: state.aesthetic_constraints }} 
        />;
      case NodeID.NODE_5:
      case NodeID.NODE_6: 
        return <Node56Output 
          onComplete={(data) => handleNodeComplete(state.current_node, data)} 
          onUpdate={(data) => updateNodeData(state.current_node, data)}
          context={state.data_locker} 
          onShowPresentation={() => setState(prev => ({ ...prev, show_presentation: true }))} 
        />;
      default: 
        return (
          <Card className="border-none shadow-xl bg-white p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#C8102E] animate-spin" />
            </div>
            <h2 className="text-xl font-bold">正在编排节点...</h2>
            <p className="text-gray-500">此节点的功能正在由 AI 编排引擎构建中。</p>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans overflow-hidden">
      <Header 
        appName={import.meta.env.VITE_APP_NAME || "百联 AI 企划助手"}
        lockChain={state.lock_chain}
        currentNode={state.current_node}
        progressValue={progressValue}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex overflow-hidden relative">
        <LeftRail 
          isMobileMenuOpen={isMobileMenuOpen}
          messages={messages}
          isTyping={isTyping}
          scrollRef={scrollRef}
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleSendMessage}
        />

        <section className="flex-1 bg-[#f8f9fa] overflow-y-auto p-4 md:p-10 relative">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <AestheticDashboard constraints={state.aesthetic_constraints} />

            <AnimatePresence mode="wait">
              {state.is_calculating ? (
                <CalculatingOverlay auditLogs={state.audit_logs} />
              ) : (
                <motion.div
                  key={state.current_node}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {renderNodeContent()}
                </motion.div>
              )}
            </AnimatePresence>

            <BentoGrid 
              lockChain={state.lock_chain}
              currentNode={state.current_node}
              dataLocker={state.data_locker}
              getNodeTitle={getNodeTitle}
            />
          </div>
        </section>
      </main>

      <AnimatePresence>
        {state.show_presentation && (
          <PresentationMode 
            context={state.data_locker} 
            onClose={() => setState(prev => ({ ...prev, show_presentation: false }))} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
