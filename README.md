# Agent Swarm Web Interface

A modern web application interface for the Agent Swarm AI system, replacing the Telegram integration with a user-friendly chat interface.

## Features

- 💬 **Text Chat Interface**: Send messages to your AI agents through a clean chat UI
- 🎤 **Voice Input**: Record voice messages that are transcribed and processed
- 🔄 **Session Management**: Maintains conversation context across sessions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Real-time Communication**: Instant messaging with loading states
- 📝 **Message History**: Persistent conversation history per session

## Architecture

The application consists of:
- **Frontend**: React-based chat interface with TypeScript
- **Backend**: Express.js API server that forwards requests to n8n webhooks
- **Integration**: Connects to your existing n8n Agent Swarm workflow via webhooks

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An n8n instance with the Agent Swarm workflow
- A webhook URL from your n8n workflow

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or navigate to the project directory)
cd agent-swarm-webapp

# Install all dependencies
npm run install:all
```

### 2. Configure the Backend

1. Copy the environment template:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` and add your n8n webhook URL:
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### 3. Update Your n8n Workflow

Replace the Telegram Trigger node with a Webhook node:

1. **Add a Webhook node** to your n8n workflow
2. **Configure it** to accept POST requests
3. **Copy the webhook URL** and add it to your `.env` file
4. **Update the workflow** to handle the new payload structure:
   - Text messages: `{{ $json.message.text }}`
   - Session ID: `{{ $json.sessionId }}`
   - Voice messages: Handle the audio file upload

### 4. Start the Application

```bash
# From the root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Type a message or click the microphone button to record
3. The AI agents will process your request and respond
4. Your conversation history is maintained per session

## API Endpoints

### Backend API

- `POST /api/messages/send` - Send a text message
- `POST /api/voice/transcribe` - Send a voice message
- `GET /api/messages/history/:sessionId` - Get conversation history
- `DELETE /api/messages/history/:sessionId` - Clear conversation history
- `GET /api/health` - Health check endpoint

## Customization

### Styling
- Edit `frontend/src/App.css` for main styling
- Modify color scheme, fonts, and layout as needed

### Features
- Add authentication by implementing middleware in `backend/server.js`
- Integrate with Redis for production-ready session storage
- Add file upload capabilities for document processing

## Deployment

### Frontend
Build the React app:
```bash
cd frontend
npm run build
```

Deploy the `build` folder to any static hosting service (Vercel, Netlify, etc.)

### Backend
Deploy the Express server to:
- Heroku
- AWS EC2/Lambda
- Google Cloud Run
- Any Node.js hosting platform

Remember to set environment variables in your production environment.

## Troubleshooting

### Webhook Connection Issues
- Verify your n8n webhook URL is correct
- Check that your n8n instance is accessible from your backend
- Look for CORS errors in the browser console

### Voice Recording Not Working
- Ensure your browser has microphone permissions
- Check that you're using HTTPS in production (required for getUserMedia)

### Session Issues
- Clear browser localStorage if sessions are corrupted
- Check backend logs for session-related errors

## Security Considerations

- Add authentication before deploying to production
- Use HTTPS for all connections
- Implement rate limiting on the backend
- Validate and sanitize all user inputs
- Store sensitive configuration in environment variables

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is provided as-is for use with the Agent Swarm n8n workflow.