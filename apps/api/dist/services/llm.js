import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import { env } from "../env";
export class AnthropicProvider {
    client;
    constructor() {
        this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY || "dummy" });
    }
    async generate(opts) {
        const jsonSchema = zodToJsonSchema(opts.schema, "OutputSchema");
        const inputSchema = jsonSchema.definitions?.OutputSchema || jsonSchema;
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
        const toolUse = response.content.find((c) => c.type === "tool_use");
        if (!toolUse || toolUse.type !== "tool_use") {
            throw new Error("Model failed to output using the required tool");
        }
        return opts.schema.parse(toolUse.input);
    }
    async chat(opts) {
        const response = await this.client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            system: opts.systemPrompt,
            max_tokens: opts.maxTokens || 4000,
            temperature: opts.temperature || 0.7,
            messages: opts.messages,
            tools: opts.tools,
        });
        const textContent = response.content.filter((c) => c.type === "text").map((c) => c.text).join("");
        const toolCalls = response.content.filter((c) => c.type === "tool_use").map((c) => ({
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
