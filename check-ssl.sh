#!/bin/bash

# SSL Certificate Check Script for Voice Project

echo "🔐 SSL Certificate Status Check"
echo "=============================="

SSL_DIR="./ssl"

# Check if SSL directory exists
if [ ! -d "$SSL_DIR" ]; then
    echo "❌ SSL directory not found!"
    exit 1
fi

# Check private key
echo ""
echo "📋 Checking Private Key..."
if [ -f "$SSL_DIR/private.key" ]; then
    echo "✅ private.key exists"
    
    # Check key validity
    if openssl rsa -in "$SSL_DIR/private.key" -check -noout 2>/dev/null; then
        echo "✅ Private key is valid"
    else
        echo "❌ Private key is invalid or corrupted"
    fi
    
    # Check permissions
    PERMS=$(stat -c "%a" "$SSL_DIR/private.key" 2>/dev/null || stat -f "%OLp" "$SSL_DIR/private.key" 2>/dev/null)
    if [ "$PERMS" == "600" ]; then
        echo "✅ Private key permissions are secure (600)"
    else
        echo "⚠️  Private key permissions are $PERMS (should be 600)"
    fi
else
    echo "❌ private.key not found!"
fi

# Check certificate
echo ""
echo "📋 Checking SSL Certificate..."
if [ -f "$SSL_DIR/fullchain.pem" ]; then
    echo "✅ fullchain.pem exists"
    
    # Display certificate info
    echo ""
    echo "Certificate Details:"
    openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -subject -dates -issuer 2>/dev/null | sed 's/^/  /'
    
    # Check if certificate is valid
    if openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -checkend 0 2>/dev/null; then
        echo ""
        echo "✅ Certificate is currently valid"
        
        # Check expiration in 30 days
        if openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -checkend 2592000 2>/dev/null; then
            echo "✅ Certificate is valid for more than 30 days"
        else
            echo "⚠️  Certificate expires within 30 days!"
        fi
    else
        echo "❌ Certificate has expired!"
    fi
    
    # Verify certificate chain
    echo ""
    echo "📋 Verifying Certificate Chain..."
    if openssl verify -CAfile "$SSL_DIR/root.crt" -untrusted "$SSL_DIR/intermediate.crt" "$SSL_DIR/voicecxr.pro.crt" 2>/dev/null; then
        echo "✅ Certificate chain is valid"
    else
        echo "⚠️  Could not verify certificate chain"
    fi
    
    # Check certificate matches private key
    echo ""
    echo "📋 Checking Certificate/Key Match..."
    CERT_MOD=$(openssl x509 -noout -modulus -in "$SSL_DIR/fullchain.pem" 2>/dev/null | openssl md5)
    KEY_MOD=$(openssl rsa -noout -modulus -in "$SSL_DIR/private.key" 2>/dev/null | openssl md5)
    
    if [ "$CERT_MOD" == "$KEY_MOD" ]; then
        echo "✅ Certificate and private key match"
    else
        echo "❌ Certificate and private key do NOT match!"
    fi
else
    echo "❌ fullchain.pem not found!"
fi

# Check domains
echo ""
echo "📋 Certificate Domains:"
if [ -f "$SSL_DIR/fullchain.pem" ]; then
    openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1 | sed 's/DNS://g' | sed 's/,/\n/g' | sed 's/^/  - /'
fi

# Summary
echo ""
echo "================================"
echo "📊 Summary:"

if [ -f "$SSL_DIR/private.key" ] && [ -f "$SSL_DIR/fullchain.pem" ]; then
    if openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -checkend 0 2>/dev/null; then
        echo "✅ SSL certificate is properly configured and ready for production!"
        echo ""
        echo "🚀 Next steps:"
        echo "1. Add SSL_FULLCHAIN secret to GitHub (copy content of ssl/fullchain.pem)"
        echo "2. Deploy using: ./deploy.sh"
    else
        echo "❌ SSL certificate has issues. Please check the errors above."
    fi
else
    echo "❌ SSL certificate files are missing. Please check ssl/ directory."
fi