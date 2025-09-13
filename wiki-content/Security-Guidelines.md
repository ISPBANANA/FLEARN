# 🔒 Security Guidelines & Best Practices

> **⚠️ CRITICAL**: This page contains essential security requirements for the FLEARN project. Follow ALL guidelines to protect sensitive data and user privacy.

## 🚨 Immediate Security Actions Required

Before contributing to or deploying FLEARN, you **MUST** complete these security steps:

### ✅ Security Checklist

- [ ] **Verify `.env*` files are in `.gitignore`**
- [ ] **Never commit real secrets** to version control
- [ ] **Replace all placeholder values** in environment files
- [ ] **Use strong, unique passwords** (minimum 16 characters)
- [ ] **Enable 2FA** on your Auth0 account
- [ ] **Use HTTPS only** in production
- [ ] **Rotate secrets** every 90 days
- [ ] **Monitor access logs** regularly

## 🔐 Environment Variables Security

### Secrets Management Rules

#### ❌ NEVER Do This:
```env
# DON'T - Weak passwords
POSTGRES_PASSWORD=123456
MONGO_PASSWORD=password

# DON'T - Real secrets in examples
AUTH0_CLIENT_ID=lcf2KrgpqZCw0XzHtKvOn1cCTnDJQH1m
AUTH0_DOMAIN=mycompany.auth0.com
```

#### ✅ Always Do This:
```env
# DO - Strong, unique passwords
POSTGRES_PASSWORD=Kx9#mN8$vR2@pL5!qW7*uE3&tY6^iO1%
MONGO_PASSWORD=Zb4@nM7$hG2#kL9*wE5&qR8!xT3%vU6^

# DO - Use placeholders in examples  
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_DOMAIN=YOUR-TENANT.auth0.com
```

### Password Requirements

All passwords **MUST** meet these criteria:
- **Minimum 16 characters**
- Include **uppercase letters** (A-Z)
- Include **lowercase letters** (a-z)  
- Include **numbers** (0-9)
- Include **special characters** (!@#$%^&*)
- **Unique for each service**
- **No dictionary words**
- **No personal information**

### Password Generation

Use these methods to generate secure passwords:

```bash
# Generate 32-character password
openssl rand -base64 32

# Generate password with special characters
pwgen -s 20 1

# Online generators (use reputable sources only)
# - 1Password Password Generator
# - Bitwarden Password Generator  
# - LastPass Password Generator
```

## 🔒 Auth0 Security Configuration

### Account Security
- **Enable 2FA/MFA** immediately on your Auth0 account
- **Use a strong, unique password** for your Auth0 account
- **Limit admin access** to essential team members only
- **Monitor Auth0 logs** regularly for suspicious activity

### Application Security
- **Restrict callback URLs** to known domains only
- **Use HTTPS URLs** in production (never HTTP)
- **Enable rate limiting** on authentication endpoints
- **Set appropriate token expiration** times
- **Enable brute force protection**

### Token Security
- **Never log JWT tokens** in plain text
- **Store tokens securely** (httpOnly cookies preferred)
- **Implement token refresh** logic
- **Validate tokens on server side** always
- **Use short expiration times** (max 24 hours)

## 🗄️ Database Security

### PostgreSQL Security
```bash
# Secure PostgreSQL configuration
# 1. Use strong authentication
POSTGRES_PASSWORD=generate_strong_password_here

# 2. Limit network access
POSTGRES_HOST=localhost  # Don't expose to public

# 3. Use SSL in production
POSTGRES_SSL=require
```

### MongoDB Security
```bash
# Secure MongoDB configuration
# 1. Enable authentication
MONGO_INITDB_ROOT_USERNAME=admin_user
MONGO_INITDB_ROOT_PASSWORD=strong_unique_password

# 2. Use authentication database
?authSource=admin

# 3. Limit network access
bind_ip = 127.0.0.1  # Don't bind to 0.0.0.0
```

### Database Access Control
- **Use separate users** for different environments
- **Grant minimum required permissions**
- **Disable default accounts**
- **Enable connection encryption**
- **Regular backup verification**
- **Monitor database logs**

## 🐳 Docker Security

### Container Security
```yaml
# Secure Docker Compose configuration
services:
  app:
    # Don't run as root
    user: "1000:1000"
    
    # Read-only filesystem where possible
    read_only: true
    
    # Limit resources
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    
    # Drop unnecessary capabilities
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
```

### Image Security
- **Use official base images** only
- **Keep images updated** regularly
- **Scan for vulnerabilities** before deployment
- **Remove unnecessary packages**
- **Don't include secrets** in images

## 🌐 Network Security

### HTTPS Configuration
```nginx
# Nginx SSL configuration (production)
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Strong SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### CORS Security
```javascript
// Secure CORS configuration
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
    // Never use '*' in production
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 🔍 Security Monitoring

### Log Monitoring
Monitor these events for security incidents:

- **Failed login attempts**
- **Unusual API access patterns**  
- **Database connection failures**
- **Webhook verification failures**
- **Token validation errors**
- **Permission denied errors**

### Alerting Setup
```bash
# Monitor for suspicious patterns
grep "Failed" /var/log/auth.log
grep "401\|403" /var/log/nginx/access.log
grep "authentication failed" /var/log/postgresql/postgresql.log
```

## 🚨 Incident Response

### If Secrets Are Compromised:

1. **Immediate Actions**:
   - Rotate ALL affected secrets immediately
   - Revoke compromised tokens/keys
   - Change all related passwords
   - Monitor for unauthorized access

2. **Investigation**:
   - Check all logs for unauthorized access
   - Identify scope of compromise
   - Document the incident
   - Notify stakeholders if needed

3. **Recovery**:
   - Update all affected systems
   - Verify security measures
   - Implement additional monitoring
   - Review and improve security procedures

### Emergency Contacts
- **Security Team Lead**: [Contact Info]
- **Auth0 Support**: [Support Channel]
- **Infrastructure Team**: [Contact Info]

## 📋 Security Audit Checklist

### Monthly Security Review
- [ ] Review and rotate secrets
- [ ] Check access logs for anomalies  
- [ ] Update dependencies with security patches
- [ ] Verify backup integrity
- [ ] Test incident response procedures
- [ ] Review team access permissions

### Quarterly Security Assessment
- [ ] Penetration testing
- [ ] Security dependency scan
- [ ] Infrastructure vulnerability scan
- [ ] Review Auth0 configuration
- [ ] Update security documentation
- [ ] Security training for team

## 🔗 Security Resources

### Tools & Services
- **Password Managers**: 1Password, Bitwarden, LastPass
- **Security Scanners**: Snyk, OWASP ZAP, Nmap
- **Vulnerability Databases**: CVE, NVD
- **Security Headers**: securityheaders.com
- **SSL Testing**: ssllabs.com

### Documentation
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Auth0 Security**: https://auth0.com/security
- **Docker Security**: https://docs.docker.com/engine/security/
- **Node.js Security**: https://nodejs.org/en/security/

---

## 🎯 Remember

**Security is everyone's responsibility.** When in doubt:
1. **Ask the security team**
2. **Choose the more secure option**
3. **Never commit secrets**
4. **Monitor and log everything**
5. **Keep systems updated**

**🔒 A secure FLEARN protects everyone's data and privacy.**