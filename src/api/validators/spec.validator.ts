import { Request, Response, NextFunction } from "express";

const MAX_SPEC_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_URL_LENGTH = 2048;

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidFilePath(path: string): boolean {
  if (!path || path.trim().length === 0) return false;
  if (path.includes('..') || path.includes('~')) return false;
  return true;
}

function isValidGitUrl(repo: string): boolean {
  const gitUrlPattern = /^(https?:\/\/|git:\/\/|ssh:\/\/|git@)[\w\.-]+/i;
  return gitUrlPattern.test(repo);
}

export function requireSource(req: Request, res: Response, next: NextFunction) {
  const source = req.body?.source;
  
  if (!source) {
    return res.status(400).json({ error: "source is required" });
  }
  
  if (typeof source !== 'object' || Array.isArray(source)) {
    return res.status(400).json({ error: "source must be an object" });
  }
  
  // Infer type if omitted based on provided fields
  let type = (source as any).type;
  if (!type) {
    if (source.url) type = "url";
    else if (source.path) type = "file";
    else if (source.repo) type = "git";
  }

  if (!type || !["url", "file", "git"].includes(type)) {
    return res.status(400).json({ error: "source.type must be one of: url, file, git" });
  }

  if (type === "url") {
    if (!source.url || typeof source.url !== 'string') {
      return res.status(400).json({ error: "source.url is required and must be a string for url type" });
    }
    if (source.url.length > MAX_URL_LENGTH) {
      return res.status(400).json({ error: `source.url exceeds maximum length of ${MAX_URL_LENGTH} characters` });
    }
    if (!isValidUrl(source.url)) {
      return res.status(400).json({ error: "source.url must be a valid HTTP/HTTPS URL" });
    }
  } else if (type === "file") {
    if (!source.path || typeof source.path !== 'string') {
      return res.status(400).json({ error: "source.path is required and must be a string for file type" });
    }
    if (!isValidFilePath(source.path)) {
      return res.status(400).json({ error: "source.path is invalid or contains dangerous patterns" });
    }
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length'], 10);
      if (contentLength > MAX_SPEC_SIZE_BYTES) {
        return res.status(400).json({ error: `Spec file size exceeds maximum of ${MAX_SPEC_SIZE_BYTES / 1024 / 1024}MB` });
      }
    }
  } else if (type === "git") {
    if (!source.repo || typeof source.repo !== 'string') {
      return res.status(400).json({ error: "source.repo is required and must be a string for git type" });
    }
    if (!isValidGitUrl(source.repo)) {
      return res.status(400).json({ error: "source.repo must be a valid Git repository URL" });
    }
    if (source.ref && typeof source.ref !== 'string') {
      return res.status(400).json({ error: "source.ref must be a string if provided" });
    }
    if (source.filePath && typeof source.filePath !== 'string') {
      return res.status(400).json({ error: "source.filePath must be a string if provided" });
    }
  }

  return next();
}

export function requireSpecIdOrDocument(req: Request, res: Response, next: NextFunction) {
  const { specId, document } = req.body || {};
  
  if (!specId && !document) {
    return res.status(400).json({ error: "specId or document is required" });
  }
  
  if (specId && typeof specId !== 'string') {
    return res.status(400).json({ error: "specId must be a string" });
  }
  
  if (document) {
    if (typeof document !== 'object' || Array.isArray(document) || document === null) {
      return res.status(400).json({ error: "document must be a valid JSON object" });
    }
    const docSize = JSON.stringify(document).length;
    if (docSize > MAX_SPEC_SIZE_BYTES) {
      return res.status(400).json({ error: `Document size exceeds maximum of ${MAX_SPEC_SIZE_BYTES / 1024 / 1024}MB` });
    }
  }
  
  return next();
}

export default { requireSource, requireSpecIdOrDocument };
