/* =========================================================
   Hotel Tejas — page behaviour
   Loader, hero slider, scroll reveals, counters, parallax,
   specials, thalis, tabbed menu with search + veg filter,
   Marathi / English switch.  Data lives in js/menu-data.js.
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- helpers ---------- */
  const MR_DIGITS = "०१२३४५६७८९";
  const SIZE = { P: { mr: "प्लेट", en: "Plate" }, H: { mr: "हाफ", en: "Half" }, F: { mr: "फुल", en: "Full" } };
  let lang = "mr";
  let foodFilter = "all";
  let query = "";
  let activeCat = MENU[0].id;

  const toMr = (s) => String(s).replace(/\d/g, (d) => MR_DIGITS[d]);
  const num = (n) => {
    const s = Number(n).toLocaleString("en-IN");
    return lang === "mr" ? toMr(s) : s;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const L = (mr, en) => (lang === "mr" ? mr : en);

  function priceHTML(p) {
    if (typeof p === "number") return "₹" + num(p);
    const main = p.map((x) => num(x[1])).join(" / ");
    const lab = p.map((x) => (x[0] ? SIZE[x[0]][lang] : L("रेग्युलर", "Regular"))).join(" / ");
    return "₹" + main + "<small>" + lab + "</small>";
  }

  /* ---------- loader ---------- */
  const started = performance.now();
  // The loader waits only for the first slider photo (not every image), at least
  // 900 ms so the Warli circle can draw, and never more than 1.8 s.
  let finished = false;
  function finishLoading() {
    if (finished) return;
    finished = true;
    const wait = reduceMotion ? 0 : Math.max(0, 900 - (performance.now() - started));
    setTimeout(() => root.classList.add("loaded"), wait);
  }
  // Wait for the first slider photo and the fonts, so the hero does not jump.
  const firstImg = document.querySelector(".slide.on img");
  const imgReady = new Promise((res) => {
    if (!firstImg || firstImg.complete) return res();
    firstImg.addEventListener("load", res, { once: true });
    firstImg.addEventListener("error", res, { once: true });
  });
  const fontSheet = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
  const sheetReady = new Promise((res) => {
    if (!fontSheet || fontSheet.media === "all" || fontSheet.sheet) return res();
    fontSheet.addEventListener("load", res, { once: true });
    fontSheet.addEventListener("error", res, { once: true });
  });
  const fontsReady = sheetReady.then(() =>
    document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load('1em "Yatra One"', "तेजस"), document.fonts.load('1em "Mukta"', "मालवणी")]).catch(() => {})
      : null
  );
  // The loader lifts when the first photo is in (max 1.8 s). The hero text stays
  // hidden until the fonts are in (max 3 s), so it never jumps when they swap.
  Promise.all([imgReady]).then(finishLoading);
  setTimeout(finishLoading, 1800);

  // A tap on the loader skips it and is passed on to the control underneath,
  // so an early tap on "EN" or "Call" is never lost.
  const loaderEl = document.querySelector(".loader");
  if (loaderEl) {
    loaderEl.addEventListener("click", (e) => {
      finished = true;
      loaderEl.style.pointerEvents = "none";
      root.classList.add("loaded");
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const target = under && under.closest("a, button");
      if (target && !loaderEl.contains(target)) target.click();
    });
  }
  const showHeroText = () => root.classList.add("fonts-in");
  fontsReady.then(showHeroText);
  setTimeout(showHeroText, 3000);

  /* ---------- header ---------- */
  const header = $(".top");
  const bar = $("#bar");
  function setHeaderHeight() {
    root.style.setProperty("--hh", header.offsetHeight + "px");
  }
  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 60);
    if (bar) bar.classList.toggle("show", y > window.innerHeight * 0.6);
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);

  /* ---------- hero slider ---------- */
  const slides = $$(".slide");
  const dotBtns = $$("#dots button");
  const nowEl = $("#nowShowing");
  let current = 0;
  let timer = null;
  const SLIDE_MS = 6000;

  function caption() {
    const s = slides[current];
    if (!s || !nowEl) return;
    nowEl.innerHTML = L("आत्ता पाहत आहात: ", "Now showing: ") + "<b>" + esc(s.dataset[lang]) + "</b> · ₹" + num(s.dataset.price);
  }
  // Slides after the first load only when they are about to show.
  function ensureImg(slide) {
    const img = slide && slide.querySelector("img[data-src]");
    if (!img) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
    img.removeAttribute("data-srcset");
  }
  function show(i) {
    ensureImg(slides[(i + slides.length) % slides.length]);
    ensureImg(slides[(i + 1 + slides.length) % slides.length]);
    slides[current].classList.remove("on");
    dotBtns.forEach((d, k) => {
      d.classList.remove("on");
      d.classList.toggle("done", k < i);
    });
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("on");
    const d = dotBtns[current];
    // restart the progress animation
    void d.offsetWidth;
    d.classList.add("on");
    caption();
  }
  function play() {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(() => show(current + 1), SLIDE_MS);
  }
  dotBtns.forEach((d, i) =>
    d.addEventListener("click", () => {
      show(i);
      play();
    })
  );
  document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : play()));

  /* ---------- specials ---------- */
  function renderSpecials() {
    $("#dishGrid").innerHTML = SPECIALS.map(
      (d, i) => `
      <article class="dish reveal" style="--i:${i % 4}">
        <div class="ph"><img src="img/${d.img}.jpg" alt="${esc(d.en)}" loading="lazy">
          ${d.tag ? `<span class="tag">${esc(d.tag[lang])}</span>` : ""}</div>
        <div class="bd">
          <h3>${esc(L(d.mr, d.en))}</h3>
          <span class="sub">${esc(d.sub[lang])}</span>
          <span class="pr">${lang === "mr" ? toMr(d.pr) : d.pr}</span>
        </div>
      </article>`
    ).join("");
  }

  /* ---------- thalis ---------- */
  function renderThalis() {
    $("#thaliList").innerHTML = THALIS.map(
      (t) => `<li class="lead-row"><span class="nm">${esc(L(t[0], t[1]))}</span><span class="dots-fill"></span><span class="p">₹${num(t[2])}</span></li>`
    ).join("");
  }

  /* ---------- menu ---------- */
  const tabsEl = $("#tabs");
  const panel = $("#panel");
  const visibleCats = () => MENU.filter((s) => foodFilter === "all" || s.kind === foodFilter || s.kind === "all");
  const matches = (it) => !query || it[0].includes(query) || it[1].toLowerCase().includes(query.toLowerCase());
  const kindLabel = (k) => (k === "veg" ? L("शाकाहारी", "Vegetarian") : k === "nv" ? L("मांसाहारी", "Non-vegetarian") : L("सर्वांसाठी", "For everyone"));

  function itemRow(it) {
    return `<li class="lead-row"><span class="nm">${esc(L(it[0], it[1]))}<small>${esc(L(it[1], it[0]))}</small></span><span class="dots-fill"></span><span class="p">${priceHTML(it[2])}</span></li>`;
  }

  function renderTabs() {
    const cats = visibleCats();
    if (!cats.some((c) => c.id === activeCat)) activeCat = cats[0].id;
    tabsEl.innerHTML = cats
      .map(
        (c) =>
          `<button class="tab" role="tab" type="button" id="tab-${c.id}" data-id="${c.id}" aria-selected="${c.id === activeCat && !query}"><i class="k ${c.kind}"></i>${esc(L(c.mr, c.en))}</button>`
      )
      .join("");
  }

  function panelHTML() {
    if (query) {
      const groups = visibleCats()
        .map((c) => ({ c, its: c.items.filter(matches) }))
        .filter((g) => g.its.length);
      if (!groups.length)
        return `<div class="empty">${L("“" + esc(query) + "” साठी काही सापडलं नाही. दुसरं नाव शोधा.", "Nothing matches “" + esc(query) + "”. Try another dish name.")}</div>`;
      return `<ul class="items">${groups
        .map((g) => `<li class="group-h">${esc(L(g.c.mr, g.c.en))}</li>${g.its.map(itemRow).join("")}`)
        .join("")}</ul>`;
    }
    const c = MENU.find((s) => s.id === activeCat);
    return `
      <div class="banner"><img src="img/${c.img}.jpg" alt="" data-parallax="0.12">
        <div class="bt"><span class="hand">${kindLabel(c.kind)} · ${num(c.items.length)} ${L("पदार्थ", "dishes")}</span><h3>${esc(L(c.mr, c.en))}</h3></div>
      </div>
      <ul class="items">${c.items.map(itemRow).join("")}</ul>`;
  }

  function renderPanel(dir) {
    if (!dir || reduceMotion || !panel.animate) {
      panel.innerHTML = panelHTML();
      return;
    }
    panel
      .animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 48}px)` }], { duration: 170, easing: "ease-in" })
      .finished.then(() => {
        panel.innerHTML = panelHTML();
        panel.animate([{ opacity: 0, transform: `translateX(${dir * 48}px)` }, { opacity: 1, transform: "none" }], {
          duration: 320,
          easing: "cubic-bezier(.2,.7,.2,1)",
        });
        parallaxTick();
      });
  }

  function renderMenu(dir) {
    renderTabs();
    renderPanel(dir);
    const all = MENU.reduce((a, s) => a + s.items.length, 0);
    let found = 0;
    if (query) visibleCats().forEach((c) => (found += c.items.filter(matches).length));
    $("#menuCount").textContent = query
      ? L(`${toMr(found)} पदार्थ सापडले`, `${found} dishes found`)
      : L(`${toMr(all)} पदार्थ — व्हेज, नॉनव्हेज, सी फूड, थाळी आणि चायनीज. विभाग निवडा.`, `${all} dishes across veg, non-veg, seafood, thalis and Chinese. Pick a section.`);
  }

  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    const cats = visibleCats();
    const from = cats.findIndex((c) => c.id === activeCat);
    const to = cats.findIndex((c) => c.id === b.dataset.id);
    if (query) {
      query = "";
      $("#q").value = "";
    }
    if (to === from && !query) return;
    activeCat = b.dataset.id;
    renderMenu(to > from ? 1 : -1);
    const tb = $("#tab-" + activeCat);
    if (tb && tabsEl.scrollWidth > tabsEl.clientWidth) tabsEl.scrollTo({ left: tb.offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
  });
  // arrow keys between tabs
  tabsEl.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = $$(".tab", tabsEl);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus();
    n.click();
  });
  $$(".vn button").forEach((b) =>
    b.addEventListener("click", () => {
      foodFilter = b.dataset.f;
      $$(".vn button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderMenu(1);
    })
  );
  let qTimer;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      query = e.target.value.trim();
      renderMenu();
    }, 120);
  });

  /* ---------- counters ---------- */
  const counts = {
    dishes: MENU.reduce((a, s) => a + s.items.length, 0),
    thalis: (MENU.find((s) => s.id === "thalis") || { items: [] }).items.length,
    seafood: (MENU.find((s) => s.id === "seafood") || { items: [] }).items.length,
  };
  $$(".count").forEach((el) => {
    if (el.dataset.key) el.dataset.to = counts[el.dataset.key];
    el.textContent = num(el.dataset.to);
  });
  function runCounter(el) {
    const to = +el.dataset.to;
    if (reduceMotion) {
      el.textContent = num(to);
      return;
    }
    const t0 = performance.now();
    const dur = 1600;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = num(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
      else el.dataset.done = "1";
    })(t0);
  }

  /* ---------- Warli borders animate only while on screen ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const fio = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle("vis", en.isIntersecting)));
    $$(".frieze").forEach((f) => fio.observe(f));
  }

  /* ---------- scroll reveal ---------- */
  let io = null;
  function observe() {
    const els = $$(".reveal:not(.in), .frieze.draw:not(.in), .count:not([data-seen])");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    if (!io)
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            if (el.classList.contains("count")) {
              el.dataset.seen = "1";
              runCounter(el);
            } else el.classList.add("in");
            io.unobserve(el);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- parallax ---------- */
  let ticking = false;
  function parallaxTick() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    $$("[data-parallax]").forEach((el) => {
      const host = el.closest(".banner") || el;
      const r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const speed = parseFloat(el.dataset.parallax);
      const off = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.translate = `0 ${off.toFixed(1)}px`;
    });
  }
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScrollHeader();
        parallaxTick();
        ticking = false;
      });
    },
    { passive: true }
  );

  /* ---------- copy phone ---------- */
  // Feedback is immediate: the number is selected and the button says so at once.
  // The clipboard write is a bonus; some phones and in-app browsers never answer it,
  // so the button must not wait for it.
  $$(".copy").forEach((btn) => {
    const label = btn.innerHTML;
    let resetTimer = null;
    btn.addEventListener("click", () => {
      const num = btn.dataset.num;
      const el = btn.closest(".person").querySelector(".num");
      try {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      } catch (e) {}
      btn.textContent = L("निवडला", "Selected");
      btn.setAttribute("aria-live", "polite");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(
          () => (btn.textContent = L("कॉपी झाला", "Copied")),
          () => {}
        );
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => (btn.innerHTML = label), 2000);
    });
  });

  /* ---------- language ---------- */
  function renderAll() {
    renderSpecials();
    renderThalis();
    renderMenu();
    caption();
    $$(".count").forEach((el) => {
      if (el.dataset.done || !el.dataset.seen) el.textContent = num(el.dataset.to);
    });
    observe();
  }
  function setLang(l) {
    lang = l;
    body.dataset.lang = l;
    root.lang = l === "mr" ? "mr" : "en";
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.l === l));
    try {
      localStorage.setItem("tejas-lang", l);
    } catch (e) {}
    renderAll();
    // already-visible content should not re-hide after a language switch
    $$(".dish.reveal, #thaliList").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("in");
    });
  }
  $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.l)));

  /* ---------- start ---------- */
  let saved = "mr";
  try {
    saved = localStorage.getItem("tejas-lang") || "mr";
  } catch (e) {}
  setLang(saved === "en" ? "en" : "mr");
  show(0);
  play();
  onScrollHeader();
  parallaxTick();
})();
