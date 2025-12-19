import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function resolveEnvFiles(): string[] {
  const cwd = process.cwd();
  const files: string[] = [];

  // base .env
  files.push(path.join(cwd, ".env"));

  // env-specific file
  const env = process.env.NODE_ENV || "development";
  files.push(path.join(cwd, `.env.${env}`));

  // also include .env.local if present
  files.push(path.join(cwd, ".env.local"));

  return files.filter((f) => fs.existsSync(f));
}

function loadDotenvFiles(): void {
  const files = resolveEnvFiles();
  for (const file of files) {
    try {
      dotenv.config({ path: file });
    } catch (err) {
      // do not throw here; keep server boot tolerant
      // eslint-disable-next-line no-console
      console.warn(`Failed to load env file ${file}: ${String(err)}`);
    }
  }
}

// Load on import
loadDotenvFiles();

export function getEnv(key: string, fallback?: string): string | undefined {
  const val = process.env[key];
  if (val === undefined || val === "") return fallback;
  return val;
}

export function getEnvNumber(key: string, fallback?: number): number | undefined {
  const v = process.env[key];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

export default {
  loadDotenvFiles,
  getEnv,
  getEnvNumber
};
