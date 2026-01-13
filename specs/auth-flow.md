# Authentication and SSO Flow

## Overview

This feature implements a secure authentication system supporting OAuth 2.0 and Single Sign-On (SSO) integration with enterprise identity providers. The system handles user authentication, token management, session lifecycle, and seamless SSO provider configuration for organizations.

## Requirements

### Functional Requirements

1. **OAuth 2.0 Integration**
   - Support Authorization Code flow with PKCE for web applications
   - Support Client Credentials flow for service-to-service auth
   - Implement standard OAuth 2.0 endpoints (authorize, token, revoke)
   - Support multiple OAuth providers (Google, GitHub, Microsoft)
   - Handle OAuth state parameter for CSRF protection

2. **SSO Provider Configuration**
   - Admin interface for configuring SSO providers per organization
   - Support SAML 2.0 and OIDC protocols
   - Automatic user provisioning on first SSO login (JIT provisioning)
   - Attribute mapping from IdP claims to user profile
   - SSO enforcement option (disable password login when enabled)

3. **Token Handling and Refresh**
   - JWT-based access tokens with configurable expiration
   - Secure refresh token rotation
   - Token revocation on logout and security events
   - Support for token introspection endpoint
   - Automatic silent refresh before token expiration

4. **Session Management**
   - Server-side session tracking with Redis
   - Concurrent session limits per user (configurable)
   - Session activity monitoring and idle timeout
   - Force logout capability for security incidents
   - "Remember me" extended session option

### Non-Functional Requirements

- Authentication flow completion < 3 seconds
- Token validation < 50ms
- Support 10,000 concurrent active sessions
- 99.9% authentication service uptime
- SOC 2 Type II compliant session handling
- All tokens encrypted at rest
- Audit logging for all authentication events

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Application                           │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway / Load Balancer                  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────────┐
│   Auth        │       │   Token       │       │   Session         │
│   Service     │       │   Service     │       │   Service         │
│               │       │               │       │                   │
│ - OAuth flows │       │ - JWT issue   │       │ - Session CRUD    │
│ - SSO/SAML    │       │ - Validation  │       │ - Activity track  │
│ - Provider    │       │ - Refresh     │       │ - Concurrency     │
│   config      │       │ - Revocation  │       │   control         │
└───────┬───────┘       └───────┬───────┘       └─────────┬─────────┘
        │                       │                         │
        └───────────────────────┼─────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────┐
        │                                                   │
   ┌────┴────┐    ┌─────────────┐    ┌─────────────────┐   │
   │PostgreSQL│    │   Redis     │    │  External IdPs  │   │
   │          │    │   (Sessions │    │  (Google, Okta, │   │
   │ - Users  │    │    & Cache) │    │   Azure AD)     │   │
   │ - Tokens │    │             │    │                 │   │
   │ - Config │    └─────────────┘    └─────────────────┘   │
   └──────────┘                                             │
        └───────────────────────────────────────────────────┘
```

### OAuth 2.0 Flow (Authorization Code with PKCE)

```
┌──────┐                  ┌──────────┐                  ┌─────────┐
│Client│                  │Auth Svc  │                  │  IdP    │
└──┬───┘                  └────┬─────┘                  └────┬────┘
   │                           │                             │
   │ 1. Generate code_verifier │                             │
   │    & code_challenge       │                             │
   │                           │                             │
   │ 2. GET /authorize?        │                             │
   │    response_type=code&    │                             │
   │    code_challenge=...     │                             │
   │ ─────────────────────────▶│                             │
   │                           │                             │
   │                           │ 3. Redirect to IdP          │
   │                           │ ───────────────────────────▶│
   │                           │                             │
   │                           │        4. User authenticates│
   │                           │ ◀───────────────────────────│
   │                           │                             │
   │ 5. Redirect with code     │                             │
   │ ◀─────────────────────────│                             │
   │                           │                             │
   │ 6. POST /token            │                             │
   │    code=...&              │                             │
   │    code_verifier=...      │                             │
   │ ─────────────────────────▶│                             │
   │                           │                             │
   │ 7. { access_token,        │                             │
   │      refresh_token,       │                             │
   │      id_token }           │                             │
   │ ◀─────────────────────────│                             │
   │                           │                             │
```

### Data Models

```typescript
// User Authentication
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash?: string;      // Null for SSO-only users
  mfaEnabled: boolean;
  mfaSecret?: string;
  authProvider: 'local' | 'google' | 'github' | 'microsoft' | 'saml' | 'oidc';
  providerId?: string;        // External provider user ID
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// OAuth/SSO Provider Configuration
interface SSOProvider {
  id: string;
  organizationId: string;
  name: string;
  protocol: 'saml' | 'oidc';
  enabled: boolean;
  enforced: boolean;          // If true, password login disabled
  config: SAMLConfig | OIDCConfig;
  attributeMapping: AttributeMapping;
  jitProvisioning: boolean;
  defaultRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  signatureAlgorithm: 'sha256' | 'sha512';
  digestAlgorithm: 'sha256' | 'sha512';
  nameIdFormat: string;
}

interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;       // Encrypted at rest
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  jwksUri: string;
  scopes: string[];
}

interface AttributeMapping {
  email: string;              // Claim path for email
  firstName?: string;
  lastName?: string;
  displayName?: string;
  groups?: string;
  customAttributes?: Record<string, string>;
}

// Session Management
interface Session {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  rememberMe: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  fingerprint?: string;
}

// Token Management
interface RefreshToken {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;          // SHA-256 hash of token
  expiresAt: Date;
  rotatedAt?: Date;
  revokedAt?: Date;
  family: string;             // Token family for rotation tracking
}

interface TokenPayload {
  sub: string;                // User ID
  email: string;
  org?: string;               // Organization ID
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string[];
}
```

### Database Schema

```sql
-- Users table (auth-specific fields)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  provider_id VARCHAR(255),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- SSO Provider Configuration
CREATE TABLE sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('saml', 'oidc')),
  enabled BOOLEAN DEFAULT true,
  enforced BOOLEAN DEFAULT false,
  config JSONB NOT NULL,
  attribute_mapping JSONB NOT NULL DEFAULT '{}',
  jit_provisioning BOOLEAN DEFAULT true,
  default_role VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Refresh Tokens (for token rotation)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  family UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  rotated_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authentication Audit Log
CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(auth_provider, provider_id);
CREATE INDEX idx_sso_providers_org ON sso_providers(organization_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family);
CREATE INDEX idx_auth_audit_user ON auth_audit_log(user_id, created_at);
CREATE INDEX idx_auth_audit_event ON auth_audit_log(event_type, created_at);
```

## API Contracts

### Initialize OAuth Flow

```
GET /api/v1/auth/oauth/{provider}/authorize

Query Parameters:
- redirect_uri: string (required)
- state: string (required, for CSRF protection)
- code_challenge: string (required for PKCE)
- code_challenge_method: 'S256' (required)

Response 302: Redirect to provider authorization URL
```

### OAuth Callback / Token Exchange

```
POST /api/v1/auth/oauth/token

Request Body:
{
  "grant_type": "authorization_code",
  "code": "auth_code_from_callback",
  "redirect_uri": "https://app.example.com/callback",
  "code_verifier": "original_pkce_verifier"
}

Response 200:
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBh...",
  "id_token": "eyJhbG...",
  "scope": "openid profile email"
}

Response 401:
{
  "error": "invalid_grant",
  "error_description": "Authorization code expired or invalid"
}
```

### Refresh Token

```
POST /api/v1/auth/token/refresh

Request Body:
{
  "grant_type": "refresh_token",
  "refresh_token": "dGhpcyBpcyBh..."
}

Response 200:
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "bmV3IHJlZnJl..."  // Rotated token
}

Response 401:
{
  "error": "invalid_token",
  "error_description": "Refresh token has been revoked"
}
```

### SAML SSO Initiation

```
GET /api/v1/auth/sso/saml/{providerId}/login

Response 302: Redirect to IdP with SAML AuthnRequest
```

### SAML Assertion Consumer Service (ACS)

```
POST /api/v1/auth/sso/saml/{providerId}/acs

Request Body: (form-encoded)
- SAMLResponse: base64-encoded SAML response

Response 302: Redirect to application with session cookie set
```

### Configure SSO Provider (Admin)

```
POST /api/v1/admin/organizations/{orgId}/sso-providers

Request Body:
{
  "name": "Corporate Okta",
  "protocol": "saml",
  "config": {
    "entityId": "https://idp.example.com",
    "ssoUrl": "https://idp.example.com/sso",
    "certificate": "-----BEGIN CERTIFICATE-----\n...",
    "signatureAlgorithm": "sha256"
  },
  "attributeMapping": {
    "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "firstName": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    "lastName": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
  },
  "jitProvisioning": true,
  "enforced": false
}

Response 201:
{
  "data": {
    "id": "provider-uuid",
    "name": "Corporate Okta",
    "protocol": "saml",
    "enabled": true,
    "spMetadataUrl": "https://api.example.com/auth/sso/saml/provider-uuid/metadata",
    "acsUrl": "https://api.example.com/auth/sso/saml/provider-uuid/acs"
  }
}
```

### Get Active Sessions

```
GET /api/v1/auth/sessions

Response 200:
{
  "data": [
    {
      "id": "session-uuid",
      "current": true,
      "device": {
        "type": "desktop",
        "os": "macOS 14.0",
        "browser": "Chrome 120"
      },
      "ipAddress": "192.168.1.100",
      "location": "San Francisco, CA",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastActivityAt": "2024-01-15T14:30:00Z"
    }
  ],
  "meta": {
    "maxSessions": 5,
    "activeSessions": 2
  }
}
```

### Revoke Session

```
DELETE /api/v1/auth/sessions/{sessionId}

Response 204: No Content

Response 403:
{
  "error": "CANNOT_REVOKE_CURRENT",
  "message": "Use /logout to end current session"
}
```

### Logout

```
POST /api/v1/auth/logout

Request Body:
{
  "allDevices": false  // Optional, default false
}

Response 200:
{
  "message": "Successfully logged out",
  "sloRedirect": "https://idp.example.com/slo?..."  // If SSO, redirect URL for IdP logout
}
```

## Acceptance Criteria

### OAuth Flow
- [ ] Authorization URL generated with correct PKCE parameters
- [ ] State parameter validated on callback to prevent CSRF
- [ ] Invalid/expired authorization codes rejected with clear error
- [ ] Token exchange completes within 500ms
- [ ] Access token contains correct claims and permissions

### SSO Integration
- [ ] SAML responses validated against IdP certificate
- [ ] OIDC tokens verified using IdP JWKS
- [ ] JIT provisioning creates user with mapped attributes
- [ ] Enforced SSO hides password login option
- [ ] SP metadata endpoint provides valid XML for IdP configuration

### Token Management
- [ ] Access tokens expire according to configuration
- [ ] Refresh token rotation invalidates previous token
- [ ] Stolen refresh token detection triggers family revocation
- [ ] Token revocation takes effect immediately
- [ ] Silent refresh works before token expiration (< 5 min remaining)

### Session Management
- [ ] Session created on successful authentication
- [ ] Session activity updated on each authenticated request
- [ ] Idle sessions expire after configured timeout
- [ ] Concurrent session limit enforced (oldest session terminated)
- [ ] "Remember me" extends session duration appropriately
- [ ] Force logout terminates session across all services

### Security
- [ ] Failed login attempts rate-limited (5 attempts per 15 minutes)
- [ ] Account lockout after 10 consecutive failures
- [ ] All authentication events logged with IP and user agent
- [ ] Sensitive tokens (refresh, SSO secrets) encrypted at rest
- [ ] HTTPS required for all authentication endpoints

## Out of Scope

- Multi-factor authentication (MFA) implementation
- Password reset and recovery flows
- User registration and email verification
- Social login UI components
- Biometric authentication (WebAuthn/FIDO2)
- Risk-based authentication and fraud detection
- Identity provider management UI
- Cross-domain SSO (federation between organizations)
- API key management for service accounts
- OAuth 2.0 device flow for TV/IoT devices
- Custom authentication provider plugins
