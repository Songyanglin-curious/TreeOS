export type AtomId = string;

export interface ThinkingAtom {
    what: string;                 // 是什么
    why: string;                  // 为什么（一句话价值）
    boundary: string[];           // 边界（条目化：包含/不包含/约束都写成句子）
    acceptance: string[];         // 验收标准（条目化，可判定）
}

export interface ThinkingNode extends ThinkingAtom {
    id: AtomId;
    children: ThinkingNode[];     // How = 子问题树；叶子节点 children=[]
}

// -------------以下的节点在0.1版本中暂时不用，后续版本会加入------------
/** 运行时/执行层（可选）：不污染定义层 */
export interface VerificationState {
    nodeId: AtomId;
    acceptancePassed: boolean[];  // 与 acceptance 一一对应
    evidence?: string[];          // 证据：链接/截图说明/日志片段等

}
/**
ThinkingNode       ← 结构定义层
VerificationState  ← 结果判定层
DiscussionLog      ← 推理轨迹层
 */

export interface DiscussionLog {
    nodeId: AtomId;
    messages: {
        role: 'human' | 'ai';
        content: string;
        timestamp: number;
    }[];
}