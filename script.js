(function () {
  "use strict";

  var WA_BASE = "https://wa.me/" + ((window.CMS_SITE && window.CMS_SITE.whatsapp) || "917068306702");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function openWhatsApp(message) {
    window.open(WA_BASE + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  }

  /* ---------- scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero slideshow ---------- */
  var slides = $$(".hero-slide");
  var dots = $$("[data-dot]");
  var counter = $("#slide-counter");
  var slide = 0;
  slides.forEach(function (img) { img.style.transition = "opacity .85s ease, transform 5.8s linear"; });
  function showSlide(n) {
    slide = n;
    slides.forEach(function (img, i) {
      img.style.opacity = i === n ? "1" : "0";
      img.style.transform = i === n ? "scale(1.035)" : "scale(1)";
    });
    dots.forEach(function (d, i) { d.setAttribute("aria-pressed", i === n ? "true" : "false"); });
    if (counter) counter.textContent = "0" + (n + 1) + " / 04";
  }
  dots.forEach(function (d) {
    d.addEventListener("click", function () { showSlide(Number(d.getAttribute("data-dot"))); });
  });
  if (slides.length) setInterval(function () { showSlide((slide + 1) % slides.length); }, 5600);

  /* ---------- WhatsApp buttons ---------- */
  $$("[data-enquire]").forEach(function (b) {
    b.addEventListener("click", function () {
      openWhatsApp("Namaste Mangalam Motor Car Bazar, mujhe " + b.getAttribute("data-enquire") + " ke baare mein jaankari chahiye.");
    });
  });
  $$("[data-wa]").forEach(function (b) {
    b.addEventListener("click", function () { openWhatsApp(b.getAttribute("data-wa")); });
  });

  /* ---------- quick car search ---------- */
  var searchForm = $("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = searchForm.elements;
      openWhatsApp("Namaste, gaadi dhoondhne mein madad chahiye. Make: " + f.brand.value + "; budget: " + f.budget.value +
        "; fuel: " + f.fuel.value + ". Kripya available options batayein.");
    });
  }

  /* ---------- EMI calculator ---------- */
  var amountEl = $("#amount"), rateEl = $("#rate"), monthsEl = $("#months");
  var amountOut = $("#amount-out"), emiOut = $("#emi-out");
  function inr(n) { return Number(n).toLocaleString("en-IN"); }
  function updateEmi() {
    var amount = Number(amountEl.value);
    var rate = Number(rateEl.value) || 0;
    var months = Number(monthsEl.value);
    var r = rate / 1200;
    var emi = r === 0 ? amount / months : amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    amountOut.textContent = "₹" + inr(amount);
    emiOut.textContent = "₹" + inr(Math.round(emi));
  }
  if (amountEl) {
    amountEl.addEventListener("input", updateEmi);
    monthsEl.addEventListener("change", updateEmi);
    rateEl.addEventListener("input", function () {
      var v = Math.max(0, Math.min(30, Number(rateEl.value)));
      if (rateEl.value !== "" && Number(rateEl.value) !== v) rateEl.value = v;
      updateEmi();
    });
    updateEmi();
  }

  /* ---------- reviews ---------- */
  var reviews = [
    { quote: "Gaadi dekhne se lekar documents tak, sab baat dhang se samajh aa gayi.", name: "Car buyer", area: "Khalilabad" },
    { quote: "Apni car ki details share ki aur seedha options par baat ho gayi.", name: "Car seller", area: "Sant Kabir Nagar" },
    { quote: "Finance aur EMI ke baare mein aasaan bhasha mein jaankari mili.", name: "Local customer", area: "Khalilabad" }
  ];
  var reviewIndex = 0;
  var rDots = $$("[data-review-dot]");
  function showReview(i) {
    reviewIndex = (i + reviews.length) % reviews.length;
    var r = reviews[reviewIndex];
    $("#review-quote").textContent = "\u201C" + r.quote + "\u201D";
    $("#review-name").textContent = r.name;
    $("#review-area").textContent = r.area + " \u00B7 udaharan ke liye";
    rDots.forEach(function (d, k) { d.setAttribute("aria-pressed", k === reviewIndex ? "true" : "false"); });
  }
  if ($("#review-prev")) {
    $("#review-prev").addEventListener("click", function () { showReview(reviewIndex - 1); });
    $("#review-next").addEventListener("click", function () { showReview(reviewIndex + 1); });
    rDots.forEach(function (d) {
      d.addEventListener("click", function () { showReview(Number(d.getAttribute("data-review-dot"))); });
    });
  }

  /* ---------- contact form -> WhatsApp ---------- */
  var contactForm = $("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = contactForm.elements;
      openWhatsApp("Namaste, mera naam " + f.name.value.trim() + " hai. Mera phone: " + f.phone.value.trim() + ". " + f.message.value.trim());
    });
  }

  /* ---------- lightbox ---------- */
  var photos = [];
  for (var i = 1; i <= 12; i++) photos.push("images/mangalam-car-" + (i < 10 ? "0" + i : i) + ".jpeg");
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCount = $("#lb-count");
  var current = null;
  if (lb) {
    var openLb = function (i) {
      current = (i + photos.length) % photos.length;
      lbImg.src = photos[current];
      lbImg.alt = "Mangalam Motor Car Bazar photo " + (current + 1) + " of " + photos.length;
      lbCount.textContent = (current + 1) + " / " + photos.length;
      lb.hidden = false;
    };
    var closeLb = function () { lb.hidden = true; current = null; };
    $$("[data-photo]").forEach(function (b) {
      b.addEventListener("click", function () { openLb(Number(b.getAttribute("data-photo"))); });
    });
    lb.addEventListener("click", closeLb);
    $("#lb-inner").addEventListener("click", function (e) { e.stopPropagation(); });
    $("#lb-close").addEventListener("click", closeLb);
    $("#lb-prev").addEventListener("click", function () { openLb(current - 1); });
    $("#lb-next").addEventListener("click", function () { openLb(current + 1); });
    window.addEventListener("keydown", function (e) {
      if (current === null) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") openLb(current + 1);
      if (e.key === "ArrowLeft") openLb(current - 1);
    });
  }

  /* ---------- missing-image fallback ---------- */
  function markMissing(img) {
    img.style.visibility = "hidden";
    if (img.parentElement) img.parentElement.classList.add("img-missing");
  }
  $$("img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    else img.addEventListener("error", function () { markMissing(img); });
  });
})();
