import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { FastifyInstance } from "fastify";
import { env } from "../env";

export async function registerLucia(app: FastifyInstance) {
  const adapter = new PrismaAdapter(app.prisma.session, app.prisma.user);
  
  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env.API_URL.startsWith("https"),
      }
    },
    getUserAttributes: (attributes) => {
      return {
        discordId: attributes.discordId,
        username: attributes.username,
        avatar: attributes.avatar,
        plan: attributes.plan
      };
    }
  });

  app.decorate("lucia", lucia);
}

declare module "fastify" {
  interface FastifyInstance {
    lucia: Lucia;
  }
}

declare module "lucia" {
  interface Register {
    Lucia: Lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  discordId: string;
  username: string;
  avatar: string | null;
  plan: string;
}
