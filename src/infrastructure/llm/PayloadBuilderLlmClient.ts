import { LLMClient } from './LLMClient.interface';

export type PayloadHints = { [k: string]: any } | undefined;

/**
 * Payload Builder LLM Client
 * Builds payloads from JSON schemas, using LLM only when examples/defaults are missing
 */
export class PayloadBuilderLlmClient {
  private llmClient: LLMClient | null;

  constructor(llmClient?: LLMClient | null) {
    this.llmClient = llmClient || null;
  }

  /**
   * Build payload from schema using LLM when needed
   * Algorithm:
   * 1. Try to build from schema & examples first
   * 2. Identify missing required fields
   * 3. Call LLM only for those fields
   */
  async buildPayloadFromSchema(schema: any, hints?: PayloadHints): Promise<any> {
    // Basic synthesis: if schema.example or default provided, use it
    if (!schema) return {};
    if (schema.example) return schema.example;
    if (schema.default) return schema.default;

    // If it's an object schema, synthesize properties
    if (schema.type === "object" || schema.properties) {
      const out: any = {};
      const props = schema.properties || {};
      const required = schema.required || [];

      for (const [key, propSchema] of Object.entries(props)) {
        const isRequired = required.includes(key);
        const prop = propSchema as any;

        // Try to build from schema/examples first
        let value = await this.buildFromSchemaOnly(prop);

        // If required field has no value and no example/default, use LLM
        if (isRequired && (value === null || value === undefined || value === '')) {
          if (this.llmClient) {
            try {
              value = await this.buildWithLLM(prop, key, hints);
            } catch (e) {
              // Fallback to basic synthesis if LLM fails
              value = await this.buildFromSchemaOnly(prop);
            }
          } else {
            // No LLM available, use basic synthesis
            value = await this.buildFromSchemaOnly(prop);
          }
        }

        out[key] = value;
      }
      return out;
    }

    // arrays
    if (schema.type === "array" && schema.items) {
      const item = await this.buildPayloadFromSchema(schema.items, hints);
      return [item];
    }

    // For primitives, try LLM if no example/default
    if (!schema.example && !schema.default && this.llmClient) {
      try {
        return await this.buildWithLLM(schema, undefined, hints);
      } catch (e) {
        // Fallback to basic synthesis
      }
    }

    return this.buildFromSchemaOnly(schema);
  }

  /**
   * Build from schema only (no LLM) - recursive helper
   */
  private async buildFromSchemaOnly(schema: any): Promise<any> {
    if (!schema) return null;
    if (schema.example) return schema.example;
    if (schema.default) return schema.default;

    if (schema.type === "object" || schema.properties) {
      const out: any = {};
      const props = schema.properties || {};
      for (const [k, v] of Object.entries(props)) {
        out[k] = await this.buildFromSchemaOnly(v as any);
      }
      return out;
    }

    if (schema.type === "array" && schema.items) {
      return [await this.buildFromSchemaOnly(schema.items)];
    }

    // primitives
    switch (schema.type) {
      case "string":
        if (schema.format === "date-time") return new Date().toISOString();
        if (schema.enum && schema.enum.length) return schema.enum[0];
        return schema.title || "string_example";
      case "integer":
      case "number":
        return schema.minimum ?? 0;
      case "boolean":
        return true;
      default:
        return null;
    }
  }

  /**
   * Build value using LLM
   */
  private async buildWithLLM(schema: any, fieldName?: string, hints?: PayloadHints): Promise<any> {
    if (!this.llmClient) {
      return this.buildFromSchemaOnly(schema);
    }

    // Build prompt for LLM
    const prompt = this.buildLLMPrompt(schema, fieldName, hints);
    
    try {
      const response = await this.llmClient.generate(prompt, {
        maxTokens: 200,
      });

      // Try to parse JSON from response
      const text = response.text.trim();
      
      // Check if response is JSON
      if (text.startsWith('{') || text.startsWith('[')) {
        try {
          return JSON.parse(text);
        } catch (e) {
          // Not valid JSON, return as string
          return text;
        }
      }

      // For primitive types, return the text directly
      if (schema.type === 'string') {
        return text;
      }
      if (schema.type === 'integer' || schema.type === 'number') {
        const num = parseFloat(text);
        return isNaN(num) ? 0 : num;
      }
      if (schema.type === 'boolean') {
        return text.toLowerCase() === 'true';
      }

      return text;
    } catch (e) {
      // LLM call failed, fallback to schema-only
      return this.buildFromSchemaOnly(schema);
    }
  }

  /**
   * Build prompt for LLM to generate payload
   */
  private buildLLMPrompt(schema: any, fieldName?: string, hints?: PayloadHints): string {
    const fieldContext = fieldName ? ` for field "${fieldName}"` : '';
    const hintsContext = hints ? `\nContext hints: ${JSON.stringify(hints)}` : '';
    
    let prompt = `Generate a realistic example value${fieldContext} based on this JSON schema:\n${JSON.stringify(schema, null, 2)}${hintsContext}\n\n`;
    
    if (schema.type === 'object') {
      prompt += 'Return a valid JSON object that matches this schema.';
    } else if (schema.type === 'array') {
      prompt += 'Return a valid JSON array with one example item.';
    } else {
      prompt += `Return only the value (${schema.type}), not JSON-wrapped.`;
    }

    return prompt;
  }

  /**
   * Static method for backwards compatibility (schema-only, no LLM)
   */
  static async buildPayloadFromSchema(schema: any, hints?: PayloadHints): Promise<any> {
    const builder = new PayloadBuilderLlmClient();
    return builder.buildPayloadFromSchema(schema, hints);
  }
}

export default PayloadBuilderLlmClient;
