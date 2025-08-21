const messages = document.getElementById("messages") as HTMLDivElement | null;
const chatForm = document.getElementById("chat-form") as HTMLFormElement | null;
const msgInput = document.getElementById("msg") as HTMLInputElement | null;
const fileInput = document.getElementById(
  "fileInput",
) as HTMLInputElement | null;

if (!messages || !chatForm || !msgInput || !fileInput) {
  console.error("Required DOM elements are missing!");
} else {
  chatForm.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const msg = msgInput.value.trim();
    const file = fileInput.files?.[0] || null;

    if (!msg && !file) {
      alert("Please enter a message or upload a file!");
      return;
    }

    if (msg) {
      const userMsg = document.createElement("div");
      userMsg.classList.add("message", "user");
      userMsg.textContent = msg;
      messages.appendChild(userMsg);
    }

    if (file) {
      const fileMsg = document.createElement("div");
      fileMsg.classList.add("message", "file");
      fileMsg.textContent = `📄 ${file.name}`;
      fileMsg.style.color = "white";
      fileMsg.style.fontWeight = "800";
      messages.appendChild(fileMsg);
    }

    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.textContent = "Thinking...";
    messages.appendChild(botMsg);

    const formData = new FormData();
    formData.append("message", msg);
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/openai-responses", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      const data = await res.json();
      botMsg.textContent = data.reply || "No response from GPT.";
    } catch (error) {
      console.error("Error:", error);
      botMsg.textContent = "⚠️ Error communicating with GPT!";
    }

    msgInput.value = "";
    fileInput.value = "";
  });
}
