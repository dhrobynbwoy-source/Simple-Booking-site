// Simple Booking — mini-site
// Comportements : menu mobile, formulaire de contact, révélation au défilement,
// et le simulateur de réservation interactif.

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initContactForm();
  initReveal();
  initSimulators();
});

/* ---------- Menu mobile ---------- */
function initNav() {
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(document.body.classList.contains("nav-open")));
    });
  }
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
  });
}

/* ---------- Formulaire de contact ---------- */
function initContactForm() {
  var form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = document.getElementById("form-status");
    var required = form.querySelectorAll("[required]");
    var valid = true;
    required.forEach(function (field) {
      if (!field.value.trim()) valid = false;
    });
    if (!valid) {
      status.textContent = "Merci de remplir les champs obligatoires.";
      status.dataset.state = "error";
      return;
    }
    status.textContent = "Merci ! Votre demande a bien été reçue, nous revenons vers vous rapidement.";
    status.dataset.state = "ok";
    form.reset();
  });
}

/* ---------- Révélation douce au défilement (une seule fois par élément) ---------- */
function initReveal() {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Simulateur de réservation ---------- */
// Chaque élément .simulator sur la page est initialisé indépendamment,
// avec ses propres données d'exemple (service / créneau / confirmation).
function initSimulators() {
  document.querySelectorAll(".simulator").forEach(setupSimulator);
}

function setupSimulator(root) {
  var state = { service: null, slot: null, name: "", phone: "" };
  var steps = root.querySelectorAll(".sim-step");
  var bars = root.querySelectorAll(".simulator-progress .bar");
  var current = 0;

  function showStep(index) {
    steps.forEach(function (s, i) { s.classList.toggle("active", i === index); });
    bars.forEach(function (b, i) { b.classList.toggle("done", i <= index); });
    current = index;
  }

  // Étape 1 — choix du service
  root.querySelectorAll(".sim-option").forEach(function (opt) {
    opt.addEventListener("click", function () {
      root.querySelectorAll(".sim-option").forEach(function (o) { o.classList.remove("selected"); });
      opt.classList.add("selected");
      state.service = opt.dataset.service;
      var nextBtn = steps[0].querySelector(".sim-btn-next");
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  // Étape 2 — choix du créneau
  root.querySelectorAll(".sim-slot").forEach(function (slot) {
    slot.addEventListener("click", function () {
      root.querySelectorAll(".sim-slot").forEach(function (s) { s.classList.remove("selected"); });
      slot.classList.add("selected");
      state.slot = slot.textContent.trim();
      var nextBtn = steps[1].querySelector(".sim-btn-next");
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  // Navigation avant/arrière
  root.querySelectorAll(".sim-btn-next").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (current === 2) {
        var nameInput = steps[2].querySelector('input[name="sim-name"]');
        var phoneInput = steps[2].querySelector('input[name="sim-phone"]');
        state.name = nameInput ? nameInput.value.trim() : "";
        state.phone = phoneInput ? phoneInput.value.trim() : "";
        if (!state.name || !state.phone) {
          nameInput && nameInput.reportValidity && nameInput.reportValidity();
          return;
        }
        fillReceipt(root, state);
      }
      if (current < steps.length - 1) showStep(current + 1);
    });
  });
  root.querySelectorAll(".sim-btn-back").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (current > 0) showStep(current - 1);
    });
  });

  // Recommencer
  var restart = root.querySelector(".sim-restart");
  if (restart) {
    restart.addEventListener("click", function () {
      state = { service: null, slot: null, name: "", phone: "" };
      root.querySelectorAll(".sim-option, .sim-slot").forEach(function (el) { el.classList.remove("selected"); });
      root.querySelectorAll(".sim-btn-next").forEach(function (b) { if (b.closest('.sim-step') !== steps[2]) b.disabled = true; });
      var nameInput = steps[2] && steps[2].querySelector('input[name="sim-name"]');
      var phoneInput = steps[2] && steps[2].querySelector('input[name="sim-phone"]');
      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";
      showStep(0);
    });
  }

  showStep(0);
}

function fillReceipt(root, state) {
  var receipt = root.querySelector(".sim-receipt");
  if (!receipt) return;
  var setRow = function (key, value) {
    var el = receipt.querySelector('[data-field="' + key + '"]');
    if (el) el.textContent = value;
  };
  setRow("service", state.service || "—");
  setRow("slot", state.slot || "—");
  setRow("name", state.name || "—");
}
