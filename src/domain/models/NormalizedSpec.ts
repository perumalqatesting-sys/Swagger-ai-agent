export interface Operation {
  operationId: string;
  method: string;
  path: string;
  tags?: string[];
  summary?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

export interface ServerInfo {
  url: string;
  description?: string;
  variables?: Record<string, any>;
}

export interface NormalizedSpec {
  id: string;
  title?: string;
  version?: string;
  description?: string;
  servers?: ServerInfo[];
  basePath?: string;
  operations: Operation[];
  raw?: any;
}

export default {} as NormalizedSpec;
