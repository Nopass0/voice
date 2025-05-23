#!/bin/bash

# SSL Setup Script for Voice Project

echo "🔐 Setting up SSL for Voice Project..."

# Create SSL directory
mkdir -p ssl

# Check if private key already exists
if [ -f "ssl/private.key" ]; then
    echo "✅ Private key already exists at ssl/private.key"
else
    echo "❌ Private key not found at ssl/private.key"
    echo "   The private key has been saved during project setup."
fi

# Instructions for certificate
echo ""
echo "📋 SSL Certificate Setup Instructions:"
echo ""
echo "1. You already have the private key at: ssl/private.key"
echo ""
echo "2. Use the CSR (Certificate Signing Request) you mentioned to obtain the certificate from AlphaSSL"
echo ""
echo "3. Once you receive the certificate from AlphaSSL, you'll get:"
echo "   - Your domain certificate"
echo "   - Intermediate certificate(s)"
echo ""
echo "4. Create the full certificate chain:"
echo "   cat your_domain.crt intermediate.crt > ssl/fullchain.pem"
echo ""
echo "5. Verify your SSL files:"
echo "   - ssl/private.key (already exists)"
echo "   - ssl/fullchain.pem (you need to create this)"
echo ""
echo "6. Set proper permissions:"
echo "   chmod 600 ssl/private.key"
echo "   chmod 644 ssl/fullchain.pem"
echo ""
echo "7. Run the deployment script:"
echo "   ./deploy.sh"
echo ""

# Set permissions on private key
if [ -f "ssl/private.key" ]; then
    chmod 600 ssl/private.key
    echo "✅ Set permissions on private.key"
fi