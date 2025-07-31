const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Process voice message
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }
    
    const { sessionId, webhookUrl, authToken, language } = req.body;
    const audioPath = req.file.path;
    
    // Prepare webhook payload with voice data
    const webhookPayload = {
      message: {
        voice: {
          file_id: req.file.filename
        },
        chat: {
          id: sessionId || req.sessionID
        }
      },
      audioFile: {
        path: audioPath,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      sessionId: sessionId || req.sessionID,
      timestamp: new Date().toISOString()
    };
    
    // Send to n8n webhook
    const n8nWebhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('Webhook URL not configured. Please set up a webhook in settings.');
    }
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('webhookData', JSON.stringify(webhookPayload));
    formData.append('language', language || 'en-US');
    
    // Prepare request config
    const requestConfig = {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    };
    
    // Add auth token if provided
    if (authToken) {
      requestConfig.headers['Authorization'] = authToken.startsWith('Bearer ') 
        ? authToken 
        : `Bearer ${authToken}`;
    }
    
    const response = await axios.post(n8nWebhookUrl, formData, requestConfig);
    
    // Clean up uploaded file
    fs.unlinkSync(audioPath);
    
    const agentResponse = response.data.output || response.data.message || 'Voice message received';
    const transcription = response.data.transcription || 'Voice message';
    
    res.json({
      success: true,
      message: agentResponse,
      transcription: transcription,
      sessionId: sessionId || req.sessionID
    });
    
  } catch (error) {
    console.error('Error processing voice message:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to process voice message',
      message: error.message
    });
  }
});

module.exports = router;