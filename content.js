(() => {
  "use strict";

  const DEFAULT_SETTINGS = {
    blockDashboard: false,
    blockCommunity: false
  };

  const OVERLAY_ID = "wav-blocker";
  let settings = { ...DEFAULT_SETTINGS };
  let lastHref = "";
  let overlay = null;

  function pathParts(pathname) {
    return pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part).toLowerCase());
  }

  function classifyStudioRoute(urlString) {
    let url;
    try {
      url = new URL(urlString);
    } catch {
      return null;
    }

    if (url.hostname !== "studio.youtube.com") {
      return null;
    }

    const parts = pathParts(url.pathname);

    // Channel-level and video-level Analytics routes both contain an
    // "analytics" path segment. This also covers Advanced Mode / Explore.
    if (parts.includes("analytics")) {
      return "analytics";
    }

    // The signed-in Studio dashboard is the exact /channel/<CHANNEL_ID> route.
    // Do not treat the bare Studio root as Dashboard because it can also be
    // used for sign-in, account selection, or redirect states.
    if (parts[0] === "channel" && parts.length === 2) {
      return "dashboard";
    }

    // YouTube has used both "comments" and "community" for the audience
    // interaction area. Restrict this to channel-level routes so a video's
    // own editing/comments pages are not accidentally blocked.
    if (
      parts[0] === "channel" &&
      parts.length >= 3 &&
      (parts[2] === "comments" || parts[2] === "community")
    ) {
      return "community";
    }

    // Future/alternate top-level Community route shape.
    if (parts[0] === "comments" || parts[0] === "community") {
      return "community";
    }

    return null;
  }

  function shouldBlock(route) {
    if (route === "analytics") return true;
    if (route === "dashboard") return settings.blockDashboard;
    if (route === "community") return settings.blockCommunity;
    return false;
  }

  function createOverlay() {
    const el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.setAttribute("role", "presentation");

    const message = document.createElement("div");
    message.className = "wav-message";
    message.textContent = "Work on another video.";

    el.appendChild(message);
    return el;
  }

  function showBlocker() {
    document.documentElement.classList.add("wav-blocked");

    if (!overlay || !overlay.isConnected) {
      overlay = createOverlay();
      (document.body || document.documentElement).appendChild(overlay);
    }
  }

  function hideBlocker() {
    document.documentElement.classList.remove("wav-blocked");

    if (overlay && overlay.isConnected) {
      overlay.remove();
    }
    overlay = null;
  }

  function applyForCurrentRoute() {
    const route = classifyStudioRoute(location.href);
    if (shouldBlock(route)) {
      showBlocker();
    } else {
      hideBlocker();
    }
  }

  async function loadSettings() {
    try {
      const saved = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      settings = { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      settings = { ...DEFAULT_SETTINGS };
    }
    applyForCurrentRoute();
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;

    let changed = false;
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (changes[key]) {
        settings[key] = changes[key].newValue ?? DEFAULT_SETTINGS[key];
        changed = true;
      }
    }

    if (changed) {
      applyForCurrentRoute();
    }
  });

  // YouTube Studio is a single-page app, so a content script can remain loaded
  // while the URL changes. Watching location.href keeps the blocker accurate
  // without modifying YouTube's own JavaScript or History API.
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      applyForCurrentRoute();
    } else if (shouldBlock(classifyStudioRoute(location.href))) {
      // If the SPA redraws the document, restore the overlay if necessary.
      if (!overlay || !overlay.isConnected) {
        showBlocker();
      }
    }
  }, 250);

  lastHref = location.href;
  loadSettings();
})();
