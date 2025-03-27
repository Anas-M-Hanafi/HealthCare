// Select DOM elements
const typing_form = document.querySelector(".typing-form");
const typingInput = document.querySelector(".typing-input");
const chat_list = document.querySelector(".chat_list");

const showTypingEffect = (text, textElement) => {
    textElement.innerText = ""; // Clear previous text
    const words = text.split(" ");
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
        }
    }, 75);
};

const API_Key = "AIzaSyA8UV-R3l3WKsWTB56lfcE6sBXkv3L1zuQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_Key}`;

const generateAPIResponse = async (div, userMessage) => {
    const textElement = div.querySelector(".text");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        console.log("API Response:", data);

        // Extract bot's reply and remove markdown bold formatting
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, '$1') || "Sorry, I didn't understand that.";

        // Show typing effect
        showTypingEffect(text, textElement);

    } catch (error) {
        console.error("API Error:", error);
        textElement.textContent = "An error occurred while fetching the response. Please try again.";
    } finally {
        div.classList.remove("loading");
    }
};

const copyMessage = (copy_Btn) => {
    const messageText = copy_Btn.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copy_Btn.innerText = "done";

    setTimeout(() => copy_Btn.innerText = "content_copy", 1000);
};

const showLoading = (userMessage) => {
    const html = `
        <div class="message_content">
            <img src="img/icon.png" alt="icon">
            <p class="text">Thinking...</p>
            <div class="loading_indicator">
                <div class="loading_Bar"></div>
                <div class="loading_Bar"></div>
                <div class="loading_Bar"></div>
            </div>
        </div>
        <i onClick="copyMessage(this)" class="fa-solid fa-copy"></i>
    `;

    const div = document.createElement("div");
    div.classList.add("message", "incoming", "loading");
    div.innerHTML = html;
    chat_list.appendChild(div);

    // Call API to get a response
    generateAPIResponse(div, userMessage);
};

const handleOutgoingChat = () => {
    const userMessage = typingInput.value.trim();
    if (!userMessage) return; // Prevent sending empty messages

    // Create user message element
    const messageHTML = `
        <div class="message outgoing">
            <div class="message_content">
                <div class="user">
                    <img src="img/user.png" alt="User">
                </div>
                <p class="text">${userMessage}</p>
            </div>
        </div>
    `;

    const div = document.createElement("div");
    div.classList.add("message", "outgoing");
    div.innerHTML = messageHTML;
    chat_list.appendChild(div);

    typing_form.reset(); // Clear input after sending
    showLoading(userMessage); // Show loading animation immediately
};

// Listen for form submit event
typing_form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
