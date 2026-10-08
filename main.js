(function () {
  "use strict";

  var STATUS = {
    "En línea": "tag tag-live",
    "En desarrollo": "tag tag-wip"
  };

  var MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, attrs) {
    var node = document.createElement(tag);
    var key;
    var value;
    if (attrs) {
      for (key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
        value = attrs[key];
        if (value == null || value === false) continue;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else node.setAttribute(key, value);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      if (arguments[i] != null) node.append(arguments[i]);
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    var year = parts[0];
    var month = parts[1] ? Number(parts[1]) : 0;
    var day = parts[2] ? Number(parts[2]) : 0;
    if (month >= 1 && month <= 12 && day) {
      return day + " de " + MONTHS[month - 1] + " de " + year;
    }
    if (month >= 1 && month <= 12) return MONTHS[month - 1] + " de " + year;
    return year;
  }

  function formatRange(start, end) {
    var from = formatDate(start);
    if (!end) return from ? from + " — Actualidad" : "Actualidad";
    return from + " — " + formatDate(end);
  }

  function splitStatus(value) {
    var match = String(value || "").match(/^(.*?)\s+\((en formación|en curso|finalizada|completado)\)$/i);
    if (!match) return { text: value || "", status: "" };
    return { text: match[1], status: match[2].toLowerCase() };
  }

  function statusBadge(status) {
    if (!status) return null;
    var label = status.charAt(0).toUpperCase() + status.slice(1);
    var kind = "badge";
    if (status === "en curso" || status === "en formación") kind += " badge-course";
    if (status === "completado" || status === "finalizada") kind += " badge-done";
    return el("span", { class: kind, text: label });
  }

  function hostLabel(url) {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch (err) {
      return "Abrir";
    }
  }

  function place(location) {
    if (!location) return "";
    return [location.city, location.region, location.countryCode].filter(Boolean).join(", ");
  }

  function telHref(phone) {
    var digits = String(phone || "").replace(/[^\d+]/g, "");
    return digits ? "tel:" + digits : "";
  }

  function reveal(node, delay) {
    node.setAttribute("data-reveal", "");
    if (delay) node.style.setProperty("--d", String(delay));
    return node;
  }

  function renderHero(resume) {
    var basics = resume.basics || {};
    var name = document.getElementById("hero-name");
    var label = document.getElementById("hero-label");
    var summary = document.getElementById("hero-summary");
    var kicker = document.getElementById("hero-kicker");
    var location = place(basics.location);

    if (basics.name) name.textContent = basics.name;
    if (basics.label) label.textContent = basics.label;
    summary.textContent = basics.summary || "";

    if (location) {
      clear(kicker);
      kicker.append(el("span", { text: "Carta de presentación · " + location }));
      document.getElementById("ficha-lugar").textContent = location;
      document.getElementById("footer-place").textContent = location;
    }

    var mail = document.getElementById("link-mail");
    var web = document.getElementById("link-web");
    if (basics.email) {
      mail.setAttribute("href", "mailto:" + basics.email);
      var mailLink = el("a", { href: "mailto:" + basics.email, text: basics.email });
      var mailDd = document.getElementById("ficha-correo");
      clear(mailDd);
      mailDd.append(mailLink);
    }
    if (basics.url) web.setAttribute("href", basics.url);

    var phone = basics.phone || "";
    if (phone) {
      var phoneDd = document.getElementById("ficha-tel");
      clear(phoneDd);
      phoneDd.append(el("a", { href: telHref(phone), text: phone }));
    }

    var profiles = basics.profiles || [];
    profiles.forEach(function (profile) {
      if (profile.network === "LinkedIn" && profile.url) {
        document.getElementById("link-in").setAttribute("href", profile.url);
      }
    });

    if (resume.meta && resume.meta.lastModified) {
      var updated = document.getElementById("updated");
      updated.hidden = false;
      updated.textContent = "Documento actualizado el " + formatDate(resume.meta.lastModified.slice(0, 10));
    }

    var data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: basics.name,
      jobTitle: basics.label,
      email: basics.email,
      telephone: basics.phone,
      url: basics.url
    };
    if (basics.location) {
      data.address = {
        "@type": "PostalAddress",
        addressLocality: basics.location.city,
        addressRegion: basics.location.region,
        addressCountry: basics.location.countryCode
      };
    }
    data.sameAs = profiles.map(function (profile) { return profile.url; }).filter(Boolean);
    var current = (resume.work || []).find(function (job) { return job.startDate && !job.endDate; });
    if (current) data.worksFor = { "@type": "Organization", name: current.name, url: current.url };
    var script = document.getElementById("person-jsonld");
    if (script) script.textContent = JSON.stringify(data);
  }

  function renderProjects(projects) {
    var grid = document.getElementById("project-grid");
    var filters = document.getElementById("project-filters");
    clear(grid);
    clear(filters);
    if (!projects || !projects.length) return;

    var present = {};
    projects.forEach(function (project) {
      (project.keywords || []).forEach(function (word) {
        if (STATUS[word]) present[word] = true;
      });
    });

    var buttons = [];
    function addChip(label, value) {
      var chip = el("button", {
        class: "chip",
        type: "button",
        text: label,
        "aria-pressed": value === "all" ? "true" : "false"
      });
      chip.dataset.filter = value;
      buttons.push(chip);
      filters.append(chip);
    }

    addChip("Todos", "all");
    Object.keys(STATUS).forEach(function (word) {
      if (present[word]) addChip(word, word);
    });

    projects.forEach(function (project, index) {
      var keywords = project.keywords || [];
      var badges = el("div", { class: "card-top" });
      var pills = el("div", { class: "pills" });
      var hasBadge = false;
      var hasPill = false;

      keywords.forEach(function (word) {
        if (STATUS[word]) {
          hasBadge = true;
          badges.append(el("span", { class: STATUS[word], text: word }));
        } else {
          hasPill = true;
          pills.append(el("span", { class: "tag", text: word }));
        }
      });

      var card = el("article", { class: "card project-card" });
      card.dataset.tags = keywords.join("|");
      if (hasBadge) card.append(badges);
      card.append(el("h3", { text: project.name || "" }));
      if (project.description) card.append(el("p", { text: project.description }));
      if (hasPill) card.append(pills);

      var meta = el("div", { class: "card-meta" });
      if (project.entity) meta.append(el("span", { class: "entity", text: project.entity }));
      if (project.url) {
        meta.append(el("a", {
          class: "card-link",
          href: project.url,
          target: "_blank",
          rel: "noopener noreferrer"
        }, document.createTextNode(hostLabel(project.url) + " "), el("span", { text: "→", "aria-hidden": "true" })));
      }
      card.append(meta);
      grid.append(reveal(card, index));
    });

    var status = document.getElementById("filter-status");
    buttons.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.dataset.filter;
        buttons.forEach(function (other) {
          other.setAttribute("aria-pressed", other === chip ? "true" : "false");
        });
        var cards = grid.querySelectorAll(".project-card");
        cards.forEach(function (card) {
          var tags = (card.dataset.tags || "").split("|");
          var match = value === "all" || tags.indexOf(value) !== -1;
          card.classList.toggle("is-dim", !match);
        });
        status.textContent = value === "all" ? "Mostrando todos los proyectos." : "Filtrando proyectos: " + value + ".";
      });
    });
  }

  function renderWork(jobs) {
    var list = document.getElementById("work-list");
    clear(list);
    (jobs || []).forEach(function (job, index) {
      var article = el("article", { class: "job" });
      article.append(el("p", { class: "when", text: formatRange(job.startDate, job.endDate) }));
      article.append(el("h3", { text: job.name || "" }));
      if (job.position) article.append(el("p", { class: "role", text: job.position }));
      if (job.location) article.append(el("p", { class: "where", text: job.location }));
      if (job.summary) article.append(el("p", { class: "summary", text: job.summary }));
      if (job.highlights && job.highlights.length) {
        var ul = el("ul");
        job.highlights.forEach(function (item) {
          ul.append(el("li", { text: item }));
        });
        article.append(ul);
      }
      if (job.url) {
        article.append(el("a", {
          class: "job-link",
          href: job.url,
          target: "_blank",
          rel: "noopener noreferrer",
          text: hostLabel(job.url)
        }));
      }
      list.append(reveal(article, index));
    });
  }

  function renderSkills(skills) {
    var grid = document.getElementById("skill-grid");
    clear(grid);
    (skills || []).forEach(function (skill, index) {
      var card = el("article", { class: "skill-card" });
      card.append(el("h3", { text: skill.name || "" }));
      var pills = el("div", { class: "pills" });
      (skill.keywords || []).forEach(function (word) {
        pills.append(el("span", { class: "pill", text: word }));
      });
      card.append(pills);
      grid.append(reveal(card, index));
    });
  }

  function renderEducation(items) {
    var list = document.getElementById("education-list");
    clear(list);
    (items || []).forEach(function (item, index) {
      var parsed = splitStatus(item.studyType);
      var card = el("article", { class: "item" });
      var badge = statusBadge(parsed.status);
      if (badge) card.append(badge);
      card.append(el("h3", { text: item.institution || "" }));
      if (item.area) card.append(el("p", { class: "area", text: item.area }));
      if (parsed.text) card.append(el("p", { class: "meta", text: parsed.text }));
      if (item.startDate || item.endDate) {
        var range = item.endDate
          ? formatDate(item.startDate) + " — " + formatDate(item.endDate)
          : formatDate(item.startDate);
        card.append(el("p", { class: "meta", text: range }));
      }
      list.append(reveal(card, index));
    });
  }

  function renderCertificates(items) {
    var list = document.getElementById("certificate-list");
    clear(list);
    (items || []).forEach(function (item, index) {
      var parsed = splitStatus(item.name);
      var card = el("article", { class: "item" });
      var badge = statusBadge(parsed.status);
      if (badge) card.append(badge);
      card.append(el("h3", { text: parsed.text }));
      if (item.issuer) card.append(el("p", { class: "meta", text: item.issuer }));
      if (item.date) card.append(el("p", { class: "meta", text: formatDate(item.date) }));
      list.append(reveal(card, index));
    });
  }

  function renderLanguages(languages) {
    var list = document.getElementById("language-list");
    clear(list);
    (languages || []).forEach(function (language, index) {
      var card = el("article", { class: "item" });
      var row = el("div", { class: "lang" });
      row.append(el("b", { text: language.language || "" }));
      if (language.fluency) row.append(el("span", { text: language.fluency }));
      card.append(row);
      list.append(reveal(card, index));
    });
  }

  function renderInterests(interests) {
    var list = document.getElementById("interest-list");
    clear(list);
    (interests || []).forEach(function (interest, index) {
      var card = el("article", { class: "item" });
      var keywords = (interest.keywords || []).join(" · ");
      card.append(el("h3", { text: interest.name || "" }));
      if (keywords) card.append(el("p", { class: "area", text: keywords }));
      list.append(reveal(card, index));
    });
  }

  function bindNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    var header = document.querySelector(".nav");

    function close() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });

    window.addEventListener("scroll", function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var progress = height > 0 ? window.scrollY / height : 0;
      document.getElementById("progress").style.transform = "scaleX(" + progress + ")";
    }, { passive: true });
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
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function bindTimeline() {
    var jobs = document.querySelectorAll(".job");
    if (!jobs.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { threshold: 0.55 });
    jobs.forEach(function (job) { observer.observe(job); });
  }

  function bindSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a[href^='#']"));
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var on = link.getAttribute("href") === "#" + entry.target.id;
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function showError(message) {
    var summary = document.getElementById("hero-summary");
    summary.textContent = "";
    summary.append(el("span", { class: "error", text: message }));
  }

  fetch("resume.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudo leer resume.json");
      return response.json();
    })
    .then(function (resume) {
      renderHero(resume);
      renderProjects(resume.projects);
      renderWork(resume.work);
      renderSkills(resume.skills);
      renderEducation(resume.education);
      renderCertificates(resume.certificates);
      renderLanguages(resume.languages);
      renderInterests(resume.interests);
      bindReveal();
      bindTimeline();
      bindSpy();
    })
    .catch(function () {
      showError("No se pudo cargar resume.json. Abrí la página desde un servidor local o desde GitHub Pages, no como archivo suelto.");
    });

  bindNav();
})();
