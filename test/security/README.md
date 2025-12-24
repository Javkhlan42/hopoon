# Security Testing Guide

## Overview
Comprehensive security tests for HopOn ride-sharing platform covering authentication, authorization, input validation, and common vulnerabilities.

## Test Categories

### 1. Authentication Security
- Token validation
- Expired token handling
- Invalid token rejection
- Malformed authorization headers

### 2. Authorization & Access Control
- Role-based access control (RBAC)
- Resource ownership verification
- Privilege escalation prevention
- Cross-user data access prevention

### 3. Input Validation
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- Input sanitization
- Format validation (phone, email, etc.)

### 4. Rate Limiting
- Login attempt limiting
- API endpoint rate limiting
- DDoS protection

### 5. Password Security
- Weak password rejection
- Minimum length enforcement
- Password hashing verification
- No password exposure in responses

### 6. JWT Token Security
- Token tampering detection
- Token expiration
- Token invalidation after logout
- Signature verification

### 7. CORS & Headers
- CORS policy enforcement
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Origin validation

## Running Tests

### All Security Tests
```bash
npm test -- test/security
```

### Specific Test Suite
```bash
npm test -- test/security/security.spec.ts
npm test -- test/security/jwt-security.spec.ts
```

### Watch Mode
```bash
npm test -- test/security --watch
```

## Security Checklist

### Before Deployment
- [ ] All authentication tests passing
- [ ] Rate limiting configured
- [ ] SQL injection tests passing
- [ ] XSS prevention verified
- [ ] CORS properly configured
- [ ] JWT tokens properly validated
- [ ] Password requirements enforced
- [ ] Security headers set

### Regular Security Audits
- [ ] Run security tests weekly
- [ ] Review failed login attempts
- [ ] Monitor rate limit violations
- [ ] Check for suspicious patterns
- [ ] Update dependencies regularly
- [ ] Review access logs

## Common Vulnerabilities Tested

### 1. SQL Injection
**Test:** Inject SQL in login fields
```javascript
phone: "' OR '1'='1",
password: "' OR '1'='1"
```
**Expected:** Request rejected (400) or sanitized

### 2. XSS
**Test:** Inject script tags
```javascript
name: '<script>alert("XSS")</script>'
```
**Expected:** Input sanitized, no script execution

### 3. JWT Tampering
**Test:** Modify token payload
```javascript
tamperedToken = validToken.replace('user-123', 'admin')
```
**Expected:** Token rejected (401)

### 4. Unauthorized Access
**Test:** Access other user's data
```javascript
GET /users/other-user-id
```
**Expected:** Forbidden (403)

### 5. Rate Limiting
**Test:** 100+ requests in short time
```javascript
Promise.all(Array(100).fill(null).map(() => makeRequest()))
```
**Expected:** Some requests return 429 (Too Many Requests)

## Security Tools

### Recommended Tools
- **OWASP ZAP**: Automated security testing
- **Burp Suite**: Manual security testing
- **npm audit**: Dependency vulnerability check
- **Snyk**: Continuous security monitoring

### Running Security Audit
```bash
# Check dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for specific vulnerabilities
npm audit --production
```

## Reporting Security Issues

If you find a security vulnerability:
1. **DO NOT** open a public issue
2. Email: security@hopon.mn
3. Include: Description, steps to reproduce, impact
4. Allow time for patch before disclosure

## Security Best Practices

### For Developers
1. Never commit secrets to git
2. Use environment variables for sensitive data
3. Validate all user input
4. Use parameterized queries
5. Hash passwords with bcrypt
6. Implement rate limiting
7. Use HTTPS only
8. Set security headers
9. Keep dependencies updated
10. Follow principle of least privilege

### For API Design
1. Require authentication by default
2. Implement authorization checks
3. Return appropriate error codes
4. Don't expose sensitive data
5. Use proper CORS configuration
6. Implement request validation
7. Log security events
8. Implement token expiration

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Security Tests
  run: npm test -- test/security
  
- name: Security Audit
  run: npm audit --audit-level=moderate
```

## Monitoring & Alerts

### Set up alerts for:
- Multiple failed login attempts
- Rate limit violations
- Unauthorized access attempts
- Token tampering attempts
- Unusual traffic patterns

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
