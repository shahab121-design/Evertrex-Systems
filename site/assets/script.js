(function () {
  "use strict";

  /* =========================================================
     CONFIG — replace before going live
  ========================================================= */
  // Create a free form at https://formspree.io pointed at evertrexsystems@gmail.com
  // and paste the resulting endpoint below. Using a form ID (not a raw email)
  // keeps the destination address out of the page source entirely.
  var FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

  /* =========================================================
     Footer year
  ========================================================= */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     Mobile nav toggle
  ========================================================= */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================================================
     "Contact Us" buttons scroll to the contact form
  ========================================================= */
  document.querySelectorAll("[data-scroll-to]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-scroll-to"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* =========================================================
     Scroll reveal (IntersectionObserver)
  ========================================================= */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* =========================================================
     Hero phone mockup loop
  ========================================================= */
  var frames = document.querySelectorAll("#phone-stage .phone-frame");
  if (frames.length) {
    var frameIndex = 0;
    var showFrame = function (i) {
      frames.forEach(function (f, idx) {
        f.classList.toggle("active", idx === i);
      });
    };
    showFrame(0);
    setInterval(function () {
      frameIndex = (frameIndex + 1) % frames.length;
      showFrame(frameIndex);
    }, 2600);
  }

  /* =========================================================
     Stat count-up on scroll
  ========================================================= */
  var statEl = document.getElementById("stat-figure");
  if (statEl && "IntersectionObserver" in window) {
    var target = parseInt(statEl.getAttribute("data-target"), 10) || 0;
    var suffix = statEl.querySelector("span");
    var suffixHTML = suffix ? suffix.outerHTML : "";
    var counted = false;

    var countUp = function () {
      var start = null;
      var duration = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(eased * target);
        statEl.innerHTML = value + suffixHTML;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            countUp();
            statObserver.disconnect();
          }
        });
      },
      { threshold: 0.6 }
    );
    statObserver.observe(statEl);
  }

  /* =========================================================
     FAQ accordion
  ========================================================= */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* =========================================================
     Contact form: validation + spam protection + submit
  ========================================================= */
  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = document.getElementById("contact-submit");

    var validators = {
      fullname: function (v) { return v.trim().length > 1; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      phone: function (v) { return /^[0-9()+\-.\s]{7,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };

    var setFieldValid = function (name, valid) {
      var input = form.elements[name];
      var row = input.closest(".form-row");
      row.classList.toggle("invalid", !valid);
    };

    var validateField = function (name) {
      var input = form.elements[name];
      var valid = validators[name](input.value);
      setFieldValid(name, valid);
      return valid;
    };

    ["fullname", "email", "phone", "message"].forEach(function (name) {
      form.elements[name].addEventListener("blur", function () {
        validateField(name);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.className = "form-status";

      // Honeypot: if filled, silently treat as spam
      if (form.elements["company"] && form.elements["company"].value) {
        statusEl.textContent = "Thank you, your message has been received and we'll be in touch shortly.";
        statusEl.className = "form-status success";
        form.reset();
        return;
      }

      var allValid = ["fullname", "email", "phone", "message"]
        .map(validateField)
        .every(Boolean);

      if (!allValid) {
        statusEl.textContent = "Please fix the highlighted fields and try again.";
        statusEl.className = "form-status error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (response.ok) {
            statusEl.textContent = "Thank you, your message has been received and we'll be in touch shortly.";
            statusEl.className = "form-status success";
            form.reset();
          } else {
            throw new Error("Submission failed");
          }
        })
        .catch(function () {
          statusEl.textContent = "Something went wrong sending your message. Please call or try again.";
          statusEl.className = "form-status error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        });
    });
  }
})();
