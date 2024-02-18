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

/* ------------------------------------- Side bar ------------------------------------- */

let selectedPage = 0;
const timePageBtn = document.getElementById("time");
const petPageBtn = document.getElementById("pet");
const timePage = document.getElementById("time-page");
const petPage = document.getElementById("pet-page");

timePageBtn.addEventListener("click", () => {
  selectedPage = 0;
  timePageBtn.setAttribute("selected", true);
  petPageBtn.setAttribute("selected", false);
  timePage.style.display = "block";
  petPage.style.display = "none";
});

petPageBtn.addEventListener("click", () => {
  selectedPage = 1;
  timePageBtn.setAttribute("selected", false);
  petPageBtn.setAttribute("selected", true);
  timePage.style.display = "none";
  petPage.style.display = "block";
});

let settingPageBtn = document.getElementById("setting");
settingPageBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("../setting/setting.html") });
});

/* ------------------------------------- Extract from storage ------------------------------------- */
let tabs = {};
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("message-sent")
//   if (message.action === "update-counter") {
//     tabData = message.data;
//   }
// });

/* ------------------------------------- Render time ------------------------------------- */

const limitDisplayDiv = document.getElementById("limit-display");
const renderTime = async () => {
  const ul = document.createElement("ul");
  ul.id = "limit-display";
  ul.className = "limit-display";
  tabs = await new Promise((resolve) => {
    chrome.storage.local.get(["tabs"], (result) => {
      resolve(result.tabs);
    });
  });
  const tabArr = Object.keys(tabs);
  for (const domain of tabArr) {
    const data = tabs[domain];
    if (!data.limit || data.limit === 0) continue;
    
    const progress = data.counter / data.limit;
    const limitDiv = document.createElement("li");
    
    limitDiv.innerHTML = "";

    const domainParagraph = document.createElement("p");
    domainParagraph.innerHTML = `<b>${domain}:</b> ${parseTimeFromSeconds(data.counter)} / ${parseTimeFromSeconds(data.limit)}`;
    limitDiv.appendChild(domainParagraph);

    const progressBarDiv = document.createElement("div");
    progressBarDiv.className = "progress-bar";

    const progressBarSlideDiv = document.createElement("div");
    progressBarSlideDiv.className = "progress-bar__slide";
    progressBarSlideDiv.style.transform = `translateX(${progress * 100}%)`;

    progressBarDiv.appendChild(progressBarSlideDiv);
    limitDiv.appendChild(progressBarDiv);
    ul.appendChild(limitDiv);
  }

  limitDisplayDiv.innerHTML = ul.innerHTML;
  if (tabArr.length === 0) {
    const text = document.createElement("p");
    text.innerHTML = "No limit set";
    limitDisplayDiv.appendChild(text);
  }
};
renderTime();

/** TMV Section */
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      console.log("thoi nao xin cho di ngu di", inputElement.files[0]);
      if (inputElement.files[0].type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onloadend = () => {
          chrome.storage.local.set({ pic: reader.result }, function () {
            if (chrome.runtime.lastError) {
              console.error("Error storing data:", chrome.runtime.lastError);
            } else {
              console.log("?????????vcl bn");
            }
          });
        };

        chrome.storage.local.get(["pic"], function (result) {
          console.log("Value currently is " + result.pic);
        });

        reader.readAsDataURL(inputElement.files[0]);
      }
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  dropZoneElement.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZoneElement.classList.remove("drop-zone--over");
  });

  dropZoneElement.addEventListener("dragend", (e) => {
    e.preventDefault();
    dropZoneElement.classList.remove("drop-zone--over");
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
  });
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumn");

  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      console.log("minhdz", e);
      thumbnailElement.style.backgroundImage = `url('${URL.createObjectURL(
        file
      )}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

/** ------------------------------------- Rerender ------------------------------------- */
setInterval(() => {
  limitDisplayDiv.innerHTML = "";
  renderTime();
}, 1000);