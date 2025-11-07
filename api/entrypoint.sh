#!/bin/sh

# Docker entrypoint script for API server
# Checks for HTTPS certificates and generates self-signed ones if needed

set -e

echo "🚀 Starting API server initialization..."

# Certificate paths
CERT_DIR="/app/certs"
CERT_KEY="${CERT_KEY_PATH:-$CERT_DIR/localhost-key.pem}"
CERT_FILE="${CERT_PATH:-$CERT_DIR/localhost.pem}"

# Only proceed with certificate checks if HTTPS is enabled
if [ "$USE_HTTPS" = "true" ]; then
  echo "🔒 HTTPS mode enabled, checking certificates..."

  # Create cert directory if it doesn't exist
  mkdir -p "$CERT_DIR"

  # Check if certificates exist
  if [ -f "$CERT_KEY" ] && [ -f "$CERT_FILE" ]; then
    echo "✅ Found existing certificates:"
    echo "   Key:  $CERT_KEY"
    echo "   Cert: $CERT_FILE"
  else
    echo "⚠️  Certificates not found, generating self-signed certificates..."

    # Generate self-signed certificate using openssl
    if command -v openssl >/dev/null 2>&1; then
      openssl req -x509 -newkey rsa:4096 \
        -keyout "$CERT_KEY" \
        -out "$CERT_FILE" \
        -days 365 -nodes \
        -subj "/C=US/ST=Dev/L=Dev/O=Dev/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
        2>/dev/null

      if [ $? -eq 0 ]; then
        echo "✅ Successfully generated self-signed certificates"
        echo "   Key:  $CERT_KEY"
        echo "   Cert: $CERT_FILE"
        echo "   Valid for: localhost, 127.0.0.1"
        echo "   Expires: 365 days from now"
      else
        echo "❌ Failed to generate certificates"
        echo "   The server will fall back to HTTP mode"
      fi
    else
      echo "❌ OpenSSL not found - cannot generate certificates"
      echo "   The server will fall back to HTTP mode"
    fi
  fi
else
  echo "🌐 HTTP mode enabled (USE_HTTPS not set to 'true')"
fi

echo ""
echo "🎯 Starting Node.js application..."
echo ""

# Execute the main command (start the Node app)
exec "$@"
