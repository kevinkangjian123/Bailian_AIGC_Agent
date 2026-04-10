export enum NodeID {
  NODE_1 = "NODE_1", // 消费者画像
  NODE_2 = "NODE_2", // 素材分析
  NODE_3 = "NODE_3", // 场域约束
  NODE_4 = "NODE_4", // 战略定调
  NODE_5 = "NODE_5", // Prompt 生成
  NODE_6 = "NODE_6", // 最终验证
}

export type Persona = "INTERVIEWER" | "CONSULTANT" | "DIRECTOR";

export interface Node1Data {
  mbti: string;
  jtbd: string;
  mood_tags: string[];
  role: string;
  analysis: string;
  persona_summary: string;
}

export interface Node2Data {
  visual_dna: {
    color_palette: string[];
    color_description: string;
    texture: string;
    form: string;
  };
  routes: {
    a: { title: string; logic: string };
    b: { title: string; logic: string };
  };
}

export interface Node3Data {
  city: string;
  month: string;
  lighting: string;
  seasonal_mood: string;
  constraints: string[];
  aesthetic_redline: string;
}

export interface Node4Data {
  strategy: string;
  concept: string;
  sensory_script: {
    visual: string;
    auditory: string;
    tactile: string;
    psychological: string;
  };
  pressure_points: number[];
  director_note: string;
}

export interface WorkflowState {
  current_node: NodeID;
  active_persona: Persona;
  lock_chain: Record<NodeID, boolean>;
  aesthetic_constraints: string[];
  is_calculating: boolean;
  audit_logs: string[];
  show_presentation: boolean;
  data_locker: {
    node1?: Node1Data;
    node2?: Node2Data;
    node3?: Node3Data;
    node4?: Node4Data;
    node5?: any;
    node6?: any;
  };
}

export const INITIAL_STATE: WorkflowState = {
  current_node: NodeID.NODE_1,
  active_persona: "INTERVIEWER",
  lock_chain: {
    [NodeID.NODE_1]: false,
    [NodeID.NODE_2]: false,
    [NodeID.NODE_3]: false,
    [NodeID.NODE_4]: false,
    [NodeID.NODE_5]: false,
    [NodeID.NODE_6]: false,
  },
  aesthetic_constraints: [],
  is_calculating: false,
  audit_logs: [],
  show_presentation: false,
  data_locker: {},
};
