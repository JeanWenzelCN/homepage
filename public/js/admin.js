/* ============================================
   后台管理 JS — 登录 / 编辑 / 保存 / 外观
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '/api';
  let config = null;

  const FONT_SLOTS = [
    ['brandFont', '导航品牌'],
    ['navFont', '导航链接'],
    ['heroNameFont', '首屏名字'],
    ['heroTaglineFont', '首屏标语'],
    ['heroSubFont', '首屏副标题'],
    ['sectionTitleFont', '板块标题'],
    ['sectionSubtitleFont', '板块副标题'],
    ['sectionTextFont', '板块正文'],
    ['workTitleFont', '作品标题'],
    ['workDescFont', '作品描述'],
    ['workTagFont', '作品标签'],
    ['ctaFont', 'CTA 按钮'],
    ['footerFont', '页脚（标题/链接/版权）']
  ];

  // ===== 登录 =====
  const loginView = document.getElementById('login-view');
  const adminView = document.getElementById('admin-view');
  const loginKey = document.getElementById('login-key');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');

  const savedKey = sessionStorage.getItem('admin_key');
  if (savedKey) tryLogin(savedKey);

  loginBtn.addEventListener('click', () => {
    const key = loginKey.value.trim();
    if (!key) { showLoginError('请输入密钥'); return; }
    tryLogin(key);
  });
  loginKey.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

  async function tryLogin(key) {
    loginError.hidden = true;
    try {
      const res = await fetch(API_BASE + '/config', {
        headers: { 'Authorization': 'Bearer ' + key }
      });
      if (res.status === 401) { showLoginError('密钥错误'); return; }
      if (!res.ok) { showLoginError('连接失败：HTTP ' + res.status); return; }
      sessionStorage.setItem('admin_key', key);
      config = await res.json();
      showAdmin();
    } catch (err) {
      showLoginError('连接失败：' + err.message);
    }
  }

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.hidden = false;
  }

  // ===== 主视图 =====
  function applyFavicon() {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = '/favicon.svg?v=' + Date.now();
  }
  applyFavicon();

  function showAdmin() {
    loginView.hidden = true;
    adminView.hidden = false;
    populateAll();
    initTabs();
  }

  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });
  }

  // ===== 填充 =====
  function populateAll() {
    document.querySelectorAll('[data-path]').forEach(el => {
      if (el.type === 'checkbox') {
        const v = getPath(config, el.dataset.path);
        el.checked = v !== false;
      } else {
        el.value = getPath(config, el.dataset.path) ?? '';
      }
    });
    renderNavEditor();
    renderSectionsEditor();
    renderWorksEditor();
    renderFooterEditor();
    renderFontsEditor();
    renderFontSlots();
    document.getElementById('json-editor').value = JSON.stringify(config, null, 2);
  }

  // ===== 收集 =====
  function collectAll() {
    document.querySelectorAll('[data-path]').forEach(el => {
      setPath(config, el.dataset.path, el.type === 'checkbox' ? el.checked : el.value);
    });
    config.nav = collectNav();
    config.sections = collectSections();
    config.works = collectWorks();
    config.footer = collectFooter();
    config.appearance = config.appearance || {};
    config.appearance.fonts = collectFonts();
    FONT_SLOTS.forEach(([key]) => {
      const sel = document.getElementById('slot-' + key);
      if (sel) config.appearance[key] = sel.value;
    });
    return config;
  }

  // ===== 通用条目构造 =====
  function createListItem(title, fields, onDelete) {
    const item = document.createElement('div');
    item.className = 'list-item';

    const head = document.createElement('div');
    head.className = 'list-item-head';
    const h = document.createElement('span');
    h.textContent = title;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-danger';
    del.textContent = '删除';
    del.addEventListener('click', onDelete);
    head.appendChild(h);
    head.appendChild(del);
    item.appendChild(head);

    fields.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'field' + (f.full ? ' full' : '');
      const label = document.createElement('label');
      label.textContent = f.label;
      wrap.appendChild(label);

      let input;
      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else if (f.type === 'select') {
        input = document.createElement('select');
        (f.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          input.appendChild(o);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }
      input.value = f.value ?? '';
      input.dataset.key = f.key;
      wrap.appendChild(input);
      item.appendChild(wrap);
    });

    return item;
  }

  // ===== 导航 =====
  function renderNavEditor() {
    const box = document.getElementById('nav-editor');
    box.innerHTML = '';
    (config.nav || []).forEach((item, i) => {
      box.appendChild(createListItem('导航 ' + (i + 1), [
        { key: 'label', label: '文字', value: item.label },
        { key: 'href', label: '链接', value: item.href }
      ], () => { config.nav.splice(i, 1); renderNavEditor(); }));
    });
  }
  document.getElementById('nav-add').addEventListener('click', () => {
    config.nav = config.nav || [];
    config.nav.push({ label: '新导航', href: '#' });
    renderNavEditor();
  });
  function collectNav() {
    return [...document.querySelectorAll('#nav-editor .list-item')].map(item => ({
      label: item.querySelector('[data-key="label"]').value,
      href: item.querySelector('[data-key="href"]').value
    }));
  }

  // ===== 板块 =====
  function renderSectionsEditor() {
    const box = document.getElementById('sections-editor');
    box.innerHTML = '';
    (config.sections || []).forEach((sec, i) => {
      box.appendChild(createListItem('板块 ' + (i + 1), [
        { key: 'id', label: 'ID（锚点）', value: sec.id },
        { key: 'subtitle', label: '副标题', value: sec.subtitle },
        { key: 'title', label: '标题', value: sec.title },
        { key: 'text', label: '正文', value: sec.text, type: 'textarea', full: true },
        { key: 'layout', label: '布局', value: sec.layout, type: 'select', options: ['text', 'cols', 'fullimg', 'cta'] },
        { key: 'image', label: '图片 URL', value: sec.image },
        { key: 'ctaText', label: 'CTA 按钮文字', value: sec.ctaText }
      ], () => { config.sections.splice(i, 1); renderSectionsEditor(); }));
    });
  }
  document.getElementById('sections-add').addEventListener('click', () => {
    config.sections = config.sections || [];
    config.sections.push({ id: '', subtitle: '', title: '新板块', text: '', layout: 'text', image: '', ctaText: '' });
    renderSectionsEditor();
  });
  function collectSections() {
    return [...document.querySelectorAll('#sections-editor .list-item')].map(item => {
      const o = {};
      item.querySelectorAll('[data-key]').forEach(el => o[el.dataset.key] = el.value);
      return o;
    });
  }

  // ===== 作品 =====
  function renderWorksEditor() {
    const box = document.getElementById('works-editor');
    box.innerHTML = '';
    (config.works || []).forEach((w, i) => {
      box.appendChild(createListItem('作品 ' + (i + 1), [
        { key: 'title', label: '标题', value: w.title },
        { key: 'desc', label: '描述', value: w.desc, type: 'textarea', full: true },
        { key: 'tag', label: '标签', value: w.tag },
        { key: 'img', label: '图片 URL', value: w.img }
      ], () => { config.works.splice(i, 1); renderWorksEditor(); }));
    });
  }
  document.getElementById('works-add').addEventListener('click', () => {
    config.works = config.works || [];
    config.works.push({ title: '新作品', desc: '', tag: '', img: '' });
    renderWorksEditor();
  });
  function collectWorks() {
    return [...document.querySelectorAll('#works-editor .list-item')].map(item => {
      const o = {};
      item.querySelectorAll('[data-key]').forEach(el => o[el.dataset.key] = el.value);
      return o;
    });
  }

  // ===== 页脚 =====
  function renderFooterEditor() {
    const box = document.getElementById('footer-editor');
    box.innerHTML = '';
    (config.footer || []).forEach((col, i) => {
      const linksText = (col.links || []).map(l => l.label + '|' + l.href).join('\n');
      box.appendChild(createListItem('栏目 ' + (i + 1), [
        { key: 'title', label: '栏目标题', value: col.title },
        { key: 'links', label: '链接（每行一条：文字|URL）', value: linksText, type: 'textarea', full: true }
      ], () => { config.footer.splice(i, 1); renderFooterEditor(); }));
    });
  }
  document.getElementById('footer-add').addEventListener('click', () => {
    config.footer = config.footer || [];
    config.footer.push({ title: '新栏目', links: [] });
    renderFooterEditor();
  });
  function collectFooter() {
    return [...document.querySelectorAll('#footer-editor .list-item')].map(item => {
      const links = item.querySelector('[data-key="links"]').value
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const idx = line.indexOf('|');
          return idx === -1
            ? { label: line, href: '' }
            : { label: line.slice(0, idx).trim(), href: line.slice(idx + 1).trim() };
        });
      return { title: item.querySelector('[data-key="title"]').value, links };
    });
  }

  // ===== 外观：字体列表 =====
  function renderFontsEditor() {
    const box = document.getElementById('fonts-editor');
    box.innerHTML = '';
    const fonts = config.appearance?.fonts || [];
    fonts.forEach((f, i) => {
      box.appendChild(createListItem('字体 ' + (i + 1), [
        { key: 'name', label: '字体名称', value: f.name },
        { key: 'file', label: '文件名（public/fonts/ 下）', value: f.file }
      ], () => {
        config.appearance.fonts.splice(i, 1);
        renderFontsEditor();
        renderFontSlots();
      }));
      // 字体名称变化时刷新下拉
      const nameInput = box.lastChild.querySelector('[data-key="name"]');
      nameInput.addEventListener('change', renderFontSlots);
    });
  }
  document.getElementById('fonts-add').addEventListener('click', () => {
    config.appearance = config.appearance || {};
    config.appearance.fonts = config.appearance.fonts || [];
    config.appearance.fonts.push({ name: '', file: '' });
    renderFontsEditor();
  });
  function collectFonts() {
    return [...document.querySelectorAll('#fonts-editor .list-item')].map(item => ({
      name: item.querySelector('[data-key="name"]').value.trim(),
      file: item.querySelector('[data-key="file"]').value.trim()
    })).filter(f => f.name || f.file);
  }

  // ===== 外观：每处文本字体槽位 =====
  function renderFontSlots() {
    const box = document.getElementById('font-slots');
    box.innerHTML = '';
    const fonts = collectFonts();
    FONT_SLOTS.forEach(([key, label]) => {
      const wrap = document.createElement('div');
      wrap.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      const sel = document.createElement('select');
      sel.id = 'slot-' + key;

      const def = document.createElement('option');
      def.value = '';
      def.textContent = '（默认）';
      sel.appendChild(def);

      fonts.forEach(f => {
        if (!f.name) return;
        const o = document.createElement('option');
        o.value = f.name;
        o.textContent = f.name;
        sel.appendChild(o);
      });

      sel.value = config.appearance?.[key] || '';
      wrap.appendChild(lab);
      wrap.appendChild(sel);
      box.appendChild(wrap);
    });
  }

  // ===== 保存 =====
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');
  saveBtn.addEventListener('click', async () => {
    const data = collectAll();
    showStatus('保存中…', '');
    try {
      const res = await fetch(API_BASE + '/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('admin_key')
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const t = await res.text();
        showStatus('错误：' + (t || 'HTTP ' + res.status), 'error');
        return;
      }
      showStatus('保存成功！', 'success');
      setTimeout(() => saveStatus.hidden = true, 3000);
    } catch (err) {
      showStatus('错误：' + err.message, 'error');
    }
  });

  function showStatus(msg, type) {
    saveStatus.textContent = msg;
    saveStatus.className = type;
    saveStatus.hidden = false;
  }

  // ===== JSON 高级编辑 =====
  document.getElementById('json-apply').addEventListener('click', () => {
    const errEl = document.getElementById('json-error');
    try {
      config = JSON.parse(document.getElementById('json-editor').value);
      errEl.hidden = true;
      populateAll();
    } catch (err) {
      errEl.textContent = 'JSON 无效：' + err.message;
      errEl.hidden = false;
    }
  });

  // ===== 工具 =====
  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }
  function setPath(obj, path, val) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = val;
  }
})();
