// Connect to Socket.IO server
const socket = io();


// =========================
// Get HTML Elements
// =========================

const usernameScreen = document.getElementById("usernameScreen");
const chatApp = document.getElementById("chatApp");

const usernameInput = document.getElementById("usernameInput");
const joinButton = document.getElementById("joinButton");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const messages = document.getElementById("messages");

const usersList = document.getElementById("usersList");
const onlineCount = document.getElementById("onlineCount");

const typingIndicator = document.getElementById("typingIndicator");

const clearButton = document.getElementById("clearButton");

const errorMessage = document.getElementById("errorMessage");


// Current user
let username = "";


// Typing timer
let typingTimer;


// =========================
// Join Chat
// =========================

joinButton.addEventListener("click", joinChat);

usernameInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        joinChat();
    }

});


function joinChat() {

    const enteredName = usernameInput.value.trim();

    if (enteredName === "") {

        errorMessage.textContent = "Please enter your username.";

        return;
    }

    if (enteredName.length < 2) {

        errorMessage.textContent = "Username must contain at least 2 characters.";

        return;
    }

    username = enteredName;

    // Hide login screen
    usernameScreen.classList.add("hidden");

    // Show chat application
    chatApp.classList.remove("hidden");

    // Send username to server
    socket.emit("joinChat", username);

    // Focus message input
    messageInput.focus();
}


// =========================
// Send Message
// =========================

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }

});


function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    // Send message to server
    socket.emit("chatMessage", message);

    // Clear input
    messageInput.value = "";

    // Stop typing
    socket.emit("stopTyping");

    clearTimeout(typingTimer);

    messageInput.focus();
}


// =========================
// Receive Message
// =========================

socket.on("message", (data) => {

    // Remove welcome empty message
    const emptyMessage = document.querySelector(".empty-message");

    if (emptyMessage) {
        emptyMessage.remove();
    }


    // System message
    if (data.system) {

        const systemMessage = document.createElement("div");

        systemMessage.classList.add("system-message");

        systemMessage.textContent =
            `${data.text} • ${data.time}`;

        messages.appendChild(systemMessage);

    }

    // Normal message
    else {

        const messageDiv = document.createElement("div");

        // Check if message belongs to current user
        if (data.username === username) {

            messageDiv.classList.add("message", "own");

        } else {

            messageDiv.classList.add("message", "other");

        }


        const usernameElement =
            document.createElement("div");

        usernameElement.classList.add("message-username");

        usernameElement.textContent = data.username;


        const contentElement =
            document.createElement("div");

        contentElement.classList.add("message-content");

        contentElement.textContent = data.text;


        const timeElement =
            document.createElement("div");

        timeElement.classList.add("message-time");

        timeElement.textContent = data.time;


        messageDiv.appendChild(usernameElement);

        messageDiv.appendChild(contentElement);

        messageDiv.appendChild(timeElement);

        messages.appendChild(messageDiv);
    }


    // Scroll to latest message
    messages.scrollTop = messages.scrollHeight;
});


// =========================
// Update Online Users
// =========================

socket.on("updateUsers", (users) => {

    usersList.innerHTML = "";

    onlineCount.textContent = users.length;


    users.forEach((user) => {

        const userItem =
            document.createElement("div");

        userItem.classList.add("user-item");


        const avatar =
            document.createElement("div");

        avatar.classList.add("user-avatar");

        avatar.textContent =
            user.charAt(0).toUpperCase();


        const name =
            document.createElement("div");

        name.classList.add("user-name");

        name.textContent = user;


        userItem.appendChild(avatar);

        userItem.appendChild(name);

        usersList.appendChild(userItem);

    });

});


// =========================
// Typing Indicator
// =========================

messageInput.addEventListener("input", () => {

    if (messageInput.value.length > 0) {

        socket.emit("typing");

        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {

            socket.emit("stopTyping");

        }, 1000);

    } else {

        socket.emit("stopTyping");

    }

});


socket.on("userTyping", (user) => {

    typingIndicator.textContent =
        `${user} is typing...`;

});


socket.on("userStoppedTyping", () => {

    typingIndicator.textContent = "";

});


// =========================
// Clear Chat
// =========================

clearButton.addEventListener("click", () => {

    messages.innerHTML = "";

    const emptyMessage =
        document.createElement("div");

    emptyMessage.classList.add("empty-message");

    emptyMessage.innerHTML = `
        <div>💬</div>
        <h3>Chat cleared</h3>
        <p>New messages will appear here.</p>
    `;

    messages.appendChild(emptyMessage);

});