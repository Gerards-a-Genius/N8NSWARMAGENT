import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Settings as SettingsIcon, Terminal, Trash2 } from 'lucide-react';
import './App.css';
import './components/Settings.css';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import VoiceRecorder from './components/VoiceRecorder';
import Settings, { AppSettings } from './components/Settings';
import { initializeTheme, applyTheme } from './utils/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'system',
  webhooks: [],
  activeWebhookId: '',
  voiceSettings: {
    language: 'en-US',
    autoSend: true
  },
  chatSettings: {
    showTimestamps: true,
    soundEnabled: false,
    enterToSend: true
  }
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize theme
    initializeTheme();

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('agentSwarmSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      applyTheme(parsedSettings.theme);
    }

    // Initialize session
    const storedSessionId = localStorage.getItem('agentSwarmSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('agentSwarmSessionId', newSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/messages/history/${sessionId}`);
      if (response.data.success && response.data.history) {
        setMessages(response.data.history.map((msg: any) => ({
          id: uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const getActiveWebhook = () => {
    return settings.webhooks.find(w => w.id === settings.activeWebhookId);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const activeWebhook = getActiveWebhook();
    if (!activeWebhook || !activeWebhook.url) {
      setError('Please configure a webhook in settings first');
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/messages/send', {
        message: content,
        sessionId,
        webhookUrl: activeWebhook.url,
        authToken: activeWebhook.authToken,
        timeout: activeWebhook.timeout
      });

      if (response.data.success) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Play sound if enabled
        if (settings.chatSettings.soundEnabled) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
      } else {
        setError('Failed to get response from agent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    const activeWebhook = getActiveWebhook();
    if (!activeWebhook || !activeWebhook.url) {
      setError('Please configure a webhook in settings first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('sessionId', sessionId);
      formData.append('webhookUrl', activeWebhook.url);
      formData.append('authToken', activeWebhook.authToken || '');
      formData.append('language', settings.voiceSettings.language);

      const response = await axios.post('/api/voice/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Add transcribed message
        const userMessage: Message = {
          id: uuidv4(),
          role: 'user',
          content: response.data.transcription,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // Add assistant response
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (settings.chatSettings.soundEnabled) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
      } else {
        setError('Failed to process voice message');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send voice message');
      console.error('Error sending voice message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      try {
        await axios.delete(`/api/messages/history/${sessionId}`);
        setMessages([]);
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        localStorage.setItem('agentSwarmSessionId', newSessionId);
      } catch (err) {
        console.error('Failed to clear conversation:', err);
      }
    }
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.theme);
    localStorage.setItem('agentSwarmSettings', JSON.stringify(newSettings));
  };

  const activeWebhook = getActiveWebhook();

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <Terminal size={20} />
          Agent Swarm
        </h1>
        <div className="header-actions">
          <button 
            className="icon-button" 
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <div className="session-info">
        <div className="session-badge">
          <div className="status-dot" />
          <span>Session: {sessionId.substring(0, 8)}...</span>
          {activeWebhook && <span> • {activeWebhook.name}</span>}
        </div>
        <button className="clear-button" onClick={clearConversation}>
          <Trash2 size={14} />
          Clear Chat
        </button>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="empty-chat-state">
              <Terminal size={48} style={{ opacity: 0.3 }} />
              <h3>Start a conversation</h3>
              <p>Send a message to begin chatting with your AI agent</p>
              {!activeWebhook && (
                <button 
                  className="add-button"
                  onClick={() => setShowSettings(true)}
                  style={{ marginTop: '1rem' }}
                >
                  Configure Webhook
                </button>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              showTimestamp={settings.chatSettings.showTimestamps}
            />
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-bubble">
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <form className="input-form" onSubmit={(e) => e.preventDefault()}>
            <MessageInput
              onSendMessage={sendMessage}
              disabled={isLoading || !activeWebhook}
              enterToSend={settings.chatSettings.enterToSend}
              placeholder={activeWebhook ? "Type your message..." : "Configure a webhook to start chatting"}
            />
            <VoiceRecorder
              onAudioRecorded={sendVoiceMessage}
              disabled={isLoading || !activeWebhook}
              autoSend={settings.voiceSettings.autoSend}
            />
          </form>
        </div>
      </div>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
        currentSettings={settings}
      />
    </div>
  );
}

export default App;