import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const oauthClientPath = path.join(root, "constants", "oauth.ts");
const oauthServerPath = path.join(root, "server", "_core", "oauth.ts");

describe("Hosted web OAuth flow", () => {
  it("uses a stable hosted API base URL and includes a returnTo parameter in the web callback URI", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain("funcbodycoch-r8qsirx4.manus.space");
    expect(source).toContain("window.location.origin");
    expect(source).toContain('searchParams.set("returnTo"');
  });

  it("falls back to the verified hosted app id and portal URL for deployed web sign-in", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('const HOSTED_WEB_APP_ID = "R8QsirX4nbLM7QkWGemeq3"');
    expect(source).toContain('const HOSTED_WEB_OAUTH_PORTAL_URL = "https://manus.im"');
    expect(source).toContain("env.portal || HOSTED_WEB_OAUTH_PORTAL_URL");
    expect(source).toContain("env.appId || HOSTED_WEB_APP_ID");
  });

  it("builds the web login URL directly against the Manus app-auth endpoint", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`)');
    expect(source).toContain('url.searchParams.set("appId", APP_ID)');
    expect(source).toContain('url.searchParams.set("redirectUri", redirectUri)');
    expect(source).not.toContain('new URL("/api/oauth/login"');
  });

  it("uses returnTo to determine the requesting frontend before building the hosted callback redirect", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('const returnTo = getQueryParam(req, "returnTo")');
    expect(source).toContain("new URL(returnTo)");
    expect(source).toContain("const frontendUrl = getFrontendRedirectUrl(req)");
    expect(source).toContain("buildFrontendCallbackRedirect(frontendUrl");
  });

  it("supports a hosted callback sessionToken fallback and redirects into the frontend callback screen", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('const sessionTokenFromQuery = getQueryParam(req, "sessionToken")');
    expect(source).toContain('const encodedUser = getQueryParam(req, "user")');
    expect(source).toContain('new URL("/oauth/callback", `${frontendUrl.replace(/\\/$/, "")}/`)');
    expect(source).toContain('callbackRedirectUrl.searchParams.set("sessionToken", sessionToken)');
  });
});
