(function() {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }

    if (slides.length) {
        showSlide(0);
        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                showSlide(i);
            });
        });
        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters(scope) {
        var root = scope || document;
        var input = root.querySelector("[data-filter-input]");
        var year = root.querySelector("[data-filter-year]");
        var type = root.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
        var empty = root.querySelector("[data-empty]");
        if (!cards.length || !input) {
            return;
        }
        var keyword = normalize(input.value);
        var yearValue = year ? normalize(year.value) : "";
        var typeValue = type ? normalize(type.value) : "";
        var visible = 0;
        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
            var okType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
            var ok = okKeyword && okYear && okType;
            card.style.display = ok ? "" : "none";
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }


    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");
    if (queryFromUrl) {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function(input) {
            if (!input.value) {
                input.value = queryFromUrl;
            }
        });
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    filterRoots.forEach(function(root) {
        var controls = Array.prototype.slice.call(root.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-type]"));
        controls.forEach(function(control) {
            control.addEventListener("input", function() {
                applyFilters(root);
            });
            control.addEventListener("change", function() {
                applyFilters(root);
            });
        });
        applyFilters(root);
    });

    function setupVideo(video) {
        if (!video || video.getAttribute("data-ready") === "1") {
            return;
        }
        var src = video.getAttribute("data-video");
        if (!src) {
            return;
        }
        video.setAttribute("data-ready", "1");
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
        } else {
            video.src = src;
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function(box) {
        var video = box.querySelector("video");
        var button = box.querySelector("[data-play]");
        if (video) {
            setupVideo(video);
            video.addEventListener("play", function() {
                box.classList.add("is-playing");
            });
            video.addEventListener("pause", function() {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function() {
                box.classList.remove("is-playing");
            });
        }
        if (button && video) {
            button.addEventListener("click", function() {
                setupVideo(video);
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function() {});
                }
            });
        }
    });
})();
