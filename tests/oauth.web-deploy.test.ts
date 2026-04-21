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

  it("redirects the OAuth callback back to the requesting frontend when returnTo is provided", () => {
    const source = readFileSync(oauthServerPath, "utf8");

    expect(source).toContain('const returnTo = getQueryParam(req, "returnTo")');
    expect(source).toContain("new URL(returnTo)");
    expect(source).toContain("res.redirect(302, frontendUrl)");
  });
});
