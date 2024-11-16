// script.js
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');
    const codeOutput = document.getElementById('code-output');

    let conversationHistory = [];

    const systemMessage = {
        role: 'system',
        content: `You are a helpful AI coding assistant. Keep responses clear and well-formatted.
        - Use line breaks between paragraphs for readability
        - Place code in a single \`\`\` block
        - Maintain natural conversation style
        - Add proper spacing in explanations`
    };

    async function sendMessage(message) {
        const selectedModel = modelSelect.value;
        appendMessage('User: ' + message, 'user-message');

        try {
            conversationHistory.push({ role: 'user', content: message });
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }

            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [systemMessage, ...conversationHistory],
                    model: selectedModel
                })
            });

            const aiResponse = await response.text();
            
            if (aiResponse) {
                // Extract code block if present
                const codeMatch = aiResponse.match(/```[\s\S]*?```/);
                
                // Clean message and preserve line breaks
                let cleanedMessage = aiResponse
                    .replace(/```[\s\S]*?```/g, '')
                    .trim();

                // Indicate code presence
                if (codeMatch) {
                    cleanedMessage += '\n\nI\'ve provided the code solution below.';
                }

                // Display formatted message
                appendMessage('AI: ' + cleanedMessage, 'ai-message');

                // Handle code display
                if (codeMatch) {
                    const code = codeMatch[0].replace(/```/g, '').trim();
                    codeOutput.innerHTML = `
                        <div class="code-header">
                            <span>Code Solution</span>
                            <button onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`')}\`)" class="copy-button">
                                Copy Code
                            </button>
                        </div>
                        <div class="code-content">
                            <pre><code>${escapeHtml(code)}</code></pre>
                        </div>
                    `;
                } else {
                    codeOutput.innerHTML = '';
                }

                conversationHistory.push({ role: 'assistant', content: aiResponse });
            }
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Error: Failed to get response', 'error-message');
        }
    }

    // Escape HTML to prevent code execution
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Preserve line breaks in messages
    function appendMessage(message, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = className;
        
        // Split by newlines and create paragraphs
        const paragraphs = message.split('\n');
        paragraphs.forEach((para, index) => {
            if (para.trim()) {
                const p = document.createElement('p');
                p.textContent = para;
                messageDiv.appendChild(p);
            } else if (index < paragraphs.length - 1) {
                // Add spacing for empty lines (except at the end)
                messageDiv.appendChild(document.createElement('br'));
            }
        });

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    modelSelect.addEventListener('change', () => {
        chatMessages.innerHTML = '';
        codeOutput.innerHTML = '';
        hiddenCodeArea.value = '';
        conversationHistory = [];
        appendMessage('System: Switched to ' + modelSelect.options[modelSelect.selectedIndex].text, 'system-message');
    });

    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    fetchModels();
});