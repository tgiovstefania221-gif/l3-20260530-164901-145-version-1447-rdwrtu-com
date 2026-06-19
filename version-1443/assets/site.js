(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = all("[data-hero-slide]");
  var dots = all("[data-hero-dot]");
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle("is-active", idx === heroIndex);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle("is-active", idx === heroIndex);
    });
  }

  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  if (prev) {
    prev.addEventListener("click", function () {
      showHero(heroIndex - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      showHero(heroIndex + 1);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5000);
  }

  function applyFilters(scope) {
    var root = scope || document;
    var input = root.querySelector(".filter-input");
    var selects = all(".filter-select", root);
    var cards = all(".movie-card, .mini-card", root);
    var empty = root.querySelector(".empty-state");
    if (!input && !selects.length) {
      return;
    }
    function run() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter")] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        var text = card.getAttribute("data-search") || "";
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (filters.year && card.getAttribute("data-year") !== filters.year) {
          ok = false;
        }
        if (filters.type && card.getAttribute("data-type") !== filters.type) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    if (input) {
      input.addEventListener("input", run);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", run);
    });
  }

  applyFilters(document);

  window.initMoviePlayer = function (videoId, coverId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var ready = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
