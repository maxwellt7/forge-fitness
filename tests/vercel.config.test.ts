import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const vercelConfigPath = path.join(root, "vercel.json");

describe("Vercel deployment configuration", () => {
  it("defines the Expo web build command and dist output directory for static deployment", () => {
    expect(existsSync(vercelConfigPath)).toBe(true);

    const config = JSON.parse(readFileSync(vercelConfigPath, "utf8")) as {
      buildCommand: string;
      outputDirectory: string;
      devCommand: string;
      cleanUrls: boolean;
      framework: null | string;
      rewrites: Array<{ source: string; destination: string }>;
    };

    expect(config.buildCommand).toBe("expo export -p web");
    expect(config.outputDirectory).toBe("dist");
    expect(config.devCommand).toBe("expo");
    expect(config.cleanUrls).toBe(true);
    expect(config.framework).toBeNull();
    expect(config.rewrites).toEqual([
      {
        source: "/:path*",
        destination: "/",
      },
    ]);
  });
});
