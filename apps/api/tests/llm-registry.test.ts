import { describe, it, expect, vi } from "vitest";

// Mock env before importing llm
vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-anthropic");
vi.stubEnv("OPENAI_API_KEY", "sk-test-openai");
vi.stubEnv("GEMINI_API_KEY", "gemini-test-key");
vi.stubEnv("GROQ_API_KEY", "groq-test-key");
vi.stubEnv("GROK_API_KEY", "grok-test-key");
vi.stubEnv("DEEPSEEK_API_KEY", "deepseek-test-key");

describe("LLM provider registry", () => {
  it("lists all 6 providers", async () => {
    const { listProviders } = await import("../src/services/llm");
    const providers = listProviders();

    expect(providers).toHaveLength(6);
    const ids = providers.map(p => p.id);
    expect(ids).toContain("anthropic");
    expect(ids).toContain("openai");
    expect(ids).toContain("gemini");
    expect(ids).toContain("groq");
    expect(ids).toContain("grok");
    expect(ids).toContain("deepseek");
  });

  it("returns model lists for all providers", async () => {
    const { listProviders } = await import("../src/services/llm");
    const providers = listProviders();

    for (const provider of providers) {
      expect(provider.models.length).toBeGreaterThan(0);
      expect(provider.name.length).toBeGreaterThan(0);
    }
  });

  it("marks a default provider", async () => {
    const { listProviders } = await import("../src/services/llm");
    const providers = listProviders();
    const defaults = providers.filter(p => p.isDefault);
    expect(defaults).toHaveLength(1);
  });

  it("throws on unknown provider", async () => {
    const { getProvider } = await import("../src/services/llm");
    expect(() => getProvider("nonexistent")).toThrow("Unknown LLM provider");
  });
});
