/* ==========================================================================
   Drop-the-needle opening (goes with intro.css)
   - Draws the record player with Jessica's real Figma strokes
   - Waits for the visitor to press the disc ("drop the needle")
   - Pressing the disc plays Blackbird (app.js handles the audio), drops the
     needle and shows the notes, then the page settles into the home layout
   - No press within 14s: it settles on its own, quietly
   - Plays once per browser session; Skip button, scroll or Esc skips it
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const player = document.querySelector(".player");
  if (!player) return;

  const INTRO_KEY = "jess-intro";
  const DRAW_SPEED = 0.8;
  const DRAW_DONE_MS = 4000;
  const WAIT_FOR_PRESS_MS = 14000;
  const LINGER_AFTER_PRESS_MS = 1200;
  const SETTLE_MOVE_MS = 1050;
  const SETTLE_CLEANUP_MS = 2400;

  const DRAWING = `<svg class="intro-svg intro-rec-svg" viewBox="0 0 373 359" fill="none" aria-hidden="true" focusable="false"><defs><mask id="introRecMask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="413" height="399"><g transform="matrix(0.7646,0,0,0.6626,108.283,179.179)"><path class="intro-scrib" transform="matrix(0.9907,0.1362,-0.1327,0.9912,18.8174,-0.8694)" pathLength="1" d="M 174.2 91.6 C 168.4 93.8 159.4 95.2 154.0 96.2 C 148.8 97.2 142.9 103.3 138.2 104.2 C 127.4 106.3 122.5 105.2 117.5 105.6 C 102.9 106.5 88.4 99.8 74.3 99.8 C 70.8 99.8 66.5 98.3 62.6 97.6 C 59.0 96.9 54.9 95.0 50.9 93.6 C 44.7 91.4 41.1 90.0 34.6 87.6 C 30.4 86.1 26.6 85.0 23.0 83.0 C 17.3 79.8 15.4 80.3 12.7 78.1 C 10.1 76.1 7.7 73.7 5.8 71.3 C 3.7 68.8 2.2 65.9 1.0 62.3 C -2.0 53.3 2.5 46.1 3.6 42.9 C 4.9 39.0 5.3 38.1 7.9 35.2 C 14.6 27.5 25.0 22.5 34.2 18.4 C 38.1 16.6 41.9 12.3 45.9 11.0 C 49.7 9.7 62.3 5.5 65.7 4.7 C 76.1 2.2 86.7 1.1 90.2 0.7 C 94.2 0.2 98.0 -0.0 101.1 0 C 116.1 0.0 129.1 3.3 142.3 3.3 C 146.4 3.3 157.5 1.6 164.0 4.7 C 172.5 8.7 176.3 5.0 183.1 7.0 C 187.2 8.3 191.5 11.4 196.0 13.8 C 199.3 15.6 206.0 19.5 209.6 22.5 C 217.7 29.2 221.3 34.1 224.4 43.7 C 226.9 51.2 224.3 58.5 222.8 62.7 C 221.7 65.8 216.0 70.1 212.6 73.2 C 205.8 79.5 201.3 79.2 194.4 82.7 C 189.1 85.4 176.8 90.5 174.2 91.6 Z" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" style="animation-duration: 0.55s; animation-delay: 3.01s"></path><path class="intro-scrib intro-scrib2" transform="matrix(0.9968,-0.0804,0.0962,0.9954,16.7291,25.2222)" pathLength="1" d="M 124.0 0.5 C 124.0 0.5 118.4 0.5 109.6 0.5 C 106.3 0.4 105.4 0.3 97.8 0.1 C 90.3 -0.0 76.1 -0.2 63.2 0.5 C 50.4 1.2 39.3 2.8 33.2 3.7 C 25.1 5.0 23.3 6.2 21.7 7.3 C 20.8 7.9 18.2 9.9 13.3 14.1 C 7.0 19.8 3.5 24.7 2.3 26.7 C -0.5 31.8 -0.2 38.7 0.5 42.4 C 0.8 44.2 3.9 47.6 8.5 52.9 C 10.8 55.6 13.6 58.1 16.9 60.9 C 20.2 63.7 24.0 66.6 28.0 69.2 C 32.0 71.7 36.0 73.8 41.3 76.0 C 46.6 78.3 53.1 80.7 56.8 82.1 C 60.5 83.4 61.1 83.6 64.2 84.7 C 67.3 85.8 72.8 87.7 79.5 89.4 C 86.3 91.2 94.2 92.6 99.8 93.6 C 108.4 95.0 113.5 95.6 119.7 96.7 C 124.0 97.5 130.8 92.3 135.4 93.2 C 142.5 94.7 144.2 95.5 146.8 95.6 C 152.1 95.9 159.3 95.0 163.7 93.9 C 166.8 93.0 172.2 91.2 180.1 86.8 C 186.1 83.5 195.2 82.7 199.3 77.8 C 202.6 73.9 201.7 73.3 203.0 70.4 C 205.5 64.7 203.3 58.1 201.3 51.6 C 200.0 47.4 196.8 42.7 192.9 38.8 C 190.4 36.3 186.4 33.2 183.0 30.8 C 179.6 28.3 176.9 26.8 171.4 24.3 C 165.8 21.8 157.5 18.5 152.8 16.6 C 147.4 14.3 145.2 13.2 142.5 11.8 C 137.4 9.2 130.0 8.4 125.8 6.8 C 123.2 5.8 119.4 4.7 108.6 3.2 C 100.8 2.1 87.8 2.2 78.7 2.2 C 69.6 2.2 64.6 2.6 59.9 3.1 C 55.3 3.6 51.1 4.2 47.4 5.1 C 40.5 6.7 36.7 8.4 34.9 9.4 C 32.8 10.5 31.1 12.0 28.5 14.7 C 23.1 20.4 19.5 25.4 18.3 27.9 C 16.0 32.5 16.4 36.5 16.8 39.7 C 16.9 40.6 17.6 41.8 20.2 45.5 C 22.7 49.2 27.3 55.4 30.3 59.3 C 34.4 64.5 38.6 67.6 43.9 70.9 C 46.5 72.4 48.9 73.5 52.8 75.0 C 56.7 76.5 62.0 78.3 68.2 80.1 C 74.3 81.8 81.1 83.4 93.4 84.7 C 105.8 86.0 123.8 84.1 133.9 84.5 C 143.9 84.8 145.8 84.6 148.7 83.9 C 155.5 82.5 162.2 80.3 166.6 78.6 C 171.7 76.6 176.2 75.4 179.9 71.8 C 183.4 68.2 184.2 62.1 184.4 56.4 C 184.5 53.7 181.3 48.8 175.0 41.1 C 171.0 36.2 167.1 34.0 163.1 31.9 C 159.7 30.2 153.3 27.2 145.8 24.1 C 138.2 21.1 129.5 18.2 121.2 16.1 C 112.9 13.9 105.3 12.5 96.5 11.7 C 87.7 10.9 77.9 10.7 70.1 11.1 C 62.3 11.5 56.8 12.4 53.7 13.0 C 48.3 14.0 44.2 17.7 41.8 20.8 C 40.3 22.8 35.6 26.2 34.9 30.8 C 34.2 35.9 34.3 39.7 34.9 41.1 C 35.9 43.1 40.2 50.0 43.9 52.9 C 46.8 55.1 51.9 58.4 58.1 61.7 C 64.2 65.1 73.6 63.2 80.4 65.8 C 87.1 68.3 93.3 70.1 99.8 71.4 C 106.2 72.7 112.7 73.5 119.9 73.9 C 127.0 74.3 134.8 71.6 140.5 71.3 C 146.1 70.9 149.4 72.9 152.9 71.9 C 159.9 69.9 164.8 67.1 167.5 65.3 C 170.6 63.2 172.2 59.0 173.2 55.2 C 174.4 51.0 171.0 46.8 168.2 43.1 C 166.5 40.8 163.4 39.0 159.0 36.5 C 156.3 35.0 152.3 33.2 147.0 31.4 C 141.6 29.6 135.2 27.9 125.8 26.4 C 116.4 24.9 104.4 23.7 96.5 23.1 C 81.2 21.9 79.2 23.2 77.5 24.3 C 75.4 25.6 74.7 28.0 74.3 30.4 C 73.4 35.6 75.4 38.3 78.6 42.9 C 79.7 44.4 84.6 48.1 92.5 53.8 C 96.0 56.3 98.8 57.5 104.0 59.0 C 109.3 60.4 117.0 62.0 122.1 62.8 C 132.3 64.4 136.0 62.7 140.4 60.5 C 143.0 59.2 144.3 57.0 145.1 55.7 C 146.4 53.1 145.6 50.4 144.4 48.3 C 142.9 45.7 137.2 43.8 128.1 42.1 C 121.8 41.8 117.5 41.9 116.2 42.2 C 115.5 42.4 114.8 42.6 113.3 43.0" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" style="animation-duration: 1.25s; animation-delay: 3.40s"></path></g></mask></defs><image class="intro-rec-img" href="assets/record-still.png" x="104.779" y="160.607" width="195.888" height="123.719" preserveAspectRatio="none" mask="url(#introRecMask)"></image></svg>
<svg class="intro-svg intro-case-svg" viewBox="0 0 373 359" fill="none" aria-hidden="true" focusable="false"><defs><mask id="introCaseMask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="413" height="399"><g class="intro-case-strokes" transform="translate(48.254 35.972)" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path transform="matrix(0.9966,-0.0829,0.09,0.9959,83.7285,18.5645)" pathLength="1" d="M 16.5 7.9 C 15.7 12.7 11.3 37.7 9.1 49.3 C 7.6 57.2 6.4 72.5 5.3 80.5 C 3.4 93.8 2.5 100.3 0.6 114.0 C 0.4 116.0 -0.8 119.4 0.9 117.9 C 5.7 113.3 7.8 112.1 12.7 106.5" style="animation-duration: 0.17s; animation-delay: 0.30s"></path><path transform="matrix(0.9966,-0.0829,0.09,0.9959,83.7285,18.5645)" pathLength="1" d="M 16.5 7.9 C 36.4 6.1 61.1 16.4 80.8 18.9 C 91.5 20.3 107.0 22.1 117.5 23.3 C 132.0 24.9 143.8 26.7 158.4 28.0 C 170.6 29.1 177.5 33.0 188.5 35.2 C 190.9 35.7 192.6 36.8 196.8 37.6 C 199.9 38.1 203.0 38.8 205.7 39.6 C 205.2 45.7 204.1 49.6 203.0 56.2 C 201.1 67.3 198.9 74.0 196.2 83.8 C 190.6 104.0 195.8 114.6 193.6 131.1 C 191.8 144.7 191.2 145.2 189.9 150.2 C 188.4 155.8 187.3 167.5 189.5 166.1 C 198.7 159.6 207.4 149.1 207.7 146.5 C 208.1 143.4 207.2 121.4 208.8 107.6 C 211.0 87.7 214.5 69.4 217.9 48.7 C 219.7 37.6 220.7 29.3 218.8 28.8 C 209.9 26.2 202.4 25.9 195.3 24.5 C 188.9 23.2 178.9 22.3 171.9 21.3 C 157.3 19.1 144.5 19.2 129.7 18.0 C 117.9 17.1 106.1 15.4 94.3 14.2 C 83.2 13.2 75.6 7.3 64.4 6.8 C 57.2 6.5 26.5 0.2 23.8 0" style="animation-duration: 0.90s; animation-delay: 0.47s"></path><path transform="matrix(0.9966,-0.0829,0.09,0.9959,83.7285,18.5645)" pathLength="1" d="M 16.5 7.9 C 16.8 5.9 18.4 4.0 23.1 1.0" style="animation-duration: 0.05s; animation-delay: 1.37s"></path><path transform="matrix(0.9966,-0.0829,0.09,0.9959,83.7285,18.5645)" pathLength="1" d="M 173.0 137.4 C 170.2 136.8 152.9 138.5 144.6 136.8 C 135.8 134.9 129.8 133.4 122.1 130.8 C 116.7 129.0 111.0 127.4 105.7 125.6 C 103.5 124.9 98.8 124.2 91.3 120.8 C 83.8 117.4 77.9 119.6 69.9 118.2 C 63.5 117.2 55.4 113.9 47.4 112.7 L 14.3 108.4" style="animation-duration: 0.22s; animation-delay: 1.39s"></path><path transform="matrix(0.9966,-0.0829,0.09,0.9959,83.7285,18.5645)" pathLength="1" d="M 24.7 17.2 C 24.2 20.3 23.5 24.9 22.7 28.9 C 20.0 41.9 20.9 52.8 18.7 65.9 L 16.0 82.5 L 15.7 99.8" style="animation-duration: 0.12s; animation-delay: 1.60s"></path><path transform="matrix(1,0.0017,-0.0017,1,11.9814,140.1992)" pathLength="1" d="M 237.1 125.2 C 238.4 122.4 247.0 114.7 248.7 103.0 C 249.1 100.7 250.6 102.2 251.0 100.3 C 253.2 90.7 258.1 81.5 260.6 72.0 C 261.0 70.5 261.1 69.6 261.5 68.1 C 262.8 63.6 268.1 60.1 269.6 55.7 C 271.7 49.9 273.4 43.6 275.4 37.9 C 275.9 36.4 277.3 30.0 272.8 28.3 C 266.8 26.1 258.0 26.2 255.2 25.5 C 253.9 25.2 251.8 24.7 250.4 24.6 C 248.5 24.5 245.8 24.0 244.4 23.9 C 241.3 23.5 238.3 23.7 235.3 22.7 C 232.5 21.9 229.8 21.3 226.9 21.2 C 222.3 21.0 203.6 18.5 198.2 17.6" style="animation-duration: 0.25s; animation-delay: 1.72s"></path><path transform="matrix(1,0.0017,-0.0017,1,11.9814,140.1992)" pathLength="1" d="M 127.5 5.2 C 123.8 4.9 104.2 6.8 100.5 2.5 C 96.1 -2.4 84.1 1.3 81.4 1.6 C 77.1 1.9 76.1 2.1 74.7 3.4 C 69.3 8.7 61.0 7.5 54.3 14.1 C 47.7 20.7 46.7 23.2 40.3 29.6 C 38.9 31.1 34.7 36.6 33.1 37.9 C 26.9 42.9 25.8 55.6 7.8 64.8" style="animation-duration: 0.20s; animation-delay: 1.96s"></path><path transform="matrix(1,0.0017,-0.0017,1,11.9814,140.1992)" pathLength="1" d="M 0 75.8 C 13.2 83.3 34.6 89.8 46.6 92.2 C 47.9 92.5 47.5 93.6 49.1 94.5 C 50.4 95.2 51.9 95.5 53.1 95.6 C 54.6 95.8 56.5 96.4 59.9 96.8 C 63.4 97.3 66.9 97.3 70.4 97.9 C 75.1 98.8 79.5 100.5 84.2 101.4 C 87.2 104.0 90.7 103.7 93.8 103.4 C 98.7 103.0 104.2 100.2 109.0 100.0 C 151.8 106.2 139.4 113.4 179.9 122.3 L 225.4 126.0" style="animation-duration: 0.32s; animation-delay: 2.16s"></path><path transform="matrix(1,0.0017,-0.0017,1,13.8828,176.125)" pathLength="1" d="M 275.0 0 C 275.0 7.3 274.7 11.7 274.1 18.9 C 274.0 23.9 273.8 26.2 273.6 31.0 C 273.5 33.7 274.6 36.6 274.0 39.4 C 273.4 42.3 274.9 45.6 274.4 47.2 C 272.5 52.7 273.9 50.9 272.0 53.4 C 269.9 56.4 263.2 71.9 261.3 75.0 C 260.5 76.3 257.2 78.6 256.2 80.0 C 255.4 81.1 254.0 91.9 252.4 94.5 C 244.3 108.1 244.5 118.7 240.9 133.7" style="animation-duration: 0.19s; animation-delay: 2.48s"></path><path transform="matrix(1,0.0017,-0.0017,1,13.8828,176.125)" pathLength="1" d="M 6.4 76.0 C 11.7 77.6 21.5 81.1 23.3 81.1 C 24.9 81.1 27.6 82.6 29.5 83.0 C 32.3 83.7 36.3 84.3 38.1 84.6 L 38.2 84.6 C 40.5 84.9 42.1 85.7 44.1 86.0 C 48.0 86.6 45.7 88.6 50.4 89.6 C 54.3 90.4 62.8 95.3 66.4 95.9 C 84.0 98.9 82.2 97.6 96.2 101.9 C 101.0 103.4 102.8 104.2 105.3 104.3 C 110.7 104.4 116.7 105.2 120.4 105.9 C 121.6 106.1 125.4 108.0 130.9 108.5 C 142.3 109.6 155.6 116.1 166.6 118.9 C 176.6 121.5 185.8 120.8 187.9 121.2 C 195.9 123.1 192.0 123.1 197.6 124.4 C 208.6 127.0 221.8 127.5 232.0 128.3" style="animation-duration: 0.31s; animation-delay: 2.67s"></path><path transform="matrix(1,0.0017,-0.0017,1,13.8828,176.125)" pathLength="1" d="M 0.0 35.6 C -0.3 45.5 2.2 57.4 2.0 68.7" style="animation-duration: 0.05s; animation-delay: 2.98s"></path><path transform="matrix(0.9998,-0.021,0.021,0.9998,243.75,278.9219)" pathLength="1" d="M 0 0 C 0 4.5 0.1 14.8 0.3 20.6 C 0.5 28.3 0.7 31.0 0.8 32.2 C 0.9 32.7 1.0 33.2 1.1 32.9" style="animation-duration: 0.05s; animation-delay: 3.03s"></path><path transform="matrix(0.9912,-0.1325,0.1447,0.9895,287.3643,35.5527)" pathLength="1" d="M 0 11.2 C 0.4 11.0 1.3 10.2 2.3 9.2 C 3.1 8.5 4.4 7.1 5.2 6.4 C 5.9 5.6 7.4 5.4 8.1 4.8 C 8.8 4.2 10.2 3.1 11.0 2.3 C 11.9 1.5 12.3 1.2 12.6 0.9 C 12.9 0.6 13.2 0.4 13.6 0" style="animation-duration: 0.05s; animation-delay: 3.08s"></path></g></mask></defs><image href="assets/intro-case.png" x="0" y="0" width="373" height="359" preserveAspectRatio="none" mask="url(#introCaseMask)"></image></svg>`;

  /* 1. Put the drawn record player + the disc hit area into the player. */
  player.insertAdjacentHTML("afterbegin", DRAWING);
  player.classList.add("has-drawing");
  const disc = document.createElement("span");
  disc.className = "disc-hit";
  disc.setAttribute("aria-hidden", "true");
  player.appendChild(disc);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try { seen = sessionStorage.getItem(INTRO_KEY) === "seen"; } catch (err) { seen = false; }

  if (!root.classList.contains("intro") || reduceMotion || seen) {
    root.classList.remove("intro");
    player.classList.add("drawing-static");
    return;
  }

  /* 2. Extra elements for the opening. */
  const prompt = document.createElement("p");
  prompt.className = "intro-prompt";
  prompt.setAttribute("aria-hidden", "true");
  prompt.innerHTML = '<img src="assets/intro-arrow.png" alt="" /><span>drop the needle</span>';
  document.body.appendChild(prompt);

  const skipBtn = document.createElement("button");
  skipBtn.type = "button";
  skipBtn.className = "intro-skip";
  skipBtn.textContent = "skip intro";
  document.body.appendChild(skipBtn);

  const stageHit = document.createElement("button");
  stageHit.type = "button";
  stageHit.className = "intro-stage-hit";
  stageHit.setAttribute("aria-label", "Skip to drop the needle");
  document.body.appendChild(stageHit);

  let phase = "idle";
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };
  const SCROLL_KEYS = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

  let scrollLocked = false;

  function preventScroll(event) {
    event.preventDefault();
  }

  function keepTop() {
    if (window.scrollY) window.scrollTo(0, 0);
  }

  function lockScroll() {
    window.scrollTo(0, 0);
    if (scrollLocked) return;
    scrollLocked = true;
    window.addEventListener("wheel", preventScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", preventScroll, { passive: false, capture: true });
    window.addEventListener("scroll", keepTop, { passive: false, capture: true });
  }

  function unlockScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    window.removeEventListener("wheel", preventScroll, { capture: true });
    window.removeEventListener("touchmove", preventScroll, { capture: true });
    window.removeEventListener("scroll", keepTop, { capture: true });
    window.scrollTo(0, 0);
  }

  function markSeen() {
    try { sessionStorage.setItem(INTRO_KEY, "seen"); } catch (err) { /* ignore */ }
  }

  function flyHome() {
    const first = player.getBoundingClientRect();
    root.classList.add("intro-settle");
    const last = player.getBoundingClientRect();
    const dx = first.left + first.width / 2 - (last.left + last.width / 2);
    const dy = first.top + first.height / 2 - (last.top + last.height / 2);
    const scale = last.width ? first.width / last.width : 1;
    player.style.transition = "none";
    player.style.transformOrigin = "center center";
    player.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    void player.offsetWidth;
    player.style.transition = `transform ${SETTLE_MOVE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
    player.style.transform = "none";
  }

  function settle() {
    if (phase === "settle" || phase === "done") return;
    phase = "settle";
    clearTimers();
    root.classList.remove("intro-wait");
    flyHome();
    markSeen();
    later(finish, SETTLE_CLEANUP_MS);
  }

  function finish() {
    clearTimers();
    phase = "done";
    root.classList.remove("intro", "intro-wait", "intro-drop", "intro-settle");
    player.style.transition = "";
    player.style.transform = "";
    player.style.transformOrigin = "";
    player.classList.add("drawing-static");
    prompt.remove();
    skipBtn.remove();
    stageHit.remove();
    unlockScroll();
    window.removeEventListener("keydown", onKey);
  }

  function skip() {
    if (phase === "done") return;
    markSeen();
    finish();
  }

  function onKey(event) {
    if (event.key === "Escape") {
      skip();
      return;
    }
    if (SCROLL_KEYS.has(event.key)) event.preventDefault();
  }

  function showWait() {
    if (phase !== "drawing") return;
    clearTimers();
    phase = "wait";
    player.classList.add("drawing-static");
    player.querySelectorAll(".intro-case-strokes path, .intro-scrib").forEach((el) => {
      el.style.animationPlayState = "paused";
    });
    root.classList.add("intro-wait");
    later(settle, WAIT_FOR_PRESS_MS);
  }

  function start() {
    if (phase !== "idle") return;
    phase = "drawing";
    lockScroll();
    window.addEventListener("keydown", onKey);
    player.classList.add("is-drawing");
    // restart the stroke animations from zero now that the page is visible
    player.querySelectorAll(".intro-case-strokes path, .intro-scrib").forEach((el) => {
      el.style.animationPlayState = "running";
    });
    later(showWait, DRAW_DONE_MS);
  }

  stageHit.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    showWait();
  });

  // Pressing the disc: app.js starts Blackbird and the spinning record;
  // here we drop the needle and let the notes play for a moment.
  player.addEventListener("click", () => {
    if (phase !== "wait") return;
    phase = "drop";
    clearTimers();
    root.classList.add("intro-drop");
    root.classList.remove("intro-wait");
    later(settle, LINGER_AFTER_PRESS_MS);
  });

  skipBtn.addEventListener("click", skip);
  lockScroll();

  player.querySelectorAll(".intro-case-strokes path, .intro-scrib").forEach((el) => {
    const duration = parseFloat(el.style.animationDuration) || 0;
    const delay = parseFloat(el.style.animationDelay) || 0;
    el.style.animationDuration = duration * DRAW_SPEED + "s";
    el.style.animationDelay = delay * DRAW_SPEED + "s";
    el.style.animationPlayState = "paused";
  });

  // Wait for the password gate, if it is showing.
  if (root.classList.contains("is-gated")) {
    document.addEventListener("site:unlocked", () => requestAnimationFrame(start), { once: true });
  } else {
    requestAnimationFrame(start);
  }
})();
