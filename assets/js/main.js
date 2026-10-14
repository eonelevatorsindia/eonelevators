(function () {
  const PHONE = "919966779500";
  const EMAIL = "info@eonelevators.com";

  // Header shadow on scroll
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Highlight current section in nav
  const links = [...nav.querySelectorAll("a:not(.btn)")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObs.observe(s));

    // Reveal on scroll
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Door filters
  const filters = document.querySelectorAll(".filter");
  const doors = document.querySelectorAll(".door");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      doors.forEach((d) => d.classList.toggle("is-hidden", f !== "all" && d.dataset.type !== f));
    });
  });

  // Enquiry form -> email or WhatsApp (no backend needed)
  const form = document.getElementById("enquiryForm");
  const error = document.getElementById("formError");
  let via = "email";
  form.querySelectorAll("button[type=submit]").forEach((b) =>
    b.addEventListener("click", () => { via = b.dataset.via; })
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const phoneOk = /^[0-9+\s-]{10,15}$/.test((d.phone || "").trim());
    if (!d.name.trim() || !phoneOk) {
      error.hidden = false;
      return;
    }
    error.hidden = true;

    const lines = [
      "New enquiry from the website",
      "",
      "Name: " + d.name,
      "Phone: " + d.phone,
      d.email ? "Email: " + d.email : "",
      "Interested in: " + d.interest,
      d.city ? "City: " + d.city : "",
      d.message ? "\nMessage:\n" + d.message : "",
    ].filter(Boolean).join("\n");

    if (via === "whatsapp") {
      window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(lines), "_blank", "noopener");
    } else {
      const subject = "Enquiry: " + d.interest + " – " + d.name;
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines);
    }
  });

  // Product views: <name>.jpg is the main photo, extra photos are <name>-2.jpg, <name>-3.jpg …
  // To add more, drop in the next numbered file and raise data-count in index.html.
  const viewsFor = (el) => {
    const name = el.dataset.views;
    return Array.from({ length: +el.dataset.count }, (_, i) => ({
      src: "assets/img/" + name + (i ? "-" + (i + 1) : "") + ".jpg",
      label: "Photo " + (i + 1),
    }));
  };

  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector(".lightbox__img");
  const lbCap = lb.querySelector(".lightbox__caption");
  const lbThumbs = lb.querySelector(".lightbox__thumbs");
  let lbViews = [], lbTitle = "", lbIndex = 0, lastFocus = null;

  const showView = (i) => {
    lbIndex = (i + lbViews.length) % lbViews.length;
    const v = lbViews[lbIndex];
    lbImg.src = v.src;
    lbImg.alt = lbTitle + " – " + v.label;
    lbCap.textContent = lbTitle + "  (" + (lbIndex + 1) + "/" + lbViews.length + ")";
    lbThumbs.querySelectorAll("button").forEach((b, k) => b.classList.toggle("is-active", k === lbIndex));
  };
  const openLightbox = (el, i) => {
    lbViews = viewsFor(el);
    lbTitle = el.dataset.title;
    lbThumbs.innerHTML = "";
    lbViews.forEach((v, k) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", v.label);
      b.innerHTML = '<img src="' + v.src + '" alt="">';
      b.addEventListener("click", () => showView(k));
      lbThumbs.appendChild(b);
    });
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    showView(i || 0);
    lb.querySelector(".lightbox__close").focus();
  };
  const closeLightbox = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  lb.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
  lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => showView(lbIndex - 1));
  lb.querySelector(".lightbox__nav--next").addEventListener("click", () => showView(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showView(lbIndex - 1);
    if (e.key === "ArrowRight") showView(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) showView(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.querySelectorAll("[data-views]").forEach((el) => {
    const views = viewsFor(el);
    const main = el.querySelector("img");
    el.classList.add("has-views");
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View " + views.length + " photos of " + el.dataset.title);

    const badge = document.createElement("span");
    badge.className = "views-badge";
    badge.textContent = views.length + " photos";
    el.appendChild(badge);

    // Thumbnail strip inside the card, above the caption
    const strip = document.createElement("div");
    strip.className = "view-strip";
    views.forEach((v, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", el.dataset.title + " photo " + (k + 1));
      b.innerHTML = '<img src="' + v.src + '" alt="" loading="lazy">';
      if (k === 0) b.classList.add("is-active");
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        main.src = v.src;
        strip.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        el.dataset.current = k;
      });
      strip.appendChild(b);
    });
    const caption = el.querySelector("figcaption");
    if (caption) el.insertBefore(strip, caption);
    else el.insertAdjacentElement("afterend", strip);

    const open = () => openLightbox(el, +(el.dataset.current || 0));
    main.addEventListener("click", open);
    el.addEventListener("keydown", (e) => {
      if (e.target === el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(); }
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
