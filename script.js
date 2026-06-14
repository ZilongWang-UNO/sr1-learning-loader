import { topics } from "./topics.js?v=20260614-30";

const menuButton = document.querySelector(".menu-button");
const mobileNavigation = document.querySelector("#mobile-navigation");
const completeButton = document.querySelector(".next-button");
const currentLesson = document.querySelector("#current-lesson");
const currentLessonButton = currentLesson.querySelector("button");
const lessonStatus = currentLesson.querySelector(".lesson-status");
const courseProgress = document.querySelector(".course-progress");
const courseProgressValue = document.querySelector("#course-progress-value");
const courseProgressFill = document.querySelector("#course-progress-fill");
const lessonProgressCopy = document.querySelector("#lesson-progress-copy");
const lessonProgressFill = document.querySelector("#lesson-progress-fill");
const lessonPanel = document.querySelector(".lesson-panel");
const lessonNote = document.querySelector(".lesson-note");
const videoFrame = document.querySelector("#video-frame");
const videoPoster = document.querySelector("#video-poster");
const loadingShell = document.querySelector("#loading-shell");
const loadingCopy = document.querySelector(".garden-loading-copy");
const loadingTrack = document.querySelector(".video-loading-track");
const loadingFill = document.querySelector("#video-loading-fill");
const discoveryTitle = document.querySelector("#discovery-title");
const discoveryVisual = document.querySelector("#discovery-visual");
const discoveryCaptions = [...document.querySelectorAll(".discovery-caption")];
const narrationButton = document.querySelector("#narration-button");
const orientationHint = document.querySelector("#orientation-hint");
const orientationHintClose = document.querySelector("#orientation-hint-close");
const siteHeader = document.querySelector(".site-header");
const mainContent = document.querySelector("main");
const watchVideoButton = document.querySelector("#watch-video-button");
const upNextBar = document.querySelector(".up-next-bar");
const loadingDuration = 20_000;
const stepTimes = [0, 6500, 13_000];
const viewedTopicsKey = "sr1-viewed-discovery-topics";
let activeTopic;
let activeStep = -1;
let narrationEnabled = true;
let activeUtterance;
let narrationText = "";
let narrationOffset = 0;
let narrationGeneration = 0;
let loadingStarted = false;
let mobilePlayerSessionActive = false;
let lessonVideoActive = false;

function isMobileDevice() {
  const mobileUserAgent =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return (
    mobileUserAgent ||
    window.innerWidth <= 640 ||
    (window.matchMedia("(pointer: coarse)").matches &&
      Math.min(window.screen?.width || window.innerWidth, window.innerWidth) <=
        1024)
  );
}

function openOrientationModal() {
  orientationHint.hidden = false;
  document.body.classList.add("modal-open");
  siteHeader.inert = true;
  mainContent.inert = true;
  orientationHintClose.focus({ preventScroll: true });
}

function closeOrientationModal({ restoreFocus = false } = {}) {
  orientationHint.hidden = true;
  document.body.classList.remove("modal-open");
  siteHeader.inert = false;
  mainContent.inert = false;

  if (restoreFocus) {
    videoPoster.focus({ preventScroll: true });
  }
}

function syncMobileViewportLayout() {
  const useLandscapePlayer =
    mobilePlayerSessionActive &&
    window.matchMedia("(orientation: landscape)").matches;

  document.body.classList.toggle("mobile-player-open", useLandscapePlayer);
  videoFrame.classList.toggle("is-mobile-player", useLandscapePlayer);
}

function enterMobilePlayerMode() {
  if (!isMobileDevice()) {
    return true;
  }

  mobilePlayerSessionActive = true;
  syncMobileViewportLayout();
  return true;
}

function continueNarration() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const generation = ++narrationGeneration;
  const startingOffset = narrationOffset;
  const remainingText = narrationText.slice(startingOffset);

  if (!remainingText) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(remainingText);
  const voice = chooseNaturalVoice();

  if (voice) {
    utterance.voice = voice;
  }

  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = narrationEnabled ? 1 : 0;
  utterance.addEventListener("boundary", (event) => {
    if (generation === narrationGeneration) {
      narrationOffset = startingOffset + event.charIndex;
    }
  });
  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function chooseNaturalVoice() {
  const voices = window.speechSynthesis.getVoices();
  const preferredNames = [
    "Ava (Premium)",
    "Ava (Enhanced)",
    "Ava",
    "Samantha (Enhanced)",
    "Samantha",
    "Allison",
    "Susan",
  ];

  for (const name of preferredNames) {
    const preferredVoice = voices.find((voice) => voice.name === name);

    if (preferredVoice) {
      return preferredVoice;
    }
  }

  return (
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        /premium|enhanced|natural/i.test(voice.name),
    ) ||
    voices.find((voice) => voice.lang === "en-US" && voice.localService) ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    null
  );
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  narrationText = text;
  narrationOffset = 0;
  narrationGeneration += 1;
  window.speechSynthesis.cancel();
  continueNarration();
}

function updateNarrationVolume() {
  if (!activeUtterance || !window.speechSynthesis?.speaking) {
    return;
  }

  narrationGeneration += 1;
  window.speechSynthesis.cancel();
  continueNarration();
}

function setDiscoveryStep(step) {
  if (step === activeStep) {
    return;
  }

  activeStep = step;
  loadingShell.dataset.step = String(step);
  discoveryVisual.dataset.step = String(step);
  discoveryCaptions.forEach((caption, index) => {
    caption.classList.toggle("is-active", index === step);
    caption.classList.toggle("is-done", index < step);
  });
  speak(activeTopic.captions[step]);
}

function getViewedTopicIds() {
  try {
    const savedIds = JSON.parse(localStorage.getItem(viewedTopicsKey) || "[]");
    const validIds = topics.map((topic) => topic.id);

    return Array.isArray(savedIds)
      ? savedIds.filter((id) => validIds.includes(id))
      : [];
  } catch {
    return [];
  }
}

function saveViewedTopic(id) {
  try {
    const viewedIds = getViewedTopicIds();
    localStorage.setItem(
      viewedTopicsKey,
      JSON.stringify([...new Set([...viewedIds, id])]),
    );
  } catch {
    // The discovery still works when browser storage is unavailable.
  }
}

function chooseDiscoveryTopic() {
  const requestedTopic = new URLSearchParams(window.location.search).get("topic");
  const requested = topics.find((topic) => topic.id === requestedTopic);

  // A fixed query is useful for reviewing one animation without changing history.
  if (requested) {
    return requested;
  }

  let viewedIds = getViewedTopicIds();
  let unseenTopics = topics.filter((topic) => !viewedIds.includes(topic.id));

  if (unseenTopics.length === 0) {
    viewedIds = [];
    unseenTopics = topics;

    try {
      localStorage.removeItem(viewedTopicsKey);
    } catch {
      // Continue with an in-memory random choice.
    }
  }

  const topic = unseenTopics[Math.floor(Math.random() * unseenTopics.length)];
  saveViewedTopic(topic.id);
  return topic;
}

function prepareDiscovery() {
  activeTopic = chooseDiscoveryTopic();
  activeStep = -1;
  discoveryTitle.textContent = activeTopic.title;
  discoveryVisual.innerHTML = activeTopic.visual();
  discoveryVisual.className = `discovery-visual visual-stage ${activeTopic.id}`;
  discoveryCaptions.forEach((caption, index) => {
    caption.querySelector("p").textContent = activeTopic.captions[index];
    caption.classList.remove("is-active", "is-done");
  });
  loadingCopy.textContent = "Lesson loading...";
  upNextBar.classList.remove("is-ready");
  watchVideoButton.hidden = true;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => setDiscoveryStep(0));
  });
}

function loadVideo() {
  const iframe = document.createElement("iframe");
  const mobilePlayback = mobilePlayerSessionActive || isMobileDevice();
  const playerParams = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    hl: "en",
  });

  if (!mobilePlayback) {
    playerParams.set("playsinline", "1");
  }

  lessonVideoActive = true;
  mobilePlayerSessionActive = false;
  syncMobileViewportLayout();

  iframe.src =
    `https://www.youtube-nocookie.com/embed/oJFLO-0cZr0?${playerParams}`;
  iframe.title = "We Are SR1!";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;

  window.speechSynthesis?.cancel();
  loadingShell.hidden = true;
  videoFrame.classList.remove("is-loading");
  videoFrame.appendChild(iframe);
  lessonNote.classList.remove("is-pending");
  lessonNote.setAttribute("aria-hidden", "false");
  completeButton.disabled = false;
}

function startVideoLoading() {
  if (loadingStarted) {
    return;
  }

  loadingStarted = true;
  const startedAt = performance.now();

  videoPoster.hidden = true;
  loadingShell.hidden = false;
  videoFrame.classList.add("is-loading");
  loadingTrack.setAttribute("aria-valuenow", "0");
  prepareDiscovery();

  function updateLoading(now) {
    const elapsed = Math.min(now - startedAt, loadingDuration);
    const progress = (elapsed / loadingDuration) * 100;

    loadingFill.style.width = `${progress}%`;
    loadingTrack.setAttribute("aria-valuenow", String(Math.round(progress)));

    if (elapsed >= stepTimes[2]) {
      setDiscoveryStep(2);
    } else if (elapsed >= stepTimes[1]) {
      setDiscoveryStep(1);
    }

    if (elapsed < loadingDuration) {
      window.requestAnimationFrame(updateLoading);
      return;
    }

    window.speechSynthesis?.cancel();
    loadingCopy.textContent = "Lesson ready";
    upNextBar.classList.add("is-ready");
    discoveryCaptions.forEach((caption) => {
      caption.classList.remove("is-active");
      caption.classList.add("is-done");
    });
    watchVideoButton.hidden = false;
  }

  window.requestAnimationFrame(updateLoading);
}

function celebrateCompletion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const colors = ["#22588e", "#38a9d6", "#d7e83f", "#f7c963", "#73a849"];
  const panelBox = lessonPanel.getBoundingClientRect();
  const layer = document.createElement("div");
  const startX = panelBox.width / 2;
  const startY = panelBox.height * 0.46;

  layer.className = "confetti-layer";
  layer.setAttribute("aria-hidden", "true");
  lessonPanel.appendChild(layer);

  const message = document.createElement("span");
  message.className = "cool-burst";
  message.textContent = "C.O.O.L.!";
  layer.appendChild(message);

  for (let index = 0; index < 28; index += 1) {
    const piece = document.createElement("span");
    const angle = (-155 + Math.random() * 130) * (Math.PI / 180);
    const burstDistance = 80 + Math.random() * 130;
    const burstX = Math.cos(angle) * burstDistance;
    const burstY = Math.sin(angle) * burstDistance;
    const drift = -22 + Math.random() * 44;
    const fallDistance = 150 + Math.random() * 70;
    const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 420);

    piece.className = "confetti-piece";
    piece.style.setProperty("--start-x", `${startX}px`);
    piece.style.setProperty("--start-y", `${startY}px`);
    piece.style.setProperty("--burst-x", `${burstX}px`);
    piece.style.setProperty("--burst-y", `${burstY}px`);
    piece.style.setProperty("--fall-x-mid", `${burstX + drift * 0.5}px`);
    piece.style.setProperty("--fall-y-mid", `${burstY + fallDistance * 0.4}px`);
    piece.style.setProperty("--fall-x", `${burstX + drift}px`);
    piece.style.setProperty("--fall-y", `${burstY + fallDistance}px`);
    piece.style.setProperty("--rotation-mid", `${rotation * 0.25}deg`);
    piece.style.setProperty("--rotation-late", `${rotation * 0.58}deg`);
    piece.style.setProperty("--rotation-end", `${rotation}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);

    layer.appendChild(piece);
  }

  window.setTimeout(() => layer.remove(), 2500);
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  mobileNavigation.hidden = isOpen;
});

videoPoster.addEventListener(
  "click",
  () => {
    if (isMobileDevice()) {
      openOrientationModal();
      return;
    }

    startVideoLoading();
  },
  { once: true },
);
watchVideoButton.addEventListener("click", loadVideo, { once: true });

narrationButton.addEventListener("click", () => {
  narrationEnabled = !narrationEnabled;
  narrationButton.setAttribute("aria-pressed", String(narrationEnabled));
  narrationButton.setAttribute(
    "aria-label",
    narrationEnabled ? "Mute narration" : "Unmute narration",
  );
  updateNarrationVolume();
});

orientationHintClose.addEventListener("click", () => {
  enterMobilePlayerMode();
  closeOrientationModal();
  startVideoLoading();
});

orientationHint.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOrientationModal({ restoreFocus: true });
  }
});

function handleMobileOrientationChange() {
  if (lessonVideoActive) {
    return;
  }

  syncMobileViewportLayout();
}

window.addEventListener("orientationchange", handleMobileOrientationChange);
window.addEventListener("resize", handleMobileOrientationChange);

completeButton.addEventListener("click", () => {
  currentLesson.classList.remove("current");
  currentLesson.classList.add("complete");
  currentLessonButton.removeAttribute("aria-current");

  lessonStatus.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 12 3 3 7-7"></path>
    </svg>
  `;
  lessonStatus.setAttribute("aria-label", "Completed");
  courseProgress.setAttribute("aria-label", "Course progress: 50 percent");
  courseProgressValue.textContent = "50%";
  courseProgressFill.style.width = "50%";
  lessonProgressCopy.textContent = "2 of 4 lessons complete";
  lessonProgressFill.style.width = "50%";

  completeButton.textContent = "Lesson complete";
  completeButton.disabled = true;
  completeButton.classList.add("lesson-finished");
  completeButton.classList.add("just-completed");
  currentLesson.classList.add("just-completed");
  celebrateCompletion();

  window.setTimeout(() => {
    completeButton.classList.remove("just-completed");
    currentLesson.classList.remove("just-completed");
  }, 2500);
});
