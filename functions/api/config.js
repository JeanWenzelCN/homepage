// Pages Function: GET /api/config (public) & PUT /api/config (admin, Bearer key)
// KV binding: HOMEPAGE_KV  |  Secret env: ADMIN_KEY

const CONFIG_KEY = 'site_config';

const DEFAULT_CONFIG = {
  site: {
    brand: '个人主页',
    title: '个人主页 — 摄影师 | 导演',
    description: '广告摄影、纪录片与长期摄影项目。'
  },
  hero: {
    name: '个人主页',
    tagline: '摄影师 | 导演',
    sub: '广告摄影 · 纪录片 · 长期摄影项目',
    bgImage: ''
  },
  appearance: {
    theme: 'dark',
    fonts: [],
    brandFont: '',
    heroNameFont: '',
    heroTaglineFont: '',
    heroSubFont: '',
    sectionTitleFont: '',
    sectionSubtitleFont: '',
    sectionTextFont: '',
    workTitleFont: '',
    workDescFont: '',
    workTagFont: '',
navFont: '',
        footerFont: '',
        ctaFont: ''
      },
  nav: [
    { label: '首页', href: '#hero' },
    { label: '创作', href: '#creative' },
    { label: '作品集', href: '#works-section' },
    { label: '社区', href: '#community' },
    { label: '联系', href: '#enquire' },
    { label: '关于', href: '#about' }
  ],
  sections: [],
  works: [],
  footer: [],
  footerCopy: '© 版权所有'
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
  return json({ error: '未授权访问' }, 401);
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
    return json({ error: '请求体不是合法的 JSON' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: '配置必须是一个 JSON 对象' }, 400);
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
  return json({ error: '不支持的请求方法' }, 405);
}
