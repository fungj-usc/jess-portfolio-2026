const timeEl = document.getElementById("boston-time");
const player = document.querySelector(".player");
const playerAudio = document.getElementById("player-audio");
const motionLayers = player.querySelectorAll("[data-motion]");

motionLayers.forEach((img) => {
  const preload = new Image();
  preload.src = img.dataset.motion;
});

function formatBostonTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s?(AM|PM)/i, "");
}

function tickClock() {
  const value = formatBostonTime();
  timeEl.textContent = value;
  timeEl.dateTime = value;
}

tickClock();
setInterval(tickClock, 1000);

function setPlaying(isPlaying) {
  player.setAttribute("aria-pressed", String(isPlaying));
  player.classList.toggle("is-playing", isPlaying);
  player.setAttribute("aria-label", isPlaying ? "Pause Blackbird" : "Play Blackbird");
  motionLayers.forEach((img) => {
    img.src = isPlaying ? img.dataset.motion : img.dataset.still;
  });
}

player.addEventListener("click", () => {
  if (playerAudio.paused) {
    playerAudio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  } else {
    playerAudio.pause();
    setPlaying(false);
  }
});

playerAudio.addEventListener("ended", () => setPlaying(false));
