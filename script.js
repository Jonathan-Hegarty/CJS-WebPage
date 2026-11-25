document.documentElement.classList.add("js");

/* CJS Solutions website interactions.
   To make the contact form send messages, set CONTACT_EMAIL to your real inbox.
   The form currently validates entries and opens a pre-filled email draft; it does
   not store or transmit personal information to a server.
*/
const CONTACT_EMAIL = "ADD-YOUR-EMAIL-HERE";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const header = document.querySelector(".site-header");

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

// Give the sticky header a subtle shadow after the page starts moving.
function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 8);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Highlight the navigation item for the section currently in view.
const pageSections = [...document.querySelectorAll("main section[id]")];
if ("IntersectionObserver" in window && pageSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isCurrent);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  pageSections.forEach((section) => sectionObserver.observe(section));
}

// Reveal content as it enters the viewport, with a no-observer fallback.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Filter the illustrative project concepts.
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectCards = [...document.querySelectorAll(".project-card")];
const filterStatus = document.querySelector("#filter-status");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filterButtons.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    let visibleCount = 0;
    projectCards.forEach((card) => {
      const show = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount += 1;
    });
    if (filterStatus) {
      const label = visibleCount === 1 ? "concept example" : "concept examples";
      filterStatus.textContent = `Showing ${selected === "all" ? "all " : ""}${visibleCount} ${label}.`;
    }
  });
});

// Contact form validation and email-draft handoff (no backend required for the demo).
const contactForm = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");
const fields = {
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  topic: document.querySelector("#topic"),
  message: document.querySelector("#message")
};
const errorElements = {
  name: document.querySelector("#name-error"),
  email: document.querySelector("#email-error"),
  topic: document.querySelector("#topic-error"),
  message: document.querySelector("#message-error")
};

function setFieldError(key, message) {
  const field = fields[key];
  const error = errorElements[key];
  if (!field || !error) return;
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
}

Object.entries(fields).forEach(([key, field]) => {
  field?.addEventListener("input", () => setFieldError(key, ""));
  field?.addEventListener("change", () => setFieldError(key, ""));
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("error");
    }

    const values = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.trim()]));
    let valid = true;
    const requiredMessages = {
      name: "Please enter your name.",
      email: "Please enter your email address.",
      topic: "Please choose a topic.",
      message: "Please tell us a little about your idea."
    };

    Object.keys(fields).forEach((key) => {
      const message = values[key] ? "" : requiredMessages[key];
      setFieldError(key, message);
      if (message) valid = false;
    });

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setFieldError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!valid) {
      const firstInvalid = contactForm.querySelector(".invalid");
      firstInvalid?.focus();
      if (feedback) {
        feedback.textContent = "Please check the highlighted fields and try again.";
        feedback.classList.add("error");
      }
      return;
    }

    const subject = encodeURIComponent(`CJS website enquiry: ${values.topic}`);
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\nTopic: ${values.topic}\n\nMessage:\n${values.message}`
    );

    if (CONTACT_EMAIL && CONTACT_EMAIL !== "ADD-YOUR-EMAIL-HERE") {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      if (feedback) feedback.textContent = "Your email app should open with your message ready to send.";
    } else if (feedback) {
      feedback.textContent = "Thanks — the form is working. Add your real contact email in script.js to enable email sending.";
    }
  });
}

// Keep the copyright year current.
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
