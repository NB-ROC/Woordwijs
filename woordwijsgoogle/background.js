// Start quiz automatisch na installatie
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("quizStart", { when: Date.now() + 2000 });
});

// Alarm gaat af → popup openen
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "quizStart") {
    chrome.windows.create({
      url: chrome.runtime.getURL("hello.html"),
      type: "popup",
      width: 350,
      height: 450,
      focused: true
    });
  }
});

// Bericht van popup → nieuwe quiz starten
chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "quizCorrect") {
    chrome.alarms.create("quizStart", { when: Date.now() + 2000 });
  }
});
