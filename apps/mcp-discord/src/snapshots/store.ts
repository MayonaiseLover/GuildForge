import fs from "fs/promises";
import path from "path";
import os from "os";

export class SnapshotStore {
  private baseDir: string;

  constructor() {
    this.baseDir = process.env.GUILDFORGE_SNAPSHOT_DIR || path.join(os.homedir(), ".guildforge", "snapshots");
  }

  private async ensureDir(guildId: string) {
    const dir = path.join(this.baseDir, guildId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async save(guildId: string, snapshotId: string, data: any, label?: string) {
    const dir = await this.ensureDir(guildId);
    const filePath = path.join(dir, `${snapshotId}.json`);
    const payload = {
      snapshotId,
      guildId,
      createdAt: new Date().toISOString(),
      label,
      data
    };
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
    return payload;
  }

  async load(guildId: string, snapshotId: string) {
    const filePath = path.join(this.baseDir, guildId, `${snapshotId}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err: any) {
      if (err.code === "ENOENT") return null;
      throw err;
    }
  }

  async list(guildId: string) {
    try {
      const dir = await this.ensureDir(guildId);
      const files = await fs.readdir(dir);
      const snapshots = [];
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(dir, file), "utf-8");
          const parsed = JSON.parse(content);
          snapshots.push({
            snapshotId: parsed.snapshotId,
            createdAt: parsed.createdAt,
            label: parsed.label
          });
        }
      }
      return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err: any) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  /** Search all guild subdirectories for a snapshot by its ID */
  async findById(snapshotId: string): Promise<{ snapshotId: string; guildId: string; createdAt: string; label?: string; data: any } | null> {
    try {
      const guilds = await fs.readdir(this.baseDir);
      for (const guildId of guilds) {
        const filePath = path.join(this.baseDir, guildId, `${snapshotId}.json`);
        try {
          const content = await fs.readFile(filePath, "utf-8");
          return JSON.parse(content);
        } catch {
          // Not in this guild dir, keep searching
        }
      }
      return null;
    } catch {
      return null;
    }
  }

}
