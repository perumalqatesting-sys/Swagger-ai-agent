import { v4 as uuidv4 } from "uuid";

export type NormalizedOperation = {
  operationId: string;
  method: string;
  path: string;
  tags: string[];
  summary?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
};

// Note: This is the infrastructure-level NormalizedSpec
// The domain model NormalizedSpec has servers as ServerInfo[]
export type NormalizedSpec = {
  id: string;
  title?: string;
  version?: string;
  servers?: Array<{ url: string; description?: string; variables?: Record<string, any> }>;
  operations: NormalizedOperation[];
};

export default class OpenApiNormalizer {
  static normalize(openApi: any): NormalizedSpec {
    const specId = openApi.info?.title ? `${openApi.info.title}-${openApi.info.version || "v1"}` : uuidv4();
    const title = openApi.info?.title;
    const version = openApi.info?.version;
    // Convert servers to ServerInfo[] format (domain model expects ServerInfo[], not string[])
    const servers = (openApi.servers || []).map((s: any) => ({
      url: typeof s === 'string' ? s : s.url,
      description: typeof s === 'object' ? s.description : undefined,
      variables: typeof s === 'object' ? s.variables : undefined,
    })).filter((s: any) => s.url);

    const operations: NormalizedOperation[] = [];

    const paths = openApi.paths || {};
    for (const [p, methods] of Object.entries(paths)) {
      const mObj: any = methods as any;
      for (const [method, opRaw] of Object.entries(mObj)) {
        // skip parameters at path level
        if (method === "parameters") continue;
        const op = opRaw as any;
        const operationId = op.operationId || `${method.toUpperCase()}_${p}`;
        operations.push({
          operationId,
          method: method.toUpperCase(),
          path: p,
          tags: op.tags || [],
          summary: op.summary || op.description,
          parameters: op.parameters || [],
          requestBody: op.requestBody,
          responses: op.responses,
        });
      }
    }

    return {
      id: specId,
      title,
      version,
      servers,
      operations,
    };
  }
}
 
