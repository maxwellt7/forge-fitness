import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const oauthClientPath = path.join(root, "constants", "oauth.ts");
const oauthServerPath = path.join(root, "server", "_core", "oauth.ts");
const oauthSdkPath = path.join(root, "server", "_core", "sdk.ts");

describe("Hosted web OAuth flow", () => {
  it("uses a stable hosted API base URL for deployed web sign-in", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain("funcbodycoch-r8qsirx4.manus.space");
  });

  it("falls back to the verified hosted app id and portal URL for deployed web sign-in", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('const HOSTED_WEB_APP_ID = "R8QsirX4nbLM7QkWGemeq3"');
    expect(source).toContain('const HOSTED_WEB_OAUTH_PORTAL_URL = "https://manus.im"');
    expect(source).toContain("env.portal || HOSTED_WEB_OAUTH_PORTAL_URL");
    expect(source).toContain("env.appId || HOSTED_WEB_APP_ID");
  });

  it("does not embed returnTo in the web callback query string, because Manus app-auth appends its own code and state parameters", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).not.toContain('callbackUrl.searchParams.set("returnTo"');
  });

  it("stores the frontend return target inside the encoded OAuth state for web sign-in", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain("JSON.stringify({ redirectUri, returnTo })");
    expect(source).toContain('const returnTo = typeof window !== "undefined" ? window.location.origin : undefined');
  });

  it("builds the web login URL directly against the Manus app-auth endpoint", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`)');
    expect(source).toContain('url.searchParams.set("appId", APP_ID)');
    expect(source).toContain('url.searchParams.set("redirectUri", redirectUri)');
    expect(source).not.toContain('new URL("/api/oauth/login"');
  });

  it("decodes structured OAuth state on the server SDK and uses only the redirectUri during token exchange", () => {
    const source = readFileSync(oauthSdkPath, "utf8");

    expect(source).toContain("JSON.parse(decodedState)");
    expect(source).toContain('typeof parsed.redirectUri === "string"');
    expect(source).toContain("return decodedState");
    expect(source).toContain("redirectUri: this.decodeState(state)");
  });

  it("uses returnTo to determine the requesting frontend before building the hosted callback redirect", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('const returnTo = getQueryParam(req, "returnTo") ?? (state ? getReturnToFromState(state) : undefined)');
    expect(source).toContain("JSON.parse(decodedState)");
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
