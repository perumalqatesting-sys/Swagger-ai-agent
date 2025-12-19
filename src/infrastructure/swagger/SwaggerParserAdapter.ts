/*
  Lightweight adapter for swagger/openapi parsing.
  Uses @apidevtools/swagger-parser if available; otherwise passes through input.
*/
import YAML from "js-yaml";

export default class SwaggerParserAdapter {
  static async parse(input: any): Promise<any> {
    // If input is a string, try to parse JSON/YAML
    let doc = input;
    if (typeof input === "string") {
      try {
        doc = JSON.parse(input);
      } catch (e) {
        doc = YAML.load(input as string);
      }
    }

    try {
      // @ts-ignore - @apidevtools/swagger-parser may not be installed
      const SwaggerParser = await import("@apidevtools/swagger-parser");
      // @ts-ignore
      const parsed = await SwaggerParser.default.dereference(doc);
      return parsed;
    } catch (err) {
      // If parser not available or fails, return doc as-is
      return doc;
    }
  }
}
