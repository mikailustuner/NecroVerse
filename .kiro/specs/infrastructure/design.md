# Infrastructure Design Document

## Overview

Infrastructure provides the foundational backend services including Supabase database, storage, authentication, real-time subscriptions, Edge Functions, deployment configuration, and monitoring. It ensures data persistence, security, and scalability for the entire Necroverse platform.

## Architecture

```
infrastructure/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   ├── functions/
│   │   ├── process-resurrection/
│   │   └── generate-nft-metadata/
│   └── config.toml
├── deployment/
│   ├── vercel.json
│   ├── netlify.toml
│   └── docker-compose.yml
└── monitoring/
    └── sentry.config.js
```

## Database Schema

### Tables

```sql
-- Resurrected Applications
CREATE TABLE resurrected_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  original_tech TEXT NOT NULL CHECK (original_tech IN ('swf', 'jar', 'xap', 'dcr', 'exe', 'dll', 'ocx')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  code_files JSONB NOT NULL,
  entry_point TEXT NOT NULL,
  metadata JSONB,
  thumbnail_url TEXT,
  nft_address TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

-- Soul Counter
CREATE TABLE soul_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Resurrection History
CREATE TABLE resurrection_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES resurrected_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  original_file_name TEXT NOT NULL,
  original_file_size INTEGER NOT NULL,
  resurrection_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES resurrected_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0
);

-- Analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES resurrected_apps(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'play', 'pause', 'stop', 'share', 'screenshot')),
  timestamp TIMESTAMP DEFAULT NOW(),
  session_duration INTEGER,
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_apps_user ON resurrected_apps(user_id);
CREATE INDEX idx_apps_public ON resurrected_apps(is_public) WHERE is_public = true;
CREATE INDEX idx_apps_tech ON resurrected_apps(original_tech);
CREATE INDEX idx_history_app ON resurrection_history(app_id);
CREATE INDEX idx_history_timestamp ON resurrection_history(timestamp DESC);
CREATE INDEX idx_comments_app ON comments(app_id);
CREATE INDEX idx_analytics_app ON analytics_events(app_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resurrected_apps_updated_at
BEFORE UPDATE ON resurrected_apps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resurrected_apps
  SET comment_count = comment_count + 1
  WHERE id = NEW.app_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_increment_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_comment_count();
```

### Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE resurrected_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resurrection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Resurrected Apps Policies
CREATE POLICY "Users can read their own apps"
ON resurrected_apps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can read public apps"
ON resurrected_apps FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can insert their own apps"
ON resurrected_apps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps"
ON resurrected_apps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps"
ON resurrected_apps FOR DELETE
USING (auth.uid() = user_id);

-- Resurrection History Policies
CREATE POLICY "Users can read their own history"
ON resurrection_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON resurrection_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Anyone can read comments on public apps"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resurrected_apps
    WHERE id = comments.app_id AND is_public = true
  )
);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- Analytics Policies
CREATE POLICY "Anyone can insert analytics events"
ON analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "App owners can read their app analytics"
ON analytics_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resurrected_apps
    WHERE id = analytics_events.app_id AND user_id = auth.uid()
  )
);
```

### RPC Functions

```sql
-- Increment Soul Counter
CREATE OR REPLACE FUNCTION increment_soul_counter()
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE soul_counter
  SET count = count + 1, last_updated = NOW()
  WHERE id = 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Soul Counter
CREATE OR REPLACE FUNCTION get_soul_counter()
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT count INTO current_count
  FROM soul_counter
  WHERE id = 1;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- Increment View Count
CREATE OR REPLACE FUNCTION increment_view_count(app_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE resurrected_apps
  SET view_count = view_count + 1
  WHERE id = app_uuid;
  
  INSERT INTO analytics_events (app_id, event_type)
  VALUES (app_uuid, 'view');
END;
$$ LANGUAGE plpgsql;

-- Get App Analytics
CREATE OR REPLACE FUNCTION get_app_analytics(app_uuid UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_plays BIGINT,
  avg_session_duration NUMERIC,
  total_shares BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
    COUNT(*) FILTER (WHERE event_type = 'play') as total_plays,
    AVG(session_duration) FILTER (WHERE session_duration IS NOT NULL) as avg_session_duration,
    COUNT(*) FILTER (WHERE event_type = 'share') as total_shares
  FROM analytics_events
  WHERE app_id = app_uuid;
END;
$$ LANGUAGE plpgsql;
```

## Storage Configuration

### Buckets

```javascript
// Storage bucket configuration
const buckets = [
  {
    name: 'uploads',
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'application/x-shockwave-flash',
      'application/java-archive',
      'application/x-silverlight-app',
      'application/x-director',
      'application/x-msdownload',
      'application/x-msdos-program'
    ]
  },
  {
    name: 'converted',
    public: true,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: ['application/json', 'text/javascript', 'application/wasm']
  },
  {
    name: 'thumbnails',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  }
];
```

### Storage Policies

```sql
-- Uploads bucket policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Converted bucket policies
CREATE POLICY "Anyone can read converted files"
ON storage.objects FOR SELECT
USING (bucket_id = 'converted');

CREATE POLICY "Authenticated users can upload converted files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'converted' AND
  auth.role() = 'authenticated'
);

-- Thumbnails bucket policies
CREATE POLICY "Anyone can read thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.role() = 'authenticated'
);
```

## Edge Functions

### Process Resurrection Function

```typescript
// supabase/functions/process-resurrection/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { file, userId } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Upload file to storage
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer);
    
    if (uploadError) throw uploadError;
    
    // Trigger resurrection process (this would call the Graveyard Runtime)
    // For now, return success
    
    // Increment soul counter
    const { data: counterData } = await supabase.rpc('increment_soul_counter');
    
    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        soulCount: counterData
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

### Generate NFT Metadata Function

```typescript
// supabase/functions/generate-nft-metadata/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { appData, metadata } = await req.json();
    
    const nftMetadata = {
      name: metadata.name,
      symbol: 'NECRO',
      description: metadata.description,
      image: appData.thumbnailUrl,
      attributes: [
        { trait_type: 'Original Technology', value: metadata.originalTech },
        { trait_type: 'Resurrection Date', value: new Date().toISOString() },
        { trait_type: 'Complexity', value: appData.complexity },
        { trait_type: 'Lines of Code', value: appData.linesOfCode },
      ],
      properties: {
        files: [
          {
            uri: appData.codeUrl,
            type: 'application/json'
          }
        ],
        category: 'code'
      }
    };
    
    return new Response(
      JSON.stringify(nftMetadata),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

## Deployment Configuration

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/necrodev/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/necroplay/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/necrodev/(.*)",
      "dest": "apps/necrodev/$1"
    },
    {
      "src": "/(.*)",
      "dest": "apps/necroplay/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### Netlify Configuration

```toml
[build]
  command = "pnpm build"
  publish = "apps/necroplay/.next"

[[redirects]]
  from = "/necrodev/*"
  to = "https://necrodev.necroverse.io/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NEXT_PUBLIC_SUPABASE_URL = "your_supabase_url"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "your_supabase_anon_key"
```

### Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: your-super-secret-password
      POSTGRES_DB: necroverse
    volumes:
      - postgres-data:/var/lib/postgresql/data

  supabase-studio:
    image: supabase/studio:latest
    ports:
      - "3000:3000"
    environment:
      SUPABASE_URL: http://localhost:8000
      SUPABASE_ANON_KEY: your-anon-key

  necrodev:
    build:
      context: .
      dockerfile: apps/necrodev/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:8000
      NEXT_PUBLIC_SUPABASE_ANON_KEY: your-anon-key

  necroplay:
    build:
      context: .
      dockerfile: apps/necroplay/Dockerfile
    ports:
      - "3002:3002"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:8000
      NEXT_PUBLIC_SUPABASE_ANON_KEY: your-anon-key

volumes:
  postgres-data:
```

## Monitoring and Error Tracking

### Sentry Configuration

```javascript
// monitoring/sentry.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### Performance Monitoring

```typescript
// services/performanceMonitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Send to analytics if threshold exceeded
    if (name === 'resurrection_time' && value > 30000) {
      this.sendAlert('Slow resurrection detected', { time: value });
    }
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private async sendAlert(message: string, data: any) {
    // Send to monitoring service
    await fetch('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ message, data })
    });
  }
}
```

## Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PRIVATE_KEY=your-wallet-private-key

# Application URLs
NEXT_PUBLIC_NECRODEV_URL=http://localhost:3001
NEXT_PUBLIC_NECROPLAY_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional Features
COMMIT_TO_DARKNESS=false
ENABLE_CRT_OVERLAY=true
ENABLE_ANALYTICS=true
```

## Testing Strategy

- Integration tests for database operations
- Test RLS policies with different user roles
- Test storage upload/download operations
- Test Edge Functions with sample data
- Load testing for concurrent resurrections
- Test real-time subscriptions
- Test deployment configurations
