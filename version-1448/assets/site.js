(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs("[data-menu-toggle]");
    var nav = qs("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function setupHeroSearch() {
    var form = qs("[data-hero-search]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = qs("input[name='q']", form);
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function yearMatches(movieYear, selected) {
    if (!selected) {
      return true;
    }

    var year = Number(movieYear);
    if (selected === "classic") {
      return year < 2000;
    }
    if (selected === "2000") {
      return year >= 2000 && year <= 2009;
    }
    if (selected === "2010") {
      return year >= 2010 && year <= 2019;
    }
    if (selected === "2020") {
      return year >= 2020 && year <= 2022;
    }
    return String(movieYear) === selected;
  }

  function setupFilters() {
    var panels = qsa("[data-filter-panel]");
    panels.forEach(function (panel) {
      var input = qs("[data-filter-input]", panel);
      var typeFilter = qs("[data-type-filter]", panel);
      var yearFilter = qs("[data-year-filter]", panel);
      var clear = qs("[data-clear-filter]", panel);
      var results = qs("[data-filter-results]");
      var empty = qs("[data-filter-empty]");

      if (!results) {
        return;
      }

      var cards = qsa("[data-movie-card]", results);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeFilter ? typeFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var match = true;

          if (query && search.indexOf(query) === -1) {
            match = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            match = false;
          }
          if (!yearMatches(cardYear, year)) {
            match = false;
          }

          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (typeFilter) {
            typeFilter.value = "";
          }
          if (yearFilter) {
            yearFilter.value = "";
          }
          apply();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && input) {
        input.value = initialQuery;
      }
      apply();
    });
  }

  function setupPlayers() {
    qsa("[data-player]").forEach(function (shell) {
      var video = qs("video", shell);
      var start = qs("[data-player-start]", shell);
      var status = qs("[data-player-status]", shell);
      var source = shell.getAttribute("data-video-url");
      var hlsInstance = null;
      var started = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function startPlayer() {
        if (!video || !source) {
          setStatus("播放源不可用");
          return;
        }
        if (started) {
          video.play();
          return;
        }
        started = true;
        shell.classList.add("playing");
        setStatus("正在加载播放源…");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
            video.play().catch(function () {
              setStatus("请再次点击播放器开始播放");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放加载失败，请刷新后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源已就绪");
            video.play().catch(function () {
              setStatus("请再次点击播放器开始播放");
            });
          }, { once: true });
        } else {
          video.src = source;
          video.play().then(function () {
            setStatus("播放源已就绪");
          }).catch(function () {
            setStatus("当前浏览器需要支持 HLS 或加载 hls.js 后播放");
          });
        }
      }

      if (start) {
        start.addEventListener("click", startPlayer);
      }

      video.addEventListener("play", function () {
        shell.classList.add("playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupFilters();
    setupPlayers();
  });
}());
