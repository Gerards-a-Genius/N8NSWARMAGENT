const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage for conversation history (replace with Redis in production)
const conversations = new Map();

// Send message to Agent Swarm
router.post('/send', async (req, res) => {
  try {
    const { message, sessionId, webhookUrl, authToken, timeout } = req.body;
    
    // Get or create session
    const userSessionId = sessionId || req.sessionID || uuidv4();
    
    // Get conversation history
    if (!conversations.has(userSessionId)) {
      conversations.set(userSessionId, []);
    }
    
    const conversationHistory = conversations.get(userSessionId);
    
    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Prepare webhook payload
    const webhookPayload = {
      message: {
        text: message,
        chat: {
          id: userSessionId
        }
      },
      sessionId: userSessionId,
      timestamp: new Date().toISOString()
    };
    
    // Send to n8n webhook
    const n8nWebhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('Webhook URL not configured. Please set up a webhook in settings.');
    }
    
    // Prepare request config
    const requestConfig = {
      timeout: timeout || 30000, // Use provided timeout or default to 30 seconds
      headers: {}
    };
    
    // Add auth token if provided
    if (authToken) {
      requestConfig.headers['Authorization'] = authToken.startsWith('Bearer ') 
        ? authToken 
        : `Bearer ${authToken}`;
    }
    
    const response = await axios.post(n8nWebhookUrl, webhookPayload, requestConfig);
    
    // Add agent response to history
    const agentResponse = response.data.output || response.data.message || 'I received your message but couldn\'t generate a response.';
    
    conversationHistory.push({
      role: 'assistant',
      content: agentResponse,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 messages per session
    if (conversationHistory.length > 50) {
      conversationHistory.splice(0, conversationHistory.length - 50);
    }
    
    res.json({
      success: true,
      message: agentResponse,
      sessionId: userSessionId
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = conversations.get(sessionId) || [];
  
  res.json({
    success: true,
    history,
    sessionId
  });
});

// Clear conversation history
router.delete('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  
  res.json({
    success: true,
    message: 'Conversation history cleared',
    sessionId
  });
});

module.exports = router;