(function () {
  "use strict";
  var AB = window.AB || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  // Footer and shared links
  $$("[data-yt]").forEach(function (a) { a.href = AB.youtube; });
  $$("[data-ig]").forEach(function (a) { a.href = AB.instagram; });
  $$("[data-shop]").forEach(function (a) { a.href = AB.shopBase; });
  $$("[data-phone]").forEach(function (p) {
    var d = String(AB.phone || "").replace(/\D/g, "");
    if (d.length !== 10) return;
    var a = $("a", p);
    a.href = "tel:+1" + d;
    a.textContent = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    p.hidden = false;
  });
  var bar = $(".bar");
  if (bar && !$(".select")) {
    var onScroll = function () { bar.classList.toggle("solid", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  // ---------- Home: character select ----------
  var select = $(".select");
  if (select) {
    var panels = $$(".panel", select);
    var canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // Watch panel: a wall of the newest video thumbnails, three reels drifting.
    var wall = $("[data-mosaic]", select);
    if (wall) {
      var vl = (AB.videos || []).slice(0, 10);
      for (var c = 0; c < 3 && vl.length; c++) {
        var col = el("div", { class: "reel" });
        var order = vl.slice((c * 3) % vl.length).concat(vl.slice(0, (c * 3) % vl.length));
        order.concat(order).forEach(function (v) {
          col.appendChild(el("img", { src: "img/yt-" + v.id + ".jpg", alt: "" }));
        });
        wall.appendChild(col);
      }
    }

    var activate = function (p) {
      panels.forEach(function (x) {
        var on = x === p;
        x.classList.toggle("active", on);
        var v = $("video", x);
        if (!v) return;
        if (on && !reduce) {
          if (!v.src) v.src = v.getAttribute("data-src");
          var pr = v.play();
          if (pr && pr.then) pr.then(function () { v.classList.add("on"); }).catch(function () {});
        } else { v.pause(); }
      });
      select.classList.toggle("has-active", !!p);
    };

    panels.forEach(function (p) {
      if (canHover) {
        p.addEventListener("mouseenter", function () { activate(p); });
      } else {
        // Phone: first tap opens the band, second tap goes in.
        p.addEventListener("click", function (e) {
          if (!p.classList.contains("active")) { e.preventDefault(); activate(p); }
        });
      }
      // Keyboard on a computer: tabbing to a panel opens it. On touch, a tap
      // also focuses the panel, so focus must not count as the first tap.
      if (canHover) p.addEventListener("focus", function () { activate(p); });
    });
    if (canHover) select.addEventListener("mouseleave", function () { activate(null); });
    // Coming back with the browser's back button: reset the screen.
    window.addEventListener("pageshow", function () { activate(null); });
  }

  // ---------- Watch ----------
  function videoCard(v) {
    var thumb = el("img", { src: "img/yt-" + v.id + ".jpg", alt: "", loading: "lazy" });
    // A film added by hand may not have a saved thumbnail yet: fall back to YouTube's.
    thumb.addEventListener("error", function () {
      if (thumb.getAttribute("data-fb")) { thumb.remove(); return; }
      thumb.setAttribute("data-fb", "1");
      thumb.src = "https://i.ytimg.com/vi/" + encodeURIComponent(v.id) + "/hqdefault.jpg";
    });
    var frame = el("button", { class: "frame", type: "button", "aria-label": "Play " + v.title },
      [thumb, el("span", { class: "play" })]);
    frame.addEventListener("click", function () {
      var f = el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?autoplay=1&rel=0",
        title: v.title, allow: "autoplay; encrypted-media; picture-in-picture; fullscreen", allowfullscreen: ""
      });
      frame.parentNode.replaceChild(el("div", { class: "frame" }, [f]), frame);
    });
    return el("article", { class: "vid" }, [
      frame, el("h3", { text: v.title }),
      el("p", {}, [el("a", { href: "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id), rel: "noopener", text: "Watch on YouTube" })])
    ]);
  }
  [["#videos", "#videos-wrap", AB.videos], ["#films", "#films-wrap", AB.films]].forEach(function (g) {
    var box = $(g[0]), wrap = $(g[1]), list = g[2] || [];
    if (!box) return;
    wrap.hidden = !list.length;
    list.forEach(function (v) { box.appendChild(videoCard(v)); });
  });

  // ---------- Shop ----------
  var grid = $("#products");
  if (grid) {
    (AB.products || []).forEach(function (p) {
      var price = (p.flat ? "$" : "From $") + p.from;
      var card = el("a", { class: "prod", href: AB.shopBase + "/products/" + p.handle, rel: "noopener" }, [
        el("div", { class: "ph" }, [
          el("img", { src: "img/" + p.img + "-1.jpg", alt: p.line + " " + p.name, loading: "lazy" }),
          el("img", { class: "alt", src: "img/" + p.img + "-2.jpg", alt: "", loading: "lazy" })
        ]),
        el("div", { class: "meta" }, [
          el("span", { class: "line", text: p.line }),
          el("h3", { text: p.name }),
          el("span", { class: "opts", text: p.opts }),
          el("div", { class: "row" }, [
            el("span", { class: "price", text: price }),
            el("span", { class: "go", text: "Buy" })
          ])
        ])
      ]);
      grid.appendChild(card);
    });
  }

  // ---------- Hire: request a quote ----------
  var mail = $("[data-mail]"), tel = $("[data-tel]");
  if (mail) {
    var picked = "";
    var setMail = function () {
      var subject = "Quote request" + (picked ? ": " + picked : "");
      var body = "Hi Aidan,\n\nName:\nWhat I need:" + (picked ? " " + picked : "") +
        "\nDate:\nTown or venue:\n\nAnything else:\n";
      mail.href = "mailto:" + (AB.quoteEmail || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var f = $(".for");
      if (f) { f.hidden = !picked; f.textContent = picked ? "Asking about: " + picked : ""; }
    };
    setMail();
    if (tel) {
      var d = String(AB.phone || "").replace(/\D/g, "");
      if (d.length === 10) {
        tel.href = "tel:+1" + d;
        $("span", tel).textContent = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
        tel.hidden = false;
      }
    }
    var quote = $("#quote");
    var still = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    $$("[data-svc]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        picked = a.getAttribute("data-svc");
        $$("[data-svc]").forEach(function (x) { x.classList.toggle("on", x === a); });
        setMail();
        quote.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
        quote.classList.remove("flash"); void quote.offsetWidth; quote.classList.add("flash");
      });
    });
  }
})();
