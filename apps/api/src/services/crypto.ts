/**
 * AES-256-GCM token encryption for OAuth tokens stored in the database.
 * Key is derived from SESSION_SECRET using PBKDF2 so any string secret works.
 */
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LEN = 32;
const SALT = "guildforge-token-salt-v1"; // fixed salt is fine since key material (SESSION_SECRET) is secret

function deriveKey(secret: string): Buffer {
  return pbkdf2Sync(secret, SALT, 100_000, KEY_LEN, "sha256");
}

let _key: Buffer | null = null;
function getKey(): Buffer {
  if (_key) return _key;
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[crypto] SESSION_SECRET is required in production — token encryption cannot be disabled");
    }
    process.stderr.write(JSON.stringify({ level: "warn", service: "crypto", msg: "SESSION_SECRET not set — token encryption disabled (dev mode only)", ts: new Date().toISOString() }) + "\n");
    _key = Buffer.alloc(KEY_LEN, 0);
  } else {
    _key = deriveKey(secret);
  }
  return _key;
}

/** Encrypt a plaintext token. Returns a string in format: iv:authTag:ciphertext (all hex) */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  if (key.every(b => b === 0)) return plaintext; // encryption disabled

  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Decrypt a token previously encrypted with encryptToken. Returns original plaintext. */
export function decryptToken(stored: string): string {
  const key = getKey();
  if (key.every(b => b === 0)) return stored; // encryption disabled

  // If it doesn't look encrypted (legacy plaintext), return as-is
  const parts = stored.split(":");
  if (parts.length !== 3) return stored;

  const [ivHex, authTagHex, cipherHex] = parts;
  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(cipherHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    // Decryption failed — return stored value (may be legacy plaintext)
    return stored;
  }
}
