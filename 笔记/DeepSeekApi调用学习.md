# DeepSeek API 调用学习笔记

## 一、接口兼容性与调用模型

### 1.1 OpenAI 兼容协议

DeepSeek 提供与 OpenAI Chat Completions 接口兼容的 API 规范。这意味着：

* 请求路径结构一致
* 参数格式一致（model / messages 等）
* 返回结构一致（choices / message / content 等）

因此，在 Node.js 环境中可以直接使用 `openai` 官方 SDK 作为客户端，仅需修改：

* `baseURL`
* `apiKey`

无需自行封装底层 HTTP 请求。

## 二、运行环境准备

### 2.1 安装依赖

```bash
npm install openai
```

### 2.2 API Key 管理

使用 `dotenv`

```js
import dotenv from "dotenv";

dotenv.config(); // 加载 .env 文件中的变量到 process.env
```

## 三、最小可运行调用示例

### 3.1 客户端初始化

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});
```

说明：

* baseURL：指定请求目标为 DeepSeek 服务
* apiKey：用于请求鉴权
* OpenAI：作为兼容客户端使用

### 3.2 发起一次 Chat Completion 请求

```javascript
const completion = await openai.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "用一句话解释什么是需求树。" }
  ],
});

console.log(completion.choices[0].message.content);
```

## 四、核心参数结构解析

### 4.1 model

指定模型名称，例如：

```js
"deepseek-chat"
```

不同模型可能有不同能力与价格策略。

### 4.2 messages

messages 是对话上下文数组，是模型推理的唯一输入上下文。

结构格式：

```js
[
  { role: "system", content: "系统提示词" },
  { role: "user", content: "用户输入" },
  { role: "assistant", content: "模型之前的回答" }
]
```

字段说明：

* role：消息身份
  * system：行为约束与角色设定
  * user：用户输入
  * assistant：模型历史输出
* content：文本内容

重要原则：

模型不会自动记忆历史。
每一次请求，必须完整传入当前需要参与推理的全部上下文。

## 五、返回结构解析

典型返回结构：

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "模型生成的文本"
      }
    }
  ]
}
```

常用访问路径：

```js
completion.choices[0].message.content
```

含义：

* choices：候选输出列表（通常只有一个）
* message：生成的消息对象
* content：最终文本内容

## 六、工程化最小封装

避免在业务代码中直接处理底层结构，建议封装为统一服务。

示例：

```javascript
import OpenAI from "openai";

class DeepSeekService {
  constructor() {
    this.client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async chat(messages, model = "deepseek-chat") {
    const res = await this.client.chat.completions.create({
      model,
      messages,
    });
    return res.choices?.[0]?.message?.content ?? "";
  }
}

export const deepseek = new DeepSeekService();
```

业务层调用：

```javascript
const text = await deepseek.chat([
  { role: "system", content: "你是需求拆解助手。" },
  { role: "user", content: "拆解用户登录功能。" }
]);
```

封装收益：

* 统一鉴权与配置管理
* 屏蔽返回结构细节
* 为后续扩展（重试、日志、限流）预留接口
