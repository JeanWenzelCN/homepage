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
      if (!res.ok) throw new Error('Failed to load config');
      const cfg = await res.json();
      renderAll(cfg);
    } catch (err) {
      console.error('Config load error:', err);
      renderAll(getDefaultConfig());
    }
  }

  function getDefaultConfig() {
    return {
      site: {
        brand: 'CREATIVE PORTFOLIO',
        title: 'Creative Portfolio',
        description: 'Photographer & Director - Campaigns, Documentary films, Long-form photography'
      },
      hero: {
        name: 'CHRISTOPHER IRELAND',
        tagline: 'Photographer | Director',
        sub: 'Campaigns · Documentary films · Long-form photography',
        bgImage: ''
      },
      nav: [
        { label: 'Landing', href: '#hero' },
        { label: 'Creative Outlets', href: '#creative-outlets' },
        { label: 'Advertising folio', href: '#works-section' },
        { label: 'Community', href: '#community' },
        { label: 'Enquire', href: '#enquire' },
        { label: 'About', href: '#about' }
      ],
      sections: [
        {
          id: 'about',
          title: 'About',
          subtitle: 'Photographer & Director',
          text: 'Christopher Ireland is a photographer and director based in Sydney, Australia. With over two decades of experience, he creates compelling visual narratives for brands, publications, and communities worldwide.',
          layout: 'text',
          image: ''
        },
        {
          id: 'commercial',
          title: 'Commercial',
          subtitle: 'Advertising Campaigns',
          text: 'From global brands to local startups, Christopher brings a cinematic eye to every commercial project. His work spans photography billboards, television commercials, and digital campaigns.',
          layout: 'text',
          image: ''
        },
        {
          id: 'creative',
          title: 'Creative',
          subtitle: 'Artistry & Ideas',
          text: 'Beyond commissioned work, Christopher pursues personal creative projects that explore the boundaries of visual storytelling. These long-form photographic series and short films are exhibited internationally.',
          layout: 'text',
          image: ''
        },
        {
          id: 'community',
          title: 'Community',
          subtitle: 'Purpose & Education',
          text: 'Christopher is committed to giving back through mentorship programs, workshops, and documentary projects that highlight underrepresented voices in the creative industry.',
          layout: 'text',
          image: ''
        },
        {
          id: 'enquire',
          title: 'Enquire',
          subtitle: 'Start a Project',
          text: 'Ready to bring your vision to life? Get in touch to discuss your next campaign, documentary, or creative collaboration.',
          layout: 'cta',
          image: ''
        }
      ],
      works: [
        { title: 'Photography Billboards', desc: 'Large-format outdoor advertising photography for global brands across APAC.', tag: 'Commercial', img: '' },
        { title: 'Film Commercials', desc: 'Broadcast and digital film campaigns with cinematic storytelling.', tag: 'Commercial', img: '' },
        { title: 'Documentary Films', desc: 'Long-form documentary projects exploring human stories and social issues.', tag: 'Creative', img: '' },
        { title: 'Long-form Photography', desc: 'Extended photographic series capturing landscapes, cultures, and communities.', tag: 'Creative', img: '' },
        { title: 'Education Programs', desc: 'Workshops and mentorship initiatives for emerging photographers.', tag: 'Community', img: '' },
        { title: 'Purpose Projects', desc: 'Pro-bono creative work for non-profits and social enterprises.', tag: 'Community', img: '' }
      ],
      footer: [
        {
          title: 'Navigation',
          links: [
            { label: 'Landing', href: '#hero' },
            { label: 'Creative Outlets', href: '#creative-outlets' },
            { label: 'Advertising folio', href: '#works-section' },
            { label: 'Community', href: '#community' },
            { label: 'Enquire', href: '#enquire' },
            { label: 'About', href: '#about' }
          ]
        },
        {
          title: 'Services',
          links: [
            { label: 'Photography Billboards', href: '#' },
            { label: 'Film Commercials', href: '#' },
            { label: 'Artistry & Ideas', href: '#' },
            { label: 'Education', href: '#' },
            { label: 'Purpose', href: '#' }
          ]
        },
        {
          title: 'Connect',
          links: [
            { label: 'Email', href: 'mailto:hello@example.com' },
            { label: 'Instagram', href: '#' },
            { label: 'LinkedIn', href: '#' },
            { label: 'Vimeo', href: '#' }
          ]
        }
      ],
      footerCopy: '© 2025 Christopher Ireland Creative. All rights reserved.'
    };
  }

  function renderAll(cfg) {
    // Title & Meta
    document.title = cfg.site?.title || 'Creative Portfolio';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = cfg.site?.description || '';

    // Nav
    renderNav(cfg);
    // Hero
    renderHero(cfg.hero);
    // Sections
    renderSections(cfg.sections || []);
    // Works
    renderWorks(cfg.works || []);
    // Footer
    renderFooter(cfg.footer || [], cfg.footerCopy);
    // Animate sections on scroll
    initScrollAnimations();
  }

  function renderNav(cfg) {
    const brand = document.getElementById('nav-brand');
    brand.textContent = cfg.site?.brand || 'CREATIVE PORTFOLIO';

    navLinks.innerHTML = '';
    (cfg.nav || []).forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
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

  function renderHero(hero) {
    if (!hero) return;
    document.getElementById('hero-name').textContent = hero.name || '';
    document.getElementById('hero-tagline').textContent = hero.tagline || '';
    document.getElementById('hero-sub').textContent = hero.sub || '';

    const heroEl = document.getElementById('hero');
    if (hero.bgImage) {
      const bg = document.createElement('div');
      bg.className = 'hero-bg';
      bg.style.backgroundImage = `url(${hero.bgImage})`;
      heroEl.insertBefore(bg, heroEl.firstChild);
    }
  }

  function renderSections(sections) {
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
        container.appendChild(sub);
      }

      // Title
      if (sec.title) {
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = sec.title;
        container.appendChild(title);
      }

      // Layout: CTA
      if (sec.layout === 'cta') {
        const text = document.createElement('p');
        text.className = 'section-text';
        text.textContent = sec.text || '';
        container.appendChild(text);

        const btn = document.createElement('a');
        btn.href = 'mailto:hello@example.com';
        btn.className = 'cta-btn';
        btn.style.cssText = `
          display:inline-block;margin-top:1.5rem;padding:14px 40px;
          border:1px solid var(--accent);color:var(--accent);
          font-size:0.8rem;font-weight:500;letter-spacing:0.15em;
          text-transform:uppercase;transition:var(--transition);
        `;
        btn.textContent = 'Get in Touch';
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
      }
      // Default: text only
      else {
        if (sec.text) {
          const text = document.createElement('p');
          text.className = 'section-text';
          text.textContent = sec.text;
          container.appendChild(text);
        }
      }

      el.appendChild(container);
      main.appendChild(el);
    });
  }

  function renderWorks(works) {
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
    });
  }

  function renderFooter(cols, copy) {
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
      grid.appendChild(div);
    });

    document.getElementById('footer-copy').textContent = copy || '';
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