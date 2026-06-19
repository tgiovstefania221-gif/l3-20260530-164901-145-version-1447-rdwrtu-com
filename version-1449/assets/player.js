(function() {
  window.setupMoviePlayer = function(videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }

    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector("[data-player-button]") : null;
    var hls = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    function play() {
      if (shell) {
        shell.classList.add("playing");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function() {});
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", function() {
      if (shell) {
        shell.classList.add("playing");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
