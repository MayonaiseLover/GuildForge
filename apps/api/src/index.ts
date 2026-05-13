import { buildApp } from "./app";
import { env } from "./env";

async function main() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on port ${env.API_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(JSON.stringify({ level: "fatal", service: "api", msg: "Unhandled startup error", error: err instanceof Error ? err.message : String(err), ts: new Date().toISOString() }) + "\n");
  process.exit(1);
});
