const timeEl = document.getElementById("boston-time");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

function timeChars(value) {
  return [...value];
}

function digitTargets(value) {
  return timeChars(value).filter((char) => char !== ":");
}

function createColon() {
  const colon = document.createElement("span");
  colon.className = "clock-colon";
  colon.setAttribute("aria-hidden", "true");
  colon.textContent = ":";
  return colon;
}

function appendCells(track, values) {
  values.forEach((value) => {
    const cell = document.createElement("span");
    cell.textContent = String(value);
    track.append(cell);
  });
}

function createReel(char, extraTurns) {
  const digit = document.createElement("span");
  digit.className = "clock-digit";
  digit.dataset.value = extraTurns > 0 ? "0" : char;
  digit.setAttribute("aria-hidden", "true");

  const track = document.createElement("span");
  track.className = "clock-digit-track";
  track.style.setProperty("--i", "0");

  const sequence = [];
  for (let turn = 0; turn < extraTurns; turn += 1) {
    for (let n = 0; n <= 9; n += 1) sequence.push(n);
  }
  const target = Number(char);
  for (let n = extraTurns > 0 ? 0 : target; n <= target; n += 1) {
    sequence.push(n);
  }
  appendCells(track, sequence);
  digit.append(track);
  digit.dataset.steps = String(sequence.length - 1);
  return digit;
}

function digitNodes() {
  return [...timeEl.querySelectorAll(".clock-digit")];
}

function pruneReel(digit) {
  const track = digit.querySelector(".clock-digit-track");
  const last = track.lastElementChild;
  if (!last) return;
  track.style.transition = "none";
  track.replaceChildren(last.cloneNode(true));
  track.style.setProperty("--i", "0");
  void track.offsetWidth;
  track.style.transition = "";
}

function mountClock(value, extraTurnsByIndex) {
  timeEl.replaceChildren();
  timeEl.dateTime = value;
  let digitIndex = 0;
  timeChars(value).forEach((char) => {
    if (char === ":") {
      timeEl.append(createColon());
      return;
    }
    const extra = extraTurnsByIndex ? extraTurnsByIndex(digitIndex) : 0;
    timeEl.append(createReel(char, extra));
    digitIndex += 1;
  });
}

function playIntro(value) {
  mountClock(value, (index) => 1 + Math.min(index, 2));
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      digitNodes().forEach((digit, index) => {
        const track = digit.querySelector(".clock-digit-track");
        const steps = Number(digit.dataset.steps);
        const duration = 1100 + index * 280;
        track.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.78, 0.18, 1)`;
        track.style.transitionDelay = `${index * 70}ms`;
        track.style.setProperty("--i", String(steps));
        digit.dataset.value = digitTargets(value)[index];
      });
      const longest = 1100 + (digitNodes().length - 1) * 280 + (digitNodes().length - 1) * 70 + 80;
      window.setTimeout(() => {
        digitNodes().forEach(pruneReel);
        resolve();
      }, longest);
    });
  });
}

function rollReel(digit, nextChar) {
  if (digit.dataset.value === nextChar) return;
  const track = digit.querySelector(".clock-digit-track");
  let current = Number(digit.dataset.value);
  const target = Number(nextChar);
  const added = [];
  do {
    current = (current + 1) % 10;
    added.push(current);
  } while (current !== target);
  appendCells(track, added);
  const nextIndex = Number(track.style.getPropertyValue("--i") || 0) + added.length;
  track.style.transition = `transform ${180 + added.length * 70}ms cubic-bezier(0.2, 0.7, 0.2, 1)`;
  track.style.transitionDelay = "0ms";
  track.style.setProperty("--i", String(nextIndex));
  digit.dataset.value = nextChar;
  window.setTimeout(() => pruneReel(digit), 180 + added.length * 70 + 40);
}

function updateClockDigits(value) {
  const digits = digitNodes();
  const targets = digitTargets(value);
  if (digits.length !== targets.length) {
    mountClock(value, () => 0);
    return;
  }
  digits.forEach((digit, index) => rollReel(digit, targets[index]));
}

function tickClock(animateChange) {
  if (!timeEl) return;
  const value = formatBostonTime();
  if (value === timeEl.dateTime) return;
  timeEl.dateTime = value;
  if (reduceMotion.matches) {
    timeEl.textContent = value;
    return;
  }
  if (!timeEl.querySelector(".clock-digit")) {
    mountClock(value, () => 0);
    return;
  }
  if (animateChange) updateClockDigits(value);
}

if (timeEl) {
  const now = formatBostonTime();
  if (reduceMotion.matches) {
    timeEl.textContent = now;
    timeEl.dateTime = now;
    setInterval(() => tickClock(false), 1000);
  } else {
    let clockReady = false;
    playIntro(now).finally(() => {
      clockReady = true;
      tickClock(true);
    });
    setInterval(() => {
      if (clockReady) tickClock(true);
    }, 1000);
  }
}

const player = document.querySelector(".player");
const playerAudio = document.getElementById("player-audio");

if (player && playerAudio) {
  const motionLayers = player.querySelectorAll("[data-motion]");

  motionLayers.forEach((img) => {
    const preload = new Image();
    preload.src = img.dataset.motion;
  });

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
}

const previewStops = [];

function stopAllProjectPreviews() {
  previewStops.forEach((stop) => stop());
  document.querySelectorAll(".preview-video").forEach((video) => {
    video.pause();
  });
}

function initProjectPreviews() {
  document.querySelectorAll(".project-preview").forEach((preview) => {
    const row = preview.closest(".record-row");
    const trigger = row?.querySelector(".project-link");
    if (!row || !trigger) return;

    const video = preview.querySelector(".preview-video");
    const clips = (preview.dataset.clips || "")
      .split(",")
      .map((clip) => clip.trim())
      .filter(Boolean);
    const hasClips = Boolean(video && clips.length);

    let index = 0;
    let active = false;
    let playTimer = 0;
    let stopTimer = 0;

    const topicsInner = preview.querySelector(".preview-topics-inner");
    const topics = [...preview.querySelectorAll(".preview-topic:not(.is-disabled)")];

    function setCurrentTopic(topic) {
      topics.forEach((item) => item.classList.toggle("is-current", item === topic));
    }

    function resetTopic() {
      setCurrentTopic(topics[index] || null);
    }
    topics.forEach((topic) => {
      topic.addEventListener("mouseenter", () => setCurrentTopic(topic));
      topic.addEventListener("focus", () => setCurrentTopic(topic));
      topic.addEventListener("mouseleave", (event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Element) || !next.closest(".preview-topic:not(.is-disabled)")) {
          resetTopic();
        }
      });
    });
    topicsInner?.addEventListener("mouseleave", resetTopic);

    const preloadEl = document.createElement("video");
    preloadEl.muted = true;
    preloadEl.playsInline = true;
    preloadEl.preload = "auto";
    let fadeTimer = 0;
    let fading = false;

    function preloadNext() {
      if (clips.length < 2) return;
      preloadEl.src = clips[(index + 1) % clips.length];
    }

    function revealClip() {
      fading = false;
      preview.classList.remove("is-clip-fading");
    }

    function showClip(nextIndex, { fade = false } = {}) {
      if (!hasClips) return;
      const apply = () => {
        index = ((nextIndex % clips.length) + clips.length) % clips.length;
        video.src = clips[index];
        video.muted = true;
        video.loop = clips.length === 1;
        setCurrentTopic(topics[index] || null);
        if (active && !reduceMotion.matches) {
          const playWhenReady = () => {
            if (!active) return;
            video.play().catch(() => {});
            revealClip();
          };
          if (video.readyState >= 2) playWhenReady();
          else video.addEventListener("loadeddata", playWhenReady, { once: true });
        } else {
          revealClip();
        }
        preloadNext();
      };

      window.clearTimeout(fadeTimer);
      if (fade && clips.length > 1 && !reduceMotion.matches) {
        fading = true;
        preview.classList.add("is-clip-fading");
        fadeTimer = window.setTimeout(apply, 700);
        return;
      }
      revealClip();
      apply();
    }

    function startPreview() {
      if (document.body.classList.contains("is-cover-open")) return;
      window.clearTimeout(stopTimer);
      if (active) return;
      active = true;
      row.classList.add("is-previewing");
      if (!hasClips) return;
      if (!video.getAttribute("src")) showClip(index);
      else video.currentTime = 0;
      if (reduceMotion.matches) {
        video.pause();
        return;
      }
      window.clearTimeout(playTimer);
      playTimer = window.setTimeout(() => {
        if (!active) return;
        video.muted = true;
        video.play().catch(() => {});
      }, 450);
    }

    function stopPreview() {
      if (!active) return;
      active = false;
      fading = false;
      window.clearTimeout(playTimer);
      window.clearTimeout(stopTimer);
      window.clearTimeout(fadeTimer);
      row.classList.remove("is-previewing");
      preview.classList.remove("is-clip-fading");
      resetTopic();
      if (!hasClips) return;
      video.pause();
      showClip(index + 1);
    }

    function queueStop() {
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        if (row.matches(":hover") || row.contains(document.activeElement)) return;
        stopPreview();
      }, 120);
    }

    if (hasClips) {
      video.addEventListener("ended", () => {
        if (!active || fading) return;
        showClip(index + 1, { fade: true });
      });
      showClip(0);
    } else {
      resetTopic();
    }

    if (new URLSearchParams(window.location.search).has("forcePreview")) {
      startPreview();
      row.scrollIntoView({ block: "center" });
    }

    topics.forEach((topic, topicIndex) => {
      topic.addEventListener("click", (event) => {
        if (clips.length < 2 || topicIndex === index) return;
        event.preventDefault();
        showClip(topicIndex, { fade: true });
      });
    });

    trigger.addEventListener("mouseenter", startPreview);
    preview.addEventListener("mouseenter", startPreview);
    row.addEventListener("mouseleave", queueStop);
    trigger.addEventListener("focusin", startPreview);
    trigger.addEventListener("focusout", queueStop);
    previewStops.push(stopPreview);
  });
}

initProjectPreviews();

function initCoverViewer() {
  const viewer = document.querySelector(".cover-viewer");
  const backdrop = viewer?.querySelector(".cover-viewer-backdrop");
  const piece = viewer?.querySelector(".cover-viewer-piece");
  const viewerImg = piece?.querySelector("img");
  if (!viewer || !backdrop || !piece || !viewerImg) return;

  const albums = [...document.querySelectorAll(".album")];
  let openAlbum = null;
  let closing = false;

  function invertToSlot(album) {
    const from = album.getBoundingClientRect();
    const to = piece.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = from.width / Math.max(to.width, 1);
    const sy = from.height / Math.max(to.height, 1);
    return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  }

  function playOpen(album) {
    if (reduceMotion.matches) {
      viewer.classList.add("is-open");
      piece.style.transform = "";
      return;
    }

    piece.style.transition = "none";
    piece.style.transform = "none";
    requestAnimationFrame(() => {
      piece.style.transform = invertToSlot(album);
      void piece.offsetWidth;
      piece.style.transition = "";
      viewer.classList.add("is-open");
      piece.style.transform = "none";
    });
  }

  function openCover(album) {
    if (openAlbum || closing) return;
    const row = album.closest(".record-row");
    if (
      row?.classList.contains("is-previewing") ||
      row?.matches(":has(.project-link:hover), :has(.project-preview:hover), :has(.project-link:focus-within)")
    ) {
      return;
    }
    const source = album.querySelector("img");
    const artSrc = album.dataset.art || source?.currentSrc || source?.src;
    if (!source || !artSrc) return;
    stopAllProjectPreviews();
    openAlbum = album;
    viewer.hidden = false;
    viewerImg.src = artSrc;
    viewerImg.alt = source.alt || "";
    document.body.classList.add("is-cover-open");
    album.classList.add("is-zoomed");
    album.setAttribute("aria-expanded", "true");

    if (viewerImg.complete && viewerImg.naturalWidth) playOpen(album);
    else viewerImg.addEventListener("load", () => playOpen(album), { once: true });
  }

  function finishClose() {
    if (!closing && !openAlbum) return;
    viewer.classList.remove("is-open", "is-closing");
    viewer.hidden = true;
    piece.style.transform = "";
    piece.style.transition = "";
    if (openAlbum) {
      openAlbum.classList.remove("is-zoomed", "is-docking", "is-seating");
      openAlbum.setAttribute("aria-expanded", "false");
      openAlbum.focus({ preventScroll: true });
    }
    openAlbum = null;
    closing = false;
    document.body.classList.remove("is-cover-open");
  }

  function closeCover() {
    if (!openAlbum || closing) return;
    closing = true;
    const album = openAlbum;

    if (reduceMotion.matches) {
      finishClose();
      return;
    }

    album.classList.add("is-docking");
    album.classList.remove("is-zoomed");
    viewer.classList.remove("is-open");
    viewer.classList.add("is-closing");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        album.classList.add("is-seating");
      });
    });

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      album.removeEventListener("transitionend", onSeat);
      finishClose();
    };
    const onSeat = (event) => {
      if (event.target !== album || event.propertyName !== "transform") return;
      done();
    };
    album.addEventListener("transitionend", onSeat);
    window.setTimeout(done, 1100);
  }

  albums.forEach((album) => {
    album.setAttribute("aria-haspopup", "dialog");
    album.setAttribute("aria-expanded", "false");
    album.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openCover(album);
    });
  });

  backdrop.addEventListener("click", closeCover);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCover();
  });
}

initCoverViewer();

const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function shouldTransition(anchor, event) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.hash) return false;
  if (url.href === window.location.href) return false;
  return true;
}

if (!reduceMotion.matches) {
  let navigating = false;
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor || !shouldTransition(anchor, event)) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const href = anchor.href;
    document.body.classList.add("is-leaving");
    void document.body.offsetWidth;
    const go = () => {
      window.location.href = href;
    };
    document.body.addEventListener("transitionend", go, { once: true });
    window.setTimeout(go, 400);
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    navigating = false;
    document.body.classList.remove("is-leaving");
  });
}
