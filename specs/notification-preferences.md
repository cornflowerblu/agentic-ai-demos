# User Notification Preferences

## Overview

This feature enables users to customize their notification experience across multiple channels (email, push) with granular control over timing, categories, and frequency. The system should respect user preferences while ensuring critical notifications are delivered appropriately.

## Requirements

### Functional Requirements

1. **Email Notification Settings**
   - Users can configure email digest frequency: real-time, daily, weekly, or disabled
   - Users can enable/disable notifications per category (e.g., security, marketing, updates, social)
   - Users can set a preferred email address for notifications (may differ from account email)
   - System sends digest emails at user-configured times

2. **Push Notification Toggles**
   - Users can enable/disable push notifications globally
   - Users can toggle individual notification types:
     - New messages
     - Mentions and replies
     - System alerts
     - Promotional content
   - Settings sync across all registered devices

3. **Quiet Hours Configuration**
   - Users can define quiet hours (start time, end time, timezone)
   - Quiet hours can be set per day of week or applied uniformly
   - Critical/security notifications bypass quiet hours (configurable)
   - Users can enable "Do Not Disturb" mode for immediate quiet period

4. **Preferences Management**
   - All preferences persist across sessions
   - Users can reset to default preferences
   - Preferences export/import capability for account portability

### Non-Functional Requirements

- Preference changes take effect within 30 seconds
- API response time < 200ms for preference operations
- Support for 100,000+ concurrent users
- GDPR compliant with audit logging for preference changes
- Mobile-responsive settings interface

## Technical Approach

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Preferences    │────▶│   Database      │
│   Settings UI   │     │   API Service    │     │   (PostgreSQL)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Notification    │
                        │  Dispatcher      │
                        └──────────────────┘
```

### Data Models

```typescript
interface NotificationPreferences {
  userId: string;
  email: EmailPreferences;
  push: PushPreferences;
  quietHours: QuietHoursConfig;
  updatedAt: Date;
  version: number;
}

interface EmailPreferences {
  enabled: boolean;
  digestFrequency: 'realtime' | 'daily' | 'weekly' | 'disabled';
  digestTime?: string; // HH:mm format, used for daily/weekly
  digestDay?: number;  // 0-6 for weekly, day of week
  categories: {
    security: boolean;
    marketing: boolean;
    updates: boolean;
    social: boolean;
  };
  alternateEmail?: string;
}

interface PushPreferences {
  enabled: boolean;
  categories: {
    messages: boolean;
    mentions: boolean;
    systemAlerts: boolean;
    promotional: boolean;
  };
  deviceTokens: string[];
}

interface QuietHoursConfig {
  enabled: boolean;
  timezone: string;
  schedule: QuietHoursPeriod[];
  bypassForCritical: boolean;
  doNotDisturb: {
    active: boolean;
    until?: Date;
  };
}

interface QuietHoursPeriod {
  dayOfWeek: number | 'all'; // 0-6 or 'all'
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}
```

### Database Schema

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  email_digest_frequency VARCHAR(20) DEFAULT 'daily',
  email_digest_time TIME DEFAULT '09:00',
  email_digest_day INTEGER,
  email_alternate VARCHAR(255),
  email_categories JSONB DEFAULT '{"security":true,"marketing":false,"updates":true,"social":true}',
  push_enabled BOOLEAN DEFAULT true,
  push_categories JSONB DEFAULT '{"messages":true,"mentions":true,"systemAlerts":true,"promotional":false}',
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
  quiet_hours_schedule JSONB DEFAULT '[]',
  quiet_hours_bypass_critical BOOLEAN DEFAULT true,
  dnd_active BOOLEAN DEFAULT false,
  dnd_until TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_dnd ON notification_preferences(dnd_active, dnd_until) WHERE dnd_active = true;
```

## API Contracts

### Get User Preferences

```
GET /api/v1/users/{userId}/notification-preferences

Response 200:
{
  "data": {
    "userId": "uuid",
    "email": {
      "enabled": true,
      "digestFrequency": "daily",
      "digestTime": "09:00",
      "categories": {
        "security": true,
        "marketing": false,
        "updates": true,
        "social": true
      }
    },
    "push": {
      "enabled": true,
      "categories": {
        "messages": true,
        "mentions": true,
        "systemAlerts": true,
        "promotional": false
      }
    },
    "quietHours": {
      "enabled": false,
      "timezone": "America/New_York",
      "schedule": [],
      "bypassForCritical": true,
      "doNotDisturb": {
        "active": false
      }
    },
    "updatedAt": "2024-01-15T10:30:00Z",
    "version": 1
  }
}
```

### Update Preferences

```
PATCH /api/v1/users/{userId}/notification-preferences

Request Body:
{
  "email": {
    "digestFrequency": "weekly",
    "digestDay": 1,
    "categories": {
      "marketing": true
    }
  },
  "version": 1  // Optimistic locking
}

Response 200:
{
  "data": { /* Updated preferences object */ },
  "message": "Preferences updated successfully"
}

Response 409 (Conflict):
{
  "error": "VERSION_CONFLICT",
  "message": "Preferences were modified by another request",
  "currentVersion": 2
}
```

### Set Do Not Disturb

```
POST /api/v1/users/{userId}/notification-preferences/dnd

Request Body:
{
  "duration": 120  // minutes, or null for indefinite
}

Response 200:
{
  "data": {
    "active": true,
    "until": "2024-01-15T14:30:00Z"
  }
}
```

### Reset to Defaults

```
POST /api/v1/users/{userId}/notification-preferences/reset

Response 200:
{
  "data": { /* Default preferences object */ },
  "message": "Preferences reset to defaults"
}
```

## Acceptance Criteria

### Email Settings
- [ ] User can select digest frequency from dropdown (real-time, daily, weekly, disabled)
- [ ] When daily/weekly selected, time picker appears for delivery time
- [ ] Category toggles update immediately with visual feedback
- [ ] Alternate email field validates email format before saving
- [ ] Changes persist after page refresh

### Push Notifications
- [ ] Global push toggle disables all category toggles when off
- [ ] Individual category toggles work independently when global is on
- [ ] Device token registration happens automatically on settings page load
- [ ] Unregistered devices are cleaned up after 30 days of inactivity

### Quiet Hours
- [ ] Timezone selector shows user's detected timezone by default
- [ ] Schedule builder allows adding multiple time periods
- [ ] Visual timeline shows configured quiet hours
- [ ] "Bypass for critical" toggle clearly explains which notifications bypass
- [ ] DND mode shows remaining time and allows early cancellation

### General
- [ ] Loading states shown during API calls
- [ ] Error messages are user-friendly and actionable
- [ ] Settings page accessible and usable on mobile devices
- [ ] All changes logged for audit purposes
- [ ] Undo functionality for accidental changes (within 30 seconds)

## Out of Scope

- Notification content customization (templates, formatting)
- Channel-specific delivery providers (SendGrid, Firebase setup)
- A/B testing of notification strategies
- Analytics dashboard for notification engagement
- Team/organization-level preference defaults
- Notification scheduling (send later functionality)
- Third-party app notification integrations
- SMS/WhatsApp notification channels
