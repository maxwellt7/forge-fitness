import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import config from "../app.config";

describe("EAS publishing configuration", () => {
  it("defines an eas.json with an explicit appVersionSource", () => {
    const testFilePath = fileURLToPath(import.meta.url);
    const easConfigPath = resolve(dirname(testFilePath), "../eas.json");
    const easConfig = JSON.parse(readFileSync(easConfigPath, "utf-8"));

    expect(easConfig.cli?.appVersionSource).toBe("remote");
    expect(easConfig.build?.production).toBeTruthy();
  });

  it("links the app config to the expected EAS project and slug", () => {
    expect(config.extra?.eas?.projectId).toBe("e71c3be5-6290-4173-a1e9-02a460a84018");
    expect(config.slug).toBe("forge");
  });

  it("sets explicit native build version metadata", () => {
    expect(config.ios?.buildNumber).toBe("1");
    expect(config.android?.versionCode).toBe(1);
  });
});
