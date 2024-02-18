/**--------------------------------------Set Chrome DB------------------------------------------- */
// console.log("vl bn oi");
// chrome.storage.local.set({ key: "minhdz" }).then(() => {
//   console.log("Value is set");
// });
// TODO: remove later

/** ------------------------------------- Variables ------------------------------------- */
let tabs = {
  "www.youtube.com": { counter: 0, limit: 4, reminder: 10 },
  "www.instagram.com": { counter: 0, limit: 10, reminder: 10 },
  "www.facebook.com": { counter: 0, limit: 10, reminder: 10 },
};
chrome.storage.local.get(["tabs"], function (result) {
  if (result.tabs) {
    tabs = result.tabs;
  } else {
    chrome.storage.local.set({ tabs }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error storing data:", chrome.runtime.lastError);
      } else {
        console.log("Data stored successfully");
      }
    });
  }
});
let intervalId = null;
let curState = ""; // current URL

/** ------------------------------------- EventListener ------------------------------------- */

chrome.tabs.onActivated.addListener(async (tab) => {
  const tabId = tab.tabId;
  tabs = await new Promise((resolve) => {
    chrome.storage.local.get(["tabs"], (result) => {
      resolve(result.tabs);
    });
  });
  console.log(tabs);
  handleTabChange(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    handleTabChange(tabId);
  }
});

/** ------------------------------------- Get value ------------------------------------- */

const getAllValues = () => {
  return tabs;
};

const getValue = (domain) => {
  return tabs[domain];
};

/** ------------------------------------- Counter ------------------------------------- */

const updateCounter = (domain) => {
  console.log("update counter called");
  if (domain in tabs) {
    curState = domain;
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(async () => {
      tabs = await new Promise((resolve) => {
        chrome.storage.local.get(["tabs"], (result) => {
          resolve(result.tabs);
        });
      });
      tabs[domain].counter++;
      console.log(tabs);
      console.log(tabs[domain].counter);

      chrome.storage.local.set({ tabs }, function () {
        if (chrome.runtime.lastError) {
          console.error("Error storing data:", chrome.runtime.lastError);
        } else {
          console.log("Data stored successfully");
        }
      });

      if (
        tabs[domain].counter >= tabs[domain].limit &&
        (tabs[domain].counter - tabs[domain].limit) % tabs[domain].reminder ===
          0
      ) {
        console.log("out of time");
        /**--------------------------------------Modal2 Activate------------------------------------------- */

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          console.log(tabs);
          chrome.tabs.sendMessage(tabs[0].id, { action: "popup-modal" });
        });

        // chrome.runtime.sendMessage({ action: "popup-modal" });
        // resetCounter();
      }
    }, 1000);
  }
};

/** ------------------------------------- Function ------------------------------------- */

const handleTabChange = (tabId) => {
  chrome.tabs.get(tabId, (currentTab) => {
    if (currentTab.url) {
      const domain = new URL(currentTab.url).hostname;
      console.log(curState, domain, "huh");

      if (curState !== domain) {
        clearInterval(intervalId);
        intervalId = null;
        curState = "";
      }
      updateCounter(domain);
    } else {
      clearInterval(intervalId);
      intervalId = null;
      curState = "";
    }
  });
};

/** ------------------------------------- Domain ------------------------------------- */

const updateDomain = (url, limit, reminder) => {
  const domain = new URL(url).hostname;
  if (!(domain in tabs)) {
    tabs[domain] = { counter: 0, limit: limit, reminder: reminder };
  }
};

/** ------------------------------------- Limit ------------------------------------- */

const updateLimit = (domain, limit) => {
  if (domain in tabs) {
    tabs[domain].limit = limit;
  }
};

/** ------------------------------------- Reminder ------------------------------------- */

const updateReminder = (domain, reminder) => {
  if (domain in tabs) {
    tabs[domain].reminder = reminder;
  }
  tabs[domain] = { counter: 0, limit: limit, reminder: reminder };
};

/** ------------------------------------- Default ------------------------------------- */

const revertDefault = () => {
  // const asArray = Object.entries(tabs);
  // const filteredTabs = asArray.filter(
  //   ([key]) =>
  //     key === "www.youtube.com" ||
  //     key === "www.instagram.com" ||
  //     key === "www.facebook.com"
  // );
  // tabs = Object.fromEntries(filteredTabs);
  tabs = {
    "www.youtube.com": { counter: 0, limit: 10, reminder: 10 },
    "www.instagram.com": { counter: 0, limit: 10, reminder: 10 },
    "www.facebook.com": { counter: 0, limit: 10, reminder: 10 },
  };
};

/** ------------------------------------- Reset counter when new day ------------------------------------- */

let lastResetDate = new Date();
let today = new Date();

const resetCounter = () => {
  Object.keys(tabs).forEach((key, _) => {
    tabs[key].counter = 0;
  });
};

const resetCounterWhenNewDay = () => {
  today = new Date();

  if (
    today.getDate() !== lastResetDate.getDate() ||
    today.getMonth() !== lastResetDate.getMonth() ||
    today.getFullYear() !== lastResetDate.getFullYear()
  ) {
    resetCounter();

    lastResetDate = today;

    console.log("Counter reset to 0 for a new day.");
  }
  console.log("Counter not reset");
};

setInterval(resetCounterWhenNewDay, 60000);

/** ------------------------------------- Chrome DB Communication ------------------------------------- */

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.from === "popup") {
//     console.log("background t nhan dc r", message);
//     // Send message to the content script
//     chrome.storage.local.set({ key: message.content }, function () {
//       if (chrome.runtime.lastError) {
//         console.error("Error storing data:", chrome.runtime.lastError);
//       } else {
//         console.log("Data stored successfully");
//       }
//     });
//     chrome.storage.local.get(["key"], function (result) {
//       console.log("Value currently is " + result.key);
//     });
//   }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.imageDataUrl) {
//     console.log(chrome.storage.local);
//     chrome.storage.local.set(
//       { imageDataUrl: message.imageDataUrl },
//       function () {
//         if (chrome.runtime.lastError) {
//           console.error("Error storing image:", chrome.runtime.lastError);
//         } else {
//           console.log("Image stored successfully");
//         }
//       }
//     );
//   }
// });

// export { getAllValues, getValue, addDomain, updateLimit, updateReminder, revertDefault };
// chrome.runtime.sendMessage({
//   from: "background_functions",
//   data: { getAllValues, getValue, updateDomain, revertDefault },
// });
