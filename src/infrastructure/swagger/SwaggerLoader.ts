import fs from "fs/promises";
import path from "path";
import YAML from "js-yaml";

export type SpecSource =
  | { type: "url"; url: string }
  | { type: "file"; path: string }
  | { type: "git"; repo: string; ref?: string; filePath?: string };

export class SwaggerLoader {
  // Loads spec from a URL (HTTP fetch) — lightweight implementation
  static async loadFromUrl(url: string): Promise<any> {
    const fetch = (await import("node-fetch")).default;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      // try YAML
      return YAML.load(text);
    }
  }

  // Loads spec from a local file path
  static async loadFromFile(filePath: string): Promise<any> {
    const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const raw = await fs.readFile(abs, "utf8");
    try {
      return JSON.parse(raw);
    } catch (e) {
      return YAML.load(raw);
    }
  }

  // Stub: load from git repo — not implemented in Phase 3
  static async loadFromGit(_repo: string, _ref?: string, _filePath?: string): Promise<any> {
    throw new Error("loadFromGit is not implemented in this phase");
  }

  // Convenience entrypoint
  static async load(source: SpecSource): Promise<any> {
    switch (source.type) {
      case "url":
        return this.loadFromUrl(source.url);
      case "file":
        return this.loadFromFile(source.path);
      case "git":
        return this.loadFromGit(source.repo, source.ref, source.filePath);
      default:
        throw new Error("unsupported source type");
    }
  }
}

export default SwaggerLoader;
