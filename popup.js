
// Function to check extension status
function checkExtensionStatus() {
  const statusElement = document.getElementById('extension-status');
  
  try {
    // Check if context menu is registered
    chrome.contextMenus.update('extractTextFromImage', {}, () => {
      if (chrome.runtime.lastError) {
        statusElement.textContent = 'Context menu not initialized. Try refreshing the extension.';
        statusElement.classList.add('error');
      } else {
        statusElement.textContent = 'Extension is active and ready to use!';
        statusElement.classList.remove('error');
      }
    });
  } catch (error) {
    statusElement.textContent = 'Error checking extension status. Try refreshing the extension.';
    statusElement.classList.add('error');
    console.error('Error checking extension status:', error);
  }
}

// Reset extension
function resetExtension() {
  const statusElement = document.getElementById('extension-status');
  statusElement.textContent = 'Refreshing extension...';
  statusElement.classList.remove('error');
  
  // Reload the extension
  chrome.runtime.reload();
  
  // Check status after a short delay
  setTimeout(checkExtensionStatus, 1000);
}

// Add event listener for reset button
document.getElementById('reset-extension').addEventListener('click', resetExtension);

// Check status when popup opens
document.addEventListener('DOMContentLoaded', checkExtensionStatus);
