/* ============================================
   ADMIN JS — Creative Portfolio CMS
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '/api';
  let adminKey = sessionStorage.getItem('admin_key') || '';
  let config = {};

  // ===== DOM REFS =====
  const loginView = document.getElementById('login-view');
  const adminView = document.getElementById('admin-view');
  const loginKey = document.getElementById('login-key');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');

  // ===== INIT =====
  if (adminKey) {
    tryLogin(adminKey);
  }

  loginBtn.addEventListener('click', () => {
    const key = loginKey.value.trim();
    if (!key) { loginError.textContent = 'Please enter a key'; return; }
    tryLogin(key);
  });
  loginKey.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
  });

  async function tryLogin(key) {
    try {
      const res = await fetch(API_BASE + '/config', {
        headers: { 'Authorization': 'Bearer ' + key }
      });
      if (res.status === 401) {
        loginError.textContent = 'Invalid admin key';
        sessionStorage.removeItem('admin_key');
        return;
      }
      if (!res.ok) throw new Error('Server error');
      adminKey = key;
      sessionStorage.setItem('admin_key', key);
      config = await res.json();
      showAdmin();
    } catch (err) {
      loginError.textContent = 'Connection failed: ' + err.message;
    }
  }

  function showAdmin() {
    loginView.style.display = 'none';
    adminView.style.display = 'block';
    populateAll();
    initTabs();
  }

  // ===== TABS =====
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

  // ===== POPULATE FORM =====
  function populateAll() {
    // Simple fields (data-path)
    document.querySelectorAll('[data-path]').forEach(input => {
      const path = input.dataset.path;
      const val = getPath(config, path);
      input.value = val !== undefined && val !== null ? val : '';
    });

    // Nav items
    renderNavEditor();
    // Sections
    renderSectionsEditor();
    // Works
    renderWorksEditor();
    // Footer
    renderFooterEditor();
    // JSON
    document.getElementById('json-editor').value = JSON.stringify(config, null, 2);
  }

  // ===== COLLECT FORM =====
  function collectAll() {
    // Simple fields
    document.querySelectorAll('[data-path]').forEach(input => {
      setPath(config, input.dataset.path, input.value);
    });

    // Nav
    config.nav = collectNav();
    // Sections
    config.sections = collectSections();
    // Works
    config.works = collectWorks();
    // Footer
    config.footer = collectFooter();

    return config;
  }

  // ===== SAVE =====
  saveBtn.addEventListener('click', async () => {
    const data = collectAll();
    saveStatus.className = 'save-status';
    saveStatus.textContent = 'Saving...';
    saveStatus.style.display = 'block';

    try {
      const res = await fetch(API_BASE + '/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + adminKey
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed (' + res.status + ')');
      }

      saveStatus.className = 'save-status success';
      saveStatus.textContent = 'Saved successfully!';
      // Update JSON view
      document.getElementById('json-editor').value = JSON.stringify(config, null, 2);
      setTimeout(() => { saveStatus.style.display = 'none'; }, 3000);
    } catch (err) {
      saveStatus.className = 'save-status error';
      saveStatus.textContent = 'Error: ' + err.message;
    }
  });

  // ===== NAV EDITOR =====
  function renderNavEditor() {
    const editor = document.getElementById('nav-editor');
    editor.innerHTML = '';
    (config.nav || []).forEach((item, i) => {
      editor.appendChild(createListItem('Nav ' + (i + 1), [
        { key: 'label', label: 'Label', value: item.label },
        { key: 'href', label: 'Link', value: item.href }
      ], () => {
        config.nav.splice(i, 1);
        renderNavEditor();
      }));
    });
  }

  function collectNav() {
    const items = [];
    document.querySelectorAll('#nav-editor .list-item').forEach(el => {
      const inputs = el.querySelectorAll('input');
      items.push({ label: inputs[0].value, href: inputs[1].value });
    });
    return items;
  }

  document.getElementById('nav-add').addEventListener('click', () => {
    if (!config.nav) config.nav = [];
    config.nav.push({ label: 'New Item', href: '#' });
    renderNavEditor();
  });

  // ===== SECTIONS EDITOR =====
  function renderSectionsEditor() {
    const editor = document.getElementById('sections-editor');
    editor.innerHTML = '';
    (config.sections || []).forEach((sec, i) => {
      editor.appendChild(createListItem(sec.title || 'Section ' + (i + 1), [
        { key: 'id', label: 'ID (anchor)', value: sec.id },
        { key: 'title', label: 'Title', value: sec.title },
        { key: 'subtitle', label: 'Subtitle', value: sec.subtitle },
        { key: 'text', label: 'Text', value: sec.text, type: 'textarea', full: true },
        { key: 'layout', label: 'Layout', value: sec.layout, type: 'select', options: ['text', 'cols', 'fullimg', 'cta'] },
        { key: 'image', label: 'Image URL', value: sec.image }
      ], () => {
        config.sections.splice(i, 1);
        renderSectionsEditor();
      }));
    });
  }

  function collectSections() {
    const items = [];
    document.querySelectorAll('#sections-editor .list-item').forEach(el => {
      const fields = el.querySelectorAll('input, textarea, select');
      items.push({
        id: fields[0].value,
        title: fields[1].value,
        subtitle: fields[2].value,
        text: fields[3].value,
        layout: fields[4].value,
        image: fields[5].value
      });
    });
    return items;
  }

  document.getElementById('sections-add').addEventListener('click', () => {
    if (!config.sections) config.sections = [];
    config.sections.push({ id: '', title: 'New Section', subtitle: '', text: '', layout: 'text', image: '' });
    renderSectionsEditor();
  });

  // ===== WORKS EDITOR =====
  function renderWorksEditor() {
    const editor = document.getElementById('works-editor');
    editor.innerHTML = '';
    (config.works || []).forEach((w, i) => {
      editor.appendChild(createListItem(w.title || 'Work ' + (i + 1), [
        { key: 'title', label: 'Title', value: w.title },
        { key: 'desc', label: 'Description', value: w.desc, type: 'textarea', full: true },
        { key: 'tag', label: 'Tag', value: w.tag },
        { key: 'img', label: 'Image URL', value: w.img }
      ], () => {
        config.works.splice(i, 1);
        renderWorksEditor();
      }));
    });
  }

  function collectWorks() {
    const items = [];
    document.querySelectorAll('#works-editor .list-item').forEach(el => {
      const fields = el.querySelectorAll('input, textarea');
      items.push({ title: fields[0].value, desc: fields[1].value, tag: fields[2].value, img: fields[3].value });
    });
    return items;
  }

  document.getElementById('works-add').addEventListener('click', () => {
    if (!config.works) config.works = [];
    config.works.push({ title: 'New Work', desc: '', tag: '', img: '' });
    renderWorksEditor();
  });

  // ===== FOOTER EDITOR =====
  function renderFooterEditor() {
    const editor = document.getElementById('footer-editor');
    editor.innerHTML = '';
    (config.footer || []).forEach((col, i) => {
      const linksStr = (col.links || []).map(l => l.label + '|' + l.href).join('\n');
      editor.appendChild(createListItem(col.title || 'Column ' + (i + 1), [
        { key: 'title', label: 'Column Title', value: col.title },
        { key: 'links', label: 'Links (one per line: Label|URL)', value: linksStr, type: 'textarea', full: true }
      ], () => {
        config.footer.splice(i, 1);
        renderFooterEditor();
      }));
    });
  }

  function collectFooter() {
    const items = [];
    document.querySelectorAll('#footer-editor .list-item').forEach(el => {
      const inputs = el.querySelectorAll('input, textarea');
      const links = inputs[1].value.split('\n')
        .filter(l => l.trim())
        .map(l => {
          const parts = l.split('|');
          return { label: (parts[0] || '').trim(), href: (parts[1] || '#').trim() };
        });
      items.push({ title: inputs[0].value, links });
    });
    return items;
  }

  document.getElementById('footer-add').addEventListener('click', () => {
    if (!config.footer) config.footer = [];
    config.footer.push({ title: 'New Column', links: [] });
    renderFooterEditor();
  });

  // ===== JSON EDITOR =====
  document.getElementById('json-apply').addEventListener('click', () => {
    const errEl = document.getElementById('json-error');
    try {
      const parsed = JSON.parse(document.getElementById('json-editor').value);
      config = parsed;
      populateAll();
      errEl.textContent = '';
    } catch (e) {
      errEl.textContent = 'Invalid JSON: ' + e.message;
    }
  });

  // ===== HELPERS =====
  function createListItem(title, fields, onDelete) {
    const item = document.createElement('div');
    item.className = 'list-item';

    const header = document.createElement('div');
    header.className = 'list-item-header';
    header.innerHTML = `<span class="list-item-title">${esc(title)}</span>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger';
    delBtn.textContent = 'Remove';
    delBtn.addEventListener('click', onDelete);
    header.appendChild(delBtn);
    item.appendChild(header);

    const fieldsDiv = document.createElement('div');
    fieldsDiv.className = 'list-item-fields';

    fields.forEach(f => {
      const div = document.createElement('div');
      div.className = 'field' + (f.full ? ' full' : '');
      const label = document.createElement('label');
      label.textContent = f.label;
      div.appendChild(label);

      if (f.type === 'textarea') {
        const ta = document.createElement('textarea');
        ta.value = f.value || '';
        ta.rows = 3;
        div.appendChild(ta);
      } else if (f.type === 'select') {
        const sel = document.createElement('select');
        (f.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          if (opt === f.value) o.selected = true;
          sel.appendChild(o);
        });
        div.appendChild(sel);
      } else {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = f.value || '';
        div.appendChild(inp);
      }
      fieldsDiv.appendChild(div);
    });

    item.appendChild(fieldsDiv);
    return item;
  }

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => o && o[k], obj);
  }

  function setPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();