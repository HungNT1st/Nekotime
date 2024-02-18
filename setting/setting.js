/* ------------------------------------- Utils ------------------------------------- */

const parseTimeFromSeconds = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;
  const result = `${hours > 0 ? hours + "h " : ""}${
    minutes > 0 ? minutes + "m " : ""
  }${second > 0 ? second + "s" : ""}`;
  return result === "" ? "0s" : result;
};

const parseTimeInput = (containerId) => {
  const container = document.querySelector(containerId);
  const hours = parseInt(container.querySelector("#hour").value);
  const minutes = parseInt(container.querySelector("#minute").value);
  const seconds = parseInt(container.querySelector("#second").value);

  let result =
    (isNaN(hours) ? 0 : hours) * 3600 +
    (isNaN(minutes) ? 0 : minutes) * 60 +
    (isNaN(seconds) ? 0 : seconds);
  return result === 0 ? 0 : result;
};

/* ------------------------------------- Display limit list ------------------------------------- */

const limitListDisplay = document.querySelector(".limit-list");
const snoozeListDisplay = document.querySelector(".snooze-list");
const renderTimeDisplay = async () => {
  let tabs = await new Promise((resolve) => {
    chrome.storage.local.get(["tabs"], (result) => {
      resolve(result.tabs);
    });
  });
  console.log(tabs);
  limitListDisplay.innerHTML = "";
  Object.keys(tabs).forEach((key) => {
    const limitItem = document.createElement("li");
    limitItem.innerHTML = `${key}: ${parseTimeFromSeconds(
      tabs[key].limit
    )}`;
    limitListDisplay.appendChild(limitItem);
  });
  snoozeListDisplay.innerHTML = "";
  Object.keys(tabs).forEach((key) => {
    const snoozeItem = document.createElement("li");
    snoozeItem.innerHTML = `${key}: ${parseTimeFromSeconds(
      tabs[key].reminder
    )}`;
    snoozeListDisplay.appendChild(snoozeItem);
  });
};
renderTimeDisplay();

/* ------------------------------------- Accordion ------------------------------------- */

const accordion = document.querySelector(".accordion");

const accordionItems = accordion.querySelectorAll(".accordion-item");

accordionItems.forEach((item) => {
  const btn = item.querySelector(".accordion-btn");
  const content = item.querySelector("ul");

  btn.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});

/* ------------------------------------- Processing time ------------------------------------- */

const limitCheckboxs = document.querySelectorAll(".limit-checkbox");
const customLimit = document.getElementById("limit-custom");
customLimit.addEventListener("click", () => {
  limitCheckboxs.forEach((checkbox) => {
    checkbox.checked = false;
  });
});

const customSnooze = document.getElementById("snooze-custom");
const snoozeCheckboxs = document.querySelectorAll(".snooze-checkbox");
customSnooze.addEventListener("click", () => {
  snoozeCheckboxs.forEach((checkbox) => {
    checkbox.checked = false;
  });
});

/* ------------------------------------- Updating setting ------------------------------------- */

const customDomain = document.getElementById("custom-domain");
const websiteSelectDiv = document.getElementById("website-select");
const websiteCheckboxs = websiteSelectDiv.querySelectorAll(".website-checkbox");
const updateBtn = document.getElementById("update-btn");

updateBtn.addEventListener("click", async () => {
  event.preventDefault();
  let tabs = await new Promise((resolve) => {
    chrome.storage.local.get(["tabs"], (result) => {
      resolve(result.tabs);
    });
  });
  console.log(tabs);
  let limitDuration = 0;
  let snoozeDuration = 0;

  limitCheckboxs.forEach((checkbox) => {
    if (checkbox.checked) {
      limitDuration = parseInt(checkbox.value);
    }
  });
  snoozeCheckboxs.forEach((checkbox) => {
    if (checkbox.checked) {
      snoozeDuration = parseInt(checkbox.value);
    }
  });

  let customLimitTime = parseTimeInput("#limit-custom");
  let customSnoozeTime = parseTimeInput("#snooze-custom");

  limitDuration = limitDuration === 0 ? customLimitTime : limitDuration;
  snoozeDuration = snoozeDuration === 0 ? customSnoozeTime : snoozeDuration;

  for (const element of websiteCheckboxs) {
    if (element.checked) {
      tabs[new URL(element.name).hostname] = {
        counter: 0,
        limit: limitDuration,
        reminder: snoozeDuration,
      };
    }
  }

  if (customDomain.value.trim() !== "") {
    if (!customDomain.value.match(/^(http|https):\/\/[^ "]+$/)) {
      const error = document.createElement("p");
      error.innerHTML = "Please enter a valid domain";
      error.style.color = "red";
      websiteSelectDiv.appendChild(error);
      return;
    }
    const error = websiteSelectDiv.querySelector("p");
    if (error) {
      websiteSelectDiv.removeChild(error);
    }
    tabs[new URL(customDomain.value).hostname] = {
      counter: 0,
      limit: limitDuration,
      reminder: snoozeDuration,
    };
  }
  chrome.storage.local.set({ tabs }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error updating data:", chrome.runtime.lastError);
    } else {
      console.log("Data updated successfully");
    }
  });
  renderTimeDisplay();
});