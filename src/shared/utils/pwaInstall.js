let installPrompt = null;
let installed =
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);
const subscribers = new Set();

function getState() {
  return { installPrompt, installed };
}

function notifySubscribers() {
  const state = getState();
  subscribers.forEach((subscriber) => subscriber(state));
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    notifySubscribers();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    installPrompt = null;
    notifySubscribers();
  });
}

export function getPwaInstallState() {
  return getState();
}

export function subscribeToPwaInstallState(subscriber) {
  subscribers.add(subscriber);
  subscriber(getState());
  return () => subscribers.delete(subscriber);
}

export function clearPwaInstallPrompt() {
  installPrompt = null;
  notifySubscribers();
}
