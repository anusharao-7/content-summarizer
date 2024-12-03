console.log("Content script loaded!");

function extractContent() {
  // Extract content from a wider range of elements
  const elements = document.querySelectorAll("p, h1, h2, h3, span, li, div");
  let content = "";
  elements.forEach((el) => {
    // Only add text if it's long enough
    if (el.innerText.length > 50) {
      content += el.innerText + " ";
    }
  });
  return content.trim();
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractContent") {
    const content = extractContent();
    console.log("Extracted Content:", content); // Log the content for debugging
    sendResponse({ content });
  }
});
