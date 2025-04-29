
import { createWorker } from 'tesseract.js';

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extractTextFromImage",
    title: "Extract Text from Image",
    contexts: ["image"]
  });
  console.log("Context menu item created");
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extractTextFromImage") {
    console.log("Context menu item clicked", info.srcUrl);
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, {
      action: "extractText",
      imageUrl: info.srcUrl
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "performOCR") {
    console.log("Received OCR request", request.imageData.substring(0, 50) + "...");
    performOCR(request.imageData)
      .then(text => {
        console.log("OCR completed successfully");
        sendResponse({ success: true, text: text });
      })
      .catch(error => {
        console.error("OCR failed", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required to use sendResponse asynchronously
  }
});

// Perform OCR on image data
async function performOCR(imageData) {
  try {
    console.log("Initializing Tesseract worker");
    const worker = await createWorker('eng');
    console.log("Running OCR recognition");
    const result = await worker.recognize(imageData);
    await worker.terminate();
    console.log("OCR text extracted successfully");
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}

// Log extension startup
console.log("OCR extension background script loaded");
