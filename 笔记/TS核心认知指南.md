# TypeScript 核心认知与工程实践指南

**适用场景**：TreeOS + Node 环境
**文档性质**：技术学习笔记
**版本日期**：2026年

---

## 1. 核心本质

### 1.1 定义

TypeScript 是 JavaScript 的超集，其核心公式为：

> TypeScript = JavaScript + 静态类型系统 + 编译阶段约束

### 1.2 运行机制

- **运行时不变**：不改变 JavaScript 的运行时行为。
- **编译时工作**：仅在开发编译阶段进行类型检查。
- **输出产物**：最终编译输出为标准 JavaScript 代码，浏览器或 Node 环境无法感知 TypeScript 存在。

### 1.3 核心价值

TypeScript 不是语法糖，而是可演进系统的基础设施。主要解决以下 JavaScript 核心问题：

1. **类型安全**：防止类型随时变化导致的隐性错误。
2. **约束能力**：强制函数参数和返回值符合预期。
3. **重构信心**：大型项目重构时提供类型保护，降低破坏性风险。
4. **可维护性**：通过类型定义作为文档，提升代码可读性。

---

## 2. 基础类型系统

### 2.1 原始类型

必须掌握的基础类型声明：

```typescript
let a: number
let b: string
let c: boolean
let d: null
let e: undefined
let f: bigint
let g: symbol
```

### 2.2 复合类型

**数组**

```typescript
let arr: number[] = [1, 2, 3]
// 或
let arr: Array<number>
```

**对象**

```typescript
let user: {
  name: string
  age: number
}
```

**函数**
需同时定义参数类型与返回值类型。

```typescript
function sum(a: number, b: number): number {
  return a + b
}
```

### 2.3 类型推断

TypeScript 具备智能推断能力。

- **原则**：能推断就不写，复杂结构必须写。
- **示例**：`let x = 10` 会自动推断为 `number` 类型。

---

## 3. 类型定义与抽象

### 3.1 Interface vs Type

两者均可定义对象结构，但在能力上存在差异。

| 能力         | interface      | type     |
| :----------- | :------------- | :------- |
| 定义对象结构 | 支持           | 支持     |
| 联合类型     | 不支持         | 支持     |
| 交叉类型     | 不支持         | 支持     |
| 扩展继承     | 支持 (extends) | 支持 (&) |

**工程建议**：

- 定义“对象结构”优先使用 `interface`。
- 定义“组合类型”（联合、交叉）使用 `type`。

### 3.2 联合类型与交叉类型

**联合类型 (Union Types)**
表示值可能是多种类型中的一种。

```typescript
let id: number | string
```

**交叉类型 (Intersection Types)**
表示同时拥有多个类型的特征。

```typescript
type A = { name: string }
type B = { age: number }
type C = A & B  // C 同时拥有 name 和 age
```

---

## 4. 类型安全与控制

### 4.1 特殊类型

- **any**：关闭类型检查。等同于回到 JavaScript，项目中应尽量避免。
- **unknown**：安全版的 any。使用前必须进行类型判断或断言。
- **never**：表示永远不会发生的值。常用于抛出异常或 switch 穷尽检查。

### 4.2 类型断言

用于告诉编译器“我比您更清楚该值的类型”。断言不进行运行时检查。

```typescript
const input = document.getElementById("app") as HTMLDivElement
```

### 4.3 类型守卫

用于缩小联合类型的范围。

```typescript
function print(id: number | string) {
  if (typeof id === "string") {
    // 在此作用域内 id 被推断为 string
    id.toUpperCase()
  }
}
```

### 4.4 泛型 (Generics)

泛型是类型的变量，用于保持函数或类的类型信息。

```typescript
function identity<T>(value: T): T {
  return value
}

// 使用
identity<number>(10)
```

**本质**：让函数在处理未知类型时，仍能保持输入与输出的类型关联。

---

## 5. 工程化配置

### 5.1 工具链

- **tsc**：TypeScript 官方编译器，负责 TS 到 JS 的转换。
- **ts-node**：开发环境下直接运行 TypeScript 文件。
- **tsx**：推荐使用的运行器，速度更快，支持 ES Modules 更好。

### 5.2 模块系统

当前 Node 环境建议使用 ES Modules。

```typescript
export function a() {}
import { a } from "./a.js"
```

**注意**：TS 编译后的模块格式必须与 Node 运行时的 module 规则一致。

### 5.3 tsconfig 核心参数

| 参数                 | 说明               | 建议值 |
| :------------------- | :----------------- | :----- |
| `target`           | 输出 JS 版本       | ES2020 |
| `module`           | 模块格式           | ESNext |
| `moduleResolution` | 模块解析策略       | Node   |
| `strict`           | 开启严格模式       | true   |
| `outDir`           | 输出目录           | ./dist |
| `rootDir`          | 源码目录           | ./src  |
| `esModuleInterop`  | 兼容 CommonJS 模块 | true   |

### 5.4 严格模式

必须开启 `strict: true`。它是质量开关，会自动启用 `strictNullChecks`、`noImplicitAny` 等检查项，确保代码质量。

---

## 6. 项目应用与路线 (TreeOS 上下文)

### 6.1 对 TreeOS 的意义

1. **结构稳定**：需求树节点结构必须强类型定义。
2. **接口契约**：API 输入输出必须稳定，防止隐性变更。
3. **数据推断**：JSON Schema 结构必须可被类型系统推断。
4. **版本演进**：重构时通过类型报错控制变更风险。

**示例数据结构**：

```typescript
interface TreeNode {
  title: string
  type: "requirement" | "task" | "idea"
  atom: {
    statement: string
    intent: string
    constraints: string[]
    acceptance: string[]
  }
  children: TreeNode[]
}
```

### 6.2 学习目标

当前阶段不追求精通所有特性，重点达成以下目标：

1. 能定义清晰的接口 (Interface)。
2. 能使用基础泛型 (Generics)。
3. 能配置严格的 tsconfig。
4. 能理解并修复编译器报错。
5. 能避免使用 `any`。

### 6.3 进阶路线

- **阶段一 (当前)**：写强类型数据结构，理解 Module 与 tsconfig。
- **阶段二**：学习泛型高级用法，掌握工具类型 (Partial, Pick, Record)。
- **阶段三**：类型驱动设计，学习条件类型、映射类型、infer 等类型编程能力。

---

## 7. 总结

TypeScript 是大型工程的稳定器与重构保护网。它不是用来提升运行速度或替代 JavaScript 的，而是作为一种**约束系统**和**设计表达语言**存在。

**核心认知**：

- 它是编译时约束，不影响运行时。
- 它是基础设施，而非单纯的语法糖。
- 它是为了长期可维护性而付出的短期开发成本。
