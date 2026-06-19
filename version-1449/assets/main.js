(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function() {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function(slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = slides.findIndex(function(slide) { return slide.classList.contains("active"); });
      if (index < 0) {
        index = 0;
      }

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(index - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          show(index + 1);
        });
      }
      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function() {
          show(index + 1);
        }, 5000);
      }
    });

    document.querySelectorAll("[data-filter-form]").forEach(function(form) {
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-filter-empty]");
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
      var params = new URLSearchParams(window.location.search);

      ["q", "year", "region", "category"].forEach(function(name) {
        var field = form.elements[name];
        var value = params.get(name);
        if (field && value) {
          field.value = value;
        }
      });

      function getText(item) {
        return [
          item.dataset.title,
          item.dataset.year,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.type,
          item.dataset.category
        ].join(" ").toLowerCase();
      }

      function apply() {
        var q = (form.elements.q && form.elements.q.value || "").trim().toLowerCase();
        var year = form.elements.year && form.elements.year.value || "";
        var region = form.elements.region && form.elements.region.value || "";
        var category = form.elements.category && form.elements.category.value || "";
        var shown = 0;

        items.forEach(function(item) {
          var text = getText(item);
          var yearValue = parseInt(item.dataset.year || "0", 10);
          var pass = true;
          if (q && text.indexOf(q) === -1) {
            pass = false;
          }
          if (year) {
            if (year === "2020") {
              pass = pass && yearValue <= 2020;
            } else {
              pass = pass && String(yearValue) === year;
            }
          }
          if (region) {
            pass = pass && (item.dataset.region || "").indexOf(region) !== -1;
          }
          if (category) {
            pass = pass && text.indexOf(category.toLowerCase()) !== -1;
          }
          item.hidden = !pass;
          if (pass) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      form.addEventListener("submit", function(event) {
        event.preventDefault();
        apply();
      });

      form.querySelectorAll("input, select").forEach(function(field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });

      var reset = form.querySelector("[data-filter-reset]");
      if (reset) {
        reset.addEventListener("click", function() {
          form.reset();
          apply();
        });
      }

      apply();
    });
  });
})();
