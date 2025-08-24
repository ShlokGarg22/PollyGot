// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

const API_BASE = (location.origin.includes('localhost:3000') || location.origin.includes('127.0.0.1:3000'))
    ? ''
    : 'http://localhost:3000';

// Remove the old checkBtn event listener since we're focusing on the chat interface

let conversation = [
    { role: 'system', content: 'You are a helpful language chatbot.' }
];

// Improved message rendering with avatars and better styling
function addMessageToChat(role, content) {
    // Move typing indicator to the end
    chatContainer.removeChild(typingIndicator);
    
    // Create message container with proper alignment
    const containerDiv = document.createElement('div');
    containerDiv.className = `message-container ${role === 'user' ? 'user-container' : ''}`;
    
    // Create avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${role === 'user' ? 'user-avatar' : ''}`;
    avatarDiv.textContent = role === 'user' ? 'You' : 'AI';
    
    // Create message content
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-content ${role === 'user' ? 'user-message' : 'ai-message'}`;
    
    // Support for markdown-like syntax highlighting
    let formattedContent = content;
    
    // Handle code blocks with backticks
    formattedContent = formattedContent.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Handle bold text
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert newlines to <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = formattedContent;
    
    // Assemble the message
    containerDiv.appendChild(avatarDiv);
    containerDiv.appendChild(messageDiv);
    chatContainer.appendChild(containerDiv);
    
    // Re-append the typing indicator
    chatContainer.appendChild(typingIndicator);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle message sending and receiving
async function handleSend() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    
    // Add user message to chat
    addMessageToChat('user', userMessage);
    conversation.push({ role: 'user', content: userMessage });
    userInput.value = '';
    
    // Show typing indicator
    typingIndicator.style.display = "flex";
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation })
        });
        
        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            addMessageToChat('ai', `❌ Error: Unable to get a response. ${res.status} ${errorText}`);
            return;
        }
        
        const data = await res.json();
        const aiReply = data.reply || "I'm sorry, I couldn't generate a response.";
        
        // Add AI reply to chat
        addMessageToChat('ai', aiReply);
        conversation.push({ role: 'assistant', content: aiReply });
    } catch (err) {
        console.error(err);
        addMessageToChat('ai', '❌ Network error. Please check if the server is running.');
    } finally {
        // Hide typing indicator
        typingIndicator.style.display = "none";
    }
}

// Event listeners
sendBtn.addEventListener('click', handleSend);

// Also listen for Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});