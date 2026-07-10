import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Eenvoudige wachtwoord-login voor het admin-panel (één beheerder).
 * De sessiecookie is een HMAC-token dat zonder de serversleutel niet te
 * vervalsen is; geen zware auth-bibliotheek nodig.
 */

export const ADMIN_COOKIE = "sana_admin";

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "sana-insecure-dev-secret"
  );
}

export function makeSessionToken(): string {
  return crypto
    .createHmac("sha256", secret())
    .update("sana-admin-session-v1")
    .digest("hex");
}

export function isValidSession(value?: string): boolean {
  if (!value) return false;
  const expected = makeSessionToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Heeft het huidige verzoek een geldige beheerderssessie? (server-side) */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(ADMIN_COOKIE)?.value);
}
