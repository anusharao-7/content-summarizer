// Function to split large text into chunks
function splitIntoChunks(text, maxLength) {
  const words = text.split(" ");
  let chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(" ").length + word.length + 1 <= maxLength) {
      currentChunk.push(word);
    } else {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

// Hugging Face Summarization Function
async function query(data) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: 'Bearer your-api-key', // Replace with your API key
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error("Error during API call:", error);
    return { error: error.message };
  }
}

// Event Listener for Button Click
document.getElementById("summarize-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    },
    async (results) => {
      const content = results[0].result;

      console.log("Extracted Content:", content);

      if (!content || content.length < 50) {
        document.getElementById("summary").innerText =
          "No meaningful content found to summarize.";
        return;
      }

      // Split content into manageable chunks (900 tokens to be safe)
      const chunks = splitIntoChunks(content, 900);

      console.log("Text Chunks:", chunks);

      try {
        let combinedSummary = "";

        for (const chunk of chunks) {
          const summaryResponse = await query({ inputs: chunk });

          if (summaryResponse.error) {
            throw new Error(summaryResponse.error);
          }

          const summary =
            summaryResponse && summaryResponse[0]
              ? summaryResponse[0].summary_text
              : "No summary available.";

          combinedSummary += summary + " ";
        }

        document.getElementById("summary").innerText = combinedSummary.trim();
      } catch (error) {
        console.error("Summarization Error:", error);
        document.getElementById("summary").innerText =
          "Error summarizing content. Please try again.";
      }
    }
  );
});
