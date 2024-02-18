console.log("modal2 on");
/** ----------------------------------- Variables ----------------------------------- */
let isDragging = false;
let offsetX, offsetY;
const text = "Dit con me hiện lên hộ bố mày";
let checkModal = false;

/** ----------------------------------- Listener ----------------------------------- */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("I listened");
  if (message.action === "popup-modal") {
    console.log("modal2 work");
    showImageModal();
  }
});

/** ----------------------------------- Function ----------------------------------- */

async function showImageModal() {
  const data = await fetchAndCacheData();
  const topGifs = data.results;

  if (checkModal) {
    console.log("Modal is already open");
    return;
  }

  checkModal = true;

  const overlay = document.createElement("div");
  overlay.setAttribute(
    "style",
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 9998;
    `
  );

  document.body.appendChild(overlay);

  const modalDiv = document.createElement("div");
  modalDiv.setAttribute("id", "bound-all");
  modalDiv.setAttribute(
    "style",
    `
    width: 50vw;
    height: 50vh;
    border: none;
    top:50%;
    left:50%;
    transform: translate(-50%, -50%);
    background-color:transparaent;
    position: fixed; 
    box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
    display: block;
    z-index: 9998; 
    `
  );

  console.log("Are you there????");
  let popupModal = await new Promise((resolve) => {
    chrome.storage.local.get(["pic"], (result) => {
      resolve(result.pic);
    });
  });
  modalDiv.innerHTML = `
    <div id="bound-relative">
      <img draggable="false" id="popup-content" style="height:100%; width:100%; border-radius: 4px;" src="${!popupModal || popupModal !== "" ? popupModal : topGifs[0].media_formats.nanogif.url}">
      <div style="position:absolute; top:5px; left:5px; cursor: pointer;">
          <button id="close-button" style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 20px;">x</button>
      </div>
      <div class="bubble grow left">${text}</div>
    </div>  
  `;
  /** ----------------------------------- Speech Buble ----------------------------------- */
  modalDiv.querySelector("#bound-relative").setAttribute(
    "style",
    `
    height:300px;
    width: 300px;
    border: none;
    top:50%;
    left:50%;
    transform: translate(-50%, -50%);
    border-radius:20px;
    background-color:transparent;
    overflow: visible;
    position: relative; 
    box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
    display: block;
    z-index: 9999;
    cursor: move;
    cursor: grab;
    `
  );

  modalDiv.querySelector(".bubble").setAttribute(
    "style",
    `
    position: absolute;
    display: inline-block;
    left: 100%;
    margin: 5 * 4px;
    text-align: center;
    font-family: "Press Start 2P", cursive;
    font-size: 16px;
    line-height: 1.3em;
    letter-spacing: -0.04em;
    background-color: #fff;
    color: #000;
    padding: 3 * 4px;
    box-shadow: 0 -4px #fff, 0 -8px #000, 4px 0 #fff, 4px -4px #000, 8px 0 #000,
      0 4px #fff, 0 8px #000, -4px 0 #fff, -4px 4px #000, -8px 0 #000,
      -4px -4px #000, 4px 4px #000;
    box-sizing: border-box;
    z-index: 10000;
    transition: transform 0.3s ease;
    width: 200px;

    .bubble:hover {
      transform: scale(1.1);
    }

    &::after {
      content: "";
      display: block;
      position: absolute;
      box-sizing: border-box;
    }

    &.left::after {
      height: 4px;
      width: 4px;
      top: 20px;
      left: -8px;
      background: #fff;
      box-shadow: -4px -4px #fff, -4px 0 #fff, -8px 0 #fff, 0 -8px #fff,
        -4px 4px #000, -8px 4px #000, -12px 4px #000, -16px 4px #000, -12px 0 #000,
        -8px -4px #000, -4px -8px #000, 0 -4px #fff;
    }
  }
    `
  );

  document.body.appendChild(modalDiv);

  console.log(document.querySelector("#bound-all"));

  const closeButton = modalDiv.querySelector("#close-button");
  closeButton.addEventListener("click", function () {
    modalDiv.style.display = "none";
    document.body.removeChild(overlay);
    checkModal = false;
  });

  /*DRAG IMAGE*/
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  modalDiv.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let rect = modalDiv.getBoundingClientRect();

    // New potential position of the modal
    let newTop = modalDiv.offsetTop - pos2;
    let newLeft = modalDiv.offsetLeft - pos1;
    const imgTag = modalDiv.querySelector("#popup-content");

    // Define the movement boundaries (for example, within the window)
    const minX = imgTag.offsetWidth / 2;
    const maxX = window.innerWidth - rect.x + modalDiv.offsetWidth / 2; // Width of the modal is considered
    const minY = modalDiv.offsetHeight / 2;
    const maxY = window.innerHeight - rect.y + modalDiv.offsetHeight / 2; // Height of the modal is considered

    // Clamp the new position within the defined boundaries
    newTop = Math.max(minY, Math.min(newTop, maxY));
    newLeft = Math.max(minX, Math.min(newLeft, maxX));

    // Apply the new position
    modalDiv.style.top = newTop + "px";
    modalDiv.style.left = newLeft + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    let rect = modalDiv.getBoundingClientRect();
    let outOfViewPort =
      rect.top + rect.height / 2 < 0 ||
      rect.left + rect.width / 2 < 0 ||
      rect.bottom - rect.height / 2 > window.innerHeight ||
      rect.right - rect.width / 2 > window.innerWidth;
    if (outOfViewPort) {
      modalDiv.style.top = "50%";
      modalDiv.style.left = "50%";
      modalDiv.style.transform = "translate(-50%, -50%)";
    }
  }

  /*FETCH AND CACHE DATA*/
  function fetchAndCacheData() {
    const currentTime = new Date().getTime();
    const cachedData = localStorage.getItem("cachedData");
    console.log(cachedData);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // If cached data is not expired, use it
      if (currentTime - timestamp < 60 * 60 * 1000) {
        console.log("Using cached data");
        return data;
      }
    }

    return new Promise((resolve, reject) => {
      grab_data((response) => {
        const cachedData = {
          data: response,
          timestamp: currentTime,
        };
        //test if data is refetch when click icon
        console.log(response);
        localStorage.setItem("cachedData", JSON.stringify(cachedData));
        resolve(response);
      });
    });
  }

  function grab_data(callback) {
    // Your existing fetch logic here...
    const apikey = "AIzaSyBADpDylTeYbh9-o8UjYbAMG3jKmERqU_s";
    const lmt = 8;
    const search_term = "laufey"; // TODO: Replace with your search term
    const search_url = `https://tenor.googleapis.com/v2/search?q=${search_term}&key=${apikey}&limit=${lmt}`;

    fetch(search_url)
      .then((response) => response.json())
      .then((data) => {
        callback(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        callback(null);
      });
  }
}
