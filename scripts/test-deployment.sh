#!/bin/bash

# Test deployment script
echo "🧪 Testing deployment manually..."

# Send a POST request to the webhook to simulate a GitHub push
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256:$(echo -n '{"ref":"refs/heads/main","repository":{"name":"FLEARN"}}' | openssl dgst -sha256 -hmac "${WEBHOOK_SECRET:-your-webhook-secret}" | cut -d' ' -f2)" \
  -d '{"ref":"refs/heads/main","repository":{"name":"FLEARN"}}'

echo ""
echo "✅ Webhook triggered. Check logs with:"
echo "   docker logs flearn_webhook -f"
echo "   tail -f logs/deployment.log"
