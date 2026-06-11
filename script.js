(() => {
  "use strict";

  const state = {
    plan: "",
    date: null, // objeto Date
    time: "",
    noAttempts: 0,
    noConverted: false,
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const screens = {
    question: $("#screenQuestion"),
    loading: $("#screenLoading"),
    plan: $("#screenPlan"),
    date: $("#screenDate"),
    final: $("#screenFinal"),
  };

  const yesBtn = $("#yesBtn");
  const noBtn = $("#noBtn");
  const noAnchor = $("#noAnchor");
  const noHint = $("#noHint");
  const toDateBtn = $("#toDateBtn");
  const finishBtn = $("#finishBtn");
  const customPlan = $("#customPlan");
  const customTime = $("#customTime");
  const summaryBox = $("#summaryBox");
  const funMessage = $("#funMessage");
  const loadingText = $("#loadingText");
  const pickedLabel = $("#pickedLabel");

  // overlays de imágenes/gifs
  const puppyIntro = $("#puppyIntro");
  const confettiGif = $("#confettiGif");
  const heartGif = $("#heartGif");

  // reproduce un overlay con fade in/out suave
  function playOverlay(el, mode = "normal") {
    if (!el) return;
    el.classList.remove("is-fading-fast", "is-fading", "is-fading--long");
    void el.offsetWidth; // reinicia la animación
    const className = mode === "fast"
      ? "is-fading-fast"
      : mode === "long"
        ? "is-fading--long"
        : "is-fading";
    el.classList.add(className);
  }

  // ── frases ──────────────────────────────────────────

  const noPhrases = [
    "uy, el botón está tímido hoy",
    "se fue. literal se fue.",
    "el botón pidió día administrativo",
    "corre más que un perrito persiguiendo la pelota",
    "cupido activó el modo evasión",
    "error 404: rechazo no encontrado",
    "ya van varios intentos… sospechoso 👀",
    "el botón presentó licencia médica",
    "ni los perritos te dejarían decir que no",
    "el universo claramente opina otra cosa, Javi",
    "esto ya es persecución (del botón hacia ti)",
    "ok, voy a tener que tomar medidas",
  ];

  const loadingPhrases = [
    "procesando sentimientos…",
    "consultando con cupido…",
    "validando nivel de ternura…",
    "compilando mariposas en el estómago…",
    "todo aprobado ♡",
  ];

  const finaleMessages = [
    "Gracias por aceptar, Javi. Tu valentía será recompensada con comida, risas y harto cariñito.",
    "Confirmación recibida. Procedo a emocionarme de forma moderada, elegante y solo un poquito ridícula.",
    "Se recomienda asistir con hambre, paciencia y disposición a reírse de mis idioteces.",
    "La cita quedó agendada con prioridad alta, Javi. Más alta que cualquier otra cosa de mi semana, sinceramente.",
    "Anotado todo. Si en el camino aparece un perrito, se detiene la cita momentáneamente para apreciarlo. No se discute.",
  ];

  // mensaje dramático según el plan elegido (emoji, frase, subtítulo)
  const planMessages = {
    "Cafetería bonita": ["☕", "buena elección, Javi…", "Ahora quizas me atreva a probar el matcha 😅"],
    "Sushi":            ["🍣", "excelente gusto…", "voy a fingir que sé pedir como todo un experto"],
    "Atardecer":        ["🌅", "qué romántica…", "el sol ya está coordinando su mejor entrada para ti"],
    "Helado y paseo":   ["🍦", "plan simple…", "efectivo y bonito"],
    "Ver perritos":     ["🐶", "SABÍA que elegirías esto…", "preparando lista de todos los perritos que vamos a saludar"],
    "Cine + comida":    ["🎬", "perfecto…", "prometo no dormirme jajaa"],
  };
  // mensaje genérico para planes inventados
  const customPlanMessages = [
    ["✨", "me gusta cómo piensas…", "no se me había ocurrido, pero ya estoy adentro"],
    ["💡", "plan aprobado…", "mejor idea que cualquiera de las mías, sinceramente"],
    ["🎲", "interesante…", "el comité romántico lo acaba de aprobar por unanimidad"],
  ];

  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  // ── helpers ─────────────────────────────────────────

  function showScreen(name) {
    Object.values(screens).forEach((sc) => {
      sc.classList.remove("screen--active");
      // reinicia las animaciones de entrada
      sc.querySelectorAll(".reveal").forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
      });
    });
    screens[name].classList.add("screen--active");
    // el botón No solo existe en la pantalla de la pregunta
    if (name !== "question") {
      noBtn.classList.remove("is-placed");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(date) {
    if (!date) return "fecha sorpresa";
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  }

  // ── corazones de fondo ──────────────────────────────

  function spawnBgHearts() {
    const wrap = document.querySelector(".bg-hearts");
    const glyphs = ["♡", "♥", "✿", "🐾"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = `${Math.random() * 100}%`;
      s.style.fontSize = `${10 + Math.random() * 12}px`;
      s.style.animationDuration = `${9 + Math.random() * 9}s`;
      s.style.animationDelay = `${Math.random() * 10}s`;
      wrap.appendChild(s);
    }
  }

  // ── botón No fugitivo (pantalla completa) ───────────

  function placeNoAtAnchor() {
    // solo posiciona si seguimos en la pantalla de la pregunta
    if (!screens.question.classList.contains("screen--active")) return;
    // alinea el botón No con el centro del botón Sí (mismo eje horizontal)
    noBtn.classList.add("is-placed");
    const aRect = noAnchor.getBoundingClientRect();
    const yRect = yesBtn.getBoundingClientRect();
    const bRect = noBtn.getBoundingClientRect();
    const left = aRect.left + (aRect.width - bRect.width) / 2;
    const top = yRect.top + (yRect.height - bRect.height) / 2;
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }

  function leaveDust(x, y) {
    const dust = document.createElement("span");
    dust.className = "dust";
    dust.textContent = "💨";
    dust.style.left = `${x}px`;
    dust.style.top = `${y}px`;
    document.body.appendChild(dust);
    setTimeout(() => dust.remove(), 650);
  }

  function fleeNoButton(event) {
    if (state.noConverted) return; // ya se rindió, ahora es un Sí
    if (event) event.preventDefault();
    state.noAttempts += 1;

    const margin = 14;
    const rect = noBtn.getBoundingClientRect();
    leaveDust(rect.left + rect.width / 3, rect.top);

    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;

    // que salte lejos de donde está, para que se note la huida
    let newLeft, newTop, tries = 0;
    do {
      newLeft = margin + Math.random() * Math.max(1, maxLeft - margin);
      newTop = margin + Math.random() * Math.max(1, maxTop - margin);
      tries++;
    } while (
      tries < 12 &&
      Math.hypot(newLeft - rect.left, newTop - rect.top) < window.innerWidth * 0.3
    );

    noBtn.style.left = `${newLeft}px`;
    noBtn.style.top = `${newTop}px`;
    noBtn.style.transform = `rotate(${Math.random() * 24 - 12}deg)`;

    noHint.textContent = `${noPhrases[(state.noAttempts - 1) % noPhrases.length]} · intento #${state.noAttempts}`;

    // dramita: el botón Sí crece mientras el No huye
    const grow = Math.min(1 + state.noAttempts * 0.06, 1.7);
    yesBtn.style.setProperty("--grow", grow);

    // el emoji del inicio reacciona con cada intento
    const heroEmoji = document.querySelector(".hero-emoji");
    if (heroEmoji) {
      const faces = ["🥺", "🥹", "😭", "🙏", "😩", "🫠", "😤", "🥺"];
      heroEmoji.textContent = faces[(state.noAttempts - 1) % faces.length];
      heroEmoji.style.animation = "none";
      void heroEmoji.offsetWidth;
      heroEmoji.style.animation = "heroBob 2.6s ease-in-out infinite, heroPop 0.5s var(--ease-bounce)";
    }

    // contador gigante flotando en pantalla
    showNoCounter(state.noAttempts);

    // el botón se va achicando con cada intento
    if (state.noAttempts === 4) noBtn.textContent = "¿segura? 🥺";
    if (state.noAttempts === 7) noBtn.classList.add("is-tiny");
    if (state.noAttempts === 9) noBtn.textContent = "no insistas";

    // a los 12 intentos se rinde y se convierte en otro Sí
    if (state.noAttempts >= 12) {
      state.noConverted = true;
      noBtn.classList.remove("is-tiny");
      noBtn.classList.add("is-converted");
      noBtn.textContent = "ya filo, Sí ♡";
      noBtn.style.transform = "rotate(0deg)";
      noHint.textContent = "el comité romántico recalificó el botón. no hay más preguntas.";
      if (heroEmoji) heroEmoji.textContent = "🥰";
    }
  }

  function showNoCounter(n) {
    const old = document.querySelector(".no-counter");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = "no-counter";
    el.textContent = n >= 12 ? "♡" : n;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  ["pointerenter", "pointerdown", "touchstart"].forEach((evt) => {
    noBtn.addEventListener(evt, fleeNoButton, { passive: false });
  });
  noBtn.addEventListener("click", (e) => {
    if (state.noConverted) {
      acceptDate();
    } else {
      e.preventDefault();
      fleeNoButton(e);
    }
  });

  // ── flujo del Sí ────────────────────────────────────

  function heartBurst(x, y) {
    const glyphs = ["💖", "💘", "✨", "🌸", "💕"];
    for (let i = 0; i < 10; i++) {
      const h = document.createElement("span");
      h.className = "heart-burst";
      h.textContent = glyphs[i % glyphs.length];
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.setProperty("--dx", `${Math.cos((i / 10) * Math.PI * 2) * (60 + Math.random() * 50)}px`);
      h.style.setProperty("--dy", `${Math.sin((i / 10) * Math.PI * 2) * (60 + Math.random() * 50) - 40}px`);
      h.style.setProperty("--rot", `${Math.random() * 90 - 45}deg`);
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1050);
    }
  }

  function sparkBurst(x, y) {
    const glyphs = ["✨", "✦", "★", "💫", "✿"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      const ang = (i / 14) * Math.PI * 2;
      const dist = 80 + Math.random() * 90;
      s.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(ang) * dist}px`);
      s.style.setProperty("--rot", `${Math.random() * 180 - 90}deg`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  }

  function acceptDate() {
    const rect = (state.noConverted ? noBtn : yesBtn).getBoundingClientRect();
    heartBurst(rect.left + rect.width / 2, rect.top);
    noBtn.classList.remove("is-placed");
    runConfetti(2600);
    playOverlay(confettiGif, "normal"); // gif de confeti sutil, más pequeño y arriba
    showScreen("loading");

    // mensajes rotando mientras "procesa sentimientos"
    let i = 0;
    loadingText.textContent = loadingPhrases[0];
    const interval = setInterval(() => {
      i += 1;
      if (i < loadingPhrases.length) {
        loadingText.textContent = loadingPhrases[i];
      } else {
        clearInterval(interval);
        showScreen("plan");
      }
    }, 720);
  }

  yesBtn.addEventListener("click", acceptDate);

  // ── plan ────────────────────────────────────────────

  // muestra una pantalla de transición dramática y luego avanza
  function planSplashThenAdvance(emoji, msg, sub) {
    const splash = document.createElement("div");
    splash.className = "plan-splash";
    splash.innerHTML =
      `<div class="plan-splash__inner">
         <span class="plan-splash__emoji">${emoji}</span>
         <p class="plan-splash__msg">${escapeHtml(msg)}</p>
         <p class="plan-splash__sub">${escapeHtml(sub)}</p>
       </div>`;
    document.body.appendChild(splash);
    sparkBurst(window.innerWidth / 2, window.innerHeight / 2);

    setTimeout(() => {
      splash.classList.add("is-leaving");
      showScreen("date");
      setTimeout(() => splash.remove(), 460);
    }, 1250);
  }

  function chooseOptionPlan(card) {
    customPlan.value = "";
    $$(".option-card").forEach((c) => c.classList.remove("is-selected"));
    card.classList.add("is-selected");
    state.plan = card.dataset.plan;

    const [emoji, msg, sub] = planMessages[state.plan] ||
      ["💘", "buena elección…", "ya me estoy emocionando"];
    // pequeña pausa para que se vea el wiggle del emoji antes del splash
    setTimeout(() => planSplashThenAdvance(emoji, msg, sub), 360);
  }

  $$(".option-card").forEach((card) => {
    card.addEventListener("click", () => chooseOptionPlan(card));
  });

  // el campo de texto sí usa el botón "continuar"
  customPlan.addEventListener("input", () => {
    if (customPlan.value.trim()) {
      $$(".option-card").forEach((c) => c.classList.remove("is-selected"));
      state.plan = customPlan.value.trim();
    } else {
      state.plan = "";
    }
  });

  // enter en el input = continuar
  customPlan.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); toDateBtn.click(); }
  });

  toDateBtn.addEventListener("click", () => {
    const typed = customPlan.value.trim();
    if (!typed) {
      // dramita: tiembla y avisa
      customPlan.classList.remove("is-shaking");
      void customPlan.offsetWidth;
      customPlan.classList.add("is-shaking");
      toast("escribe algo primero, no me dejes en visto 👀");
      return;
    }
    state.plan = typed;
    const [emoji, msg, sub] =
      customPlanMessages[Math.floor(Math.random() * customPlanMessages.length)];
    planSplashThenAdvance(emoji, msg, sub);
  });

  // ── calendario propio ───────────────────────────────

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1); // desde mañana

  let viewYear = minDate.getFullYear();
  let viewMonth = minDate.getMonth();

  const calTitle = $("#calTitle");
  const calGrid = $("#calGrid");
  const prevBtn = $("#prevMonth");
  const nextBtn = $("#nextMonth");

  function sameDay(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function renderCalendar() {
    calTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    calGrid.innerHTML = "";

    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // lunes = 0
    const offset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement("button");
      empty.className = "is-empty";
      empty.disabled = true;
      empty.tabIndex = -1;
      calGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = d;
      if (cellDate < minDate) btn.disabled = true;
      if (sameDay(cellDate, today)) btn.classList.add("is-today");
      if (sameDay(cellDate, state.date)) btn.classList.add("is-picked");

      btn.addEventListener("click", () => {
        state.date = cellDate;
        renderCalendar();
        pickedLabel.textContent = `elegiste: ${formatDate(cellDate)} ♡`;
        validateDate();
      });

      calGrid.appendChild(btn);
    }

    // no dejar navegar a meses completamente pasados
    prevBtn.disabled =
      viewYear === minDate.getFullYear() && viewMonth === minDate.getMonth();
  }

  prevBtn.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    renderCalendar();
  });

  // ── horario ─────────────────────────────────────────

  function validateDate() {
    finishBtn.disabled = !(state.date && state.time);
  }

  $$("#timeGrid button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#timeGrid button").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");

      if (btn.dataset.time === "__custom") {
        customTime.hidden = false;
        customTime.focus();
        state.time = customTime.value.trim();
      } else {
        customTime.hidden = true;
        customTime.value = "";
        state.time = btn.dataset.time;
      }
      validateDate();
    });
  });

  customTime.addEventListener("input", () => {
    state.time = customTime.value.trim();
    validateDate();
  });

  $("#backToPlanBtn").addEventListener("click", () => showScreen("plan"));

  // ── final ───────────────────────────────────────────

  function renderSummary() {
    const rows = [
      ["💘", "plan elegido", state.plan],
      ["📅", "fecha", formatDate(state.date)],
      ["⏰", "horario", state.time === "Sorpresa" ? "sorpresa (yo aviso)" : state.time],
      ["🫡", "coordinación general", "yo, con seriedad administrativa y nerviosismo romántico"],
    ];
    summaryBox.innerHTML = rows
      .map(([emoji, label, value]) =>
        `<div class="summary-row"><span>${emoji}</span><div><strong>${label}</strong>${escapeHtml(value)}</div></div>`)
      .join("");
    funMessage.textContent = finaleMessages[Math.floor(Math.random() * finaleMessages.length)];
  }

  finishBtn.addEventListener("click", () => {
    if (!state.date || !state.time) return;
    const rect = finishBtn.getBoundingClientRect();
    sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    renderSummary();
    showScreen("final");
    runConfetti(2400);
    playOverlay(heartGif, "long"); // gif de corazón abrazado, más rápido que antes
  });

  // número de WhatsApp de destino (formato internacional sin signos)
  const WHATSAPP_NUMBER = "56946137389";

  function summaryText() {
    return `¡Acepto la cita! ♡\n\n📍 Plan: ${state.plan}\n📅 Fecha: ${formatDate(state.date)}\n⏰ Horario: ${state.time}\n\n— Javi 💘`;
  }

  $("#shareBtn").addEventListener("click", () => {
    const text = summaryText();
    // abre directamente el chat de WhatsApp con el mensaje listo para enviar
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    sparkBurst(window.innerWidth / 2, window.innerHeight * 0.7);
    toast("abriendo WhatsApp… solo aprieta enviar ♡");
    window.open(url, "_blank");
  });

  $("#restartBtn").addEventListener("click", () => {
    showScreen("plan");
    toast("se permite editar. el amor también tiene control de cambios.");
  });

  // ── confeti pastel con corazones ────────────────────

  function runConfetti(duration = 2400) {
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const colors = ["#f290ad", "#e9e3ff", "#ffe3a9", "#bfe8d2", "#ffd9e3"];
    let pieces = [];
    let start;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawHeart(x, y, size, color, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.beginPath();
      const s = size / 2;
      ctx.moveTo(0, s * 0.6);
      ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s, 0, -s * 0.3);
      ctx.bezierCurveTo(s * 0.4, -s, s, -s * 0.4, 0, s * 0.6);
      ctx.fill();
      ctx.restore();
    }

    function makePieces() {
      const count = Math.min(150, Math.floor(window.innerWidth / 3));
      pieces = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: -30 - Math.random() * window.innerHeight * 0.3,
        size: 6 + Math.random() * 9,
        speed: 1.8 + Math.random() * 3.4,
        rotation: Math.random() * Math.PI * 2,
        spin: -0.1 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: -1.4 + Math.random() * 2.8,
        heart: Math.random() < 0.35,
      }));
    }

    function draw(now) {
      if (!start) start = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift + Math.sin((elapsed + p.x) / 260) * 0.4;
        p.rotation += p.spin;

        if (p.heart) {
          drawHeart(p.x, p.y, p.size * 1.4, p.color, p.rotation);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
          ctx.restore();
        }
      });

      if (elapsed < duration) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    resize();
    makePieces();
    requestAnimationFrame(draw);
  }

  // ── init ────────────────────────────────────────────

  spawnBgHearts();
  renderCalendar();

  // perrito sonrojado en forma de corazón al entrar (fade in/out suave)
  setTimeout(() => playOverlay(puppyIntro, "fast"), 150);

  // posiciona el botón No alineado al Sí, ya que las animaciones de entrada
  // mueven los elementos; re-ubicamos cuando todo está asentado
  function settleNoButton() {
    if (state.noAttempts > 0 || state.noConverted) return;
    placeNoAtAnchor();
  }
  function initNoPlacement() {
    settleNoButton();
    // reintentos mientras corren las animaciones de revelado (~0.8s)
    [200, 500, 900, 1300].forEach((t) => setTimeout(settleNoButton, t));
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(initNoPlacement));
  } else {
    requestAnimationFrame(() => requestAnimationFrame(initNoPlacement));
  }
  window.addEventListener("resize", settleNoButton);
})();
