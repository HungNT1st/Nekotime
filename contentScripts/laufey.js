// console.log("Laufey content script loaded!");
const fileName = ["lau.jpg", "lau2.jpg", "lau3.jpg", "lau4.jpg"];

let images = document.getElementsByTagName("img");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  for (let image of images) {
    const rand = Math.floor(Math.random() * fileName.length);
    const file = fileName[rand];
    image.src = chrome.runtime.getURL(`icons/Laufey/${file}`);
  }
});
