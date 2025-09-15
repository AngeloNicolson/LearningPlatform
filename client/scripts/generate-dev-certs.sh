#!/bin/bash

# Script to generate self-signed certificates for development
# This is an alternative to mkcert for quick setup

echo "Generating self-signed certificates for local development..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate a private key
openssl genrsa -out certs/localhost-key.pem 2048

# Generate a certificate signing request
openssl req -new -key certs/localhost-key.pem -out certs/localhost.csr -subj "/C=US/ST=State/L=City/O=Development/CN=localhost"

# Generate the certificate
openssl x509 -req -days 365 -in certs/localhost.csr -signkey certs/localhost-key.pem -out certs/localhost.pem

# Clean up CSR file
rm certs/localhost.csr

echo "✅ Self-signed certificates created in client/certs/"
echo "⚠️  Note: These are self-signed certificates. Your browser will show a security warning."
echo "    You can proceed by clicking 'Advanced' and 'Proceed to localhost' in Chrome."
echo ""
echo "For trusted certificates, install mkcert and run: npm run setup:https"