
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

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

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var keyword = filterForm.querySelector('[name="keyword"]');
    var type = filterForm.querySelector('[name="type"]');
    var year = filterForm.querySelector('[name="year"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResult = document.querySelector('.no-result');

    function runFilter() {
      var q = (keyword && keyword.value || '').trim().toLowerCase();
      var t = type && type.value || '';
      var y = year && year.value || '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        if (q && title.indexOf(q) === -1) {
          ok = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (noResult) {
        noResult.classList.toggle('show', visible === 0);
      }
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });
    ['input', 'change'].forEach(function (name) {
      filterForm.addEventListener(name, runFilter);
    });
  }

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch && window.SEARCH_INDEX) {
    var input = globalSearch.querySelector('input');
    var resultBox = document.querySelector('[data-search-results]');
    var emptyBox = document.querySelector('.no-result');

    function renderSearch() {
      var q = (input.value || '').trim().toLowerCase();
      var html = '';
      var matches = [];
      if (q) {
        matches = window.SEARCH_INDEX.filter(function (item) {
          return item.title.toLowerCase().indexOf(q) !== -1 ||
            item.one.toLowerCase().indexOf(q) !== -1 ||
            item.tags.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 80);
      }
      html = matches.map(function (item) {
        return '<article class="movie-card" data-title="' + escapeHtml(item.title) + '">' +
          '<a class="poster" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span><span class="poster-play">▶</span></a>' +
          '<div class="movie-card-body"><div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '年</span></div>' +
          '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.one) + '</p><div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div></div></article>';
      }).join('');
      resultBox.innerHTML = html;
      emptyBox.classList.toggle('show', q && matches.length === 0);
    }

    globalSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch();
    });
    input.addEventListener('input', renderSearch);
    renderSearch();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  window.initPlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var loaded = false;

    function attach() {
      if (!video) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var nextPlay = video.play();
            if (nextPlay && typeof nextPlay.catch === 'function') {
              nextPlay.catch(function () {});
            }
          });
        } else {
          video.src = source;
        }
        video.controls = true;
        loaded = true;
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', attach);
    }
    if (video) {
      video.addEventListener('click', attach);
    }
  };
})();
