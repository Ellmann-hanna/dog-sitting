"use strict";
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.content ?? "";
}
function appendMessage(message) {
    const isUser = message.role === "user";
    const wrapper = document.createElement("div");
    wrapper.className = `message ${isUser ? "user-message" : "assistant-message"}`;
    const avatar = document.createElement("div");
    avatar.className = `avatar ${isUser ? "user-avatar" : "assistant-avatar"}`;
    avatar.textContent = isUser ? "U" : "C";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const p = document.createElement("p");
    p.textContent = message.content;
    bubble.appendChild(p);
    if (isUser) {
        wrapper.appendChild(bubble);
        wrapper.appendChild(avatar);
    }
    else {
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
    }
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}
function setLoading(loading) {
    sendBtn.disabled = loading;
    inputEl.disabled = loading;
    sendBtn.style.opacity = loading ? "0.6" : "1";
}
async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text)
        return;
    inputEl.value = "";
    appendMessage({ role: "user", content: text });
    setLoading(true);
    try {
        const response = await fetch("/pages/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": getCsrfToken(),
            },
            body: JSON.stringify({ message: text }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        appendMessage({ role: "assistant", content: data.reply });
    }
    catch (err) {
        appendMessage({
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
        });
        console.error("Chat error:", err);
    }
    finally {
        setLoading(false);
        inputEl.focus();
    }
}
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
inputEl.focus();
