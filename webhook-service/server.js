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

    console.log(`🔔 [${getUTC7Timestamp()}] Received ${event} event for ${repository?.name}`);

    // Only process push events to main branch
    if (event === 'push' && ref === 'refs/heads/main') {
      console.log(`🚀 [${getUTC7Timestamp()}] Processing deployment for main branch...`);
      
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
      console.log(`⏭️  [${getUTC7Timestamp()}] Skipping deployment - Event: ${event}, Ref: ${ref}`);
      res.status(200).json({ message: 'Event ignored' });
    }
  } catch (error) {
    console.error(`❌ [${getUTC7Timestamp()}] Webhook error:`, error);
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

function getUTC7Timestamp() {
  const now = new Date();
  // Add 7 hours (7 * 60 * 60 * 1000 milliseconds) to UTC time
  const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return utc7Time.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC+7');
}

function deployApplication() {
  const timestamp = getUTC7Timestamp();
  const logFile = path.join(PROJECT_PATH, 'logs', 'deployment.log');
  
  try {
    console.log(`🔄 [${timestamp}] Starting deployment...`);
    logToFile(logFile, `[${timestamp}] 🔄 Starting deployment...`);

    // Change to project directory
    process.chdir(PROJECT_PATH);

    // Fix git ownership and permissions
    console.log(`🔧 [${timestamp}] Configuring git safe directory...`);
    logToFile(logFile, `[${timestamp}] 🔧 Configuring git safe directory...`);
    try {
      execSync(`git config --global --add safe.directory ${PROJECT_PATH}`, { stdio: 'pipe' });
      execSync(`chown -R $(whoami):$(whoami) .git/`, { stdio: 'pipe' });
      execSync(`chmod -R 755 .git/`, { stdio: 'pipe' });
    } catch (gitConfigError) {
      console.log(`⚠️  [${timestamp}] Git config warning:`, gitConfigError.message);
    }

    // Pull latest code
    console.log(`📥 [${timestamp}] Pulling latest code...`);
    logToFile(logFile, `[${timestamp}] 📥 Pulling latest code...`);
    execSync('git pull origin main', { stdio: 'pipe' });

    // Stop containers (except webhook service to avoid stopping ourselves)
    console.log(`⏹️  [${timestamp}] Stopping containers...`);
    logToFile(logFile, `[${timestamp}] ⏹️  Stopping containers...`);
    try {
      // Stop individual services except webhook
      const services = ['flearn-frontend', 'flearn-backend', 'postgres', 'mongodb', 'pgadmin', 'mongo-express'];
      for (const service of services) {
        try {
          execSync(`docker compose stop ${service}`, { stdio: 'pipe' });
        } catch (error) {
          // Try legacy docker-compose
          execSync(`docker-compose stop ${service}`, { stdio: 'pipe' });
        }
      }
    } catch (composeError) {
      console.log(`⚠️  [${timestamp}] Some containers could not be stopped gracefully`);
      logToFile(logFile, `[${timestamp}] ⚠️  Some containers could not be stopped gracefully: ${composeError.message}`);
    }

    // Build and start with cache bust (except webhook service)
    console.log(`🔨 [${timestamp}] Building and starting containers...`);
    logToFile(logFile, `[${timestamp}] 🔨 Building and starting containers...`);
    const cacheBust = Date.now();
    try {
      // Build and start services except webhook
      const services = ['flearn-frontend', 'flearn-backend', 'postgres', 'mongodb', 'pgadmin', 'mongo-express'];
      for (const service of services) {
        try {
          execSync(`CACHEBUST=${cacheBust} docker compose up -d --build ${service}`, { stdio: 'pipe' });
        } catch (error) {
          // Try legacy docker-compose
          execSync(`CACHEBUST=${cacheBust} docker-compose up -d --build ${service}`, { stdio: 'pipe' });
        }
      }
    } catch (composeError) {
      console.log(`⚠️  [${timestamp}] Some containers could not be started, trying full restart...`);
      logToFile(logFile, `[${timestamp}] ⚠️  Some containers could not be started: ${composeError.message}`);
      try {
        // Fallback: restart all services
        execSync(`CACHEBUST=${cacheBust} docker compose up -d --build`, { stdio: 'pipe' });
      } catch (fallbackError) {
        execSync(`CACHEBUST=${cacheBust} docker-compose up -d --build`, { stdio: 'pipe' });
      }
    }

    // Clean up old images
    console.log(`🧹 [${timestamp}] Cleaning up old images...`);
    logToFile(logFile, `[${timestamp}] 🧹 Cleaning up old images...`);
    try {
      execSync('docker image prune -f', { stdio: 'pipe' });
    } catch (cleanupError) {
      console.log(`⚠️  [${timestamp}] Cleanup warning:`, cleanupError.message);
    }

    console.log(`✅ [${timestamp}] Deployment completed successfully!`);
    logToFile(logFile, `[${timestamp}] ✅ Deployment completed successfully!`);

    // Log container status
    try {
      const status = execSync('docker compose ps --format "table {{.Name}}\\t{{.Status}}"', { encoding: 'utf8' });
      logToFile(logFile, `[${timestamp}] 📊 Container Status:\n${status}`);
    } catch (statusError) {
      try {
        const status = execSync('docker-compose ps', { encoding: 'utf8' });
        logToFile(logFile, `[${timestamp}] 📊 Container Status:\n${status}`);
      } catch (legacyStatusError) {
        logToFile(logFile, `[${timestamp}] ⚠️  Could not get container status`);
      }
    }

  } catch (error) {
    console.error(`❌ [${timestamp}] Deployment failed:`, error.message);
    logToFile(logFile, `[${timestamp}] ❌ Deployment failed: ${error.message}`);
    
    // Try to restart containers if they're down
    try {
      console.log(`🔧 [${timestamp}] Attempting to restart containers...`);
      try {
        execSync('docker compose up -d', { stdio: 'pipe' });
      } catch (composeError) {
        execSync('docker-compose up -d', { stdio: 'pipe' });
      }
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
  console.log(`🛑 [${getUTC7Timestamp()}] Webhook service shutting down...`);
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🎣 [${getUTC7Timestamp()}] FLEARN Webhook service listening on port ${PORT}`);
  console.log(`📁 Project path: ${PROJECT_PATH}`);
  console.log(`🔐 Webhook secret configured: ${WEBHOOK_SECRET ? 'Yes' : 'No'}`);
});
