import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Send, Image as ImageIcon, Bot, User, Clipboard } from 'lucide-react';

// Background pattern from https://www.heropatterns.com/
const ChatBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full bg-[#E5DDD5] opacity-50">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="a" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="scale(2) rotate(0)">
          <path d="M0 60V0h60" stroke="#C4C1BD" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#a)"/>
    </svg>
  </div>
);


function App() {
  // State Management
  const [messages, setMessages] = useState([
    { from: 'bot', type: 'text', content: 'Welcome to Munimji! Please enter your Gemini API key to begin.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isApiValid, setIsApiValid] = useState(null); // null, true, or false
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  // --- Core Logic (Functions) ---

  const validateApiKey = async (key) => {
    if (!key) {
      setIsApiValid(false);
      return;
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "contents": [{"parts":[{"text": "hello"}]}]
        })
      });
      if (response.ok) {
        setIsApiValid(true);
        setApiKey(key);
        setMessages(prev => [...prev, { from: 'bot', type: 'text', content: 'API Key is valid! You can now use the features.' }]);
      } else {
        setIsApiValid(false);
        setMessages(prev => [...prev, { from: 'bot', type: 'text', content: 'Invalid API Key. Please try again.' }]);
      }
    } catch (error) {
      setIsApiValid(false);
      setMessages(prev => [...prev, { from: 'bot', type: 'text', content: 'Failed to validate API key. Check your network.' }]);
    }
  };

  const handleIncomingMessage = async (message) => {
    if (!apiKey) {
        setMessages(prev => [...prev, { from: 'bot', type: 'text', content: 'Please set your Gemini API key first.' }]);
        return;
    }

    setIsBotTyping(true);

    try {
        let payload;
        if (message.type === 'text') {
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{ "text": message.content }]
                    },
                    {
                        "role": "model",
                        "parts": [{
                            "text": `You are "Munimji", an AI assistant for Indian MSMEs. Your task is to understand user commands and return structured JSON.
                        - For invoice creation, return: { "intent": "CREATE_INVOICE", "details": { "customerName": "...", "amount": 0, "dueDate": "..." } }
                        - For payment queries, return: { "intent": "QUERY_PAYMENTS", "details": { "status": "..." } }
                        - For help, return: { "intent": "HELP", "details": { "topic": "..." } }
                        - For anything else, return: { "intent": "UNKNOWN" }`
                        }]
                    }
                ],
                "generationConfig": {
                    "response_mime_type": "application/json"
                }
            };
        } else if (message.type === 'image') {
            const base64Data = message.content.split(',')[1];
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            { "text": "You are an expert receipt scanner. Analyze the image and return a JSON object with: { \"vendor\": \"...\", \"amount\": 0.0, \"category\": \"e.g., food, travel\" }." },
                            {
                                "inline_data": {
                                    "mime_type": message.file.type,
                                    "data": base64Data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "response_mime_type": "application/json"
                }
            };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        
        // Add a small delay to make the interaction feel more natural
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'bot', type: 'text', content: `

${botResponse}

`}]);
            setIsBotTyping(false);
        }, 1000);


    } catch (error) {
        console.error("Error processing message:", error);
        setMessages(prev => [...prev, { from: 'bot', type: 'text', content: `Sorry, something went wrong. ${error.message}` }]);
        setIsBotTyping(false);
    }
};


  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMessage = { from: 'user', type: 'text', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    handleIncomingMessage(userMessage);
    setInputValue('');
  };

  const handleSendImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      const userMessage = { from: 'user', type: 'image', content: base64Url, file: file };
      setMessages(prev => [...prev, userMessage]);
      handleIncomingMessage(userMessage);
    };
    reader.readAsDataURL(file);
  };

  const handleDemoClick = (text) => {
    setInputValue(text);
  };

  // --- UI Layout ---
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center font-sans p-4">
      {/* API Key Section */}
      <div className="w-full max-w-4xl mb-4 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Gemini API Key</h2>
        <div className="flex items-center space-x-2">
          <input
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => validateApiKey(tempApiKey)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save & Validate
          </button>
          {isApiValid === true && <Check className="text-green-500" />}
          {isApiValid === false && <X className="text-red-500" />}
        </div>
      </div>

      {/* Two-Pane Layout */}
      <div className="w-full max-w-4xl flex space-x-4">
        {/* Left Pane (Control Panel) */}
        <div className="w-1/3 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">GST Business Assistant</h1>
          <p className="text-gray-600 mt-2">
            This is a functional prototype of "Munimji". Use natural language in the chat to manage your business finances.
          </p>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Demo Controls</h3>
            <div className="flex flex-col space-y-2 mt-2">
              <button
                onClick={() => handleDemoClick('Create an invoice for customer "Rajesh Kumar" for Rs. 15,000 due next Friday.')}
                disabled={!apiKey}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                Create an Invoice
              </button>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={!apiKey}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                Send Receipt Image
              </button>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleSendImage}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>

        {/* Right Pane (Mock Phone) */}
        <div className="w-2/3">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Phone Header */}
            <div className="bg-gray-200 p-3 flex items-center">
                <Bot className="w-8 h-8 text-gray-600 mr-3"/>
                <div>
                    <h2 className="font-semibold text-gray-800">Munimji</h2>
                    <p className="text-sm text-green-600">online</p>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={chatAreaRef} className="h-96 bg-[#E5DDD5] p-4 overflow-y-auto relative">
              <ChatBackground />
              <div className="relative z-10 flex flex-col space-y-3">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md shadow ${msg.from === 'user' ? 'bg-[#DCF8C6]' : 'bg-white'}`}>
                      {msg.type === 'text' && <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>}
                      {msg.type === 'image' && <img src={msg.content} alt="User upload" className="rounded-md max-h-60" />}
                    </div>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-3 py-2 bg-white shadow">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-100 flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-grow p-2 border rounded-full px-4 focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={handleSend} className="ml-3 text-blue-600 hover:text-blue-800">
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;