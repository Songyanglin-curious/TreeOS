/**
 * 边界定义 (Boundary)
 * 核心目的：确保问题【可收敛】(Convergent)
 * 通过划定范围和约束，防止 Scope Creep（范围蔓延）
 */
export interface Boundary {
    inScope: string[];       // 明确包含什么（生效前提）
    outOfScope: string[];    // 绝对不包含什么（防止无限发散的防杠声明）
    limitations?: string[];  // 客观约束（如：时间、预算、物理定律、技术限制）
}

/**
 * 验收标准 (Acceptance Criteria)
 * 核心目的：确保问题【可验证】(Verifiable)
 * 必须是客观的、可测量的、二元（Pass/Fail）的结果
 */
export interface AcceptanceCriterion {
    id: string;
    description: string;     // 衡量指标或测试用例描述
    isVerified: boolean;     // 初始状态应为 false
}

/**
 * 核心思考单元 (The Thinking Atom)
 * 基础的、正交的、不可再分的最小闭环
 * 核心目的：确保【准确】(Accurate)
 */
export interface CoreThinkingAtom {
    what: string;            // 本体论：统一定义事实和目标
    why: string;             // 因果论：背后的底层逻辑/第一性原理
    boundary: Boundary;      // 空间论：收敛边界
    acceptance: AcceptanceCriterion[]; // 终局论：可证伪的闭环标准
}

/**
 * 可解析的思考节点 (Resolvable Thinking Node)
 * 完美诠释你的洞察：“怎么做是由一堆子问题有层级地组合起来的”
 * 
 * 它继承了核心原子，并引入了“分形/递归”能力。
 * 这里的 subAtoms 就是所谓的 "How" 的真实形态。
 */
export interface ThinkingAtomNode extends CoreThinkingAtom {
    id: string;              // 节点的唯一标识

    /**
     * 怎么做 (How) 的本质实现：子问题组合
     * 如果当前节点足够简单，可以直接验收，则 subAtoms 为空。
     * 如果当前节点复杂（无法直接解决），则向下拆解产生子节点树。
     */
    subAtoms?: ThinkingAtomNode[];

    /**
     * 工程状态（可选属性，用于实际追踪求解过程）
     */
    status?: 'pending' | 'in-progress' | 'verified' | 'failed';
}

// 例子

/**
 * 
 const loginAtom: ThinkingAtomNode = {
  id: "T-001",
  what: "实现基于手机号验证码的用户登录功能",
  why: "当前账号体系不安全，且为了收集真实用户联系方式以提升留存转化",
  boundary: {
    inScope: ["国内+86手机号", "验证码获取与校验"],
    outOfScope: ["国际手机号", "第三方微信/Apple登录", "密码登录"], // 边界收敛
    limitations: ["开发周期不超过3天", "短信成本单条<0.05元"]
  },
  acceptance: [
    { id: "A1", description: "输入正确手机号和验证码，生成有效Token", isVerified: false },
    { id: "A2", description: "输入错误验证码，提示重新输入且不阻断后续操作", isVerified: false }
  ],
  status: "pending",
  
  // 这就是“怎么做 (How)”的拆解：
  subAtoms: [
    {
      id: "T-001-1",
      what: "对接阿里云短信网关",
      why: "需要第三方服务下发真实短信",
      boundary: {
        inScope: ["调用发送API", "接收状态回调"],
        outOfScope: ["配置新的短信模板"], // 收敛子问题
      },
      acceptance: [{ id: "A1-1", description: "接口调用成功率>99%", isVerified: false }],
      // 如果这个子问题够简单，就不再需要 subAtoms 往下拆了，直接执行即可。
    },
    {
      id: "T-001-2",
      what: "编写前端登录UI组件",
      why: "提供用户输入手机号和验证码的界面",
      // ... boundary and acceptance ...
    }
  ]
};
 */