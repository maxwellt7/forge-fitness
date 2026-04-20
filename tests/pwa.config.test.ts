import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "public", "manifest.json");
const htmlPath = path.join(root, "app", "+html.tsx");

describe("PWA configuration", () => {
  it("defines an installable manifest with branded icons", () => {
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      name: string;
      short_name: string;
      display: string;
      icons: Array<{ src: string; sizes: string }>;
      theme_color: string;
      background_color: string;
    };

    expect(manifest.name).toBe("Forge Daily");
    expect(manifest.short_name).toBe("Forge Daily");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#050814");
    expect(manifest.background_color).toBe("#050814");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/pwa-192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/pwa-512.png", sizes: "512x512" }),
      ])
    );
  });

  it("links the manifest and registers the service worker in the root HTML", () => {
    const html = readFileSync(htmlPath, "utf8");

    expect(html).toContain('<link rel="manifest" href="/manifest.json" />');
    expect(html).toContain("navigator.serviceWorker.register('/sw.js')");
    expect(html).toContain('<meta name="theme-color" content="#050814" />');
  });
});
