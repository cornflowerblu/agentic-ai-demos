# Dashboard Widget System

## Overview

This feature provides a customizable dashboard widget that displays real-time data from integrated APIs. Users can personalize widget appearance, data sources, and layout positioning. The widget system is designed to be extensible, allowing new widget types to be added with minimal code changes.

## Requirements

### Functional Requirements

1. **Widget Component Structure**
   - Modular widget architecture with standard lifecycle hooks
   - Support for multiple widget types: metrics, charts, lists, status indicators
   - Drag-and-drop positioning within dashboard grid
   - Widget state persistence across sessions
   - Configurable refresh intervals per widget

2. **API Integration for Data Fetching**
   - Centralized data fetching service with caching
   - Support for REST and GraphQL data sources
   - Automatic retry with exponential backoff on failures
   - Real-time updates via WebSocket subscription option
   - Data transformation layer for normalizing API responses

3. **User Customization Options**
   - Widget title and description editing
   - Color theme selection (predefined palettes or custom colors)
   - Data display format options (numbers, percentages, currency)
   - Threshold configuration for alerts/highlighting
   - Show/hide specific data fields within widget

4. **Responsive Layout Requirements**
   - Grid-based layout system (12-column on desktop)
   - Widgets resize fluidly across breakpoints
   - Mobile view collapses to single-column stack
   - Minimum/maximum widget dimensions enforced
   - Layout presets for common configurations

### Non-Functional Requirements

- Initial dashboard load < 2 seconds (50th percentile)
- Widget data refresh < 500ms perceived latency
- Support 50+ widgets per dashboard without performance degradation
- Offline capability with cached data display
- WCAG 2.1 AA accessibility compliance
- Cross-browser support (Chrome, Firefox, Safari, Edge - latest 2 versions)

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Dashboard Container                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Grid Layout Engine                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│  │  │ Widget  │  │ Widget  │  │ Widget  │  │ Widget  │      │  │
│  │  │ Wrapper │  │ Wrapper │  │ Wrapper │  │ Wrapper │      │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │  │
│  └───────┼────────────┼────────────┼────────────┼───────────┘  │
│          │            │            │            │               │
│  ┌───────▼────────────▼────────────▼────────────▼───────────┐  │
│  │                   Widget Registry                         │  │
│  │    (Metric | Chart | List | Status | Custom)             │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                 Data Fetching Service                      │  │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │   │  Cache  │  │  REST   │  │ GraphQL │  │   WS    │     │  │
│  │   │  Layer  │  │ Client  │  │ Client  │  │ Client  │     │  │
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure

```typescript
// Base Widget Interface
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: GridPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSourceConfig;
  refreshInterval: number; // milliseconds, 0 = manual only
  createdAt: Date;
  updatedAt: Date;
}

type WidgetType = 'metric' | 'chart' | 'list' | 'status' | 'custom';

interface GridPosition {
  x: number;  // column (0-11)
  y: number;  // row
}

interface WidgetSize {
  width: number;   // columns (1-12)
  height: number;  // rows (1-4)
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

interface WidgetConfig {
  theme: ThemeConfig;
  display: DisplayConfig;
  thresholds?: ThresholdConfig[];
  visibleFields?: string[];
}

interface ThemeConfig {
  preset?: 'default' | 'dark' | 'light' | 'colorful';
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface DisplayConfig {
  format: 'number' | 'percentage' | 'currency' | 'duration';
  precision?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
}

interface ThresholdConfig {
  field: string;
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
  value: number;
  color: string;
  label?: string;
}

interface DataSourceConfig {
  type: 'rest' | 'graphql' | 'websocket';
  endpoint: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  query?: string;       // GraphQL query
  body?: object;        // Request body
  transform?: string;   // JSONPath or transformation function name
  authentication?: 'bearer' | 'apiKey' | 'none';
}
```

### Dashboard Configuration

```typescript
interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: LayoutConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LayoutConfig {
  columns: number;       // Default 12
  rowHeight: number;     // Pixels
  gap: number;           // Gap between widgets in pixels
  breakpoints: BreakpointConfig[];
}

interface BreakpointConfig {
  name: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minWidth: number;
  columns: number;
}
```

### Database Schema

```sql
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout_config JSONB NOT NULL DEFAULT '{"columns":12,"rowHeight":100,"gap":16}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  size_width INTEGER NOT NULL DEFAULT 3,
  size_height INTEGER NOT NULL DEFAULT 2,
  config JSONB NOT NULL DEFAULT '{}',
  data_source JSONB NOT NULL,
  refresh_interval INTEGER DEFAULT 60000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboards_user ON dashboards(user_id);
CREATE INDEX idx_widgets_dashboard ON widgets(dashboard_id);
CREATE INDEX idx_dashboards_default ON dashboards(user_id, is_default) WHERE is_default = true;
```

## API Contracts

### Get Dashboard with Widgets

```
GET /api/v1/dashboards/{dashboardId}

Response 200:
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "name": "My Dashboard",
    "description": "Main analytics view",
    "layout": {
      "columns": 12,
      "rowHeight": 100,
      "gap": 16,
      "breakpoints": [
        { "name": "xs", "minWidth": 0, "columns": 1 },
        { "name": "sm", "minWidth": 576, "columns": 2 },
        { "name": "md", "minWidth": 768, "columns": 6 },
        { "name": "lg", "minWidth": 992, "columns": 12 }
      ]
    },
    "widgets": [
      {
        "id": "widget-uuid",
        "type": "metric",
        "title": "Total Revenue",
        "position": { "x": 0, "y": 0 },
        "size": { "width": 3, "height": 2 },
        "config": {
          "theme": { "preset": "default" },
          "display": { "format": "currency", "locale": "en-US" },
          "thresholds": [
            { "field": "value", "operator": "lt", "value": 10000, "color": "#ff4444" }
          ]
        },
        "dataSource": {
          "type": "rest",
          "endpoint": "/api/v1/analytics/revenue",
          "transform": "$.data.total"
        },
        "refreshInterval": 30000
      }
    ],
    "isDefault": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Create Widget

```
POST /api/v1/dashboards/{dashboardId}/widgets

Request Body:
{
  "type": "chart",
  "title": "Sales Trend",
  "position": { "x": 3, "y": 0 },
  "size": { "width": 6, "height": 2 },
  "config": {
    "theme": { "preset": "colorful" },
    "display": { "format": "number" }
  },
  "dataSource": {
    "type": "rest",
    "endpoint": "/api/v1/analytics/sales-trend",
    "method": "GET"
  },
  "refreshInterval": 60000
}

Response 201:
{
  "data": { /* Created widget object */ },
  "message": "Widget created successfully"
}
```

### Update Widget

```
PATCH /api/v1/widgets/{widgetId}

Request Body:
{
  "title": "Updated Title",
  "config": {
    "theme": { "primaryColor": "#3498db" }
  }
}

Response 200:
{
  "data": { /* Updated widget object */ }
}
```

### Update Widget Positions (Bulk)

```
PATCH /api/v1/dashboards/{dashboardId}/layout

Request Body:
{
  "widgets": [
    { "id": "widget-1", "position": { "x": 0, "y": 0 }, "size": { "width": 4, "height": 2 } },
    { "id": "widget-2", "position": { "x": 4, "y": 0 }, "size": { "width": 8, "height": 2 } }
  ]
}

Response 200:
{
  "data": { /* Updated dashboard with new layout */ },
  "message": "Layout updated successfully"
}
```

### Fetch Widget Data

```
POST /api/v1/widgets/{widgetId}/data

Response 200:
{
  "data": {
    "widgetId": "uuid",
    "fetchedAt": "2024-01-15T10:30:00Z",
    "cachedUntil": "2024-01-15T10:31:00Z",
    "payload": {
      // Transformed data based on widget's dataSource config
    }
  }
}

Response 503:
{
  "error": "DATA_SOURCE_UNAVAILABLE",
  "message": "Unable to fetch data from source",
  "lastCachedData": { /* Previous successful fetch if available */ },
  "lastCachedAt": "2024-01-15T10:25:00Z"
}
```

### Delete Widget

```
DELETE /api/v1/widgets/{widgetId}

Response 204: No Content
```

## Acceptance Criteria

### Widget Display
- [ ] Widgets render correctly based on their type (metric, chart, list, status)
- [ ] Loading skeleton shown while data is being fetched
- [ ] Error state displays gracefully with retry option
- [ ] Cached data shown with "stale" indicator when source unavailable
- [ ] Refresh countdown visible when auto-refresh is enabled

### Drag and Drop
- [ ] Widgets can be repositioned via drag handle
- [ ] Visual guides show valid drop positions
- [ ] Widgets snap to grid alignment
- [ ] Overlapping widgets prevented with collision detection
- [ ] Position changes saved automatically after drop

### Customization
- [ ] Edit mode accessible via widget menu
- [ ] Theme changes preview in real-time
- [ ] Display format options shown with example values
- [ ] Threshold configuration with color picker
- [ ] Changes apply immediately without page refresh

### Responsive Behavior
- [ ] Dashboard adapts smoothly to viewport changes
- [ ] Mobile view displays widgets in single column
- [ ] Widget content reflows appropriately at each breakpoint
- [ ] Touch interactions work on mobile devices
- [ ] Horizontal scrolling prevented on all screen sizes

### Performance
- [ ] Dashboard with 20 widgets loads within 2 seconds
- [ ] Widget data fetches are parallelized
- [ ] Only visible widgets fetch data initially (virtualization)
- [ ] Stale cache served while revalidating in background
- [ ] Memory usage stays stable during long sessions

## Out of Scope

- Widget marketplace/sharing between users
- Custom widget development SDK
- Data source OAuth connection wizard
- Dashboard templates library
- Export dashboard as PDF/image
- Collaborative real-time editing
- Widget annotations/comments
- Historical data comparison within widgets
- Natural language widget creation ("show me sales by region")
- Mobile app-specific widget variants
