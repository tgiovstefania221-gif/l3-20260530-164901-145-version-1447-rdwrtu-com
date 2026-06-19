(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  if (slides.length) {
    showHero(0);

    var nextButtons = document.querySelectorAll('[data-hero-next]');
    var prevButtons = document.querySelectorAll('[data-hero-prev]');

    nextButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        showHero(heroIndex + 1);
      });
    });

    prevButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        showHero(heroIndex - 1);
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var searchAreas = document.querySelectorAll('[data-search-area]');

  searchAreas.forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var filters = Array.prototype.slice.call(area.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
    var currentFilter = 'all';

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applySearch() {
      var query = normalize(input ? input.value : '');

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.textContent);
        var group = normalize(card.getAttribute('data-group'));
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = currentFilter === 'all' || group.indexOf(currentFilter) !== -1;
        card.classList.toggle('hidden-card', !(matchesText && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applySearch);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        currentFilter = normalize(filter.getAttribute('data-filter'));

        filters.forEach(function (item) {
          item.classList.toggle('is-active', item === filter);
        });

        applySearch();
      });
    });
  });

  function initVideo(video) {
    if (!video || video.getAttribute('data-ready') === 'true') {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');

    if (!streamUrl) {
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsObject = hls;
      return;
    }

    video.src = streamUrl;
  }

  var videoWraps = document.querySelectorAll('.video-wrap');

  videoWraps.forEach(function (wrap) {
    var video = wrap.querySelector('video[data-stream]');
    var trigger = wrap.querySelector('.play-layer');

    function playVideo() {
      initVideo(video);
      wrap.classList.add('is-playing');

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
    }
  });
})();
