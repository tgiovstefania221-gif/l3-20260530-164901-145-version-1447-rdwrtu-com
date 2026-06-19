(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = next % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupSearch() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
            var scope = input.closest("[data-search-scope]") || document;
            var targets = Array.prototype.slice.call(scope.querySelectorAll("[data-search-target]"));
            input.addEventListener("input", function () {
                var query = normalize(input.value);
                targets.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-year"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-genre"),
                        item.getAttribute("data-tags"),
                        item.textContent
                    ].join(" "));
                    item.classList.toggle("is-hidden-by-filter", query && haystack.indexOf(query) === -1);
                });
            });
        });
    }

    function setupSort() {
        Array.prototype.slice.call(document.querySelectorAll("[data-sort-select]")).forEach(function (select) {
            var scope = select.closest("[data-search-scope]") || document;
            var grid = scope.querySelector("[data-sort-grid]");
            if (!grid) {
                return;
            }
            select.addEventListener("change", function () {
                var cards = Array.prototype.slice.call(grid.children);
                var mode = select.value;
                cards.sort(function (a, b) {
                    var ay = Number(a.getAttribute("data-year") || 0);
                    var by = Number(b.getAttribute("data-year") || 0);
                    var at = a.getAttribute("data-title") || "";
                    var bt = b.getAttribute("data-title") || "";
                    if (mode === "year-asc") {
                        return ay - by || at.localeCompare(bt, "zh-Hans-CN");
                    }
                    if (mode === "title") {
                        return at.localeCompare(bt, "zh-Hans-CN");
                    }
                    return by - ay || at.localeCompare(bt, "zh-Hans-CN");
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        });
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".play-overlay");
            var src = shell.getAttribute("data-src");
            var started = false;
            var hls = null;
            if (!video || !overlay || !src) {
                return;
            }
            function playVideo() {
                overlay.classList.add("is-hidden");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }
            function start() {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    return;
                }
                video.src = src;
                playVideo();
            }
            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupSort();
        setupPlayers();
    });
})();
