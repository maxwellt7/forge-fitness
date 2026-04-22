import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const oauthClientPath = path.join(root, "constants", "oauth.ts");
const oauthServerPath = path.join(root, "server", "_core", "oauth.ts");

describe("Hosted web OAuth flow", () => {
  it("provides non-empty hosted web OAuth fallbacks for app ID and portal URL", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('const HOSTED_WEB_APP_ID = "R8QsirX4nbLM7QkWGemeq3"');
    expect(source).toContain('const HOSTED_WEB_OAUTH_PORTAL_URL = "https://manus.im"');
    expect(source).toContain("env.portal || HOSTED_WEB_OAUTH_PORTAL_URL");
    expect(source).toContain("env.appId || HOSTED_WEB_APP_ID");
  });

  it("uses a stable hosted API base URL and includes a returnTo parameter in the web callback URI", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain("funcbodycoch-r8qsirx4.manus.space");
    expect(source).toContain("window.location.origin");
    expect(source).toContain('searchParams.set("returnTo"');
  });

  it("starts hosted web sign-in through the backend login route so the frontend no longer needs a public app id", () => {
    const source = readFileSync(oauthClientPath, "utf8");

    expect(source).toContain('if (ReactNative.Platform.OS === "web")');
    expect(source).toContain('new URL("/api/oauth/login"');
    expect(source).toContain('searchParams.set("returnTo"');
  });

  it("redirects the OAuth callback back to the requesting frontend when returnTo is provided", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('const returnTo = getQueryParam(req, "returnTo")');
    expect(source).toContain("new URL(returnTo)");
    expect(source).toContain("res.redirect(302, frontendUrl)");
  });

  it("builds the hosted login redirect on the server with the configured app id and a portal fallback", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('app.get("/api/oauth/login"');
    expect(source).toContain("ENV.appId");
    expect(source).toContain("https://manus.im");
    expect(source).toContain('searchParams.set("appId", ENV.appId)');
  });
});
