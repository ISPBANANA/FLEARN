const express = require('express');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const PROJECT_PATH = process.env.PROJECT_PATH || '/app/flearn';

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'FLEARN Webhook Service' });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    
    // Verify GitHub webhook signature
    if (!verifySignature(signature, payload)) {
      console.log('❌ Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'];
    const { action, ref, repository } = req.body;

    console.log(`🔔 Received ${event} event for ${repository?.name}`);

    // Only process push events to main branch
    if (event === 'push' && ref === 'refs/heads/main') {
      console.log('🚀 Processing deployment for main branch...');
      
      // Execute deployment in background
      setTimeout(() => {
        deployApplication();
      }, 1000);

      res.status(200).json({ 
        message: 'Deployment initiated', 
        ref: ref,
        repository: repository?.name 
      });
    } else {
      console.log(`⏭️  Skipping deployment - Event: ${event}, Ref: ${ref}`);
      res.status(200).json({ message: 'Event ignored' });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function verifySignature(signature, payload) {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignatureWithPrefix)
  );
}

function deployApplication() {
  const timestamp = new Date().toISOString();
  const logFile = path.join(PROJECT_PATH, 'logs', 'deployment.log');
  
  try {
    console.log('🔄 Starting deployment...');
    logToFile(logFile, `[${timestamp}] 🔄 Starting deployment...`);

    // Change to project directory
    process.chdir(PROJECT_PATH);

    // Pull latest code
    console.log('📥 Pulling latest code...');
    logToFile(logFile, `[${timestamp}] 📥 Pulling latest code...`);
    execSync('git pull origin main', { stdio: 'pipe' });

    // Stop containers
    console.log('⏹️  Stopping containers...');
    logToFile(logFile, `[${timestamp}] ⏹️  Stopping containers...`);
    execSync('docker compose down', { stdio: 'pipe' });

    // Build and start with cache bust
    console.log('🔨 Building and starting containers...');
    logToFile(logFile, `[${timestamp}] 🔨 Building and starting containers...`);
    const cacheBust = Date.now();
    execSync(`CACHEBUST=${cacheBust} docker compose up -d --build`, { stdio: 'pipe' });

    // Clean up old images
    console.log('🧹 Cleaning up old images...');
    logToFile(logFile, `[${timestamp}] 🧹 Cleaning up old images...`);
    try {
      execSync('docker image prune -f', { stdio: 'pipe' });
    } catch (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message);
    }

    console.log('✅ Deployment completed successfully!');
    logToFile(logFile, `[${timestamp}] ✅ Deployment completed successfully!`);

    // Log container status
    const status = execSync('docker compose ps --format "table {{.Name}}\\t{{.Status}}"', { encoding: 'utf8' });
    logToFile(logFile, `[${timestamp}] 📊 Container Status:\n${status}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    logToFile(logFile, `[${timestamp}] ❌ Deployment failed: ${error.message}`);
    
    // Try to restart containers if they're down
    try {
      console.log('🔧 Attempting to restart containers...');
      execSync('docker compose up -d', { stdio: 'pipe' });
      logToFile(logFile, `[${timestamp}] 🔧 Containers restarted after failure`);
    } catch (restartError) {
      logToFile(logFile, `[${timestamp}] ❌ Failed to restart containers: ${restartError.message}`);
    }
  }
}

function logToFile(filename, message) {
  try {
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(filename, message + '\n');
  } catch (error) {
    console.error('Logging error:', error.message);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Webhook service shutting down...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🎣 FLEARN Webhook service listening on port ${PORT}`);
  console.log(`📁 Project path: ${PROJECT_PATH}`);
  console.log(`🔐 Webhook secret configured: ${WEBHOOK_SECRET ? 'Yes' : 'No'}`);
});
