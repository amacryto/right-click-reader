
document.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.getElementById('loading');
  const resultContainer = document.getElementById('result-container');
  const resultElement = document.getElementById('result');
  const copyButton = document.getElementById('copy-btn');
  const closeButton = document.getElementById('close-btn');

  // Parse the URL parameters to get the image data
  const urlParams = new URLSearchParams(window.location.search);
  const imageData = urlParams.get('imageData');
  
  if (imageData) {
    // Use the Chrome API to perform OCR on the image data
    chrome.runtime.sendMessage(
      { action: 'performOCR', imageData },
      (response) => {
        loadingElement.style.display = 'none';
        resultContainer.style.display = 'block';
        
        if (response && response.success) {
          resultElement.textContent = response.text || 'No text detected in image.';
        } else {
          resultElement.textContent = 'Failed to extract text from the image.';
          console.error('OCR error:', response?.error);
        }
      }
    );
  } else {
    loadingElement.style.display = 'none';
    resultContainer.style.display = 'block';
    resultElement.textContent = 'Error: No image data provided.';
  }

  // Set up button event handlers
  copyButton.addEventListener('click', () => {
    const textToCopy = resultElement.textContent;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy Text';
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  });

  closeButton.addEventListener('click', () => {
    window.close();
  });
});
