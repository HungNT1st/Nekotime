console.log("huh");

// chrome.runtime.onMessage.addListener(gotMessage);

// function gotMessage(message, sender, sendResponse) {
//   if (message.from === "popup") {
//     let p_array = document.getElementsByTagName("p");
//     for (let elem of p_array) {
//       elem.textContent = message.txt;
//     }
//   }
// }

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.from === "background") {
//     console.log("Received message from popup via background:", message.data);
//     // Process the message as needed
//     chrome.storage.local.set({ data: message.data }, function () {
//       if (chrome.runtime.lastError) {
//         console.error("Error storing data:", chrome.runtime.lastError);
//       } else {
//         console.log("Data stored successfully");
//       }
//     });
//   }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.imageDataUrl) {
    console.log(chrome.storage.local);
    chrome.storage.local.set(
      { imageDataUrl: message.imageDataUrl },
      function () {
        if (chrome.runtime.lastError) {
          console.error("Error storing image:", chrome.runtime.lastError);
        } else {
          console.log("Image stored successfully");
        }
      }
    );
  }
});
