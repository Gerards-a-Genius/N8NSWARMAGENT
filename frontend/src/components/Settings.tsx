import React, { useState, useEffect } from 'react';
import { X, Webhook, Palette, MessageSquare, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  currentSettings: AppSettings;
}

export interface WebhookProfile {
  id: string;
  name: string;
  url: string;
  authToken?: string;
  timeout?: number;
  active: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  webhooks: WebhookProfile[];
  activeWebhookId: string;
  voiceSettings: {
    language: string;
    autoSend: boolean;
  };
  chatSettings: {
    showTimestamps: boolean;
    soundEnabled: boolean;
    enterToSend: boolean;
  };
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSettingsChange, currentSettings }) => {
  const [activeTab, setActiveTab] = useState<'webhook' | 'appearance' | 'chat'>('webhook');
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleWebhookAdd = () => {
    const newWebhook: WebhookProfile = {
      id: Date.now().toString(),
      name: 'New Agent',
      url: '',
      authToken: '',
      timeout: 30000,
      active: false
    };
    
    setSettings(prev => ({
      ...prev,
      webhooks: [...prev.webhooks, newWebhook]
    }));
    setUnsavedChanges(true);
  };

  const handleWebhookUpdate = (id: string, field: keyof WebhookProfile, value: any) => {
    setSettings(prev => ({
      ...prev,
      webhooks: prev.webhooks.map(webhook =>
        webhook.id === id ? { ...webhook, [field]: value } : webhook
      )
    }));
    setUnsavedChanges(true);
  };

  const handleWebhookDelete = (id: string) => {
    setSettings(prev => ({
      ...prev,
      webhooks: prev.webhooks.filter(webhook => webhook.id !== id)
    }));
    setUnsavedChanges(true);
  };

  const handleWebhookActivate = (id: string) => {
    setSettings(prev => ({
      ...prev,
      activeWebhookId: id,
      webhooks: prev.webhooks.map(webhook => ({
        ...webhook,
        active: webhook.id === id
      }))
    }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    onSettingsChange(settings);
    setUnsavedChanges(false);
    // Save to localStorage
    localStorage.setItem('agentSwarmSettings', JSON.stringify(settings));
  };

  const tabs = [
    { id: 'webhook', label: 'Webhooks', icon: Webhook },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-backdrop"
            onClick={onClose}
          />
          
          {/* Settings Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="settings-sidebar"
          >
            {/* Header */}
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="icon-button" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="settings-content">
              {activeTab === 'webhook' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h3>Webhook Configuration</h3>
                    <button className="add-button" onClick={handleWebhookAdd}>
                      <Plus size={16} />
                      Add Webhook
                    </button>
                  </div>

                  <div className="webhooks-list">
                    {settings.webhooks.map((webhook) => (
                      <div key={webhook.id} className={`webhook-card ${webhook.active ? 'active' : ''}`}>
                        <div className="webhook-header">
                          <input
                            type="text"
                            value={webhook.name}
                            onChange={(e) => handleWebhookUpdate(webhook.id, 'name', e.target.value)}
                            className="webhook-name"
                            placeholder="Agent Name"
                          />
                          <div className="webhook-actions">
                            <button
                              className={`activate-button ${webhook.active ? 'active' : ''}`}
                              onClick={() => handleWebhookActivate(webhook.id)}
                            >
                              {webhook.active ? 'Active' : 'Activate'}
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleWebhookDelete(webhook.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Webhook URL</label>
                          <input
                            type="url"
                            value={webhook.url}
                            onChange={(e) => handleWebhookUpdate(webhook.id, 'url', e.target.value)}
                            placeholder="https://your-n8n-instance.com/webhook/..."
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label>Auth Token (Optional)</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showTokens[webhook.id] ? 'text' : 'password'}
                              value={webhook.authToken || ''}
                              onChange={(e) => handleWebhookUpdate(webhook.id, 'authToken', e.target.value)}
                              placeholder="Bearer token or API key"
                              className="form-input"
                            />
                            <button
                              className="toggle-password"
                              onClick={() => setShowTokens(prev => ({
                                ...prev,
                                [webhook.id]: !prev[webhook.id]
                              }))}
                            >
                              {showTokens[webhook.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Timeout (ms)</label>
                          <input
                            type="number"
                            value={webhook.timeout || 30000}
                            onChange={(e) => handleWebhookUpdate(webhook.id, 'timeout', parseInt(e.target.value))}
                            min="5000"
                            max="120000"
                            step="1000"
                            className="form-input"
                          />
                        </div>
                      </div>
                    ))}

                    {settings.webhooks.length === 0 && (
                      <div className="empty-state">
                        <Webhook size={48} />
                        <p>No webhooks configured</p>
                        <button className="add-button" onClick={handleWebhookAdd}>
                          <Plus size={16} />
                          Add Your First Webhook
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h3>Appearance</h3>
                  
                  <div className="form-group">
                    <label>Theme</label>
                    <div className="theme-selector">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          className={`theme-option ${settings.theme === theme ? 'active' : ''}`}
                          onClick={() => {
                            setSettings(prev => ({ ...prev, theme: theme as any }));
                            setUnsavedChanges(true);
                          }}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Preview</label>
                    <div className="theme-preview">
                      <div className="preview-chat">
                        <div className="preview-message user">
                          <div className="preview-bubble">Hello! How can you help me?</div>
                        </div>
                        <div className="preview-message assistant">
                          <div className="preview-bubble">I'm here to assist you with any questions!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="settings-section">
                  <h3>Chat Settings</h3>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.chatSettings.showTimestamps}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            chatSettings: {
                              ...prev.chatSettings,
                              showTimestamps: e.target.checked
                            }
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <span>Show timestamps</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.chatSettings.soundEnabled}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            chatSettings: {
                              ...prev.chatSettings,
                              soundEnabled: e.target.checked
                            }
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <span>Enable message sounds</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.chatSettings.enterToSend}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            chatSettings: {
                              ...prev.chatSettings,
                              enterToSend: e.target.checked
                            }
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <span>Press Enter to send (Shift+Enter for new line)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Voice Language</label>
                    <select
                      value={settings.voiceSettings.language}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          voiceSettings: {
                            ...prev.voiceSettings,
                            language: e.target.value
                          }
                        }));
                        setUnsavedChanges(true);
                      }}
                      className="form-input"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="it-IT">Italian</option>
                      <option value="pt-BR">Portuguese (Brazil)</option>
                      <option value="ja-JP">Japanese</option>
                      <option value="ko-KR">Korean</option>
                      <option value="zh-CN">Chinese (Simplified)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.voiceSettings.autoSend}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            voiceSettings: {
                              ...prev.voiceSettings,
                              autoSend: e.target.checked
                            }
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <span>Auto-send voice messages after recording</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="settings-footer">
              <button
                className="save-button"
                onClick={handleSave}
                disabled={!unsavedChanges}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Settings;