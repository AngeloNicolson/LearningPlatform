#!/bin/bash

# Script to set up local HTTPS certificates using mkcert

echo "Setting up local HTTPS certificates..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Please install it first:"
    echo "  - macOS: brew install mkcert"
    echo "  - Linux: Follow instructions at https://github.com/FiloSottile/mkcert"
    echo "  - Windows: Download from https://github.com/FiloSottile/mkcert/releases"
    exit 1
fi

# Create certs directory at root level
mkdir -p certs

# Install local CA
mkcert -install

# Generate certificates for localhost and common local addresses
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1

echo "✅ HTTPS certificates created successfully in certs/"
echo "✅ Certificates are valid for: localhost, 127.0.0.1, ::1"
echo ""
echo "To use HTTPS, run: npm run dev:https"