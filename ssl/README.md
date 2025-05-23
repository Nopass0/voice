# SSL Certificate Setup

## ✅ SSL Certificate is Ready!

All SSL certificates have been installed and configured.

## Files in this directory:

- `voicecxr.pro.key` - Original private key file
- `private.key` - Copy of private key (used by Nginx)
- `voicecxr.pro.csr` - Certificate Signing Request
- `voicecxr.pro.crt` - Domain certificate (valid until June 24, 2026)
- `intermediate.crt` - Intermediate certificate
- `root.crt` - Root certificate
- `fullchain.pem` - Full certificate chain (ready for production)

## Certificate Details:

- **Domain**: www.voicecxr.pro, voicecxr.pro
- **Issuer**: GlobalSign GCC R6 AlphaSSL CA 2023
- **Valid From**: May 23, 2025
- **Valid Until**: June 24, 2026
- **Type**: AlphaSSL

## Permissions:

```bash
# Already set correctly:
chmod 600 private.key voicecxr.pro.key
chmod 644 *.crt *.pem *.csr
```

## Production Ready:

The SSL certificate is now fully configured and ready for production deployment!