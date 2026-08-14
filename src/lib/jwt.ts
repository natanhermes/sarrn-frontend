import type { UserRole } from "@/schemas/auth";
import { userRoleSchema } from "@/schemas/auth";

function normalizeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  return normalized + "=".repeat(padding);
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const json = atob(normalizeBase64(payload));
    const parsed: unknown = JSON.parse(json);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRoleClaim(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/^ROLE_/i, "").toUpperCase();
  const parsed = userRoleSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function getRoleFromJwt(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const directRole = normalizeRoleClaim(payload.role);
  if (directRole) {
    return directRole;
  }

  if (Array.isArray(payload.roles)) {
    for (const item of payload.roles) {
      const role = normalizeRoleClaim(item);
      if (role) {
        return role;
      }
    }
  }

  if (Array.isArray(payload.authorities)) {
    for (const item of payload.authorities) {
      if (typeof item === "string") {
        const role = normalizeRoleClaim(item);
        if (role) {
          return role;
        }
        continue;
      }

      if (item && typeof item === "object" && "authority" in item) {
        const role = normalizeRoleClaim(
          (item as { authority: unknown }).authority,
        );
        if (role) {
          return role;
        }
      }
    }
  }

  return null;
}
