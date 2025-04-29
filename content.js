
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    extractTextFromImage(request.imageUrl);
  }
});

// Function to extract text from an image
function extractTextFromImage(imageUrl) {
  // Create and show the loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'ocr-overlay';
  overlay.innerHTML = `
    <div class="ocr-modal">
      <div class="ocr-header">
        <h2>Extracting Text...</h2>
      </div>
      <div class="ocr-content">
        <div class="ocr-spinner"></div>
        <p>Processing image, please wait...</p>
      </div>
    </div>
  `;
  
  // Add styles for the overlay
  const style = document.createElement('style');
  style.textContent = `
    .ocr-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    .ocr-modal {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      overflow: hidden;
    }
    .ocr-header {
      padding: 16px;
      background-color: #4285F4;
      color: white;
    }
    .ocr-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .ocr-content {
      padding: 24px;
      text-align: center;
    }
    .ocr-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #4285F4;
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      animation: ocr-spin 1s linear infinite;
    }
    .ocr-result {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      margin: 16px 0;
      text-align: left;
      white-space: pre-wrap;
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
    }
    .ocr-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }
    .ocr-button {
      background-color: #4285F4;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      margin-left: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    .ocr-button:hover {
      background-color: #3367D6;
    }
    @keyframes ocr-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  
  // Fetch the image and convert it to base64
  fetch(imageUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Could not fetch the image');
      }
      return response.blob();
    })
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Send the image data to the background script for OCR
        chrome.runtime.sendMessage({
          action: "performOCR",
          imageData: reader.result
        }, response => {
          if (response && response.success) {
            showResult(response.text, overlay);
          } else {
            showError(response?.error || 'Failed to extract text', overlay);
          }
        });
      };
      reader.readAsDataURL(blob);
    })
    .catch(error => {
      showError(error.message, overlay);
    });
}

// Show the OCR result in the modal
function showResult(text, overlay) {
  const modal = overlay.querySelector('.ocr-modal');
  modal.innerHTML = `
    <div class="ocr-header">
      <h2>Extracted Text</h2>
    </div>
    <div class="ocr-content">
      <div class="ocr-result">${text || 'No text detected in this image.'}</div>
      <div class="ocr-actions">
        <button class="ocr-button" id="ocr-copy">Copy Text</button>
        <button class="ocr-button" id="ocr-close">Close</button>
      </div>
    </div>
  `;
  
  // Set up event listeners for buttons
  modal.querySelector('#ocr-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        const copyBtn = modal.querySelector('#ocr-copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Text';
        }, 2000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  });
  
  modal.querySelector('#ocr-close').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
}

// Show an error message in the modal
function showError(errorMessage, overlay) {
  const modal = overlay.querySelector('.ocr-modal');
  modal.innerHTML = `
    <div class="ocr-header" style="background-color: #EA4335;">
      <h2>Error</h2>
    </div>
    <div class="ocr-content">
      <p>${errorMessage}</p>
      <div class="ocr-actions">
        <button class="ocr-button" id="ocr-close" style="background-color: #EA4335;">Close</button>
      </div>
    </div>
  `;
  
  modal.querySelector('#ocr-close').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
}
