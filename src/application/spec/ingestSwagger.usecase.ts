import SwaggerLoader from "../../infrastructure/swagger/SwaggerLoader";
import SwaggerParserAdapter from "../../infrastructure/swagger/SwaggerParserAdapter";
import OpenApiNormalizer from "../../infrastructure/swagger/OpenApiNormalizer";
import { NormalizedSpec } from "../../domain/models/NormalizedSpec";
import SpecRepository from "../../domain/repositories/SpecRepository";
import { structuredLogger } from "../../infrastructure/logging/winston.logger";

export type SpecSource = { type: "url" | "file" | "git"; url?: string; path?: string; repo?: string; ref?: string; filePath?: string };

export async function ingestSwagger(source: SpecSource, specRepo: SpecRepository): Promise<NormalizedSpec> {
  const startTime = Date.now();
  const sourceStr = source.type === "url" ? source.url : (source.type === "file" ? source.path : source.repo);

  try {
    // load
    let raw: any;
    if (source.type === "url" && source.url) raw = await SwaggerLoader.loadFromUrl(source.url);
    else if (source.type === "file" && source.path) raw = await SwaggerLoader.loadFromFile(source.path);
    else if (source.type === "git" && source.repo) raw = await SwaggerLoader.loadFromGit(source.repo, source.ref, source.filePath);
    else throw new Error("invalid source");

    // parse
    const parsed = await SwaggerParserAdapter.parse(raw);

    // normalize
    const normalized = OpenApiNormalizer.normalize(parsed);

    // persist - use the normalized spec's id
    const saved = await specRepo.save(normalized.id, normalized);
    
    const durationMs = Date.now() - startTime;
    structuredLogger.logSpecIngest(saved.id, sourceStr || 'unknown', saved.operations?.length || 0, durationMs);
    
    return saved;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    structuredLogger.logSpecIngestError(sourceStr || 'unknown', error, durationMs);
    throw error;
  }
}

export default ingestSwagger;
