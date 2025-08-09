import { Request, Response, NextFunction } from 'express';

const HARDCODED_USERNAME = 'demo';
const HARDCODED_PASSWORD = 'demo123';

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const base64Credentials = authHeader.split(' ')[1] ?? '';
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    next();
    return;
  }
  res.status(401).json({ error: 'unauthorized' });
}


