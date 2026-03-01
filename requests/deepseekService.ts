import OpenAI from "openai";
import dotenv from "dotenv";
import reasonerSystemPrompt from "../prompts/reasonerSystemPrompt.js";
import formatterSystemPrompt from "../prompts/formatterSystemPrompt.js";
import { validateTreeSchema } from "./treeSchema.js";
import type { AnalyzeResult, TreeNode } from "../types/tree.js";

dotenv.config();

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;
type JsonResponseFormat = { type: "json_object" };

interface CompletionInput {
  model: string;
  messages: Message[];
  thinking?: { type: "enabled" };
  response_format?: JsonResponseFormat;
  temperature?: number;
  max_tokens?: number;
}

class DeepSeekService {
  private readonly client: OpenAI;

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Missing DEEPSEEK_API_KEY in environment variables");
    }

    this.client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey,
    });
  }

  async completion({
    model,
    messages,
    thinking,
    response_format,
    temperature = 0.2,
    max_tokens = 2000,
  }: CompletionInput): Promise<ChatCompletion> {
    const payload: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    };

    const extra: Record<string, unknown> = {};
    if (thinking) extra.thinking = thinking;
    if (response_format) extra.response_format = response_format;

    const request = {
      ...payload,
      ...extra,
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

    return this.client.chat.completions.create(request);
  }

  async reasonDraft(userText: string): Promise<string> {
    const res = await this.completion({
      model: "deepseek-reasoner",
      thinking: { type: "enabled" },
      messages: [
        { role: "system", content: reasonerSystemPrompt },
        { role: "user", content: userText },
      ],
    });

    const message = res.choices?.[0]?.message;
    const content = message?.content;
    const reasoning = (message as unknown as { reasoning_content?: unknown } | undefined)?.reasoning_content;
    const draft =
      typeof content === "string" && content.trim()
        ? content
        : typeof reasoning === "string"
          ? reasoning
          : "";

    if (!draft) {
      throw new Error("Reasoner draft empty");
    }

    return draft;
  }

  async formatToJson(userText: string, draftText: string, retryHint = ""): Promise<TreeNode> {
    const userPrompt = `Original requirement:\n${userText}\n\nReasoning draft:\n${draftText}${retryHint ? `\n\n${retryHint}` : ""}`;

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

    const text = res.choices?.[0]?.message?.content ?? "";
    if (!text) {
      throw new Error("Formatter content empty");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Formatter invalid JSON: ${text.slice(0, 200)}`);
    }

    if (!validateTreeSchema(parsed)) {
      throw new Error("Formatter output failed schema validation");
    }

    return parsed;
  }

  async analyzeToTree(userText: string): Promise<AnalyzeResult> {
    const draft = await this.reasonDraft(userText);

    try {
      const json = await this.formatToJson(userText, draft);
      return { draft, json };
    } catch (error) {
      const retryHint =
        "Previous output failed JSON.parse or schema validation. Return one strict JSON object only.";
      const json = await this.formatToJson(userText, draft, retryHint);
      const firstError = error instanceof Error ? error.message : String(error);
      return { draft, json, retried: true, firstError };
    }
  }
}

export default new DeepSeekService();
