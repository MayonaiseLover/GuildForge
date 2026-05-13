import { FastifyInstance } from "fastify";

/**
 * Registers @fastify/swagger and @fastify/swagger-ui for auto-generated API docs.
 * Access docs at: GET /docs
 */
export async function registerSwagger(app: FastifyInstance) {
  try {
    const swagger = await import("@fastify/swagger");
    const swaggerUI = await import("@fastify/swagger-ui");

    await app.register(swagger.default, {
      openapi: {
        openapi: "3.1.0",
        info: {
          title: "GuildForge API",
          description: "AI-powered Discord server architect — REST API documentation",
          version: "1.0.0",
          contact: { name: "GuildForge Team", url: "https://github.com/MayonaiseLover/GuildForge" },
          license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
        },
        servers: [
          { url: "http://localhost:3001", description: "Development" },
        ],
        tags: [
          { name: "Auth", description: "Discord OAuth2 & session management" },
          { name: "Guilds", description: "Discord guild management & audit" },
          { name: "Conversations", description: "AI chat & plan generation" },
          { name: "Plans", description: "Build plan CRUD & execution" },
          { name: "Teams", description: "Team workspaces & invites" },
          { name: "Billing", description: "Subscription management (Stripe)" },
          { name: "Monitoring", description: "Server health checks & alerts" },
          { name: "Providers", description: "LLM provider management" },
          { name: "Templates", description: "Server template library" },
          { name: "Analytics", description: "Platform analytics & metrics" },
          { name: "System", description: "Health checks & status" },
        ],
        components: {
          securitySchemes: {
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "gf_session",
            },
          },
        },
        security: [{ cookieAuth: [] }],
      },
    });

    await app.register(swaggerUI.default, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        displayRequestDuration: true,
      },
      staticCSP: true,
    });

    app.log.info("OpenAPI docs available at /docs");
  } catch (err) {
    app.log.warn("@fastify/swagger not installed — API docs disabled. Run: pnpm add @fastify/swagger @fastify/swagger-ui");
  }
}
