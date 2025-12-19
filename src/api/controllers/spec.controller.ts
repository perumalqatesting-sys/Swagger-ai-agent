import { Request, Response } from 'express';
import container from '../../core/container';
import ingestSwagger from '../../application/spec/ingestSwagger.usecase';
import normalizeSpec from '../../application/spec/normalizeSpec.usecase';
import validateSpecDocument from '../../application/spec/validateSpec.usecase';
import listOperations from '../../application/spec/listOperations.usecase';
import listTags from '../../application/spec/listTags.usecase';
import listEnvironments from '../../application/environment/listEnvironments.usecase';

export async function importSpec(req: Request, res: Response) {
  try {
    const source = req.body?.source;
    if (!source) return res.status(400).json({ error: 'source is required' });

    const saved = await ingestSwagger(source, container.specRepository as any);
    console.log('DEBUG: saved from ingestSwagger ->', JSON.stringify(saved));
    return res.json({ specId: saved.id, title: saved.title, version: saved.version, operationCount: (saved.operations || []).length });
  } catch (err: any) {
    console.error('ERROR in importSpec:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function validateSpec(req: Request, res: Response) {
  try {
    const { specId, document } = req.body || {};

    if (specId) {
      const spec = await (container.specRepository as any).get(specId);
      if (!spec) return res.status(404).json({ error: 'spec not found' });
      return res.json({ valid: true, issues: [], spec: { id: spec.id, title: spec.title } });
    }

    if (document) {
      const result = validateSpecDocument(document);
      if (!result.valid) return res.json({ valid: false, issues: result.issues });
      const normalized = normalizeSpec(document);
      return res.json({ valid: true, issues: [], spec: { id: normalized.id, title: normalized.title } });
    }

    return res.status(400).json({ error: 'specId or document is required' });
  } catch (err: any) {
    return res.status(500).json({ valid: false, issues: [{ message: err?.message }] });
  }
}

export async function getSpec(req: Request, res: Response) {
  try {
    const specId = req.params.specId;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const spec = await (container.specRepository as any).get(specId);
    if (!spec) return res.status(404).json({ error: 'spec not found' });
    return res.json({ id: spec.id, title: spec.title, version: spec.version, servers: spec.servers, operationCount: (spec.operations || []).length });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function getOperations(req: Request, res: Response) {
  try {
    const specId = req.params.specId;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const ops = await listOperations(specId, container.specRepository as any);
    return res.json({ operations: ops });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function getTags(req: Request, res: Response) {
  try {
    const specId = req.params.specId;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const tags = await listTags(specId, container.specRepository as any);
    return res.json({ tags });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function getSpecEnvironments(req: Request, res: Response) {
  try {
    const specId = req.params.specId;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const environments = await listEnvironments(container.environmentRepository as any, specId);
    return res.json({ environments, total: environments.length });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default { importSpec, validateSpec, getSpec, getOperations, getTags, getSpecEnvironments };
