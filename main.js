(function () {
  "use strict";

  var PHRASES = [
    "calidad que se mide",
    "procesos que se ordenan",
    "tecnología e IA aplicadas",
    "turismo desde La Caldera"
  ];
  var STATUS = { "En línea": "status status-live", "En desarrollo": "status" };
  var MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var WA = "https://wa.me/543874624947";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduced) document.documentElement.classList.add("reduce");
  document.documentElement.classList.add("js");
  if (!reduced && fine) document.documentElement.classList.add("has-cursor");

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null || value === false) return;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else node.setAttribute(key, value);
      });
    }
    for (var i = 2; i < arguments.length; i++) if (arguments[i] != null) node.append(arguments[i]);
    return node;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    var month = parts[1] ? Number(parts[1]) : 0;
    var day = parts[2] ? Number(parts[2]) : 0;
    if (month >= 1 && month <= 12 && day) return day + " de " + MONTHS[month - 1] + " de " + parts[0];
    if (month >= 1 && month <= 12) return MONTHS[month - 1] + " de " + parts[0];
    return parts[0];
  }

  function formatRange(start, end) {
    var from = formatDate(start);
    if (!end) return from ? from + " — Actualidad" : "Actualidad";
    return from + " — " + formatDate(end);
  }

  function formatSpan(start, end) {
    if (start && end) return formatDate(start) + " — " + formatDate(end);
    return formatDate(start || end);
  }

  function splitStatus(value) {
    var match = String(value || "").match(/^(.*?)\s+\((en formación|en curso|finalizada|completado)\)$/i);
    if (!match) return { text: value || "", status: "" };
    return { text: match[1], status: match[2].toLowerCase() };
  }

  function cap(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : ""; }
  function place(location) {
    if (!location) return "";
    return [location.city, location.region, location.countryCode].filter(Boolean).join(", ");
  }
  function host(url) { try { return new URL(url).host.replace(/^www\./, ""); } catch (err) { return "Abrir"; } }
  function profile(list, network) {
    return (list || []).filter(function (item) { return item.network === network; })[0];
  }
  function reveal(node) { node.setAttribute("data-reveal", ""); return node; }

  function linkAttrs(href, download) {
    var attrs = { href: href };
    if (download) attrs.download = download;
    else if (/^https?:/.test(href)) { attrs.target = "_blank"; attrs.rel = "noopener noreferrer"; }
    return attrs;
  }

  function makeButton(href, text, primary, download) {
    var attrs = linkAttrs(href, download);
    attrs.class = primary ? "btn btn-lime" : "btn";
    attrs.text = text;
    return el("a", attrs);
  }

  function fillActions(node, basics, linkedin) {
    if (!node) return;
    if (basics.url) node.append(makeButton(basics.url, "Ver magnami.ar", true));
    if (linkedin && linkedin.url) node.append(makeButton(linkedin.url, "LinkedIn"));
    node.append(makeButton(WA, "WhatsApp"));
    if (basics.email) node.append(makeButton("mailto:" + basics.email, "Email"));
    node.append(makeButton("resume.json", "Ver JSON"));
    node.append(makeButton("resume.json", "Descargar JSON", false, "resume.json"));
  }

  function splitName(text) {
    var h1 = document.getElementById("name");
    h1.textContent = "";
    String(text || "").split(/(\s+)/).forEach(function (part, index) {
      if (!part) return;
      if (!part.trim()) { h1.append(document.createTextNode(part)); return; }
      var word = el("span", { class: "word", text: part });
      word.style.setProperty("--i", String(index));
      h1.append(el("span", { class: "mask" }, word));
    });
  }

  function render(resume) {
    var basics = resume.basics || {};
    var where = place(basics.location);
    var linkedin = profile(basics.profiles, "LinkedIn");
    var github = profile(basics.profiles, "GitHub");

    splitName(basics.name || "");
    document.getElementById("label").textContent = basics.label || "";
    document.getElementById("summary").textContent = basics.summary || "";
    document.getElementById("footer-place").textContent = where;
    if (basics.location && basics.location.city) {
      document.getElementById("perfil-title").textContent = "Trabajo desde " + basics.location.city + ".";
    }
    if (basics.location && basics.location.city) document.getElementById("field-label").textContent = basics.location.city;

    fillActions(document.getElementById("actions"), basics, linkedin);
    fillActions(document.getElementById("footer-actions"), basics, linkedin);

    var spec = document.getElementById("spec");
    function fact(term, value, href) {
      var dd = el("dd");
      if (href) {
        var attrs = linkAttrs(href);
        attrs.text = value;
        dd.append(el("a", attrs));
      } else dd.textContent = value;
      spec.append(el("div", null, el("dt", { text: term }), dd));
    }
    if (where) fact("lugar", where);
    if (basics.email) fact("email", basics.email, "mailto:" + basics.email);
    if (basics.phone) fact("tel", basics.phone, "tel:" + String(basics.phone).replace(/[^\d+]/g, ""));
    if (basics.url) fact("web", host(basics.url), basics.url);
    if (github) fact("github", github.username || "GitHub", github.url);
    if (linkedin) fact("linkedin", linkedin.username || "LinkedIn", linkedin.url);
    fact("whatsapp", "+54 387 462 4947", WA);
    if (resume.meta && resume.meta.lastModified) fact("documento", formatDate(String(resume.meta.lastModified).slice(0, 10)));

    var keywords = [];
    (resume.skills || []).forEach(function (skill) {
      (skill.keywords || []).forEach(function (word) { keywords.push(word); });
    });
    var track = document.getElementById("marquee");
    for (var copy = 0; copy < 2; copy++) {
      var group = el("div");
      keywords.forEach(function (word) {
        group.append(el("span", { text: word }));
        group.append(el("i"));
      });
      track.append(group);
    }

    var projects = document.getElementById("projects");
    var filters = document.getElementById("filters");
    var present = {};
    (resume.projects || []).forEach(function (project) {
      (project.keywords || []).forEach(function (word) { if (STATUS[word]) present[word] = true; });
    });
    var chips = [];
    function addChip(label, value) {
      var chip = el("button", { class: "chip", type: "button", text: label, "aria-pressed": value === "*" ? "true" : "false" });
      chip.dataset.filter = value;
      chips.push(chip);
      filters.append(chip);
    }
    addChip("Todos", "*");
    Object.keys(STATUS).forEach(function (word) { if (present[word]) addChip(word, word); });

    (resume.projects || []).forEach(function (project, index) {
      var words = project.keywords || [];
      var card = el("article", { class: "card" });
      card.dataset.tags = words.join("|");
      var top = el("div", { class: "card-top" });
      var status = words.filter(function (word) { return STATUS[word]; })[0];
      top.append(status ? el("span", { class: STATUS[status], text: status }) : el("span"));
      top.append(el("span", { class: "idx", text: String(index + 1).padStart(2, "0") }));
      card.append(top);
      card.append(el("h3", { text: project.name || "" }));
      if (project.description) card.append(el("p", { text: project.description }));
      var extra = words.filter(function (word) { return !STATUS[word]; });
      if (extra.length) card.append(el("p", { class: "entity", text: extra.join(" · ") }));
      if (project.entity) card.append(el("p", { class: "entity", text: project.entity }));
      if (project.url) {
        var attrs = linkAttrs(project.url);
        attrs.text = host(project.url) + " →";
        card.append(el("a", attrs));
      }
      projects.append(reveal(card));
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.dataset.filter;
        chips.forEach(function (other) { other.setAttribute("aria-pressed", other === chip ? "true" : "false"); });
        projects.querySelectorAll(".card").forEach(function (card) {
          var tags = (card.dataset.tags || "").split("|");
          card.classList.toggle("is-dim", value !== "*" && tags.indexOf(value) === -1);
        });
      });
    });

    if (!reduced && fine) {
      projects.querySelectorAll(".card").forEach(function (card) {
        card.addEventListener("mousemove", function (event) {
          var rect = card.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
          card.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
        });
        card.addEventListener("mouseleave", function () {
          card.style.setProperty("--ry", "0deg");
          card.style.setProperty("--rx", "0deg");
        });
      });
    }

    var work = document.getElementById("work");
    (resume.work || []).forEach(function (job, index) {
      var article = el("article", { class: "job" });
      article.id = "job-" + index;
      var node = el("button", { class: "node", type: "button", "aria-label": "Resaltar " + (job.name || "este tramo") });
      var side = el("div");
      side.append(el("p", { class: "when", text: formatRange(job.startDate, job.endDate) }));
      if (job.location) side.append(el("p", { class: "muted", text: job.location }));
      var body = el("div");
      body.append(el("h3", { text: job.name || "" }));
      if (job.position) body.append(el("p", { class: "role", text: job.position }));
      if (job.summary) body.append(el("p", { text: job.summary }));
      if (job.highlights && job.highlights.length) {
        var list = el("ul");
        job.highlights.forEach(function (item) { list.append(el("li", { text: item })); });
        body.append(list);
      }
      if (job.url) {
        var urlAttrs = linkAttrs(job.url);
        urlAttrs.text = host(job.url);
        body.append(el("a", urlAttrs));
      }
      article.append(node, side, body);
      node.addEventListener("click", function () {
        var pinned = article.classList.contains("is-pinned");
        work.querySelectorAll(".job").forEach(function (item) { item.classList.remove("is-pinned"); });
        if (!pinned) {
          article.classList.add("is-pinned", "is-active");
          article.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        }
      });
      work.append(reveal(article));
    });

    var skills = document.getElementById("skills");
    (resume.skills || []).forEach(function (skill) {
      var card = el("article", { class: "group" });
      card.append(el("h3", { text: skill.name || "" }));
      var tags = el("div", { class: "tags" });
      (skill.keywords || []).forEach(function (word) { tags.append(el("span", { class: "tag", text: word })); });
      card.append(tags);
      skills.append(reveal(card));
    });

    (resume.education || []).forEach(function (item) {
      var parsed = splitStatus(item.studyType);
      var article = el("article", { class: "item" });
      if (parsed.status) article.append(el("p", { class: "badge", text: cap(parsed.status) }));
      article.append(el("h3", { text: item.institution || "" }));
      if (item.area) article.append(el("p", { text: item.area }));
      if (parsed.text) article.append(el("p", { class: "muted", text: parsed.text }));
      var span = formatSpan(item.startDate, item.endDate);
      if (span) article.append(el("p", { class: "muted", text: span }));
      document.getElementById("education").append(reveal(article));
    });

    (resume.certificates || []).forEach(function (item) {
      var parsed = splitStatus(item.name);
      var article = el("article", { class: "item" });
      if (parsed.status) article.append(el("p", { class: "badge", text: cap(parsed.status) }));
      article.append(el("h3", { text: parsed.text }));
      document.getElementById("certificates").append(reveal(article));
    });

    (resume.languages || []).forEach(function (language) {
      var row = el("div", { class: "item lang" });
      row.append(el("h3", { text: language.language || "" }));
      if (language.fluency) row.append(el("span", { class: "muted", text: language.fluency }));
      document.getElementById("languages").append(reveal(row));
    });

    (resume.interests || []).forEach(function (interest) {
      var article = el("article", { class: "item" });
      article.append(el("h3", { text: interest.name || "" }));
      if (interest.keywords && interest.keywords.length) article.append(el("p", { class: "muted", text: interest.keywords.join(" · ") }));
      document.getElementById("interests").append(reveal(article));
    });

    bindReveal();
    bindTimeline();
    bindSpy();
  }

  function bindReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("is-in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function bindTimeline() {
    var jobs = document.querySelectorAll(".job");
    if (!jobs.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (document.querySelector(".job.is-pinned")) return;
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    jobs.forEach(function (job) { observer.observe(job); });
  }

  function bindSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".menu a[href^='#']"));
    var sections = links.map(function (link) { return document.querySelector(link.getAttribute("href")); }).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function startTyping() {
    var node = document.getElementById("typed");
    if (reduced) {
      node.textContent = PHRASES.join("  ·  ");
      return;
    }
    var phrase = 0;
    var char = 0;
    var deleting = false;
    function tick() {
      var text = PHRASES[phrase];
      if (!deleting) {
        char += 1;
        node.textContent = text.slice(0, char);
        if (char >= text.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
        setTimeout(tick, 42);
        return;
      }
      char -= 1;
      node.textContent = text.slice(0, char);
      if (char <= 0) {
        deleting = false;
        phrase = (phrase + 1) % PHRASES.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 22);
    }
    tick();
  }

  function startField() {
    var canvas = document.getElementById("plot");
    var wrap = document.getElementById("field");
    if (!canvas || !wrap) return;
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var running = true;

    function resize() {
      var rect = wrap.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time) {
      var t = reduced ? 1.1 : time * 0.00028;
      var scroll = window.scrollY * 0.0022;
      var mobile = width < 520;
      var step = mobile ? 12 : 8;
      var band = mobile ? 16 : 13;
      ctx.clearRect(0, 0, width, height);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      var bands = Math.ceil(height / band) + 8;
      for (var b = -3; b < bands; b++) {
        ctx.beginPath();
        var major = ((b % 4) + 4) % 4 === 0;
        for (var x = -step; x <= width + step; x += step) {
          var nx = x / Math.max(width, 1);
          var pull = Math.exp(-Math.pow((x - pointer.x) / (mobile ? 78 : 120), 2));
          var y = b * band
            + Math.sin(nx * 9.4 + b * 0.46 + t + scroll) * (7 + (Math.abs(b) % 4) * 1.6)
            + Math.cos(nx * 3.6 - t * 0.55 + b * 0.18) * 4.5
            - pull * (mobile ? 14 : 20) * Math.sin(b * 0.62 + t);
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = major ? "rgba(17,17,17,0.78)" : "rgba(90,104,112,0.4)";
        ctx.lineWidth = major ? 1.25 : 0.7;
        ctx.stroke();
      }
      var gap = mobile ? 24 : 18;
      var rows = Math.ceil(height / gap) + 1;
      var cols = Math.ceil(width / gap) + 1;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var dx = c * gap + 4;
          var dy = r * gap + 6 + Math.sin(c * 0.5 + t + scroll) * 3.5;
          var dist = Math.hypot(dx - pointer.x, dy - pointer.y);
          var near = dist < (mobile ? 72 : 108);
          ctx.beginPath();
          ctx.arc(dx, dy, near ? 2.5 : 1.05, 0, Math.PI * 2);
          ctx.fillStyle = near ? "#c6ef22" : "rgba(17,17,17,0.42)";
          ctx.fill();
        }
      }
    }

    var pointer = { x: 0, y: 0, moved: false };
    function placePointer() {
      if (!pointer.moved) {
        pointer.x = width * 0.62;
        pointer.y = height * 0.38;
      }
    }
    wrap.addEventListener("pointermove", function (event) {
      var rect = wrap.getBoundingClientRect();
      pointer.moved = true;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });

    resize();
    placePointer();
    window.addEventListener("resize", function () { resize(); placePointer(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); placePointer(); }).observe(wrap);

    if (reduced) {
      draw(0);
      return;
    }
    var seen = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        seen = entries[0].isIntersecting;
      }).observe(wrap);
    }
    function frame(time) {
      if (running && seen && !document.hidden) draw(time);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function startCursor() {
    if (reduced || !fine) return;
    var node = document.getElementById("cursor");
    var tx = 0;
    var ty = 0;
    var x = 0;
    var y = 0;
    var seen = false;
    node.style.opacity = "0";
    window.addEventListener("pointermove", function (event) {
      seen = true;
      node.style.opacity = "1";
      tx = event.clientX;
      ty = event.clientY;
      if (!x && !y) { x = tx; y = ty; }
    }, { passive: true });
    function frame() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      node.style.left = x + "px";
      node.style.top = y + "px";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function startScroll() {
    var bar = document.getElementById("progress");
    var fill = document.getElementById("rail-fill");
    var timeline = document.getElementById("timeline");
    function onScroll() {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var progress = height > 0 ? window.scrollY / height : 0;
      bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, progress)) + ")";
      if (timeline && fill) {
        var rect = timeline.getBoundingClientRect();
        var seen = Math.min(rect.height, Math.max(0, window.innerHeight * 0.62 - rect.top));
        var ratio = rect.height ? seen / rect.height : 0;
        fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, ratio)) + ")";
      }
      document.getElementById("top").classList.toggle("is-stuck", window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function startNav() {
    var toggle = document.querySelector(".toggle");
    var menu = document.getElementById("menu");
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  startNav();
  startTyping();
  startField();
  startCursor();
  startScroll();

  fetch("resume.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("fail");
      return response.json();
    })
    .then(render)
    .catch(function () {
      document.getElementById("summary").textContent = "No se pudo cargar resume.json. Abrí la página desde un servidor o desde GitHub Pages.";
    });
})();
