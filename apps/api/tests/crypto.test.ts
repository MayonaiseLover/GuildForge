import { describe, it, expect, vi, beforeEach } from "vitest";

// Save original env
const originalEnv = { ...process.env };

describe("crypto service", () => {
  beforeEach(() => {
    // Reset module cache between tests so key re-derives
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("encrypts and decrypts a token roundtrip", async () => {
    process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-32chars";
    const { encryptToken, decryptToken } = await import("../src/services/crypto");

    const plaintext = "xoxb-1234567890-abcdefghij";
    const encrypted = encryptToken(plaintext);

    // Encrypted format: iv:authTag:ciphertext (hex)
    expect(encrypted).not.toEqual(plaintext);
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(plaintext);
  });

  it("returns plaintext unchanged when encryption disabled (dev mode)", async () => {
    delete process.env.SESSION_SECRET;
    process.env.NODE_ENV = "development";
    const { encryptToken, decryptToken } = await import("../src/services/crypto");

    const plaintext = "test-token-value";
    const result = encryptToken(plaintext);
    expect(result).toEqual(plaintext);
    expect(decryptToken(result)).toEqual(plaintext);
  });

  it("handles legacy plaintext gracefully during decryption", async () => {
    process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-32chars";
    const { decryptToken } = await import("../src/services/crypto");

    // A string that doesn't match the iv:authTag:ciphertext format
    const legacy = "some-old-plaintext-token";
    expect(decryptToken(legacy)).toEqual(legacy);
  });

  it("produces different ciphertexts for the same input (random IV)", async () => {
    process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-32chars";
    const { encryptToken } = await import("../src/services/crypto");

    const plaintext = "same-token-value";
    const enc1 = encryptToken(plaintext);
    const enc2 = encryptToken(plaintext);
    expect(enc1).not.toEqual(enc2); // Different IVs → different ciphertext
  });
});
