// background.js — service worker
//
// Deze extensie heeft geen eigen woordenlijst of opslag voor coins/
// geschiedenis: dat gebeurt allemaal in oefening.js/popup.js via dezelfde
// Firestore-database als de website. background.js regelt alleen de timer
// (chrome.alarms) en opent op tijd het oefenvenster.

const ALARM = "woord-oefening";
const STANDAARD_INTERVAL = 10; // minuten

// ---- alarm (her)instellen ------------------------------------------
async function herstelAlarm() {
  const { intervalMinuten = STANDAARD_INTERVAL } =
    await chrome.storage.local.get("intervalMinuten");
  await chrome.alarms.clear(ALARM);
  await chrome.alarms.create(ALARM, {
    delayInMinutes: intervalMinuten,
    periodInMinutes: intervalMinuten,
  });
}

// ---- het oefenvenster openen -----------------------------------
async function startOefening() {
  const { oefeningVensterId } = await chrome.storage.local.get(
    "oefeningVensterId"
  );

  // Staat er al een venster open? Dan alleen naar voren halen.
  if (oefeningVensterId != null) {
    try {
      await chrome.windows.get(oefeningVensterId);
      await chrome.windows.update(oefeningVensterId, {
        focused: true,
        drawAttention: true,
      });
      return;
    } catch {
      await chrome.storage.local.remove("oefeningVensterId");
    }
  }

  const venster = await chrome.windows.create({
    url: chrome.runtime.getURL("oefening.html"),
    type: "popup",
    width: 460,
    height: 640,
    focused: true,
  });
  await chrome.storage.local.set({ oefeningVensterId: venster.id });

  chrome.notifications.create("woord-melding", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
    title: "Tijd voor een woord",
    message: "Leg een nieuw woord uit in Woordwijs.",
    priority: 2,
  });
}

// ---- listeners (synchroon registreren) ------------------------
chrome.runtime.onInstalled.addListener(async () => {
  const { intervalMinuten } = await chrome.storage.local.get(
    "intervalMinuten"
  );
  if (intervalMinuten === undefined) {
    await chrome.storage.local.set({ intervalMinuten: STANDAARD_INTERVAL });
  }
  await herstelAlarm();
});

chrome.runtime.onStartup.addListener(herstelAlarm);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) startOefening();
});

chrome.notifications.onClicked.addListener((id) => {
  if (id === "woord-melding") {
    chrome.notifications.clear(id);
    startOefening();
  }
});

chrome.windows.onRemoved.addListener(async (id) => {
  const { oefeningVensterId } = await chrome.storage.local.get(
    "oefeningVensterId"
  );
  if (id === oefeningVensterId)
    await chrome.storage.local.remove("oefeningVensterId");
});

chrome.runtime.onMessage.addListener((bericht, _afzender, stuurAntwoord) => {
  (async () => {
    if (bericht?.type === "zet-interval") {
      const minuten = Number(bericht.minuten);
      if (Number.isFinite(minuten) && minuten >= 1) {
        await chrome.storage.local.set({ intervalMinuten: minuten });
        await herstelAlarm();
        stuurAntwoord({ ok: true });
      } else {
        stuurAntwoord({ ok: false, fout: "ongeldig interval" });
      }
    } else if (bericht?.type === "nu-oefenen") {
      await startOefening();
      stuurAntwoord({ ok: true });
    } else {
      stuurAntwoord({ ok: false });
    }
  })();
  return true; // async antwoord
});
