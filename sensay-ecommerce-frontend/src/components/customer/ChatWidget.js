import React, { useState, useEffect, useRef } from 'react';
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
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const messagesEndRef = useRef(null);

  const conversationId = isAuthenticated ? user?._id : 'anonymous';

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchChatHistory();
    } else if (isOpen && !isAuthenticated) {
      setMessages([]);
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(conversationId);
      setMessages(history.messages);
      await updateUser();
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      toast.error('Failed to load chat history.');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const messageToSend = inputMessage.trim() || recordedText.trim();

    if (!messageToSend || isSending) return;

    const userMessage = {
      role: 'user',
      content: messageToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setRecordedText('');
    setIsSending(true);

    try {
      let aiResponse;
      if (isAuthenticated) {
        aiResponse = await chatService.sendAuthenticatedMessage(messageToSend, conversationId);
      } else {
        aiResponse = await chatService.sendAnonymousMessage(messageToSend);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse.content,
          createdAt: new Date().toISOString(),
          metadata: aiResponse.metadata,
        },
      ]);
      toast.success('AI responded!');
      
      await updateUser(); 

    } catch (error) {
      toast.error(error.message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Oops! I encountered an error: ${error.message}. Please try again.`,
          createdAt: new Date().toISOString(),
          metadata: { model: 'error' },
        },
      ]);
    } finally {
      setIsSending(false);
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
    formattedContent = formattedContent.replace(/\[(.*?)\](?!https?:\/\/)(.*?)\)/g, '<a href="$2" class="chat-link">$1</a>');
    formattedContent = formattedContent.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

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
            <span className="chat-balance">
              <Coins size={16} /> {sensayBalance?.toLocaleString() || 0} units
            </span>
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
                key={index}
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
            {isSending && (
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
                disabled={isSending}
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
            )}
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isRecording ? "Listening..." : (isAuthenticated ? "Type your message..." : "Chat as guest (login for full features)")}
              className="chat-input"
              disabled={isSending || isRecording}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isSending || (!inputMessage.trim() && !recordedText.trim())}
            >
              <Send size={20} />
            </button>
          </form>

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
