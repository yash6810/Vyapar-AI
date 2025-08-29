Project Brief: Munimji - AI-Powered GST Business Assistant
1. Project Overview
Munimji is an interactive, single-page React application that serves as a functional prototype for an AI-powered financial assistant for Indian MSMEs. The core concept is to demonstrate how a user can manage their business finances (invoicing, expenses) through a simple, conversational interface that mimics WhatsApp. The application will feature a live integration with the Google Gemini API, requiring users to input their own API key to activate the AI functionalities.

2. Core Features
API Key Validation: A dedicated UI section for users to enter and validate their Gemini API key (obtainable from Google AI Studio). The app's core features remain disabled until a valid key is provided.

Conversational UI: A two-pane layout featuring a control panel and a simulated smartphone with a WhatsApp-like chat interface.

AI-Powered Text Analysis: Use the Google Gemini API (gemini-1.5-flash) to understand natural language commands for creating invoices, querying payments, and asking for help. The AI should return structured JSON.

AI-Powered Image Analysis: Use the Google Gemini API (gemini-1.5-flash) to analyze images of receipts, extract key information (vendor, amount, category), and return structured JSON.

Dynamic Chat Flow: The chat interface should display user messages, bot responses, image uploads, and a "typing" indicator to simulate a real conversation.

Responsive Design: The application should be fully responsive and visually appealing on all screen sizes.

3. Tech Stack
Framework: React (using create-react-app)

Styling: Tailwind CSS

Icons: Lucide React

Language: JavaScript (ES6+)

API: Google Gemini API (v1beta)

4. File Structure
The entire application should be built within the standard create-react-app structure. The primary logic will be contained within src/App.js.

munimji-app/
├── docs/
│   └── Project Brief Munimji - AI-Powered.md
├── public/
│   └── index.html
├── src/
│   ├── App.js         # Main application component
│   ├── index.css      # Tailwind CSS directives
│   └── index.js
├── package.json
├── tailwind.config.js # Tailwind configuration
└── postcss.config.js  # PostCSS configuration

5. Component Breakdown (src/App.js)
The App.js file will contain the entire application logic. Here is the required structure and functionality:

State Management (useState)
messages: An array of chat message objects (e.g., { from: 'user', type: 'text', content: '...' }).

inputValue: The current text in the chat input field.

isBotTyping: A boolean to show/hide the typing indicator.

apiKey, tempApiKey: Strings to manage the Gemini API key.

isApiValid: A state to track if the provided API key is valid (null, true, or false).

UI Layout
A main container div using Flexbox.

API Key Section (Top):

An input field (type password) for the API key.

A "Save & Validate" button.

Visual feedback (check/cross icon) for API key validation status.

Two-Pane Layout:

Left Pane (Control Panel):

App title ("GST Business Assistant").

Description of the demo.

"Demo Controls" section with buttons to pre-fill the input for common actions ("Send Receipt Image", "Create an Invoice"). These buttons should be disabled if no API key is set.

Right Pane (Mock Phone):

A container styled to look like a smartphone.

A header with the bot's name ("Munimji") and "online" status.

A scrollable chat area that maps over the messages state array to display each message. It should render different styles for 'user' and 'bot' messages, as well as image messages.

A "typing" indicator that appears when isBotTyping is true.

A chat input field and a "Send" button at the bottom.

Core Logic (Functions)
validateApiKey(key): An async function that makes a test call to a Gemini endpoint to verify the key. Updates the isApiValid and apiKey states based on the response.

handleIncomingMessage(message): The main async function that orchestrates the AI interaction.

It should first check if a valid apiKey exists.

It sets isBotTyping to true.

If the message is text: It constructs a payload for the Gemini API with a detailed system prompt instructing the model to act as "Munimji" and return a specific JSON object based on the user's intent (CREATE_INVOICE, QUERY_PAYMENTS, etc.).

If the message is an image: It first converts the image URL to Base64. Then, it constructs a payload for the Gemini API vision model with a system prompt instructing it to analyze the receipt and return a JSON object with vendor, amount, and category.

It makes the fetch call to the Gemini API.

It parses the JSON response from the AI and updates the messages state with the bot's reply.

It handles potential API errors gracefully.

Finally, it sets isBotTyping to false.

handleSend() & handleSendImage(): Functions to add the user's message/image to the chat and trigger handleIncomingMessage.

6. Styling Guidelines
Use Tailwind CSS for all styling.

The chat bubbles for the user should be a light green (#DCF8C6) and right-aligned.

The chat bubbles for the bot should be white and left-aligned.

The chat background should use a subtle, classic WhatsApp background pattern.

The overall design should be clean, professional, and intuitive, with ample white space.

7. Setup and Run
The generated code should be runnable with the following standard commands in the project directory:

npm install

npm start