const typingForm = document.querySelector(".typing-form");
const chatlist = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChat = document.querySelector("#delete-chat-button");

let usermessage = null;
let isResponseGenrator = false;
const YOUR_API_KEY = "AIzaSyBXNQmUDgucKekTxUq5S2AfxiC2I3Ibom0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${YOUR_API_KEY}`;

const localStorageData = () => {
    const isLightmode = (localStorage.getItem("themeColor") === "light_mode");
    const savedChats = localStorage.getItem("savedChats");
    document.body.classList.toggle("hide-header", !!savedChats);
    document.body.classList.toggle("light_mode", isLightmode);
    toggleThemeButton.innerText = isLightmode ? "dark_mode" : "light_mode";
    chatlist.innerHTML = savedChats || "";
    chatlist.scrollTo(0, chatlist.scrollHeight);
};

localStorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenrator = false; 
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatlist.innerHTML);
        }
    }, 50);
};

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: usermessage }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const apiResponse = data?.candidates[0]?.content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);

    } catch (error) {
        isResponseGenrator = false;
        console.error('API call failed:', error);
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

const showLoadingAnimation = () => {
    const html = `
        <div class="message-content">
            <img src="google-gemini-icon.webp" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-outlined">content_copy</span>
    `;
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatlist.appendChild(incomingMessageDiv);
    chatlist.scrollTo(0, chatlist.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
};

const handleOutgoingChat = () => {
    usermessage = typingForm.querySelector(".typing-input").value.trim() || usermessage;
    if (!usermessage|| isResponseGenrator) return;
    isResponseGenrator = true;
    const html = `
        <div class="message-content">
            <img src="profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg" alt="user image" class="avatar">
            <p class="text"></p>
        </div>
    `;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerHTML = usermessage;
    chatlist.appendChild(outgoingMessageDiv);
    typingForm.reset();
    chatlist.scrollTo(0, chatlist.scrollHeight);
    document.body.classList.add("hide-header");
    showLoadingAnimation();
};

suggestions.forEach(suggestions=>{
    suggestions.addEventListener("click",()=>{
        usermessage = suggestions.querySelector(".text").innerText;
        handleOutgoingChat()
});
});

deleteChat.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        localStorageData();
    }
});

toggleThemeButton.addEventListener("click", () => {
    const isLightmode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightmode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightmode ? "dark_mode" : "light_mode";
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
