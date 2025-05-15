import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleQuestion, Send, X, Sparkles } from 'lucide-react';
import './Chatbot.css';

const url = import.meta.env.VITE_API_URL;


const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "👋 Hi there! I'm your education management assistant. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('guest');
  const [conversationId, setConversationId] = useState(null);
  const chatboxRef = useRef(null);
  const inputRef = useRef(null);
  const prevUserTypeRef = useRef('guest');
  const tokenCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  useEffect(() => {
    if (isOpen && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isOpen, isLoading]);


  useEffect(() => {    

    const userId = localStorage.getItem('userId') || generateUserId();
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
    
    
    checkUserTypeFromTokens();
    
    
    tokenCheckIntervalRef.current = setInterval(checkUserTypeFromTokens, 1000);
    
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, []);

  const checkUserTypeFromTokens = () => {
    const tokens = {
      parentToken: localStorage.getItem('parentToken'),
      teacherToken: localStorage.getItem('teacherToken'),
      principalToken: localStorage.getItem('principalToken'),
      districtHeadToken: localStorage.getItem('districtHeadToken')
    };
    
    const tokenToUserType = {
      'parentToken': 'parent',
      'teacherToken': 'teacher',
      'principalToken': 'principal',
      'districtHeadToken': 'districtHead'
    };
    

    let foundUserType = null;
    for (const [tokenName, token] of Object.entries(tokens)) {
      if (token) {
        foundUserType = tokenToUserType[tokenName];
        break;
      }
    }
    
    const newUserType = foundUserType || 'guest';
    const userId = localStorage.getItem('userId');
    

    if (newUserType !== prevUserTypeRef.current) {
      console.log(`User type changed from ${prevUserTypeRef.current} to ${newUserType}`);
      
     
      setMessages([
        { text: `👋 Hi there! I'm your education management assistant. How can I help you today?`, sender: "bot" }
      ]);
      

      setUserType(newUserType);
      localStorage.setItem('userType', newUserType);
      setConversationId(`${userId}_${newUserType}`);
      

      prevUserTypeRef.current = newUserType;
    }
  };

  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  };

  const handleLinkClick = (link) => {
  
    window.location.href = link;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const currentUserType = userType;
      
      const res = await fetch(`${url}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userType: currentUserType,
          conversationId: conversationId
        }),
      });

      const data = await res.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      
      const botMessage = {
        text: data.response,
        sender: "bot",
        link: data.link || null,
        loginRequired: data.loginRequired || false,
        actionText: data.actionText || "access this feature",
        featureName: data.featureName || "this feature",
        linkText: data.linkText || "Click here"
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: "Sorry, I'm having trouble connecting to the server. Please try again later.", sender: "bot" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  const formatMessage = (message, msgObj) => {
    
    let processedMessage;
    
    if (message.includes("```")) {
      const parts = message.split("```");
      processedMessage = (
        <>
          {parts.map((part, i) => {
            if (i % 2 === 0) {
              return <span key={i}>{part}</span>;
            } else {
              return (
                <pre key={i} className="code-block">
                  <code>{part}</code>
                </pre>
              );
            }
          })}
        </>
      );
    } else {
      processedMessage = message.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < message.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    
    // Add link if present
    if (msgObj?.link) {
      return (
        <>
          {processedMessage}
          <div className="message-link-container">
            <a 
              href={msgObj.link}
              className="chat-link"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(msgObj.link);
              }}
            >
              {msgObj.linkText}
            </a>
          </div>
        </>
      );
    }
    
    return processedMessage;
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
          <div className="chatbot-header">
            <Sparkles size={20} color="white" style={{ marginRight: '10px' }} />
            <h3>AI Assistance</h3>
            {userType && <span className="user-role-badge">{userType}</span>}
            <div className="chatbot-close-icon">
              <X
                size={20}
                color="white"
                onClick={() => setIsOpen(false)}
              />
            </div>
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
                {typeof msg.text === 'string' ? formatMessage(msg.text, msg) : msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot typing-indicator">
                <div className="typing-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="send-button"
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