import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleQuestion, Send, X, Sparkles } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "👋 Hi there! What brings you to our AI assistance today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const chatboxRef = useRef(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIsLoggedIn(true);
      setUserType(payload.userType);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userType: userType
        }),
      });

      const data = await res.json();
      setMessages(prevMessages => [
        ...prevMessages,
        { text: data.response, sender: "bot", link: data.link }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: "Sorry, something went wrong.", sender: "bot" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? "expanded" : ""}`}>
      {!isOpen && (
        <div
          className="chatbot-main-icon"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircleQuestion color="white" />
        </div>
      )}
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-close-icon">
            <X
              size={20}
              color="white"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="chatbot-header">
            <Sparkles size={20} color="white" style={{ marginRight: '10px' }} />
            <h3>AI Assistance</h3>
          </div>
          <div 
            className="chatbox" 
            ref={chatboxRef}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                {msg.text}
                {msg.link && (
                  <a 
                    href={msg.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="message-link"
                  >
                    Go to {msg.link}
                  </a>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot typing-indicator">
                Typing...
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;