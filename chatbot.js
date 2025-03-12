// chatbot.js
// Function to append messages to the chat window
function appendMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    messageDiv.innerText = message;
    document.getElementById('messages').appendChild(messageDiv);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

// Function to handle user input and interact with the backend API
function handleUserInput() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    appendMessage(userInput, 'user'); // Show user's message
    document.getElementById('user-input').value = ''; // Clear input field

    // Call the backend API with the user input
    fetchData(userInput);
}

// Function to interact with the backend API
function fetchData(userInput) {
    console.log("🔹 Sending message to server:", userInput);

    fetch('http://localhost:5001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })  // 🔥 Ensure correct field name
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Received response from server:", data);
        appendMessage(data.response || "I didn't understand that.", 'bot');
    })
    .catch(error => {
        console.error('❌ Fetch error:', error);
        appendMessage('Error processing request.', 'bot');
    });
}


// Event listener for send button
document.getElementById('send-button').addEventListener('click', handleUserInput);

// Allow user to send message by pressing "Enter" key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});
