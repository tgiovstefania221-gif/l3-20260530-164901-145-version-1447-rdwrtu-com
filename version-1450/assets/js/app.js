(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  var pageSearch = document.querySelector('[data-page-search]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryFromUrl() {
    if (!pageSearch) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var value = params.get('q');

    if (value) {
      pageSearch.value = value;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(pageSearch ? pageSearch.value : '');
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.type,
        card.dataset.region,
        card.dataset.tags,
        card.dataset.category,
        card.dataset.year
      ].join(' '));
      var typeOk = !typeValue || card.dataset.type === typeValue;
      var yearOk = true;

      if (yearValue === 'new') {
        yearOk = Number(card.dataset.year) >= 2024;
      }

      if (yearValue === 'classic') {
        yearOk = Number(card.dataset.year) < 2020;
      }

      var queryOk = !query || haystack.indexOf(query) !== -1;
      var show = queryOk && typeOk && yearOk;

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  applyQueryFromUrl();

  if (pageSearch) {
    pageSearch.addEventListener('input', filterCards);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  filterCards();
})();

function initMoviePlayer(mediaUrl) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');

  if (!video || !mediaUrl) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function attachMedia() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function playVideo() {
    attachMedia();

    if (cover) {
      cover.classList.add('hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
