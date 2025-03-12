async function chatWithBot(userMessage) {
    try {
        const response = await fetch("https://soulsepulse.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        displayMessage("Bot", data.reply);
    } catch (error) {
        console.error("Error communicating with the bot:", error);
        displayMessage("Bot", "Oops! Something went wrong. Please try again.");
    }
}

function displayMessage(sender, message) {
    const chatbox = document.getElementById("chatbox");
    const messageElement = document.createElement("p");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(messageElement);
}

// Event listener for user input
document.getElementById("sendBtn").addEventListener("click", function () {
    const userInput = document.getElementById("userInput").value;
    if (userInput.trim() !== "") {
        displayMessage("You", userInput);
        chatWithBot(userInput);
        document.getElementById("userInput").value = "";
    }
});
