export type SpecSource =
  | { type: "url"; url: string }
  | { type: "file"; path: string }
  | { type: "git"; repo: string; ref?: string; filePath?: string };

export type ImportSpecRequest = { source: SpecSource };

export type ValidateSpecRequest = { specId?: string; document?: any };

export type ImportSpecResponse = { specId: string; title?: string; version?: string; operationCount: number };

export default {};
