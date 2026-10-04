/* ============================================
   MAIN JS — Fetch config from API and render
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '/api';

  // ===== NAVIGATION =====
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // ===== LOAD CONFIG & RENDER =====
  async function init() {
    try {
      const res = await fetch(API_BASE + '/config');
      if (!res.ok) throw new Error('配置加载失败');
      const cfg = await res.json();
      renderAll(cfg);
    } catch (err) {
      console.error('配置加载错误：', err);
      renderAll(getDefaultConfig());
    }
  }

  function getDefaultConfig() {
    return {
      site: {
        brand: '个人主页',
        title: '个人主页',
        description: '摄影师与导演 — 广告摄影、纪录片、长期摄影项目'
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
  }

  function renderAll(cfg) {
    // Apply appearance settings first
    applyAppearance(cfg.appearance);
    const ap = cfg.appearance || {};

    // Title & Meta
    document.title = cfg.site?.title || '个人主页';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = cfg.site?.description || '';

    // Nav
    renderNav(cfg, ap);
    // Hero
    renderHero(cfg.hero, ap);
    // Sections
    renderSections(cfg.sections || [], ap);
    // Works
    if (ap.showWorks === false) {
      const ws = document.getElementById('works-section');
      if (ws) ws.style.display = 'none';
    } else {
      renderWorks(cfg.works || [], ap);
    }
    // Footer
    renderFooter(cfg.footer || [], cfg.footerCopy, ap);
    // Animate sections on scroll
    initScrollAnimations();
  }

  function applyAppearance(appearance) {
    if (!appearance) return;

    // Theme
    const theme = appearance.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Favicon with cache-busting
    applyFavicon();

    // Register custom fonts from /public/fonts/
    const fonts = appearance.fonts || [];
    fonts.forEach(f => {
      if (!f.name || !f.file) return;
      const fontPath = f.file.startsWith('/') ? f.file : '/fonts/' + f.file;
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${f.name}';
          src: url('${fontPath}') format('woff2'),
               url('${fontPath}') format('woff'),
               url('${fontPath}') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    });
  }

  // Dynamic favicon with cache-busting query string
  function applyFavicon() {
    const ts = Date.now();
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = '/favicon.svg?v=' + ts;
  }

  // Apply per-element font override via inline style
  function applyFont(el, fontName) {
    if (!el || !fontName) return;
    el.style.fontFamily = `'${fontName}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`;
  }

  function renderNav(cfg, ap) {
    const brand = document.getElementById('nav-brand');
    brand.textContent = cfg.site?.brand || '个人主页';
    applyFont(brand, ap?.brandFont);

    navLinks.innerHTML = '';
    (cfg.nav || []).forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      applyFont(a, ap?.navFont);
      li.appendChild(a);
      navLinks.appendChild(li);
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  function renderHero(hero, ap) {
    if (!hero) return;
    const nameEl = document.getElementById('hero-name');
    const tagEl = document.getElementById('hero-tagline');
    const subEl = document.getElementById('hero-sub');
    nameEl.textContent = hero.name || '';
    tagEl.textContent = hero.tagline || '';
    subEl.textContent = hero.sub || '';
    applyFont(nameEl, ap?.heroNameFont);
    applyFont(tagEl, ap?.heroTaglineFont);
    applyFont(subEl, ap?.heroSubFont);

    const heroEl = document.getElementById('hero');
    if (hero.bgImage) {
      const bg = document.createElement('div');
      bg.className = 'hero-bg';
      bg.style.backgroundImage = `url(${hero.bgImage})`;
      heroEl.insertBefore(bg, heroEl.firstChild);
    }
  }

  function renderSections(sections, ap) {
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    sections.forEach((sec, i) => {
      const el = document.createElement('section');
      el.className = 'section' + (i % 2 === 1 ? ' section--dark' : '');
      el.id = sec.id || '';

      const container = document.createElement('div');
      container.className = 'container';

      // Subtitle
      if (sec.subtitle) {
        const sub = document.createElement('p');
        sub.className = 'section-subtitle';
        sub.textContent = sec.subtitle;
        applyFont(sub, ap?.sectionSubtitleFont);
        container.appendChild(sub);
      }

      // Title
      if (sec.title) {
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = sec.title;
        applyFont(title, ap?.sectionTitleFont);
        container.appendChild(title);
      }

      // Layout: CTA
      if (sec.layout === 'cta') {
        const text = document.createElement('p');
        text.className = 'section-text';
        text.textContent = sec.text || '';
        applyFont(text, ap?.sectionTextFont);
        container.appendChild(text);

        const btn = document.createElement('a');
        btn.href = 'mailto:hello@example.com';
        btn.className = 'cta-btn';
        btn.style.cssText = `
          display:inline-block;margin-top:1.5rem;padding:14px 40px;
          border:1px solid var(--accent);color:var(--accent);
          font-size:0.8rem;font-weight:500;letter-spacing:0.15em;
          transition:var(--transition);
        `;
        btn.textContent = sec.ctaText || '联系我们';
        applyFont(btn, ap?.ctaFont);
        btn.onmouseenter = () => { btn.style.background = 'var(--accent)'; btn.style.color = '#0a0a0a'; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; btn.style.color = 'var(--accent)'; };
        container.appendChild(btn);
      }
      // Layout: two-column with image
      else if (sec.layout === 'cols' && sec.image) {
        const cols = document.createElement('div');
        cols.className = 'section-cols';
        cols.innerHTML = `
          <div><p class="section-text">${esc(sec.text)}</p></div>
          <div><img src="${esc(sec.image)}" alt="${esc(sec.title)}" loading="lazy"></div>
        `;
        container.appendChild(cols);
        applyFont(cols.querySelector('.section-text'), ap?.sectionTextFont);
      }
      // Layout: full-width image
      else if (sec.layout === 'fullimg' && sec.image) {
        const fullImg = document.createElement('div');
        fullImg.className = 'section-fullimg';
        fullImg.innerHTML = `
          <img src="${esc(sec.image)}" alt="${esc(sec.title)}" loading="lazy">
          <div class="overlay-text"><h3>${esc(sec.title)}</h3></div>
        `;
        container.appendChild(fullImg);
        applyFont(fullImg.querySelector('.overlay-text h3'), ap?.sectionTitleFont);
      }
      // Default: text only
      else {
        if (sec.text) {
          const text = document.createElement('p');
          text.className = 'section-text';
          text.textContent = sec.text;
          applyFont(text, ap?.sectionTextFont);
          container.appendChild(text);
        }
      }

      el.appendChild(container);
      main.appendChild(el);
    });
  }

  function renderWorks(works, ap) {
    const grid = document.getElementById('works-grid');
    grid.innerHTML = '';

    works.forEach(w => {
      const card = document.createElement('div');
      card.className = 'work-card';

      let imgHtml = '';
      if (w.img) {
        imgHtml = `<img class="work-card-img" src="${esc(w.img)}" alt="${esc(w.title)}" loading="lazy">`;
      } else {
        imgHtml = `<div class="work-card-img" style="display:flex;align-items:center;justify-content:center;">
          <span style="color:var(--text-muted);font-size:2rem;font-weight:300;">${esc(w.title.charAt(0))}</span>
        </div>`;
      }

      card.innerHTML = `
        ${imgHtml}
        <div class="work-card-body">
          <h3 class="work-card-title">${esc(w.title)}</h3>
          <p class="work-card-desc">${esc(w.desc)}</p>
          ${w.tag ? `<span class="work-card-tag">${esc(w.tag)}</span>` : ''}
        </div>
      `;
      grid.appendChild(card);
      applyFont(card.querySelector('.work-card-title'), ap?.workTitleFont);
      applyFont(card.querySelector('.work-card-desc'), ap?.workDescFont);
      applyFont(card.querySelector('.work-card-tag'), ap?.workTagFont);
      applyFont(card.querySelector('.work-card-img span'), ap?.workTitleFont);
    });
  }

  function renderFooter(cols, copy, ap) {
    const grid = document.getElementById('footer-grid');
    grid.innerHTML = '';

    cols.forEach(col => {
      const div = document.createElement('div');
      div.className = 'footer-col';

      const h4 = document.createElement('h4');
      h4.textContent = col.title;
      div.appendChild(h4);

      const ul = document.createElement('ul');
      (col.links || []).forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        if (link.href.startsWith('http')) a.target = '_blank';
        li.appendChild(a);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      applyFont(h4, ap?.footerFont);
      applyFont(ul, ap?.footerFont);
      grid.appendChild(div);
    });

    const copyEl = document.getElementById('footer-copy');
    copyEl.textContent = copy || '';
    applyFont(copyEl, ap?.footerFont);
  }

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== SCROLL ANIMATIONS =====
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(s => {
      s.style.opacity = '0';
      s.style.transform = 'translateY(30px)';
      s.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(s);
    });

    // Add visible styles dynamically
    const style = document.createElement('style');
    style.textContent = '.section.visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

  // ===== START =====
  init();
})();