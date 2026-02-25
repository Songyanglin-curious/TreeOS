import OpenAI from "openai";
import dotenv from "dotenv";
import reasonerSystemPrompt from "../prompts/reasonerSystemPrompt.js";
import formatterSystemPrompt from "../prompts/formatterSystemPrompt.js";
import { validateTreeSchema } from "./treeSchema.js";

dotenv.config();

class DeepSeekService {
    constructor() {
        this.client = new OpenAI({
            baseURL: "https://api.deepseek.com",
            apiKey: process.env.DEEPSEEK_API_KEY,
        });
    }

    async completion({
        model,
        messages,
        thinking,
        response_format,
        temperature = 0.2,
        max_tokens = 2000,
    }) {
        return this.client.chat.completions.create({
            model,
            messages,
            thinking,
            response_format,
            temperature,
            max_tokens,
        });
    }

    async reasonDraft(userText) {
        const res = await this.completion({
            model: "deepseek-reasoner",
            thinking: { type: "enabled" },
            messages: [
                { role: "system", content: reasonerSystemPrompt },
                { role: "user", content: userText },
            ],
            // temperature: 0.2,
            // max_tokens: 2500,
        });

        const msg = res.choices?.[0]?.message ?? {};
        const draft =
            msg.content && msg.content.trim() ? msg.content : msg.reasoning_content ?? "";

        if (!draft) {
            throw new Error("Reasoner draft empty");
        }
        return draft;
    }

    async formatToJson(userText, draftText, retryHint = "") {
        const userPrompt = `原始需求：
${userText}

思考稿（来自分析专家）：
${draftText}
${retryHint ? `\n\n${retryHint}` : ""}`;
        console.log("开始格式化...");
        const res = await this.completion({
            model: "deepseek-chat",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: formatterSystemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
            max_tokens: 2000,
        });
        console.log("格式化完成，开始校验...");
        const text = res.choices?.[0]?.message?.content ?? "";
        if (!text) {
            throw new Error("Formatter content empty");
        }

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error(`Formatter invalid JSON: ${text.slice(0, 200)}`);
        }

        validateTreeSchema(parsed);
        console.log("校验通过!");
        return parsed;
    }

    async analyzeToTree(userText) {
        console.log("分析中...");
        const draft = await this.reasonDraft(userText);
        console.log("思考稿生成完成，开始格式化...");
        try {
            const json = await this.formatToJson(userText, draft);
            return { draft, json };
        } catch (error) {
            const retryHint =
                "上次输出无法通过 JSON.parse 或结构校验，请只输出一个严格 JSON 对象，不得包含任何其他字符。";
            const json = await this.formatToJson(userText, draft, retryHint);
            return { draft, json, retried: true, firstError: String(error.message || error) };
        }
    }
}

export default new DeepSeekService();
