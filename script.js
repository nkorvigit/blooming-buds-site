/* ==========================================================
   Blooming Buds Pre-School & Day Care
   script.js
   ========================================================== */

"use strict";

/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initStickyHeader();
    initMobileMenu();
    initActiveNavigation();
    initScrollReveal();
    initCounters();
    initBackToTop();
    initSmoothScroll();
    initGalleryHover();
    initTestimonialAnimation();
    initFloatingCards();

});

/* ==========================================================
   STICKY HEADER
========================================================== */

function initStickyHeader() {

    const header = document.querySelector(".header");

    if (!header) return;

    function updateHeader() {

        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    updateHeader();

    window.addEventListener("scroll", updateHeader);

}

/* ==========================================================
   MOBILE MENU
========================================================== */

function initMobileMenu() {

    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".nav-menu");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {

        menu.classList.toggle("active");

        toggle.classList.toggle("active");

        if (toggle.classList.contains("active")) {

            toggle.innerHTML = '<i class="ri-close-line"></i>';

        } else {

            toggle.innerHTML = '<i class="ri-menu-3-line"></i>';

        }

    });

    document.querySelectorAll(".nav-menu a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("active");

            toggle.classList.remove("active");

            toggle.innerHTML = '<i class="ri-menu-3-line"></i>';

        });

    });

}

/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

function initActiveNavigation() {

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function activateMenu() {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 120;
            const height = section.offsetHeight;

            if (window.scrollY >= top &&
                window.scrollY < top + height) {

                current = section.getAttribute("id");

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {

                link.classList.add("active");

            }

        });

    }

    activateMenu();

    window.addEventListener("scroll", activateMenu);

}

/* ==========================================================
   SMOOTH SCROLL
========================================================== */

function initSmoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function(e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            window.scrollTo({

                top: target.offsetTop - 80,

                behavior: "smooth"

            });

        });

    });

}

/* ==========================================================
   SCROLL REVEAL
========================================================== */

function initScrollReveal() {

    const elements = document.querySelectorAll(

        ".fade-up,.fade-left,.fade-right,.fade-down,.scale-in"

    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.15

    });

    elements.forEach(el => observer.observe(el));

}

/* ==========================================================
   COUNTER ANIMATION
========================================================== */

function initCounters() {

    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;

            const target = Number(counter.dataset.target);

            let current = 0;

            const increment = Math.ceil(target / 80);

            const timer = setInterval(() => {

                current += increment;

                if (current >= target) {

                    counter.textContent = target;

                    clearInterval(timer);

                } else {

                    counter.textContent = current;

                }

            }, 20);

            observer.unobserve(counter);

        });

    });

    counters.forEach(counter => observer.observe(counter));

}

/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop() {

    const button = document.getElementById("backToTop");

    if (!button) return;

    function toggleButton() {

        if (window.scrollY > 500) {

            button.classList.add("show");

        } else {

            button.classList.remove("show");

        }

    }

    toggleButton();

    window.addEventListener("scroll", toggleButton);

    button.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/* ==========================================================
   GALLERY HOVER EFFECT
========================================================== */

function initGalleryHover() {

    document.querySelectorAll(".gallery-item").forEach(item => {

        item.addEventListener("mouseenter", () => {

            item.classList.add("active");

        });

        item.addEventListener("mouseleave", () => {

            item.classList.remove("active");

        });

    });

}

/* ==========================================================
   TESTIMONIAL AUTO HIGHLIGHT
========================================================== */

function initTestimonialAnimation() {

    const cards = document.querySelectorAll(".testimonial-card");

    if (!cards.length) return;

    let current = 0;

    setInterval(() => {

        cards.forEach(card => {

            card.classList.remove("active");

        });

        cards[current].classList.add("active");

        current++;

        if (current >= cards.length) {

            current = 0;

        }

    }, 3500);

}

/* ==========================================================
   FLOATING CARDS
========================================================== */

function initFloatingCards() {

    const cards = document.querySelectorAll(".floating-card");

    if (!cards.length) return;

    cards.forEach((card, index) => {

        card.style.animationDelay = `${index * 0.5}s`;

    });

}

/* ==========================================================
   PARALLAX HERO SHAPES
========================================================== */

window.addEventListener("scroll", () => {

    const shapes = document.querySelectorAll(".shape");

    const offset = window.pageYOffset;

    shapes.forEach((shape, index) => {

        const speed = (index + 1) * 0.08;

        shape.style.transform =
            `translateY(${offset * speed}px)`;

    });

});

/* ==========================================================
   CONTACT FORM
========================================================== */

const contactForm = document.querySelector(".contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", function(e) {

        e.preventDefault();

        alert(
            "Thank you for contacting Blooming Buds! We will get back to you shortly."
        );

        this.reset();

    });

}

/* ==========================================================
   IMAGE LAZY FADE-IN
========================================================== */

const lazyImages = document.querySelectorAll("img");

const imageObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("loaded");

        imageObserver.unobserve(entry.target);

    });

});

lazyImages.forEach(image => imageObserver.observe(image));

/* ==========================================================
   CURRENT YEAR
========================================================== */

const year = document.querySelector(".current-year");

if (year) {

    year.textContent = new Date().getFullYear();

}

/* ==========================================================
   END
========================================================== */