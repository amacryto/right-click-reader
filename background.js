
import { createWorker } from 'tesseract.js';

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

// Also create context menu when extension is loaded (for developer mode)
createContextMenu();

// Function to create context menu
function createContextMenu() {
  // First remove any existing menu items to prevent duplicates
  chrome.contextMenus.removeAll(() => {
    // Then create the new menu item
    chrome.contextMenus.create({
      id: "extractTextFromImage",
      title: "Extract Text from Image",
      contexts: ["image"]
    }, () => {
      // Log success or failure
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError);
      } else {
        console.log("Context menu item created successfully");
      }
    });
  });
}

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extractTextFromImage") {
    console.log("Context menu item clicked", info.srcUrl);
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, {
      action: "extractText",
      imageUrl: info.srcUrl
    }, (response) => {
      // Log any errors in message sending
      if (chrome.runtime.lastError) {
        console.error("Error sending message to content script:", chrome.runtime.lastError);
      }
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

// Listen for extension status checks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkStatus") {
    sendResponse({ status: "active" });
  }
  return true;
});
