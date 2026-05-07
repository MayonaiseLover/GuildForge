import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import { env } from "../env";

export interface LLMProvider {
  generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
  }): Promise<T>;

  chat(opts: {
    systemPrompt: string;
    messages: { role: "user" | "assistant", content: string }[];
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }>;
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY || "dummy" });
  }

  async generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
  }): Promise<T> {
    const jsonSchema = zodToJsonSchema(opts.schema, "OutputSchema");
    const inputSchema = (jsonSchema as any).definitions?.OutputSchema || jsonSchema;

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
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

    const toolUse = response.content.find((c: any) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model failed to output using the required tool");
    }

    return opts.schema.parse(toolUse.input);
  }

  async chat(opts: {
    systemPrompt: string;
    messages: { role: "user" | "assistant", content: any }[];
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ content: string; toolCalls?: any[]; rawContent?: any[] }> {
    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: opts.systemPrompt,
      max_tokens: opts.maxTokens || 4000,
      temperature: opts.temperature || 0.7,
      messages: opts.messages,
      tools: opts.tools,
    });

    const textContent = response.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
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
