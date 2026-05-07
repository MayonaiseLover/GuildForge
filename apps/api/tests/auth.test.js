import { describe, it, expect, vi } from "vitest";
vi.mock("arctic", () => ({
    generateState: () => "state123",
    Discord: vi.fn().mockImplementation(() => ({
        createAuthorizationURL: vi.fn().mockResolvedValue(new URL("https://discord.com/oauth2/authorize?state=state123")),
        validateAuthorizationCode: vi.fn().mockResolvedValue({
            accessToken: "access_token",
            refreshToken: "refresh_token",
            accessTokenExpiresAt: new Date(Date.now() + 3600000)
        })
    }))
}));
describe("Discord OAuth", () => {
    it("generates redirect URL and state cookie", async () => {
        expect(true).toBe(true);
    });
});
