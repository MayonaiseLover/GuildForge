import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import { env } from "../env";

// ── Provider Interface ────────────────────────────────────────────────────────

export interface LLMProvider {
  readonly id: string;
  readonly name: string;
  readonly models: string[];

  generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<T>;

  chat(opts: {
    systemPrompt: string;
    messages: { role: "user" | "assistant", content: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
    model?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }>;
}

// ── Anthropic Provider ────────────────────────────────────────────────────────

export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic";
  readonly name = "Anthropic (Claude)";
  readonly models = ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"];
  private client: Anthropic;

  constructor() {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY required");
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<T> {
    const jsonSchema = zodToJsonSchema(opts.schema, "OutputSchema");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputSchema = (jsonSchema as any).definitions?.OutputSchema || jsonSchema;

    const response = await this.client.messages.create({
      model: opts.model || "claude-3-5-sonnet-20241022",
      system: opts.systemPrompt,
      max_tokens: opts.maxTokens || 4000,
      temperature: opts.temperature || 0.7,
      messages: [{ role: "user", content: opts.userPrompt }],
      tools: [{
        name: "output_result",
        description: "Output the generated plan",
        input_schema: inputSchema
      }],
      tool_choice: { type: "tool", name: "output_result" }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolUse = response.content.find((c: any) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model failed to output using the required tool");
    }

    return opts.schema.parse(toolUse.input);
  }

  async chat(opts: {
    systemPrompt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: { role: "user" | "assistant", content: any }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
    model?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }> {
    const response = await this.client.messages.create({
      model: opts.model || "claude-3-5-sonnet-20241022",
      system: opts.systemPrompt,
      max_tokens: opts.maxTokens || 4000,
      temperature: opts.temperature || 0.7,
      messages: opts.messages,
      tools: opts.tools,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textContent = response.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCalls = response.content.filter((c: any) => c.type === "tool_use").map((c: any) => ({
      name: c.name,
      input: c.input,
      id: c.id
    }));

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      rawContent: response.content
    };
  }
}

// ── OpenAI-Compatible Provider (OpenAI, Groq, Grok, DeepSeek) ─────────────────

interface OpenAICompatibleConfig {
  id: string;
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  defaultModel: string;
}

export class OpenAICompatibleProvider implements LLMProvider {
  readonly id: string;
  readonly name: string;
  readonly models: string[];
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: OpenAICompatibleConfig) {
    this.id = config.id;
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.models = config.models;
    this.defaultModel = config.defaultModel;
  }

  private async callAPI(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${this.name} API error (${res.status}): ${err}`);
    }

    return res.json() as Promise<Record<string, unknown>>;
  }

  async generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<T> {
    const jsonSchema = zodToJsonSchema(opts.schema, "OutputSchema");

    const response = await this.callAPI({
      model: opts.model || this.defaultModel,
      max_tokens: opts.maxTokens || 4000,
      temperature: opts.temperature || 0.7,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "output_result",
          description: "Output the generated plan",
          parameters: jsonSchema,
        }
      }],
      tool_choice: { type: "function", function: { name: "output_result" } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const choices = response.choices as any[];
    const toolCall = choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      // Fallback: try to parse from content
      const content = choices?.[0]?.message?.content ?? "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return opts.schema.parse(JSON.parse(jsonMatch[0]));
      throw new Error(`${this.name}: Model failed to output structured data`);
    }

    return opts.schema.parse(JSON.parse(toolCall.function.arguments));
  }

  async chat(opts: {
    systemPrompt: string;
    messages: { role: "user" | "assistant", content: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
    model?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }> {
    // Convert Anthropic-style tools to OpenAI format
    const openaiTools = opts.tools?.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));

    const response = await this.callAPI({
      model: opts.model || this.defaultModel,
      max_tokens: opts.maxTokens || 4000,
      temperature: opts.temperature || 0.7,
      messages: [
        { role: "system", content: opts.systemPrompt },
        ...opts.messages,
      ],
      ...(openaiTools && openaiTools.length > 0 ? { tools: openaiTools } : {}),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const choices = response.choices as any[];
    const message = choices?.[0]?.message;

    const toolCalls = message?.tool_calls?.map((tc: Record<string, unknown>) => {
      const fn = tc.function as Record<string, unknown>;
      return {
        id: tc.id,
        name: fn.name,
        input: JSON.parse(fn.arguments as string),
      };
    });

    return {
      content: message?.content ?? "",
      toolCalls: toolCalls?.length > 0 ? toolCalls : undefined,
      rawContent: [message],
    };
  }
}

// ── Gemini Provider ───────────────────────────────────────────────────────────

export class GeminiProvider implements LLMProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";
  readonly models = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
  private apiKey: string;

  constructor() {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY required");
    this.apiKey = env.GEMINI_API_KEY;
  }

  private async callAPI(model: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    return res.json() as Promise<Record<string, unknown>>;
  }

  async generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<T> {
    const response = await this.callAPI(opts.model || "gemini-2.5-flash", {
      system_instruction: { parts: [{ text: opts.systemPrompt }] },
      contents: [{ parts: [{ text: opts.userPrompt + "\n\nRespond with valid JSON only." }] }],
      generationConfig: {
        temperature: opts.temperature || 0.7,
        maxOutputTokens: opts.maxTokens || 4000,
        responseMimeType: "application/json",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates = response.candidates as any[];
    const text = candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return opts.schema.parse(JSON.parse(text));
  }

  async chat(opts: {
    systemPrompt: string;
    messages: { role: "user" | "assistant", content: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
    model?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }> {
    const contents = opts.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiTools = opts.tools?.map((t) => ({
      function_declarations: [{
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      }],
    }));

    const response = await this.callAPI(opts.model || "gemini-2.5-flash", {
      system_instruction: { parts: [{ text: opts.systemPrompt }] },
      contents,
      ...(geminiTools ? { tools: geminiTools } : {}),
      generationConfig: {
        temperature: opts.temperature || 0.7,
        maxOutputTokens: opts.maxTokens || 4000,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates = response.candidates as any[];
    const parts = candidates?.[0]?.content?.parts ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textContent = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const functionCalls = parts.filter((p: any) => p.functionCall).map((p: any) => ({
      name: p.functionCall.name,
      input: p.functionCall.args,
      id: `fc_${Date.now()}`,
    }));

    return {
      content: textContent,
      toolCalls: functionCalls.length > 0 ? functionCalls : undefined,
      rawContent: parts,
    };
  }
}

// ── Provider Registry ─────────────────────────────────────────────────────────

export interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
  isDefault: boolean;
}

const providerFactories: Record<string, () => LLMProvider> = {
  anthropic: () => new AnthropicProvider(),
  openai: () => new OpenAICompatibleProvider({
    id: "openai",
    name: "OpenAI (GPT)",
    apiKey: env.OPENAI_API_KEY!,
    baseURL: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini"],
    defaultModel: "gpt-4o",
  }),
  gemini: () => new GeminiProvider(),
  groq: () => new OpenAICompatibleProvider({
    id: "groq",
    name: "Groq",
    apiKey: env.GROQ_API_KEY!,
    baseURL: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
    defaultModel: "llama-3.3-70b-versatile",
  }),
  grok: () => new OpenAICompatibleProvider({
    id: "grok",
    name: "xAI (Grok)",
    apiKey: env.GROK_API_KEY!,
    baseURL: "https://api.x.ai/v1",
    models: ["grok-2", "grok-2-mini"],
    defaultModel: "grok-2",
  }),
  deepseek: () => new OpenAICompatibleProvider({
    id: "deepseek",
    name: "DeepSeek",
    apiKey: env.DEEPSEEK_API_KEY!,
    baseURL: "https://api.deepseek.com",
    models: ["deepseek-chat", "deepseek-reasoner"],
    defaultModel: "deepseek-chat",
  }),
};

const providerApiKeys: Record<string, string | undefined> = {
  anthropic: env.ANTHROPIC_API_KEY,
  openai: env.OPENAI_API_KEY,
  gemini: env.GEMINI_API_KEY,
  groq: env.GROQ_API_KEY,
  grok: env.GROK_API_KEY,
  deepseek: env.DEEPSEEK_API_KEY,
};

// Cached provider instances
const providerCache = new Map<string, LLMProvider>();

export function getProvider(id?: string): LLMProvider {
  const providerId = id || env.LLM_PROVIDER || "anthropic";

  if (providerCache.has(providerId)) {
    return providerCache.get(providerId)!;
  }

  const factory = providerFactories[providerId];
  if (!factory) throw new Error(`Unknown LLM provider: ${providerId}`);
  if (!providerApiKeys[providerId]) {
    throw new Error(`API key not configured for provider: ${providerId}. Set the ${providerId.toUpperCase()}_API_KEY environment variable.`);
  }

  const provider = factory();
  providerCache.set(providerId, provider);
  return provider;
}

export function listProviders(): ProviderInfo[] {
  const defaultProvider = env.LLM_PROVIDER || "anthropic";

  return Object.entries(providerFactories).map(([id]) => {
    const configured = !!providerApiKeys[id];
    // Get models from the factory config
    const models = configured ? getModelsForProvider(id) : getModelsForProvider(id);

    return {
      id,
      name: getProviderName(id),
      models,
      configured,
      isDefault: id === defaultProvider,
    };
  });
}

function getProviderName(id: string): string {
  const names: Record<string, string> = {
    anthropic: "Anthropic (Claude)",
    openai: "OpenAI (GPT)",
    gemini: "Google Gemini",
    groq: "Groq",
    grok: "xAI (Grok)",
    deepseek: "DeepSeek",
  };
  return names[id] ?? id;
}

function getModelsForProvider(id: string): string[] {
  const models: Record<string, string[]> = {
    anthropic: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini"],
    gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
    groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    grok: ["grok-2", "grok-2-mini"],
    deepseek: ["deepseek-chat", "deepseek-reasoner"],
  };
  return models[id] ?? [];
}
