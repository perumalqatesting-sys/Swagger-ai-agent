export interface ParameterDef {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  schema?: any;
  description?: string;
}

export interface RequestBodyDef {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema: any }>;
}

export interface ResponseDef {
  statusCode: string; // e.g., '200'
  description?: string;
  content?: Record<string, { schema: any }>;
}

export interface Operation {
  id: string; // generated id like GET_/pets
  method: string; // GET, POST, etc.
  path: string; // /pets
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterDef[];
  requestBody?: RequestBodyDef | null;
  responses?: ResponseDef[];
  security?: any[];
}

// Named export only; consumers should import { Operation } from this module
