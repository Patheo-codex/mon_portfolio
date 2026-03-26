/* Mobile-first portfolio interactions:
   - Fond particules canvas interactif
   - Révélations au scroll (IntersectionObserver)
   - Comptes + barres de compétences animés
   - Modale projets
   - Effet ripple sur boutons
   - Formulaire contact (simulation + mailto)
*/

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ========== Typing effect ==========
  const typeEl = $(".type");
  if (typeEl && typeEl.dataset.type) {
    const full = typeEl.dataset.type;
    // Keep the content clean: we animate a substring, starting by clearing text.
    typeEl.textContent = "";

    let i = 0;
    let last = "";
    const speed = 26; // ms
    const loop = () => {
      const next = full.slice(0, i);
      if (next !== last) {
        typeEl.textContent = next;
        last = next;
      }
      i++;
      if (i <= full.length) {
        setTimeout(loop, speed);
      }
    };
    // Start when visible
    const obs = new IntersectionObserver(
      (entries, o) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          o.disconnect();
          loop();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(typeEl);
  }

  // ========== Reveal on scroll ==========
  const revealEls = $$("[data-reveal]");
  const revealObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("is-visible");
      }
    },
    { threshold: 0.18 }
  );
  for (const el of revealEls) revealObs.observe(el);

  // ========== Ripple ==========
  function makeRipple(e) {
    const btn = e.currentTarget;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const span = document.createElement("span");
    span.className = "ripple-span";
    span.style.left = `${e.clientX - rect.left}px`;
    span.style.top = `${e.clientY - rect.top}px`;

    btn.appendChild(span);
    span.addEventListener("animationend", () => span.remove(), { once: true });
  }

  $$("[data-ripple]").forEach((el) => {
    el.addEventListener("pointerdown", (e) => {
      // Use only primary touch/mouse to avoid duplicated ripples.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      makeRipple(e);
    });
  });

  // ========== Mobile menu ==========
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu after navigation (mobile)
    $$("#nav a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ========== Counters ==========
  const counterEls = $$(".counter[data-target]");
  const counterObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        counterObs.unobserve(el);

        const target = Number(el.dataset.target || 0);
        const duration = 900 + Math.min(900, target * 8);
        const start = performance.now();
        const from = 0;

        const tick = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = Math.round(from + (target - from) * eased);
          el.textContent = String(value);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.35 }
  );
  for (const el of counterEls) counterObs.observe(el);

  // ========== Skill bars ==========
  const skillEls = $$("[data-skill]");
  const skillObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("is-visible");
        skillObs.unobserve(el);
      }
    },
    { threshold: 0.25 }
  );
  for (const el of skillEls) skillObs.observe(el);

  // ========== Particles background ==========
  const canvas = $("#bg");
  const ctx = canvas ? canvas.getContext("2d") : null;
  if (canvas && ctx) {
    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: 0, y: 0, down: false };
    const particles = [];
    const maxParticles = 90;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(clamp((w * h) / 18000, 22, maxParticles));
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.35, 0.35),
          vy: rand(-0.35, 0.35),
          r: rand(1.2, 2.4),
          a: rand(0.35, 0.9),
        });
      }
    };

    window.addEventListener("resize", resize, { passive: true });

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
      return { x, y };
    };

    const onPointerMove = (e) => {
      const p = getPos(e);
      pointer.x = p.x;
      pointer.y = p.y;
    };
    const onPointerDown = (e) => {
      pointer.down = true;
      onPointerMove(e);
    };
    const onPointerUp = () => {
      pointer.down = false;
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    resize();

    let lastT = performance.now();
    const animate = (t) => {
      const dt = Math.min(32, t - lastT);
      lastT = t;

      ctx.clearRect(0, 0, w, h);

      // Subtle background glow
      const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(w, h) * 0.5);
      g.addColorStop(0, "rgba(109,92,255,0.14)");
      g.addColorStop(0.35, "rgba(34,211,238,0.08)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Update particles
      for (const p of particles) {
        // Slow drift
        p.x += p.vx * (dt / 16.67);
        p.y += p.vy * (dt / 16.67);

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Pointer attraction
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist2 = dx * dx + dy * dy;
        const influence = pointer.down ? 80000 : 50000;
        if (dist2 < influence) {
          const dist = Math.sqrt(dist2) + 0.0001;
          const strength = (pointer.down ? 0.022 : 0.014) * (1 - dist / Math.sqrt(influence));
          p.vx += (dx / dist) * strength * (dt / 16.67);
          p.vy += (dy / dist) * strength * (dt / 16.67);
        }

        // Damping so it stays smooth
        p.vx *= 0.995;
        p.vy *= 0.995;
      }

      // Draw links
      const linkDist = Math.max(88, Math.min(150, w / 7));
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.35;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const p of particles) {
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // ========== Projects modal ==========
  const modal = $("#projectModal");
  const modalClose = $("#modalClose");
  const modalTag = $("#modalTag");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalList = $("#modalList");
  const modalPrimary = $("#modalPrimary");
  const modalSecondary = $("#modalSecondary");

  const projects = [
    {
      tag: "Animation",
      title: "Portail UI",
      desc: "Une page “wow” mobile: fond particules réactif, titres animés, cartes et modales qui glissent proprement.",
      points: ["Fond particules canvas (tactile)", "Révélations au scroll via IntersectionObserver", "CTA avec ripple + micro-interactions"],
      primaryText: "Voir (placeholder)",
    },
    {
      tag: "Performance",
      title: "Galerie fluide",
      desc: "Cartes projet optimisées pour mobile avec effet de brillance et tilt au toucher. Ouverture de modale animée.",
      points: ["Effet shine côté CSS", "Tilt tactile léger (JS)", "Modale avec transitions propres + fermeture facile"],
      primaryText: "Voir (placeholder)",
    },
    {
      tag: "UI/UX",
      title: "Formulaire stylé",
      desc: "Formulaire avec labels flottants, validation HTML native et retour utilisateur sous forme de toast.",
      points: ["Champs avec labels flottants", "Toast de confirmation à l’envoi", "Fallback mailto si aucune backend n’est utilisée"],
      primaryText: "Voir (placeholder)",
    },
  ];

  function openModal(projectIndex) {
    const p = projects[projectIndex];
    if (!p) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    modalTag.textContent = p.tag;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;

    modalList.innerHTML = "";
    for (const item of p.points) {
      const div = document.createElement("div");
      div.className = "modal-item";
      div.innerHTML = `<strong>•</strong>${escapeHtml(item)}`;
      modalList.appendChild(div);
    }

    modalPrimary.textContent = p.primaryText;
    modalSecondary.href = "#contact";

    modalClose.focus({ preventScroll: true });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Safe escape for text inserted into HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Open on card click
  $$(".project-card").forEach((card) => {
    const idx = Number(card.dataset.project);
    card.addEventListener("click", () => openModal(idx));

    // Shine trigger (only when opened-ish)
    card.addEventListener("pointerdown", () => {
      card.classList.add("is-shining");
      setTimeout(() => card.classList.remove("is-shining"), 900);
    });

    // Tilt effect (touch + mouse)
    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 2 - 1;
      const py = (y / rect.height) * 2 - 1;
      card.style.transform = `perspective(800px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    };
    const reset = () => {
      card.style.transform = "";
    };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", reset, { passive: true });
    card.addEventListener("pointerup", reset, { passive: true });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target instanceof HTMLElement && target.dataset.close === "true") closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  // ========== Contact form ==========
  const form = $("#contactForm");
  const submitBtn = $("#submitBtn");
  const toast = $("#toast");
  const mailtoLink = $("#mailtoLink");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  // Update mailto with form values
  function updateMailto() {
    if (!mailtoLink || !form) return;
    const name = $("#name")?.value?.trim() || "";
    const email = $("#email")?.value?.trim() || "";
    const message = $("#message")?.value?.trim() || "";
    const to = "romarictia@gmail.com";
    const subject = `Message de ${name || "visiteur"} via portfolio`;
    const body = `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    // Keep `to` unencoded for better mail client compatibility.
    mailtoLink.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  if (form) {
    ["input", "change"].forEach((evt) => {
      form.addEventListener(evt, updateMailto, { passive: true });
    });
    updateMailto();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const message = $("#message").value.trim();

      // Basic check (native required should already handle most)
      if (!name || !email || !message) {
        showToast("Remplis tous les champs.");
        return;
      }

      if (!submitBtn) return;
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;

      // No backend: open mail client for real sending
      updateMailto();
      const mailHref = mailtoLink?.href;

      setTimeout(() => {
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;

        if (mailHref) {
          showToast("Message prêt: ouverture de ton email...");
          window.location.href = mailHref;
        } else {
          showToast("Ton email n’est pas configuré. Remplace les placeholders.");
        }
      }, 850);
    });
  }

  // ========== Year ==========
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

