/* ==========================================================
   Blooming Buds Pre-School & Day Care
   script.js
   ========================================================== */

"use strict";

/* ==========================================================
   SHARED HELPERS
========================================================== */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

/**
 * Every scroll-driven feature registers here instead of adding its
 * own listener. Previously four separate listeners each read layout
 * on every scroll event (offsetTop, parallax writes), which forced
 * synchronous reflows and made scrolling visibly stutter.
 */

const scrollHandlers = [];

let scrollTicking = false;

function onScroll(handler) {

    scrollHandlers.push(handler);

    handler(window.scrollY);

}

function runScrollHandlers() {

    const y = window.scrollY;

    for (const handler of scrollHandlers) {
        handler(y);
    }

    scrollTicking = false;

}

window.addEventListener("scroll", () => {

    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(runScrollHandlers);

}, { passive: true });

/**
 * Height the fixed header currently occupies, used as the landing
 * offset for in-page navigation.
 */

function getHeaderOffset() {

    const header = document.querySelector(".header");

    if (!header) return 0;

    return header.offsetHeight + 20;

}

/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initAnnouncementDismiss();
    initAnnouncementOffset();
    initStickyHeader();
    initMobileMenu();
    initDropdownMenu();
    initActiveNavigation();
    initScrollReveal();
    initCounters();
    initBackToTop();
    initSmoothScroll();
    initGalleryInteractions();
    initTestimonialAnimation();
    initFloatingCards();
    initParallaxShapes();
    initContactForm();
    initCurrentYear();

});

/* ==========================================================
   ANNOUNCEMENT BAR DISMISS

   Remembered per browser tab (sessionStorage) rather than
   permanently, so it still greets a visitor who returns another
   day but doesn't keep eating vertical space for the rest of
   this visit once they've closed it.
========================================================== */

function initAnnouncementDismiss() {

    const bar = document.getElementById("announcementBar");
    const closeBtn = document.getElementById("announcementClose");

    if (!bar || !closeBtn) return;

    function hide() {

        bar.style.display = "none";

        document.documentElement.style.setProperty("--announcement-height", "0px");

    }

    let dismissed = false;

    try {
        dismissed = sessionStorage.getItem("announcementDismissed") === "true";
    } catch (e) {
        // Storage unavailable (private mode, etc.) — bar just stays visible.
    }

    if (dismissed) {

        hide();
        return;

    }

    closeBtn.addEventListener("click", () => {

        hide();

        try {
            sessionStorage.setItem("announcementDismissed", "true");
        } catch (e) { }

    });

}

/* ==========================================================
   ANNOUNCEMENT BAR OFFSET

   The header is pinned below the announcement bar. That offset
   was hard-coded to 40px, so the header overlapped the bar as
   soon as the announcement text wrapped to a second line on
   narrow screens.
========================================================== */

function initAnnouncementOffset() {

    const bar = document.querySelector(".announcement-bar");

    if (!bar) return;

    function measure() {

        document.documentElement.style.setProperty(
            "--announcement-height",
            `${Math.round(bar.getBoundingClientRect().height)}px`
        );

    }

    measure();

    window.addEventListener("resize", measure);

    window.addEventListener("load", measure);

}

/* ==========================================================
   STICKY HEADER
========================================================== */

function initStickyHeader() {

    const header = document.querySelector(".header");

    if (!header) return;

    onScroll(y => {

        header.classList.toggle("scrolled", y > 60);

    });

}

/* ==========================================================
   MOBILE MENU
========================================================== */

function initMobileMenu() {

    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".nav-menu");

    if (!toggle || !menu) return;

    const icon = toggle.querySelector("i");

    function setMenu(isOpen) {

        menu.classList.toggle("active", isOpen);

        toggle.classList.toggle("active", isOpen);

        toggle.setAttribute("aria-expanded", String(isOpen));

        // Re-class the existing icon rather than rewriting innerHTML.
        // Replacing the markup detached the very node that was clicked,
        // so the outside-click handler below no longer recognised it as
        // part of the button and closed the menu immediately.

        if (icon) {

            icon.className = isOpen ? "ri-close-line" : "ri-menu-3-line";

        }

    }

    toggle.addEventListener("click", () => {

        setMenu(!toggle.classList.contains("active"));

    });

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => setMenu(false));

    });

    // Tapping outside the panel, or pressing Escape, closes it

    document.addEventListener("click", event => {

        if (!menu.classList.contains("active")) return;

        if (menu.contains(event.target) || toggle.contains(event.target)) return;

        setMenu(false);

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") setMenu(false);

    });

}

/* ==========================================================
   NAV DROPDOWNS

   Hover opens them on desktop (handled purely in CSS), but click
   is wired here too so touch and keyboard users — who never
   trigger :hover — can still reach the submenu.
========================================================== */

function initDropdownMenu() {

    const items = Array.from(document.querySelectorAll(".nav-item.has-dropdown"));

    if (!items.length) return;

    function closeAll(except) {

        items.forEach(item => {

            if (item === except) return;

            item.classList.remove("open");

            const toggle = item.querySelector(".dropdown-toggle");

            if (toggle) toggle.setAttribute("aria-expanded", "false");

        });

    }

    items.forEach(item => {

        const toggle = item.querySelector(".dropdown-toggle");

        if (!toggle) return;

        toggle.addEventListener("click", event => {

            event.stopPropagation();

            const willOpen = !item.classList.contains("open");

            closeAll(item);

            item.classList.toggle("open", willOpen);

            toggle.setAttribute("aria-expanded", String(willOpen));

        });

        item.querySelectorAll(".dropdown-link").forEach(link => {

            link.addEventListener("click", () => {

                item.classList.remove("open");

                toggle.setAttribute("aria-expanded", "false");

            });

        });

    });

    document.addEventListener("click", event => {

        if (items.some(item => item.contains(event.target))) return;

        closeAll();

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") closeAll();

    });

}

/* ==========================================================
   ACTIVE NAVIGATION

   Section positions are measured once and re-measured on resize
   rather than on every scroll frame.
========================================================== */

function initActiveNavigation() {

    const sections = Array.from(document.querySelectorAll("section[id]"));
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));

    if (!sections.length || !navLinks.length) return;

    let positions = [];

    function measure() {

        positions = sections.map(section => {

            const top = section.getBoundingClientRect().top + window.scrollY;

            return {
                id: section.id,
                top: top,
                bottom: top + section.offsetHeight
            };

        });

    }

    function activate(y) {

        let current = "";

        // Probe just below the fixed header — i.e. the first line of
        // content the visitor can actually see. Comparing raw scrollY
        // against an offset section top left the nav one section behind
        // after an in-page jump.

        const probe = y + getHeaderOffset() + 10;

        for (const entry of positions) {

            if (probe >= entry.top && probe < entry.bottom) {
                current = entry.id;
            }

        }

        // Near the very bottom nothing else can become active

        if (!current &&
            y + window.innerHeight >= document.body.scrollHeight - 4) {

            current = positions[positions.length - 1].id;

        }

        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + current
            );

        });

        // A dropdown toggle has no href of its own — light it up
        // whenever one of its submenu links is the active one, so
        // visitors can tell which section they're in without having
        // to open the submenu.

        document.querySelectorAll(".nav-item.has-dropdown").forEach(item => {

            const toggle = item.querySelector(".dropdown-toggle");

            if (!toggle) return;

            toggle.classList.toggle(
                "active",
                Boolean(item.querySelector(".dropdown-link.active"))
            );

        });

    }

    measure();

    onScroll(activate);

    window.addEventListener("resize", () => {

        measure();

        activate(window.scrollY);

    });

    window.addEventListener("load", measure);

}

/* ==========================================================
   SMOOTH SCROLL

   The CSS `scroll-behavior:smooth` handles keyboard and hash
   navigation; this adds the correct fixed-header offset, which
   CSS alone cannot compute.
========================================================== */

function initSmoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (event) {

            const hash = this.getAttribute("href");

            if (!hash || hash === "#") return;

            const target = document.querySelector(hash);

            if (!target) return;

            event.preventDefault();

            const top =
                target.getBoundingClientRect().top +
                window.scrollY -
                getHeaderOffset();

            window.scrollTo({
                top: Math.max(top, 0),
                behavior: prefersReducedMotion.matches ? "auto" : "smooth"
            });

            // Deliberately no focus() / replaceState() here: both make the
            // browser run its own "scroll the fragment into view" pass,
            // which landed on `scroll-padding-top` instead and snapped the
            // section 42px away from where the smooth scroll had put it.

        });

    });

}

/* ==========================================================
   SCROLL REVEAL

   `.reveal` animates the element itself, `.reveal-stagger`
   animates its direct children in sequence. Both classes are
   stripped once the animation finishes so the elements go back
   to their own hover transitions.
========================================================== */

function initScrollReveal() {

    const elements = document.querySelectorAll(".reveal,.reveal-stagger");

    if (!elements.length) return;

    function show(el) {

        el.classList.add("is-visible");

        const childCount = el.classList.contains("reveal-stagger")
            ? el.children.length
            : 0;

        const settle = 800 + Math.min(childCount, 9) * 70;

        window.setTimeout(() => {

            el.classList.remove("reveal", "reveal-stagger", "is-visible");

        }, settle);

    }

    // No observer support, or the visitor asked for less motion —
    // show everything straight away.

    if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {

        elements.forEach(show);

        return;

    }

    const observer = new IntersectionObserver((entries, obs) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            show(entry.target);

            obs.unobserve(entry.target);

        });

    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px"
    });

    elements.forEach(el => observer.observe(el));

}

/* ==========================================================
   COUNTER ANIMATION
========================================================== */

function initCounters() {

    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    function run(counter) {

        const target = Number(counter.dataset.target) || 0;

        if (prefersReducedMotion.matches) {

            counter.textContent = target;

            return;

        }

        const duration = 1400;

        let startTime = null;

        function step(timestamp) {

            if (startTime === null) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out so the number settles instead of stopping dead

            const eased = 1 - Math.pow(1 - progress, 3);

            counter.textContent = Math.round(target * eased);

            if (progress < 1) window.requestAnimationFrame(step);

        }

        window.requestAnimationFrame(step);

    }

    if (!("IntersectionObserver" in window)) {

        counters.forEach(run);

        return;

    }

    const observer = new IntersectionObserver((entries, obs) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            run(entry.target);

            obs.unobserve(entry.target);

        });

    }, { threshold: 0.4 });

    counters.forEach(counter => observer.observe(counter));

}

/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop() {

    const button = document.getElementById("backToTop");

    if (!button) return;

    onScroll(y => {

        button.classList.toggle("show", y > 500);

    });

    button.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion.matches ? "auto" : "smooth"
        });

    });

}

/* ==========================================================
   GALLERY — TOUCH CAPTIONS + LIGHTBOX
========================================================== */

function initGalleryInteractions() {

    const items = Array.from(document.querySelectorAll(".gallery-item"));

    if (!items.length) return;

    /* --- Caption reveal on hover (mirrors :hover for pointer-less
           devices, where the CSS hover state never fires) --- */

    items.forEach(item => {

        item.addEventListener("mouseenter", () => item.classList.add("active"));

        item.addEventListener("mouseleave", () => item.classList.remove("active"));

    });

    /* --- Lightbox --- */

    const lightbox = document.getElementById("lightbox");

    if (!lightbox) return;

    const image = lightbox.querySelector(".lightbox-image");
    const caption = lightbox.querySelector(".lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    const slides = items.map(item => {

        const img = item.querySelector("img");
        const title = item.querySelector("figcaption h4");

        return {
            src: img ? img.getAttribute("src") : "",
            alt: img ? img.getAttribute("alt") : "",
            title: title ? title.textContent.trim() : ""
        };

    });

    let index = 0;
    let lastFocused = null;

    function render() {

        const slide = slides[index];

        image.setAttribute("src", slide.src);
        image.setAttribute("alt", slide.alt);

        caption.textContent = slide.title;

    }

    function open(startIndex) {

        index = startIndex;

        lastFocused = document.activeElement;

        render();

        lightbox.hidden = false;

        // Next frame so the opacity transition has a starting value

        window.requestAnimationFrame(() => lightbox.classList.add("open"));

        document.body.style.overflow = "hidden";

        closeBtn.focus();

    }

    function close() {

        lightbox.classList.remove("open");

        document.body.style.overflow = "";

        window.setTimeout(() => {

            lightbox.hidden = true;

        }, 300);

        if (lastFocused) lastFocused.focus();

    }

    function move(step) {

        index = (index + step + slides.length) % slides.length;

        render();

    }

    // The whole tile is the hit area; the zoom button is the
    // visible affordance and simply bubbles up to it.

    items.forEach((item, i) => {

        item.addEventListener("click", () => open(i));

    });

    closeBtn.addEventListener("click", close);

    prevBtn.addEventListener("click", () => move(-1));

    nextBtn.addEventListener("click", () => move(1));

    lightbox.addEventListener("click", event => {

        if (event.target === lightbox) close();

    });

    document.addEventListener("keydown", event => {

        if (lightbox.hidden) return;

        if (event.key === "Escape") close();

        if (event.key === "ArrowLeft") move(-1);

        if (event.key === "ArrowRight") move(1);

        // Trap Tab focus inside the dialog — otherwise it leaks into the
        // page behind it, which a screen reader/keyboard user can't see.

        if (event.key === "Tab") {

            const focusable = [closeBtn, prevBtn, nextBtn];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {

                event.preventDefault();
                last.focus();

            } else if (!event.shiftKey && document.activeElement === last) {

                event.preventDefault();
                first.focus();

            }

        }

    });

}

/* ==========================================================
   TESTIMONIAL AUTO HIGHLIGHT
========================================================== */

function initTestimonialAnimation() {

    const cards = document.querySelectorAll(".testimonial-card");

    if (cards.length < 2 || prefersReducedMotion.matches) return;

    const grid = cards[0].closest(".testimonials-grid");

    let current = 0;
    let intervalId = null;

    function tick() {

        cards.forEach(card => card.classList.remove("active"));

        cards[current].classList.add("active");

        current = (current + 1) % cards.length;

    }

    function start() {

        if (intervalId) return;

        intervalId = window.setInterval(tick, 3500);

    }

    function stop() {

        window.clearInterval(intervalId);

        intervalId = null;

    }

    start();

    // Pause while a visitor is actively hovering or has keyboard focus
    // inside the grid, so the highlight doesn't shift under them.

    if (grid) {

        grid.addEventListener("mouseenter", stop);
        grid.addEventListener("mouseleave", start);
        grid.addEventListener("focusin", stop);
        grid.addEventListener("focusout", start);

    }

}

/* ==========================================================
   FLOATING CARDS
========================================================== */

function initFloatingCards() {

    document.querySelectorAll(".floating-card").forEach((card, index) => {

        card.style.animationDelay = `${index * 0.5}s`;

    });

}

/* ==========================================================
   PARALLAX HERO SHAPES

   Skipped on small screens (the shapes are hidden there) and
   under reduced-motion. Transforms are written inside the
   shared rAF pass so they never fight the scroll thread.
========================================================== */

function initParallaxShapes() {

    const shapes = Array.from(document.querySelectorAll(".shape"));

    if (!shapes.length || prefersReducedMotion.matches) return;

    const wide = window.matchMedia("(min-width: 577px)");

    onScroll(y => {

        if (!wide.matches) return;

        // Only worth doing while the hero is still on screen

        if (y > window.innerHeight * 1.2) return;

        shapes.forEach((shape, index) => {

            const speed = (index + 1) * 0.06;

            shape.style.transform = `translate3d(0, ${y * speed}px, 0)`;

        });

    });

}

/* ==========================================================
   CONTACT FORM
========================================================== */

function initContactForm() {

    const form = document.querySelector(".contact-form");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        alert(
            "Thank you for contacting Blooming Buds! We will get back to you shortly."
        );

        this.reset();

    });

}

/* ==========================================================
   CURRENT YEAR
========================================================== */

function initCurrentYear() {

    const year = document.querySelector(".current-year");

    if (year) year.textContent = new Date().getFullYear();

}

/* ==========================================================
   END
========================================================== */