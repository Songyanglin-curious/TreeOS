import deepseek from "./requests/deepseekService.js";

async function main() {
  const userText = `做一个简单的任务管理系统。
用户可以注册登录，创建任务，设置截止时间，标记完成。
需要支持任务分类和搜索功能。`;

  const { draft, json, retried, firstError } = await deepseek.analyzeToTree(userText);

  console.log("=== draft ===");
  console.log(draft);

  console.log("=== json ===");
  console.dir(json, { depth: null });

  if (retried) {
    console.log("=== retry ===");
    console.log(`formatter first failed: ${firstError}`);
  }
}

main().catch((error) => {
  console.error("Execution failed:", error);
  process.exit(1);
});
