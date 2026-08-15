// Mobile navigation, scroll reveal animations, FAQ accordion, gallery lightbox
document.addEventListener("DOMContentLoaded", () => {
  initLanguageSwitcher();
  initMobileNav();
  initRevealAnimations();
  initFAQ();
  initGallery();
});

function initMobileNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".header nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("active"));
  });
}

function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  items.forEach((el) => observer.observe(el));
}

function initFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const wasActive = item.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("active");
        const icon = other.querySelector(".faq-question span");
        if (icon) icon.textContent = "+";
      });

      if (!wasActive) {
        item.classList.add("active");
        const icon = question.querySelector("span");
        if (icon) icon.textContent = "−";
      }
    });
  });
}

function initGallery() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentIndex = 0;

  const images = items.map((item) => item.querySelector("img").getAttribute("src"));

  function show(index) {
    currentIndex = (index + images.length) % images.length;
    lightboxImg.setAttribute("src", images[currentIndex]);
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      show(index);
      lightbox.classList.add("active");
    });
  });

  closeBtn?.addEventListener("click", () => lightbox.classList.remove("active"));
  prevBtn?.addEventListener("click", () => show(currentIndex - 1));
  nextBtn?.addEventListener("click", () => show(currentIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") lightbox.classList.remove("active");
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });
}
