const MovieSite = {
  initMenu() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  },

  initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === index);
      });
    };

    const run = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        run();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        run();
      });
    });

    show(0);
    run();
  },

  initFilters() {
    const panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach((panel) => {
      const input = panel.querySelector("[data-search-input]");
      const category = panel.querySelector("[data-category-select]");
      const sort = panel.querySelector("[data-sort-select]");
      const scopeId = panel.getAttribute("data-filter-panel");
      const scope = scopeId ? document.getElementById(scopeId) : document;
      if (!scope) {
        return;
      }
      const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));

      const apply = () => {
        const keyword = input ? input.value.trim().toLowerCase() : "";
        const catValue = category ? category.value : "";
        cards.forEach((card) => {
          const text = [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.category,
            card.dataset.tags
          ].join(" ").toLowerCase();
          const matchedKeyword = !keyword || text.includes(keyword);
          const matchedCategory = !catValue || card.dataset.category === catValue;
          card.classList.toggle("hidden-card", !(matchedKeyword && matchedCategory));
        });

        if (sort) {
          const visibleCards = cards
            .filter((card) => !card.classList.contains("hidden-card"))
            .sort((a, b) => {
              if (sort.value === "year") {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
              }
              if (sort.value === "rating") {
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
              }
              if (sort.value === "views") {
                return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
              }
              return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
            });
          visibleCards.forEach((card) => scope.appendChild(card));
        }
      };

      if (input) {
        input.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }
      apply();
    });
  },

  setupPlayer(streamUrl) {
    const ready = () => {
      const video = document.getElementById("videoPlayer");
      const cover = document.getElementById("playButton");
      if (!video || !cover || !streamUrl) {
        return;
      }
      let started = false;
      let hls = null;

      const start = () => {
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
          } else {
            video.src = streamUrl;
          }
        }
        video.controls = true;
        cover.classList.add("is-hidden");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            cover.classList.remove("is-hidden");
          });
        }
      };

      cover.addEventListener("click", start);
      video.addEventListener("click", () => {
        if (!started) {
          start();
        }
      });
      window.addEventListener("beforeunload", () => {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ready);
    } else {
      ready();
    }
  },

  boot() {
    this.initMenu();
    this.initHero();
    this.initFilters();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  MovieSite.boot();
});
