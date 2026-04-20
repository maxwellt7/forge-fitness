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

  it("links the app config to the expected EAS project", () => {
    expect(config.extra?.eas?.projectId).toBe("ca051aa4-b386-436e-ac0a-5ebfb66e0ce2");
  });

  it("sets explicit native build version metadata", () => {
    expect(config.ios?.buildNumber).toBe("1");
    expect(config.android?.versionCode).toBe(1);
  });
});
