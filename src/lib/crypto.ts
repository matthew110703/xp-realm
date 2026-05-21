import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be set to exactly 64 hex characters (32 bytes). Generate with: openssl rand -hex 32");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + tag.toString("hex") + encrypted.toString("hex");
}

export function decrypt(encoded: string): string {
  const key = getKey();
  const iv = Buffer.from(encoded.slice(0, 24), "hex");
  const tag = Buffer.from(encoded.slice(24, 56), "hex");
  const encrypted = Buffer.from(encoded.slice(56), "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}
