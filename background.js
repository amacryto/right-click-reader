
import { createWorker } from 'tesseract.js';

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extractTextFromImage",
    title: "Extract Text from Image",
    contexts: ["image"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extractTextFromImage") {
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
    performOCR(request.imageData)
      .then(text => {
        sendResponse({ success: true, text: text });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required to use sendResponse asynchronously
  }
});

// Perform OCR on image data
async function performOCR(imageData) {
  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(imageData);
    await worker.terminate();
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}
