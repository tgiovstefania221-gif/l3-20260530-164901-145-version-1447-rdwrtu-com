(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };
        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        start();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var keyword = filterPanel.querySelector('[data-filter-keyword]');
        var region = filterPanel.querySelector('[data-filter-region]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var apply = function () {
            var q = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
            var r = region && region.value ? region.value : '';
            var y = year && year.value ? year.value : '';
            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var pass = (!q || title.indexOf(q) !== -1) && (!r || cardRegion === r) && (!y || cardYear === y);
                card.classList.toggle('is-hidden-card', !pass);
            });
        };
        [keyword, region, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    var searchForm = document.querySelector('[data-search-form]');
    if (searchForm && window.MOVIE_INDEX) {
        var input = searchForm.querySelector('[data-search-input]');
        var regionSelect = searchForm.querySelector('[data-search-region]');
        var results = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        var escapeHtml = function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };
        var renderCard = function (item) {
            return '<a class="movie-card" href="./' + escapeHtml(item.file) + '">' +
                '<span class="card-cover">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="card-gradient"></span>' +
                '<span class="card-badge">' + escapeHtml(item.regionGroup) + '</span>' +
                '<span class="card-score">★ ' + escapeHtml(item.rating) + '</span>' +
                '</span>' +
                '<span class="card-info">' +
                '<strong>' + escapeHtml(item.title) + '</strong>' +
                '<em>' + escapeHtml(item.oneLine) + '</em>' +
                '<span class="card-meta"><span>' + escapeHtml(item.year) + '年</span><span>' + escapeHtml(item.type) + '</span></span>' +
                '</span>' +
                '</a>';
        };
        var runSearch = function () {
            var q = input && input.value ? input.value.trim().toLowerCase() : '';
            var r = regionSelect && regionSelect.value ? regionSelect.value : '';
            var list = window.MOVIE_INDEX.filter(function (item) {
                var haystack = [item.title, item.oneLine, item.genre, item.tags, item.year, item.region].join(' ').toLowerCase();
                return (!q || haystack.indexOf(q) !== -1) && (!r || item.regionGroup === r);
            }).slice(0, 120);
            if (q || r) {
                results.innerHTML = list.map(renderCard).join('');
                status.textContent = list.length ? '搜索结果' : '暂无匹配影片';
                var newUrl = './search.html';
                if (q) {
                    newUrl += '?q=' + encodeURIComponent(input.value.trim());
                }
                window.history.replaceState({}, '', newUrl);
            }
        };
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
        if (regionSelect) {
            regionSelect.addEventListener('change', runSearch);
        }
        if (initial) {
            runSearch();
        }
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playOverlay');
        if (!video || !source) {
            return;
        }
        var hlsInstance = null;
        var prepared = false;
        var prepare = function () {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        };
        var start = function () {
            prepare();
            video.setAttribute('controls', 'controls');
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
