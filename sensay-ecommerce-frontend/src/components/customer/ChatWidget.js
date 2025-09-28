import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import { MessageSquare, Send, X, Loader2, Info, Coins, Mic, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/ChatWidget.css';

// Ensure SpeechRecognition is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const ChatWidget = () => {
  const { isAuthenticated, user, updateUser, sensayBalance } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const messagesEndRef = useRef(null);

<<<<<<< HEAD
  // --- REVISED: Use useRef for isSending to avoid unnecessary re-renders ---
  const isSendingRef = useRef(false); // Use ref to track sending state
  const [showTypingIndicator, setShowTypingIndicator] = useState(false); // State for actual UI indicator

=======
  // For anonymous users, conversationId is 'anonymous'.
  // For authenticated users, it's their user ID.
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
  const conversationId = isAuthenticated ? user?._id : 'anonymous';

  // --- REVISED useEffect for loading chat history ---
  useEffect(() => {
    console.log('useEffect [isOpen, isAuthenticated, conversationId] triggered. IsOpen:', isOpen, 'Authenticated:', isAuthenticated, 'ConvId:', conversationId);
    let isMounted = true; 
    const loadChatHistory = async () => {
<<<<<<< HEAD
      // Ensure we're not currently sending a message before re-fetching history
      // This prevents the history re-fetch from wiping out a message being processed.
      if (isSendingRef.current) {
        console.log('loadChatHistory: Skipping history fetch because a message is currently sending.');
        return; 
      }

      if (isOpen && isAuthenticated) {
        console.log('Fetching chat history for authenticated user...');
        try {
          const history = await chatService.getChatHistory(conversationId);
          console.log('Fetched chat history:', history.messages.length, 'messages');
          if (isMounted) {
            setMessages(history.messages);
            console.log('setMessages called from loadChatHistory');
          }
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
          if (isMounted) {
            toast.error('Failed to load chat history.');
          }
        }
      } else if (isOpen && !isAuthenticated) {
        console.log('Clearing messages for anonymous user on widget open.');
        if (isMounted) {
          setMessages([]);
          console.log('setMessages called to clear for anonymous');
        }
      }
    };

=======
      // Only fetch history if authenticated AND widget is open
      if (isOpen && isAuthenticated) {
        console.log('Fetching chat history for authenticated user...');
        try {
          const history = await chatService.getChatHistory(conversationId);
          console.log('Fetched chat history:', history.messages.length, 'messages');
          if (isMounted) {
            setMessages(history.messages);
            console.log('setMessages called from loadChatHistory');
          }
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
          if (isMounted) {
            toast.error('Failed to load chat history.');
          }
        }
      } else if (isOpen && !isAuthenticated) {
        // When widget opens for an anonymous user, clear any previous messages
        console.log('Clearing messages for anonymous user on widget open.');
        if (isMounted) {
          setMessages([]);
          console.log('setMessages called to clear for anonymous');
        }
      }
    };

>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
    loadChatHistory();

    return () => {
      isMounted = false;
      console.log('Cleanup for useEffect [isOpen, isAuthenticated, conversationId]');
    };
  }, [isOpen, isAuthenticated, conversationId]); 

  // --- Keep this for scrolling ---
  useEffect(() => {
    console.log('useEffect [messages] triggered. Messages length:', messages.length);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const messageToSend = inputMessage.trim() || recordedText.trim();

<<<<<<< HEAD
    if (!messageToSend || isSendingRef.current) { // Check ref for sending state
=======
    if (!messageToSend || isSending) {
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
      console.log('handleSendMessage: Aborted. Message empty or already sending.');
      return;
    }

    // Add user message immediately to local state
    const userMessage = {
      role: 'user',
      content: messageToSend,
      createdAt: new Date().toISOString(),
    };
    console.log('handleSendMessage: Adding user message to state:', userMessage.content);
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setRecordedText('');
<<<<<<< HEAD
    
    // --- REVISED: Manage sending state with ref and typing indicator with state ---
    isSendingRef.current = true; // Set ref immediately
    console.log('handleSendMessage: Setting isSendingRef.current to true');
    setShowTypingIndicator(true); // Show typing indicator
    console.log('handleSendMessage: Setting showTypingIndicator to true');
=======
    console.log('handleSendMessage: Setting isSending to true (show typing indicator)');
    setIsSending(true); 
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67

    try {
      let aiResponse;
      if (isAuthenticated) {
        console.log('handleSendMessage: Sending authenticated message...');
        aiResponse = await chatService.sendAuthenticatedMessage(messageToSend, conversationId);
      } else {
        console.log('handleSendMessage: Sending anonymous message...');
        aiResponse = await chatService.sendAnonymousMessage(messageToSend);
      }

      console.log('handleSendMessage: AI response received:', aiResponse.content);
      // Add AI response to local state
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse.content,
          createdAt: new Date().toISOString(),
          metadata: aiResponse.metadata,
        },
      ]);
      console.log('handleSendMessage: setMessages called with AI response.');
      toast.success('AI responded!');
      
<<<<<<< HEAD
=======
      // Only update user context if authenticated
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
      if (isAuthenticated) {
        console.log('handleSendMessage: Calling updateUser() for authenticated user.');
        await updateUser(); 
      }

    } catch (error) {
      console.error('handleSendMessage: Error during AI communication:', error);
<<<<<<< HEAD
=======
      // IMPORTANT: Check for specific error types for anonymous users
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
      if (!isAuthenticated && error.message.includes('Insufficient balance')) {
          toast.error('AI assistant is temporarily unavailable. Please try again later.');
      } else if (!isAuthenticated && error.message.includes('System temporarily unavailable')) {
          toast.error('AI assistant is temporarily unavailable. Please try again later.');
      } else {
<<<<<<< HEAD
=======
          // For other errors or authenticated users, use generic error message
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
          toast.error(error.message || 'An unexpected error occurred. Please try again.');
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Oops! I encountered an error: ${error.message}. Please try again.`,
          createdAt: new Date().toISOString(),
          metadata: { model: 'error' },
        },
      ]);
      console.log('handleSendMessage: setMessages called with error message.');
    } finally {
<<<<<<< HEAD
      // --- REVISED: Ensure typing indicator is hidden and ref is reset ---
      isSendingRef.current = false; // Reset ref
      console.log('handleSendMessage: Setting isSendingRef.current to false');
      setShowTypingIndicator(false); // Hide typing indicator
      console.log('handleSendMessage: Setting showTypingIndicator to false');
=======
      console.log('handleSendMessage: Setting isSending to false (hide typing indicator)');
      setIsSending(false); 
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
    }
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    setIsRecording(true);
    setRecordedText('');
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecordedText(transcript);
      setInputMessage(transcript);
      console.log('Recorded:', transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const formatMessageContent = (content) => {
    let formattedContent = content;

    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedContent = formattedContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
    formattedContent = formattedContent.replace(/\[([^\]]+)\]\((?!https?:\/\/)([^\s)]+)\)/g, '<a href="$2" class="chat-link">$1</a>');
    formattedContent = formattedContent.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  // Admin users should not see the chat widget
  if (user?.role === 'admin') {
    return null;
  }

  return (
    <div className="chat-widget">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-btn"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3 className="chat-title">Sensay AI Assistant</h3>
<<<<<<< HEAD
=======
            {/* Display balance only if authenticated */}
>>>>>>> 324ffdcbbff9deaa336e20b500836429c0662d67
            {isAuthenticated && (
              <span className="chat-balance">
                <Coins size={16} /> {sensayBalance?.toLocaleString() || 0} units
              </span>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                {isAuthenticated ? (
                  <p>Hi {user?.firstName}! How can I help you today?</p>
                ) : (
                  <p>Hello! I'm your AI assistant. How can I help you?</p>
                )}
                <p className="chat-welcome-sub">
                  {isAuthenticated ? 'Your past conversations are loaded here.' : 'Chat as guest. Login for personalized experience.'}
                </p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={msg._id || msg.createdAt || index} 
                className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}
              >
                <div className="chat-message-content">
                  {formatMessageContent(msg.content)}
                  <p className="chat-message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {/* --- REVISED: Use showTypingIndicator state for UI display --- */}
            {showTypingIndicator && ( 
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-content chat-typing">
                  <Loader2 size={16} className="spinner" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            {SpeechRecognition && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`chat-voice-btn ${isRecording ? 'recording' : ''}`}
                title={isRecording ? "Stop Recording" : "Start Voice Message"}
                disabled={isSendingRef.current} // Check ref for disabling
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
            )}
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isRecording ? "Listening..." : (isAuthenticated ? "Type your message..." : "Chat as guest")}
              className="chat-input"
              disabled={isSendingRef.current || isRecording} // Check ref for disabling
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isSendingRef.current || (!inputMessage.trim() && !recordedText.trim())} // Check ref for disabling
            >
              <Send size={20} />
            </button>
          </form>

          {/* Low balance warning for authenticated customers only */}
          {isAuthenticated && user?.role === 'customer' && sensayBalance !== undefined && sensayBalance < 50 && (
            <div className="chat-warning">
              <Info size={16} />
              Low Sensay Balance: {sensayBalance} units.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
