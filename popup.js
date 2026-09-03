"use strict";

const DEFAULT_SETTINGS = {
  blockDashboard: false,
  blockCommunity: false
};

const dashboard = document.getElementById("blockDashboard");
const community = document.getElementById("blockCommunity");
const status = document.getElementById("status");
let statusTimer;

async function load() {
  const saved = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  dashboard.checked = saved.blockDashboard;
  community.checked = saved.blockCommunity;
}

async function save() {
  await chrome.storage.sync.set({
    blockDashboard: dashboard.checked,
    blockCommunity: community.checked
  });

  status.textContent = "Saved.";
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    status.textContent = "";
  }, 900);
}

dashboard.addEventListener("change", save);
community.addEventListener("change", save);
load();
