import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import type { Express, Request, Response } from "express";
import { getUserByOpenId, upsertUser } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function decodeState(state: string): { redirectUri?: string; returnTo?: string } {
  if (!state) {
    return {};
  }

  try {
    const decodedState = Buffer.from(state, "base64").toString("utf-8");

    try {
      const parsed = JSON.parse(decodedState);
      if (parsed && typeof parsed.redirectUri === "string") {
        return {
          redirectUri: parsed.redirectUri,
          returnTo: typeof parsed.returnTo === "string" ? parsed.returnTo : undefined,
        };
      }
    } catch {
      // Backward compatibility: older auth flows stored only the redirectUri.
    }

    return { redirectUri: decodedState };
  } catch {
    return {};
  }
}

const HOSTED_WEB_FRONTEND_URL = "https://forge-fitness-iota.vercel.app";

function getDefaultFrontendUrl(req?: Request): string {
  const requestHost = req?.headers.host?.split(":")[0] ?? "";

  if (requestHost.endsWith(".manus.space")) {
    return HOSTED_WEB_FRONTEND_URL;
  }

  return process.env.EXPO_WEB_PREVIEW_URL || process.env.EXPO_PACKAGER_PROXY_URL || "http://localhost:8081";
}

function isAllowedFrontendRedirect(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".manus.space") ||
    hostname.endsWith(".manus.computer")
  );
}

function getReturnToFromState(state: string): string | undefined {
  return decodeState(state).returnTo;
}

function getFrontendRedirectUrl(req: Request, state?: string): string {
  const returnTo = getQueryParam(req, "returnTo") ?? (state ? getReturnToFromState(state) : undefined);
  if (!returnTo) {
    return getDefaultFrontendUrl(req);
  }

  try {
    const parsed = new URL(returnTo);
    if ((parsed.protocol === "https:" || parsed.protocol === "http:") && isAllowedFrontendRedirect(parsed.hostname)) {
      return parsed.toString();
    }
  } catch (error) {
    console.warn("[OAuth] Invalid returnTo URL provided", { returnTo, error });
  }

  return getDefaultFrontendUrl();
}

async function syncUser(userInfo: {
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  platform?: string | null;
}) {
  if (!userInfo.openId) {
    throw new Error("openId missing from user info");
  }

  const lastSignedIn = new Date();
  await upsertUser({
    openId: userInfo.openId,
    name: userInfo.name || null,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn,
  });
  const saved = await getUserByOpenId(userInfo.openId);
  return (
    saved ?? {
      openId: userInfo.openId,
      name: userInfo.name,
      email: userInfo.email,
      loginMethod: userInfo.loginMethod ?? null,
      lastSignedIn,
    }
  );
}

function buildUserResponse(
  user:
    | Awaited<ReturnType<typeof getUserByOpenId>>
    | {
        openId: string;
        name?: string | null;
        email?: string | null;
        loginMethod?: string | null;
        lastSignedIn?: Date | null;
      },
) {
  return {
    id: (user as any)?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? new Date()).toISOString(),
  };
}

function encodeUserForRedirect(user: ReturnType<typeof buildUserResponse>): string {
  return Buffer.from(JSON.stringify(user), "utf-8").toString("base64");
}

function buildFrontendCallbackRedirect(
  frontendUrl: string,
  sessionToken: string,
  encodedUser?: string,
): string {
  const callbackRedirectUrl = new URL("/oauth/callback", `${frontendUrl.replace(/\/$/, "")}/`);
  callbackRedirectUrl.searchParams.set("sessionToken", sessionToken);
  if (encodedUser) {
    callbackRedirectUrl.searchParams.set("user", encodedUser);
  }
  return callbackRedirectUrl.toString();
}

async function authenticateSessionToken(req: Request, sessionToken: string) {
  const originalAuthorization = req.headers.authorization;
  req.headers.authorization = `Bearer ${sessionToken}`;

  try {
    return await sdk.authenticateRequest(req);
  } finally {
    if (typeof originalAuthorization === "string") {
      req.headers.authorization = originalAuthorization;
    } else {
      delete req.headers.authorization;
    }
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const sessionTokenFromQuery = getQueryParam(req, "sessionToken");
    const encodedUser = getQueryParam(req, "user");
    const frontendUrl = getFrontendRedirectUrl(req, state);

    if (!code || !state) {
      if (!sessionTokenFromQuery) {
        res.status(400).json({ error: "code and state are required" });
        return;
      }

      try {
        const authenticatedUser = await authenticateSessionToken(req, sessionTokenFromQuery);
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionTokenFromQuery, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        const redirectUser = encodedUser || encodeUserForRedirect(buildUserResponse(authenticatedUser));
        res.redirect(302, buildFrontendCallbackRedirect(frontendUrl, sessionTokenFromQuery, redirectUser));
      } catch (error) {
        console.error("[OAuth] Hosted callback session fallback failed", error);
        res.status(500).json({ error: "OAuth callback failed" });
      }
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const redirectUser = encodeUserForRedirect(buildUserResponse(user));
      res.redirect(302, buildFrontendCallbackRedirect(frontendUrl, sessionToken, redirectUser));
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  app.get("/api/oauth/mobile", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);

      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(user),
      });
    } catch (error) {
      console.error("[OAuth] Mobile exchange failed", error);
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/me failed:", error);
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });

  app.post("/api/auth/session", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);

      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }
      const token = authHeader.slice("Bearer ".length).trim();

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
