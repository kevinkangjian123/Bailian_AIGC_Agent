import { NodeID, Persona } from "@/types";

export const getNodeTitle = (node: NodeID): string => {
  switch (node) {
    case NodeID.NODE_1: return "消费者画像";
    case NodeID.NODE_2: return "素材分析";
    case NodeID.NODE_3: return "场域约束";
    case NodeID.NODE_4: return "战略定调";
    case NodeID.NODE_5: return "Prompt 生成";
    case NodeID.NODE_6: return "最终验证";
  }
};

export const getPersonaForNode = (node: NodeID): Persona => {
  if (node === NodeID.NODE_1) return "INTERVIEWER";
  if (node === NodeID.NODE_2 || node === NodeID.NODE_3) return "CONSULTANT";
  return "DIRECTOR";
};

export const getTransitionMessage = (nodeId: NodeID, nextPersona: Persona): string => {
  const personaPrefix = 
    nextPersona === "INTERVIEWER" ? "作为您的访谈助手，" :
    nextPersona === "CONSULTANT" ? "作为您的策展顾问，" : "作为本案的执行导演，";

  switch (nodeId) {
    case NodeID.NODE_1: return `${personaPrefix}画像分析已完成。我已为您锁定了初步的美学红线。接下来，请上传您的创意素材，我们将进行深度的视觉基因提取。`;
    case NodeID.NODE_2: return `${personaPrefix}素材的视觉基因非常独特。现在我们需要进入场域匹配环节，请提供场地相关信息，我将结合实时时令情绪进行推演。`;
    case NodeID.NODE_3: return `${personaPrefix}场域约束已就绪。现在进入最关键的战略定调环节，我将为您输出具备感官呼吸感的导演剧本。`;
    case NodeID.NODE_4: return `${personaPrefix}剧本已定稿。最后一步，我将为您生成用于生产的高精度视觉与文案 Prompt。`;
    default: return "所有流程已完成，您可以查看最终的策划报告了。";
  }
};
