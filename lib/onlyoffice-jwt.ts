import { createHmac, timingSafeEqual } from "node:crypto";

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function signOnlyOfficeConfig(payload: Record<string, unknown>, secret: string) {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyOnlyOfficeToken(token: string, secret: string) {
  const parts = token.replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return false;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  let actual: Buffer;
  try { actual = Buffer.from(parts[2], "base64url"); } catch { return false; }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
