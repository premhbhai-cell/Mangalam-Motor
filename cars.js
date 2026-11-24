/* Mangalam Motor — car gallery, lightbox, filters, reviews slider */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I = {
    l: '<svg class="cx-i" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    r: '<svg class="cx-i" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    x: '<svg class="cx-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    star: '<svg class="cx-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
    pin: '<svg class="cx-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  /* ---------- GALLERY (swipe slider + thumbnails + fullscreen) ---------- */
  var lb, lbImg, lbN, lbList = [], lbIdx = 0, lbOnClose = null;
  function buildLb() {
    if (lb) return;
    lb = document.createElement("div");
    lb.id = "cx-lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = '<button class="x" aria-label="Close">' + I.x + '</button><button class="lb-p" aria-label="Previous photo">' + I.l +
      '</button><img alt=""><button class="lb-n" aria-label="Next photo">' + I.r + '</button><span class="n"></span>';
    document.body.appendChild(lb);
    lbImg = $("img", lb); lbN = $(".n", lb);
    $(".x", lb).onclick = closeLb;
    $(".lb-p", lb).onclick = function (e) { e.stopPropagation(); showLb(lbIdx - 1); };
    $(".lb-n", lb).onclick = function (e) { e.stopPropagation(); showLb(lbIdx + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1));
    });
    window.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") showLb(lbIdx + 1);
      if (e.key === "ArrowLeft") showLb(lbIdx - 1);
    });
  }
  function showLb(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src; lbImg.alt = lbList[lbIdx].alt;
    lbN.textContent = (lbIdx + 1) + " / " + lbList.length;
  }
  function openLb(list, i, onClose) {
    buildLb(); lbList = list; lbOnClose = onClose; showLb(i);
    lb.classList.add("on"); document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("on"); document.body.style.overflow = "";
    if (lbOnClose) lbOnClose(lbIdx);
  }

  $$("[data-gallery]").forEach(function (g) {
    var track = $(".cx-track", g), slides = $$(".cx-slide", g), thumbs = $$(".cx-thumb", g);
    var count = $(".cx-cnt", g), idx = 0, tick = false;
    var imgs = slides.map(function (s) { var im = $("img", s); return { src: im.getAttribute("data-full") || im.src, alt: im.alt }; });
    function setIdx(i) {
      idx = i; if (count) count.textContent = (i + 1) + " / " + slides.length;
      thumbs.forEach(function (t, k) { t.setAttribute("aria-current", k === i ? "true" : "false"); });
      var t = thumbs[i];
      if (t && t.parentNode.scrollWidth > t.parentNode.clientWidth) {
        t.parentNode.scrollTo({ left: t.offsetLeft - (t.parentNode.clientWidth - t.clientWidth) / 2, behavior: "smooth" });
      }
    }
    function go(i, smooth) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: smooth === false ? "auto" : "smooth" });
      if (smooth === false) setIdx(i);
    }
    track.addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var i = Math.round(track.scrollLeft / (track.clientWidth || 1));
        if (i !== idx && i >= 0 && i < slides.length) setIdx(i);
      });
    }, { passive: true });
    var p = $(".cx-prev", g), n = $(".cx-next", g);
    if (p) p.addEventListener("click", function () { go(idx - 1); });
    if (n) n.addEventListener("click", function () { go(idx + 1); });
    thumbs.forEach(function (t, k) { t.addEventListener("click", function () { go(k); }); });
    slides.forEach(function (s, k) {
      s.addEventListener("click", function () { openLb(imgs, k, function (j) { go(j, false); }); });
    });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    });
    window.addEventListener("resize", function () { go(idx, false); });
    setIdx(0);
  });

  /* ---------- share ---------- */
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      var done = function () { var o = b.innerHTML; b.querySelector("span").textContent = "Link copied!"; setTimeout(function () { b.innerHTML = o; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
    });
  });

  /* ---------- listing: filter + sort ---------- */
  var grid = $("[data-grid]");
  if (grid && $("[data-filter]")) {
    var cards = $$(".cx-card", grid), state = { f: "all", s: "default" }, label = $("#cx-count");
    var orig = cards.slice();
    function apply() {
      var list = orig.slice();
      if (state.s === "plow") list.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
      if (state.s === "phigh") list.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
      if (state.s === "year") list.sort(function (a, b) { return b.dataset.year - a.dataset.year; });
      var shown = 0;
      list.forEach(function (c) {
        var ok = state.f === "all" || c.dataset.fuel === state.f;
        c.hidden = !ok; if (ok) shown++; grid.appendChild(c);
      });
      if (label) label.innerHTML = "<b>" + shown + "</b> car" + (shown === 1 ? "" : "s") + " available";
    }
    $$("[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.f = b.getAttribute("data-filter");
        $$("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    var sel = $("#cx-sort");
    if (sel) sel.addEventListener("change", function () { state.s = sel.value; apply(); });
  }

  /* ---------- REVIEWS (15) ---------- */
  var REVIEWS = [
    ["Rahul Verma", "Khalilabad", 5, "Gaadi photos jaisi hi nikli. Papers sab clear the aur deal mein koi chakkar nahi hua."],
    ["Amit Yadav", "Basti", 5, "CNG gaadi li, mileage ekdum badhiya hai. Staff ne har cheez dhang se samjhayi."],
    ["Sunil Chaudhary", "Maghar", 4, "Rate sahi laga aur gaadi ki condition achhi thi. Service history bhi dikhayi gayi."],
    ["Priya Singh", "Gorakhpur", 5, "Family ke liye badi gaadi dhoondh rahe the, yahin mil gayi. Bahut smooth experience raha."],
    ["Mohd. Arif", "Khalilabad", 5, "Insurance aur transfer ka kaam unhone khud sambhal liya, humein bhaag-daud nahi karni padi."],
    ["Deepak Mishra", "Sant Kabir Nagar", 5, "Finance ki baat saaf bhasha mein samjhayi, EMI ka poora hisaab pehle hi bata diya."],
    ["Vikas Gupta", "Bakhira", 4, "Gaadi chala kar dekhne ke baad hi li. Har sawal ka seedha jawab mila."],
    ["Neha Pandey", "Basti", 5, "Pehli baar used car li thi, thoda darr tha, par yahan bharosa mila. Zaroor aaiye."],
    ["Ramesh Prajapati", "Mehdawal", 5, "Purani gaadi becheni thi, sahi daam mila aur payment bhi usi din ho gaya."],
    ["Imran Ansari", "Khalilabad", 5, "Gaadi ki saari detail pehle hi WhatsApp par mil gayi, aane se pehle sab clear tha."],
    ["Sandeep Tripathi", "Gorakhpur", 4, "Budget mein achhi gaadi mili. Thodi bargaining ke baad reasonable rate lag gaya."],
    ["Anjali Verma", "Khalilabad", 5, "Staff ka vyavhar bahut achha hai, kisi tarah ka pressure nahi daala gaya."],
    ["Pawan Kumar", "Maghar", 5, "Delivery time par mili aur RC transfer ka kaam bhi samay par ho gaya."],
    ["Shahid Khan", "Basti", 4, "Tyre aur battery sab check karke di. Bharose layak dealer hai."],
    ["Manoj Srivastava", "Sant Kabir Nagar", 5, "Dost ke kehne par aaya tha, ab main bhi sabko yahi bata raha hoon."]
  ];
  var COLORS = ["#e8590c", "#1c64f2", "#0e9f6e", "#7e3af2", "#d61f69", "#0891b2", "#c27803", "#374151"];
  $$("[data-reviews]").forEach(function (box) {
    var cards = REVIEWS.map(function (r, i) {
      var stars = "";
      for (var k = 0; k < 5; k++) stars += k < r[2] ? I.star : I.star.replace('class="cx-i"', 'class="cx-i off"');
      return '<article class="cx-rcard"><span class="q" aria-hidden="true">\u201D</span>' +
        '<div class="cx-stars" role="img" aria-label="' + r[2] + ' out of 5 stars">' + stars + '</div>' +
        '<p>\u201C' + r[3] + '\u201D</p>' +
        '<div class="cx-who"><span class="cx-av" style="background:' + COLORS[i % COLORS.length] + '" aria-hidden="true">' + r[0].charAt(0) + '</span>' +
        '<span><b>' + r[0] + '</b><small>' + I.pin + r[1] + '</small></span></div></article>';
    }).join("");
    box.innerHTML =
      '<div class="cx-rev-head"><div><p class="cx-eyebrow">Customer reviews</p><h2 class="cx-h">Hamare customers kya kehte hain</h2></div>' +
      '<div class="cx-rev-ctl"><button type="button" data-rp aria-label="Previous review">' + I.l + '</button><button type="button" data-rn aria-label="Next review">' + I.r + '</button></div></div>' +
      '<div class="cx-rev-track">' + cards + '</div><div class="cx-bar"><i></i></div>' +
      '<p class="cx-note">Illustrative examples only \u2014 not verified customer reviews.</p>';
    var track = $(".cx-rev-track", box), bar = $(".cx-bar i", box), paused = false, visible = true;
    function step() { var c = $(".cx-rcard", track); return c ? c.offsetWidth + 16 : 300; }
    function prog() { bar.style.width = Math.max(8, (track.scrollLeft + track.clientWidth) / track.scrollWidth * 100) + "%"; }
    function next() {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: step(), behavior: "smooth" });
    }
    function prev() {
      if (track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      else track.scrollBy({ left: -step(), behavior: "smooth" });
    }
    $("[data-rn]", box).onclick = next; $("[data-rp]", box).onclick = prev;
    track.addEventListener("scroll", prog, { passive: true }); prog();
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { box.addEventListener(ev, function () { setTimeout(function () { paused = false; }, 2500); }, { passive: true }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(box);
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setInterval(function () { if (!paused && visible) next(); }, 4500);
  });
})();
