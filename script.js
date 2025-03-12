document.getElementById("sendBtn").addEventListener("click", function () {

    sendMessage();

});
 
document.getElementById("userInput").addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});
 
async function sendMessage() {

    const userInput = document.getElementById("userInput").value.trim();

    if (userInput === "") return;
 
    appendMessage("You", userInput);

    document.getElementById("userInput").value = "";
 
    // Show thinking message

    appendMessage("Bot", "SoulPulse is thinking...");
 
    try {

        const response = await fetch("https://soulsepulse.onrender.com/query", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ message: userInput }),

        });
 
        const data = await response.json();

        document.getElementById("messages").lastChild.remove(); // Remove "thinking..." message

        appendMessage("Bot", data.response || "I didn't understand that.");

    } catch (error) {

        document.getElementById("messages").lastChild.remove(); // Remove "thinking..." message

        appendMessage("Bot", "Oops! Something went wrong. Please try again.");

    }

}
 
function appendMessage(sender, message) {

    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", sender === "Bot" ? "bot-message" : "user-message");

    messageDiv.textContent = `${sender}: ${message}`;

    document.getElementById("messages").appendChild(messageDiv);

    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;

}

 
