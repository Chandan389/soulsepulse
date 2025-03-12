const BACKEND_URL = "https://soulsepulse.onrender.com";
 
function appendMessage(message, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender === "bot" ? "bot-message" : "user-message");
    div.textContent = message;
    document.getElementById("messages").appendChild(div);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}
 
function askQuestion() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;
    appendMessage(userInput, "user");
    document.getElementById("user-input").value = "";
 
    appendMessage("SoulPulse is thinking...", "bot");
 
    fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("messages").lastChild.remove();
        appendMessage(data.response || "I didn't understand that.", "bot");
    })
    .catch(error => {
        document.getElementById("messages").lastChild.remove();
        appendMessage("❌ Error processing request. Try again.", "bot");
    });
}
 
document.getElementById("send-button").addEventListener("click", askQuestion);
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        askQuestion();
    }
});

// Event listener for send button
document.getElementById('send-button').addEventListener('click', handleUserInput);

// Allow user to send message by pressing "Enter" key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});
