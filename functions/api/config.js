// Pages Function: GET /api/config (public) & PUT /api/config (admin, Bearer key)
// KV binding: HOMEPAGE_KV  |  Secret env: ADMIN_KEY

const CONFIG_KEY = 'site_config';

const DEFAULT_CONFIG = {
  site: {
    brand: 'CHRISTOPHER IRELAND',
    title: 'Christopher Ireland — Photographer | Director',
    description: 'Campaigns, documentary films and long-form photography.'
  },
  hero: {
    name: 'CHRISTOPHER IRELAND',
    tagline: 'Photographer | Director',
    sub: 'Campaigns · Documentary films · Long-form photography',
    bgImage: ''
  },
  nav: [
    { label: 'Landing', href: '#hero' },
    { label: 'Creative Outlets', href: '#creative' },
    { label: 'Advertising folio', href: '#commercial' },
    { label: 'Community', href: '#community' },
    { label: 'Enquire', href: '#enquire' },
    { label: 'About', href: '#about' }
  ],
  sections: [],
  works: [],
  footer: [],
  footerCopy: '© Christopher Ireland. All rights reserved.'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function unauthorized() {
  return json({ error: 'Unauthorized' }, 401);
}

function isAuthorized(request, env) {
  const key = env.ADMIN_KEY;
  if (!key) return false;
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  // constant-time-ish comparison
  if (token.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ key.charCodeAt(i);
  return diff === 0;
}

export async function onRequestGet(context) {
  const { env } = context;
  // Probe requests carrying a key are used by the admin UI to validate it.
  const auth = context.request.headers.get('Authorization');
  if (auth && !isAuthorized(context.request, env)) return unauthorized();

  let config = null;
  try {
    config = await env.HOMEPAGE_KV.get(CONFIG_KEY, { type: 'json' });
  } catch (e) {
    config = null;
  }
  return json(config || DEFAULT_CONFIG);
}

export async function onRequestPut(context) {
  const { request, env } = context;
  if (!isAuthorized(request, env)) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Config must be a JSON object' }, 400);
  }

  await env.HOMEPAGE_KV.put(CONFIG_KEY, JSON.stringify(body));
  return json({ ok: true });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  return json({ error: 'Method not allowed' }, 405);
}
