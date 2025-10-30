
document.getElementById("summarize").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "⏳ Summarizing page...";
document.getElementById("theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
document.getElementById("copy").addEventListener("click", () => {
  const text = document.getElementById("output").innerText;
  if (text) {
    navigator.clipboard.writeText(text);
    alert("✅ Summary copied to clipboard!");
  } else {
    alert("⚠️ No summary to copy.");
  }
});

  try {
    // Get active tab and extract text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result: pageText }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText.slice(0, 8000)
    });

    // If no text found
    if (!pageText || pageText.trim().length < 100) {
      output.textContent = "⚠️ Not enough text to summarize.";
      return;
    }

    let summary;

    // ✅ Try to use Gemini Nano Summarizer if available
    if ("ai" in self && ai.summarizer) {
      const summarizer = await ai.summarizer.create({ type: "key-points" });
      summary = await summarizer.summarize(pageText);
      summary = summary || "⚠️ AI did not return a summary.";
    } else {
      // 🧩 Fallback summarizer (Stable Chrome)
      const sentences = pageText.split(/[.!?]/).filter(Boolean).slice(0, 3);
      summary = sentences.join(". ") + ".\n\n";
    }

    output.textContent = summary;
    chrome.storage.local.set({ lastSummary: summary }, () => {
      console.log("✅ Summary saved locally.");
    });
  } catch (err) {
    console.error("Error:", err);
    output.textContent = "❌ Error: " + err.message;
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  chrome.storage.local.get("lastSummary", (data) => {
    if (data.lastSummary) {
      output.textContent =
        "🗂️ Last saved summary:\n\n" + data.lastSummary;
    }
  });
});