/* Shared logic of the Merchant-style demos: prices in RUB/USD, cart and mini cart, wishlist, quick view,
   catalogue filters, comparison, timers, sliders, product gallery, furniture calculator and works filter.
   Data: window.SHOP from data.js (shops only). Nothing is sent anywhere. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var store = document.body.getAttribute('data-store'), SH = window.SHOP || { products: {}, cats: {} }, P = SH.products;
  function ru() { return window.TPL ? TPL.lang() === 'ru' : document.documentElement.getAttribute('data-lang') === 'ru'; }
  var L = { add: ['Added to cart', 'Добавлено в корзину'], wishOn: ['Added to the wishlist', 'Добавлено в избранное'], wishOff: ['Removed from the wishlist', 'Убрано из избранного'], empty: ['The cart is empty.', 'Корзина пуста.'], toCat: ['Open the catalogue', 'Перейти в каталог'], remove: ['Remove', 'Удалить'],
    found: ['products', 'товаров'], free: ['free', 'бесплатно'], promoOk: ['Promo code applied', 'Промокод применён'], promoBad: ['Unknown promo code or the order is too small', 'Промокод не подошёл или сумма заказа мала'], cmpMax: ['Up to 4 products can be compared', 'Сравнить можно до 4 товаров'],
    cmpEmpty: ['Nothing to compare yet. Tick «Compare» on products in the catalogue.', 'Пока нечего сравнивать. Отметьте «Сравнить» у товаров в каталоге.'], cmpN: ['products to compare', 'товара в сравнении'], open: ['Open the product page', 'Открыть страницу товара'], days: ['days', 'дн'], hours: ['hours', 'ч'], min: ['min', 'мин'], sec: ['sec', 'сек'],
    price: ['Price', 'Цена'], cat: ['Category', 'Категория'], inCart: ['In cart ✓', 'В корзине ✓'], addBtn: ['Add to cart', 'В корзину'] };
  function t(k) { return L[k][ru() ? 1 : 0]; }
  function money(rub) { return ru() ? Math.round(rub).toLocaleString('ru-RU') + ' ₽' : '$' + Math.round(rub / 90).toLocaleString('en-US'); }
  function prices() { $$('.pr[data-rub]').forEach(function (e) { e.textContent = money(+e.getAttribute('data-rub')); }); }
  function name(id) { var p = P[id]; return p ? (ru() ? p.ru : p.en) : ''; }
  function get(k, d) { try { return JSON.parse(localStorage.getItem('ms-' + store + '-' + k)) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem('ms-' + store + '-' + k, JSON.stringify(v)); } catch (e) {} }
  var cart = get('cart', {}), wish = get('wish', []), cmp = get('cmp', []), promo = get('promo', '');
  Object.keys(cart).forEach(function (k) { if (!P[k]) delete cart[k]; });
  var toastT; function toast(s) { var el = $('[data-toast]'); if (!el) return; el.textContent = s; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 1800); }
  function bump(sel, n) { $$(sel).forEach(function (e) { e.textContent = n || ''; e.classList.add('bump'); setTimeout(function () { e.classList.remove('bump'); }, 300); }); }
  function counters() { var n = Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0); $$('[data-cart-n]').forEach(function (e) { e.textContent = n || ''; }); $$('[data-wish-n]').forEach(function (e) { e.textContent = wish.length || ''; }); $$('[data-cmp-n]').forEach(function (e) { e.textContent = cmp.length || ''; }); }
  function sync() {
    $$('[data-wish]').forEach(function (b) { b.setAttribute('aria-pressed', String(wish.indexOf(b.getAttribute('data-wish')) > -1)); });
    $$('.pc__add[data-add]').forEach(function (b) { var on = !!cart[b.getAttribute('data-add')]; b.classList.toggle('is-in', on); b.textContent = on ? t('inCart') : t('addBtn'); });
    $$('[data-compare]').forEach(function (c) { c.checked = cmp.indexOf(c.getAttribute('data-compare')) > -1; });
    var bar = $('[data-cmpbar]'); if (bar) { bar.hidden = !cmp.length; $('[data-cmpn]').textContent = cmp.length + ' ' + t('cmpN'); }
    counters(); mini();
  }
  /* mini cart drawer */
  var dr = $('[data-drawer]');
  function openDrawer(o) { if (!dr) return; dr.classList.toggle('is-open', o); dr.setAttribute('aria-hidden', String(!o)); }
  function mini() {
    var box = $('[data-mini]'); if (!box) return; var ids = Object.keys(cart), sum = 0;
    box.innerHTML = ids.length ? ids.map(function (id) { var p = P[id]; sum += p.price * cart[id]; return '<div class="mini"><img src="../img/' + p.img + '-sm.webp" alt=""><a href="product-' + id + '.html">' + name(id) + ' × ' + cart[id] + '</a><button type="button" data-mini-x="' + id + '" aria-label="×">×</button></div>'; }).join('') : '<p class="empty">' + t('empty') + '</p>';
    var s = $('[data-mini-sum]'); if (s) s.textContent = money(sum);
  }
  /* clicks */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]');
    if (a && P[a.getAttribute('data-add')]) { var id = a.getAttribute('data-add'), q = a.hasAttribute('data-add-qty') ? Math.max(1, +($('[data-qty]') || { value: 1 }).value || 1) : 1; cart[id] = Math.min(9, (cart[id] || 0) + q); set('cart', cart); sync(); bump('[data-cart-n]', Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0)); toast(t('add') + ': ' + name(id)); if (a.closest('.qv')) { var d = $('#quick'); if (d && d.open) d.close(); } return; }
    var w = e.target.closest('[data-wish]'); if (w) { var wid = w.getAttribute('data-wish'), i = wish.indexOf(wid); if (i < 0) { wish.push(wid); toast(t('wishOn')); } else { wish.splice(i, 1); toast(t('wishOff')); } set('wish', wish); sync(); bump('[data-wish-n]', wish.length); if (new URLSearchParams(location.search).get('wish')) filter(); return; }
    var qv = e.target.closest('[data-quick]'); if (qv) { var qid = qv.getAttribute('data-quick'), p = P[qid], d2 = $('#quick'); if (!p || !d2) return; $('[data-qv]').innerHTML = '<div class="qvb"><img src="../img/' + p.img + '.webp" alt=""><div><b>' + name(qid) + '</b><span class="pr" data-rub="' + p.price + '">' + money(p.price) + '</span><button class="btn" type="button" data-add="' + qid + '">' + t('addBtn') + '</button><a class="link" href="product-' + qid + '.html">' + t('open') + ' →</a></div></div>'; d2.showModal(); return; }
    if (e.target.closest('[data-drawer-open]')) { openDrawer(true); return; }
    if (e.target.closest('[data-drawer-close]') || e.target === dr) { openDrawer(false); return; }
    var mx = e.target.closest('[data-mini-x]'); if (mx) { delete cart[mx.getAttribute('data-mini-x')]; set('cart', cart); sync(); if (store && $('[data-cart-list]')) renderCart(); return; }
    var sc = e.target.closest('[data-scroll]'); if (sc) { var row = sc.closest('section').querySelector('[data-row]'); if (row) row.scrollBy({ left: +sc.getAttribute('data-scroll') * row.clientWidth * .8, behavior: 'smooth' }); return; }
    var tf = e.target.closest('[data-tf]'); if (tf) { var box = tf.closest('[data-tabs-filter]'), k = tf.getAttribute('data-tf'); $$('[data-tf]', box).forEach(function (b) { b.setAttribute('aria-pressed', String(b === tf)); }); $$('.pc', $('[data-tf-grid="' + box.getAttribute('data-tabs-filter') + '"]')).forEach(function (c) { c.hidden = k !== 'all' && c.getAttribute('data-cat') !== k; }); return; }
    var op = e.target.closest('[data-opt] button'); if (op) { $$('button', op.parentNode).forEach(function (b) { b.setAttribute('aria-pressed', String(b === op)); }); return; }
    var mg = e.target.closest('[data-mega]'); if (mg) { var pn = $('[data-mega-panel]'); pn.hidden = !pn.hidden; mg.setAttribute('aria-expanded', String(!pn.hidden)); return; }
    var pnl = $('[data-mega-panel]'); if (pnl && !pnl.hidden && !e.target.closest('[data-mega-panel]')) { pnl.hidden = true; $('[data-mega]').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openDrawer(false); });
  /* timers: end of the current day + N days */
  $$('[data-timer]').forEach(function (el) {
    var end = new Date(); end.setHours(23, 59, 59, 0); end.setDate(end.getDate() + (+el.getAttribute('data-timer') || 0));
    function tick() { var d = Math.max(0, end - new Date()), u = [[Math.floor(d / 864e5), 'days'], [Math.floor(d / 36e5) % 24, 'hours'], [Math.floor(d / 6e4) % 60, 'min'], [Math.floor(d / 1e3) % 60, 'sec']];
      if (!u[0][0]) u.shift(); el.innerHTML = u.map(function (x) { return '<span><b>' + String(x[0]).padStart(2, '0') + '</b><small>' + t(x[1]) + '</small></span>'; }).join(''); }
    tick(); setInterval(tick, 1000);
  });
  /* hero slider */
  $$('[data-slider]').forEach(function (s) {
    var slides = $$('.eslide', s), dots = $$('[data-dot]', s), i = 0, timer;
    function go(n) { i = (n + slides.length) % slides.length; slides.forEach(function (x, k) { x.hidden = k !== i; }); dots.forEach(function (d, k) { d.setAttribute('aria-pressed', String(k === i)); }); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); }); });
    timer = setInterval(function () { go(i + 1); }, 5000);
  });
  /* product page */
  var main = $('[data-zoom]');
  if (main) {
    $$('[data-th]').forEach(function (b) { b.addEventListener('click', function () { var n = b.getAttribute('data-th'), img = $('img', main); img.src = '../img/' + n + '.webp'; img.removeAttribute('srcset'); $$('[data-th]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }); });
    main.addEventListener('mousemove', function (e) { var r = main.getBoundingClientRect(); $('img', main).style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; });
    main.addEventListener('click', function () { main.classList.toggle('zoom'); });
    $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { var q = $('[data-qty]'); q.value = Math.max(1, Math.min(9, (+q.value || 1) + +b.getAttribute('data-q'))); }); });
  }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { var box = b.closest('.tabs2'); $$('[data-tab]', box).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); }); $$('[data-pane]', box).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== b.getAttribute('data-tab'); }); }); });
  /* catalogue */
  var grid = $('[data-grid]'), st = { cat: 'all', min: '', max: '', sale: false, nw: false, brands: [], sort: 'pop' };
  function filter() {
    if (!grid) return; var qs = new URLSearchParams(location.search), q = (qs.get('q') || '').toLowerCase(), onlyWish = !!qs.get('wish'), cards = $$('.pc', grid), n = 0;
    cards.forEach(function (c) { var id = c.getAttribute('data-id'), pr = +c.getAttribute('data-price'), p = P[id] || {}, txt = ((p.en || '') + ' ' + (p.ru || '') + ' ' + c.getAttribute('data-cat')).toLowerCase();
      var ok = (st.cat === 'all' || c.getAttribute('data-cat') === st.cat) && (st.min === '' || pr >= +st.min) && (st.max === '' || pr <= +st.max) && (!st.sale || c.getAttribute('data-sale') === '1') && (!st.nw || c.getAttribute('data-new') === '1') && (!st.brands.length || st.brands.indexOf(c.getAttribute('data-brand')) > -1) && (!q || txt.indexOf(q) > -1) && (!onlyWish || wish.indexOf(id) > -1);
      c.hidden = !ok; if (ok) n++; });
    var key = st.sort, sorted = cards.slice().sort(function (a, b) { var pa = +a.getAttribute('data-price'), pb = +b.getAttribute('data-price'); return key === 'asc' ? pa - pb : key === 'desc' ? pb - pa : key === 'new' ? (+b.getAttribute('data-new')) - (+a.getAttribute('data-new')) : (+b.getAttribute('data-pop')) - (+a.getAttribute('data-pop')); });
    sorted.forEach(function (c) { grid.appendChild(c); });
    $('[data-found]').textContent = ru() ? n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'товар' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'товара' : 'товаров') : n + (n === 1 ? ' product' : ' products'); $('[data-empty]').hidden = n > 0;
    $$('[data-fcat]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-fcat') === st.cat); });
  }
  if (grid) {
    var qs0 = new URLSearchParams(location.search), h0 = location.hash.slice(1) || qs0.get('c'); if (h0 && $('[data-fcat="' + h0 + '"]')) st.cat = h0;
    $$('[data-fcat]').forEach(function (b) { b.addEventListener('click', function () { st.cat = b.getAttribute('data-fcat'); history.replaceState(null, '', st.cat === 'all' ? location.pathname + location.search : '#' + st.cat); filter(); $('[data-side]').classList.remove('is-open'); }); });
    $('[data-pmin]').addEventListener('input', function (e) { st.min = e.target.value; filter(); }); $('[data-pmax]').addEventListener('input', function (e) { st.max = e.target.value; filter(); });
    $('[data-fsale]').addEventListener('change', function (e) { st.sale = e.target.checked; filter(); }); $('[data-fnew]').addEventListener('change', function (e) { st.nw = e.target.checked; filter(); });
    $$('[data-fbrand]').forEach(function (c) { c.addEventListener('change', function () { st.brands = $$('[data-fbrand]').filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-fbrand'); }); filter(); }); });
    $('[data-sort]').addEventListener('change', function (e) { st.sort = e.target.value; filter(); });
    $('[data-freset]').addEventListener('click', function () { st = { cat: 'all', min: '', max: '', sale: false, nw: false, brands: [], sort: 'pop' }; $$('[data-side] input').forEach(function (i) { if (i.type === 'checkbox') i.checked = false; else i.value = ''; }); $('[data-sort]').value = 'pop'; history.replaceState(null, '', location.pathname); filter(); });
    $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { grid.classList.toggle('grid--list', b.getAttribute('data-view') === 'list'); $$('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }); });
    $('[data-side-open]').addEventListener('click', function () { $('[data-side]').classList.add('is-open'); });
    document.addEventListener('click', function (e) { var s = $('[data-side]'); if (s && s.classList.contains('is-open') && !e.target.closest('[data-side],[data-side-open]')) s.classList.remove('is-open'); });
    filter();
  }
  /* comparison */
  document.addEventListener('change', function (e) { var c = e.target.closest('[data-compare]'); if (!c) return; var id = c.getAttribute('data-compare'), i = cmp.indexOf(id);
    if (c.checked && i < 0) { if (cmp.length >= 4) { c.checked = false; toast(t('cmpMax')); return; } cmp.push(id); } else if (!c.checked && i > -1) cmp.splice(i, 1); set('cmp', cmp); sync(); bump('[data-cmp-n]', cmp.length); });
  var clr = $('[data-cmpclear]'); if (clr) clr.addEventListener('click', function () { cmp = []; set('cmp', cmp); sync(); });
  function renderCompare() {
    var box = $('[data-compare-table]'); if (!box) return; var ids = cmp.filter(function (id) { return P[id]; });
    if (!ids.length) { box.innerHTML = '<p class="empty">' + t('cmpEmpty') + '</p>'; return; }
    var keys = []; ids.forEach(function (id) { (P[id].spec || []).forEach(function (s) { if (!keys.some(function (k) { return k[0] === s[0]; })) keys.push(s); }); });
    var row = function (label, vals) { var diff = vals.some(function (v) { return v !== vals[0]; }); return '<tr' + (diff && ids.length > 1 ? ' class="diff"' : '') + '><th>' + label + '</th>' + vals.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>'; };
    box.innerHTML = '<table><tr><th></th>' + ids.map(function (id) { return '<td><img src="../img/' + P[id].img + '-sm.webp" alt=""><br><a href="product-' + id + '.html">' + name(id) + '</a></td>'; }).join('') + '</tr>' +
      row(t('price'), ids.map(function (id) { return money(P[id].price); })) + row(t('cat'), ids.map(function (id) { var c = SH.cats[P[id].cat]; return c ? c[ru() ? 1 : 0] : ''; })) +
      keys.map(function (k) { return row(ru() ? k[1] : k[0], ids.map(function (id) { var s = (P[id].spec || []).find(function (x) { return x[0] === k[0]; }); return s ? (ru() ? s[3] : s[2]) : '—'; })); }).join('') +
      '<tr><th></th>' + ids.map(function (id) { return '<td><button class="btn btn--sm" type="button" data-add="' + id + '">' + t('addBtn') + '</button></td>'; }).join('') + '</tr></table>';
  }
  /* cart page */
  function totals() {
    var items = 0; Object.keys(cart).forEach(function (id) { items += P[id].price * cart[id]; });
    var pct = promo === 'SALE20' ? .2 : promo === 'SALE10' && items >= 10000 ? .1 : 0, disc = Math.round(items * pct), sh = $('[data-ship]'), v = sh ? sh.value : '0', ship = v === 'pick' ? 290 : v === 'store' ? 0 : items - disc >= 15000 ? 0 : 390;
    return { items: items, disc: disc, ship: ship, tot: items - disc + ship };
  }
  function renderCart() {
    var list = $('[data-cart-list]'), sum = $('[data-cart-sum]'); if (!list) return; var ids = Object.keys(cart);
    if (!ids.length) { list.innerHTML = '<p class="empty" style="text-align:left">' + t('empty') + ' <a class="btn btn--sm" href="catalog.html">' + t('toCat') + '</a></p>'; sum.hidden = !$('[data-checkout]').classList.contains('is-sent'); return; }
    list.innerHTML = ids.map(function (id) { var p = P[id]; return '<div class="citem"><img src="../img/' + p.img + '-sm.webp" alt=""><div><a href="product-' + id + '.html">' + name(id) + '</a><div class="qty"><button type="button" data-cq="' + id + '" data-d="-1">−</button><input value="' + cart[id] + '" readonly aria-label="qty"><button type="button" data-cq="' + id + '" data-d="1">+</button></div></div><div class="citem__r"><b>' + money(p.price * cart[id]) + '</b><button class="citem__x" type="button" data-cx="' + id + '">' + t('remove') + '</button></div></div>'; }).join('');
    var x = totals(); $('[data-s-items]').textContent = money(x.items); $('[data-s-disc]').textContent = x.disc ? '−' + money(x.disc) : '—'; $('[data-s-ship]').textContent = x.ship ? money(x.ship) : t('free'); $('[data-s-tot]').textContent = money(x.tot); sum.hidden = false;
  }
  if ($('[data-cart-list]')) {
    $('[data-cart-list]').addEventListener('click', function (e) { var b = e.target.closest('[data-cq]'), x = e.target.closest('[data-cx]'); if (b) { var id = b.getAttribute('data-cq'); cart[id] = Math.max(1, Math.min(9, cart[id] + +b.getAttribute('data-d'))); } if (x) delete cart[x.getAttribute('data-cx')]; if (b || x) { set('cart', cart); sync(); renderCart(); } });
    $('[data-ship]').addEventListener('change', renderCart);
    var pi = $('[data-promo]'); pi.value = promo; $('[data-promo-apply]').addEventListener('click', function () { var v = pi.value.trim().toUpperCase(); var before = totals().disc; promo = v; var after = totals().disc; if (after > 0) { set('promo', promo); toast(t('promoOk')); } else { promo = ''; set('promo', ''); toast(t('promoBad')); } renderCart(); });
    $('[data-checkout]').addEventListener('submit', function (e) { var f = e.currentTarget; setTimeout(function () { if (f.classList.contains('is-sent')) { cart = {}; promo = ''; set('cart', cart); set('promo', ''); sync(); renderCart(); } }, 0); });
    renderCart();
  }
  /* furniture: works filter, lightbox, kitchen calculator */
  var wf = $('[data-wfilter]'); if (wf) wf.addEventListener('click', function (e) { var b = e.target.closest('[data-wf]'); if (!b) return; var k = b.getAttribute('data-wf'); $$('[data-wf]', wf).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $$('.work').forEach(function (w) { w.hidden = k !== 'all' && w.getAttribute('data-wcat') !== k; }); });
  var lbx = $('#lbx'); document.addEventListener('click', function (e) { var w = e.target.closest('[data-work]'); if (!w) { if (lbx && e.target === lbx) lbx.close(); return; } if (!lbx) { location.href = 'works.html'; return; } $('img', lbx).src = w.getAttribute('data-img'); $('p', lbx).textContent = ru() ? w.getAttribute('data-cap-ru') : w.getAttribute('data-cap'); lbx.showModal(); });
  var kc = $('[data-kcalc]'); function kcalc() { if (!kc) return; var len = +$('[data-klen]').value, f = +$('[data-kfront]').value, top = +$('[data-ktop]').value, isl = $('[data-kisl]').checked; $('[data-kv]').textContent = ru() ? String(len).replace('.', ',') : len; $('[data-kres]').textContent = money(Math.round((len * 42000 * f + top * len / 3 + (isl ? 95000 : 0)) / 1000) * 1000); }
  if (kc) { $$('input, select', kc).forEach(function (i) { i.addEventListener('input', kcalc); i.addEventListener('change', kcalc); }); kcalc(); }
  prices(); sync(); renderCompare();
  document.addEventListener('langchange', function () { prices(); sync(); renderCompare(); if ($('[data-cart-list]')) renderCart(); kcalc(); if (grid) filter(); $$('[data-timer]').forEach(function () {}); });
})();
