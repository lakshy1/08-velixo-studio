import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "velixo-admin-session";
const ADMIN_COOKIE_PAYLOAD = "velixo-admin-panel";

export function getAdminSecret() {
  return (
    process.env.Admin_Panel_Secret ||
    process.env.ADMIN_PANEL_SECRET ||
    process.env.Supabase_Password ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

export function createAdminToken(secret: string) {
  return createHmac("sha256", secret).update(ADMIN_COOKIE_PAYLOAD).digest("hex");
}

export function isAdminTokenValid(token: string | undefined | null) {
  const secret = getAdminSecret();
  if (!secret || !token) {
    return false;
  }

  const expected = Buffer.from(createAdminToken(secret));
  const actual = Buffer.from(token);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function isAdminSessionActive() {
  const cookieStore = await cookies();
  return isAdminTokenValid(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export function buildAdminCookieValue(secret: string) {
  return createAdminToken(secret);
}
