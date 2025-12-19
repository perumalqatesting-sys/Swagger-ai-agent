import { Request, Response } from 'express';
import container from '../../core/container';
import buildPayloadFromSchema, { BuildPayloadRequest, BuildPayloadResponse } from '../../application/llm/buildPayloadFromSchema.usecase';
import { BuildPayloadRequest as BuildPayloadRequestDto, BuildPayloadResponse as BuildPayloadResponseDto } from '../dto/llm.dto';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * POST /llm/build-payload
 * Build payload from schema with optional LLM assistance
 */
export async function buildPayloadHandler(req: Request, res: Response) {
  try {
    const body = req.body as BuildPayloadRequestDto;

    // Convert DTO to use case request
    const request: BuildPayloadRequest = {
      specId: body.specId,
      operationId: body.operationId,
      mode: body.mode || 'schema-with-llm',
      hints: body.hints,
    };

    const result = await buildPayloadFromSchema(
      container.specRepository as any,
      request,
      container.llmClient as any
    );

    // Convert use case response to DTO
    const response: BuildPayloadResponseDto = {
      payloads: result.payloads,
      source: result.source,
      fieldsGeneratedByLLM: result.fieldsGeneratedByLLM,
      operationId: body.operationId,
      specId: body.specId,
    };

    return res.json(response);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default { buildPayloadHandler };
