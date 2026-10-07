(() => {
  const q = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => [...r.querySelectorAll(s)];
  const media = (v) => (v || '').trim();
  const setText = (el, value) => { if (el && value !== undefined && value !== null) el.textContent = value; };
  const esc = (s='') => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function imageStyle(id, selector, image, overlay) {
    if (!image) return;
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    const safe = image.replace(/'/g, "%27");
    style.textContent = selector + '{background:' + overlay + ", url('" + safe + "') center/cover no-repeat !important}";
  }

  function applyStats(stats=[]) {
    const shell = q('.stats-shell');
    if (!shell || !Array.isArray(stats)) return;
    const existing = qa('.stat', shell);
    stats.forEach((item, i) => {
      let card = existing[i];
      if (!card) {
        card = document.createElement('div');
        card.className = 'stat';
        card.innerHTML = '<div class="stat-icon"><svg class="icon-svg lg"><use href="#i-star"/></svg></div><div><strong></strong><span></span></div>';
        shell.appendChild(card);
      }
      setText(q('strong', card), item.value);
      setText(q('span', card), item.label);
    });
    existing.slice(stats.length).forEach(el => el.remove());
  }

  function applyServices(items=[]) {
    const wrap = q('#services .services');
    if (!wrap || !Array.isArray(items)) return;
    const existing = qa('.service', wrap);
    items.forEach((item, i) => {
      let card = existing[i];
      if (!card) {
        card = document.createElement('article');
        card.className = 'service reveal show';
        card.innerHTML = '<div class="service-icon"><svg class="icon-svg xl"><use href="#i-camera"/></svg></div><h3></h3><p></p><div class="service-tag"><svg class="icon-svg sm"><use href="#i-star"/></svg> <span></span></div>';
        wrap.appendChild(card);
      }
      setText(q('h3', card), item.title);
      setText(q('p', card), item.description);
      const tag = q('.service-tag', card);
      if (tag) {
        const textNode = q('span', tag);
        if (textNode) setText(textNode, item.tag || '');
        else tag.append(document.createTextNode(' ' + (item.tag || '')));
      }
      if (item.image) card.style.setProperty('--bg', "url('" + item.image.replace(/'/g, "%27") + "')");
    });
    existing.slice(items.length).forEach(el => el.remove());
  }

  function bindNewGalleryCard(card) {
    if (card.dataset.cmsBound === '1') return;
    card.dataset.cmsBound = '1';
    const launch = () => {
      if (window.__openGallery && card.dataset.gallery) window.__openGallery(card.dataset.gallery);
    };
    card.addEventListener('click', launch);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launch(); }
    });
  }

  function applyWorks(items=[]) {
    const wrap = q('#portfolio .portfolio');
    if (!wrap || !Array.isArray(items)) return;
    const original = qa('.work', wrap);
    items.forEach((item, i) => {
      let card = original[i];
      let created = false;
      if (!card) {
        created = true;
        card = document.createElement('article');
        card.className = 'work reveal show';
        card.tabIndex = 0;
        card.setAttribute('role','button');
        card.innerHTML = '<img alt=""><div class="work-info"><h3></h3><span></span></div>';
        wrap.appendChild(card);
      }
      card.dataset.cat = item.category || 'photo';
      setText(q('.work-info h3', card), item.title);
      setText(q('.work-info span', card), item.subtitle || '');
      const img = q('img', card);
      if (img) {
        img.alt = item.title || 'عمل مصور';
        if (item.cover) img.src = media(item.cover);
      }

      const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean).map(media) : [];
      if (gallery.length && window.__galleryDefs) {
        const gid = 'cms-work-' + i;
        card.dataset.gallery = gid;
        card.setAttribute('aria-label', 'فتح معرض ' + (item.title || 'العمل'));
        window.__galleryDefs[gid] = {
          title: item.title || 'معرض الصور',
          total: gallery.length,
          images: gallery,
          sprite: null
        };
      }
      if (created) bindNewGalleryCard(card);
    });
    original.slice(items.length).forEach(el => el.remove());
  }

  function makeCoverageCard(item) {
    const card = document.createElement('article');
    card.className = 'coverage-card reveal show';
    card.innerHTML =
      '<div class="cover-image"><img alt=""></div>' +
      '<div class="coverage-body">' +
      '<div class="coverage-date"><svg class="icon-svg sm"><use href="#i-calendar"/></svg> <span></span></div>' +
      '<h3></h3><p></p></div>';
    return card;
  }

  function applyNews(items=[]) {
    const wrap = q('#coverage .coverage');
    if (!wrap || !Array.isArray(items)) return;
    const existing = qa('.coverage-card', wrap);
    items.forEach((item, i) => {
      let card = existing[i];
      if (!card) {
        card = makeCoverageCard(item);
        wrap.appendChild(card);
      }
      const img = q('.cover-image img', card);
      if (img) {
        img.alt = item.title || 'خبر';
        if (item.image) img.src = media(item.image);
      }
      const dateEl = q('.coverage-date', card);
      if (dateEl) {
        let span = q('span', dateEl);
        if (!span) {
          span = document.createElement('span');
          const textNodes = [...dateEl.childNodes].filter(n => n.nodeType === 3);
          textNodes.forEach(n => n.remove());
          dateEl.appendChild(span);
        }
        setText(span, item.date || '');
      }
      setText(q('h3', card), item.title);
      setText(q('p', card), item.summary || '');
    });
    existing.slice(items.length).forEach(el => el.remove());
  }

  function applyAbout(about={}) {
    const section = q('#about');
    if (!section) return;
    setText(q('.about-copy h2', section), about.title);
    const ps = qa('.about-copy > p', section);
    [about.paragraph1, about.paragraph2, about.paragraph3].forEach((v,i) => setText(ps[i], v));
    setText(q('.quote div:last-child', section), about.quote);
    if (about.image) {
      imageStyle(
        'cms-about-photo',
        '#about .about-media::before',
        media(about.image),
        'linear-gradient(to top, rgba(4,13,21,.92), transparent 48%)'
      );
    }
  }

  function applyContact(contact={}) {
    const section = q('#contact');
    if (!section) return;
    const h2 = q('.contact-copy h2', section);
    if (h2 && contact.title) h2.textContent = contact.title;
    setText(q('.contact-copy > div:first-child > p', section), contact.description);

    const items = qa('.contact-item', section);
    if (items[0] && contact.phone) {
      let a = q('a', items[0]);
      if (!a) { a = document.createElement('a'); items[0].appendChild(a); }
      a.dir = 'ltr';
      a.href = 'tel:' + contact.phone.replace(/\s+/g,'');
      a.textContent = contact.phone;
    }
    if (items[1] && contact.email) {
      const target = q('span, a', items[1]);
      if (target) target.textContent = contact.email;
    }
    if (items[2] && contact.location) {
      const target = q('span', items[2]);
      if (target) target.textContent = contact.location;
    }

    setText(q('.contact-image .overlay strong', section), contact.overlay_title);
    setText(q('.contact-image .overlay span', section), contact.overlay_text);
    if (contact.whatsapp) window.cmsWhatsAppNumber = String(contact.whatsapp).replace(/\D/g,'');
  }

  function applyHero(hero={}) {
    const section = q('#home');
    if (!section) return;
    const kicker = q('.kicker', section);
    if (kicker && hero.kicker) {
      kicker.innerHTML = '<svg class="icon-svg sm"><use href="#i-camera"/></svg> ' + esc(hero.kicker);
    }
    const h1 = q('h1', section);
    if (h1) h1.innerHTML = esc(hero.title || '') + (hero.highlight ? ' <span>' + esc(hero.highlight) + '</span>' : '');
    setText(q('.hero-copy > p', section), hero.description);
    setText(q('.hero-actions .primary', section), hero.primary_button);
    setText(q('.hero-actions .outline', section), hero.secondary_button);

    if (hero.image) {
      imageStyle(
        'cms-hero-photo',
        '#home .hero-card::before',
        media(hero.image),
        'linear-gradient(to left, rgba(5,17,28,.2), rgba(5,17,28,.7) 56%), linear-gradient(to top, rgba(4,13,21,.72), transparent 45%)'
      );
    }
  }

  async function loadCMSContent() {
    try {
      const res = await fetch('content/site.json?ts=' + Date.now(), {cache:'no-store'});
      if (!res.ok) return;
      const data = await res.json();

      applyHero(data.hero || {});
      applyStats(data.stats || []);

      const servicesHead = q('#services .section-head > div');
      setText(q('h2', servicesHead), data.services_section?.title);
      setText(q('p', servicesHead), data.services_section?.description);
      applyServices(data.services || []);

      const worksHead = q('#portfolio .section-head > div');
      setText(q('h2', worksHead), data.portfolio_section?.title);
      setText(q('p', worksHead), data.portfolio_section?.description);
      applyWorks(data.works || []);

      applyAbout(data.about || {});

      const newsHead = q('#coverage .section-head > div');
      setText(q('h2', newsHead), data.news_section?.title);
      setText(q('p', newsHead), data.news_section?.description);
      applyNews(data.news || []);

      applyContact(data.contact || {});
    } catch (err) {
      console.warn('CMS content load failed', err);
    }
  }

  loadCMSContent();
})();