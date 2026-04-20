import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const authScreenPath = path.join(root, "app", "auth.tsx");

describe("Auth screen scrolling", () => {
  it("uses a ScrollView so tall signed-out content can scroll on mobile web", () => {
    const source = readFileSync(authScreenPath, "utf8");

    expect(source).toContain("ScrollView");
    expect(source).toContain("<ScrollView");
    expect(source).toContain("flexGrow: 1");
  });
});
