// pages/api/proxy-to-laravel.js
import { getAccessToken } from '@auth0/nextjs-auth0';

/**
 * Proxy server-side: Next obtém um access token do Auth0 (server-side)
 * e encaminha a requisição para o Laravel adicionando Authorization: Bearer <token>.
 *
 * Como usar (exemplo):
 * GET  /api/proxy-to-laravel?path=protected-route
 * POST /api/proxy-to-laravel?path=orders    (body JSON)
 *
 * Nota: ajusta `laravelBase` se o Laravel estiver noutro host/porta.
 */

const laravelBase = process.env.NEXT_PUBLIC_LARAVEL_URL || 'http://localhost:8000';

export default async function handler(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['openid', 'profile', 'email']
    });

    if (!accessToken) {
      return res.status(401).json({ error: 'Login required' });
    }

    const path = req.query.path || '';
    // remove leading slash se existir
    const sanitizedPath = path.replace(/^\/+/, '');
    const laravelUrl = `${laravelBase.replace(/\/$/, '')}/api/${sanitizedPath}`;

    const forwardHeaders = {
      Authorization: `Bearer ${accessToken}`,
      // Forward content-type if client set it; otherwise default to json
      'Content-Type': req.headers['content-type'] || 'application/json',
      // You can forward other headers if needed (e.g. custom headers)
    };

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
      // If body is already a string (from fetch), pass it through; otherwise stringify.
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    }

    const apiRes = await fetch(laravelUrl, fetchOptions);
    const text = await apiRes.text();

    // tenta parsear JSON, se não der devolve texto cru
    try {
      const json = JSON.parse(text);
      res.status(apiRes.status).json(json);
    } catch {
      res.status(apiRes.status).send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    // Se o erro vier do getAccessToken é possivel que a sessão não exista
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}
