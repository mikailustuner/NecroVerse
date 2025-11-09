# Requirements Document

## Introduction

Infrastructure provides the foundational services for Necroverse including database schema, storage management, authentication, real-time subscriptions, deployment configuration, and monitoring. It ensures data persistence, security, and scalability across NecroDev and NecroPlay platforms.

## Glossary

- **Infrastructure**: The backend services and deployment configuration
- **Supabase**: PostgreSQL database and backend-as-a-service platform
- **Storage Bucket**: File storage container for uploads and converted files
- **Real-time Subscription**: Live data updates via WebSocket
- **Row Level Security**: Database-level access control policies
- **Edge Function**: Serverless function for backend logic
- **Migration**: Database schema version control script

## Requirements

### Requirement 1

**User Story:** As a developer, I want a database schema for storing resurrected applications, so that data persists across sessions

#### Acceptance Criteria

1. THE Infrastructure SHALL create a resurrected_apps table with columns: id, name, original_tech, created_at, code_files, entry_point, metadata, nft_address, is_public
2. THE Infrastructure SHALL use UUID for primary keys
3. THE Infrastructure SHALL store code_files as JSONB for flexible structure
4. THE Infrastructure SHALL index is_public column for fast public app queries
5. THE Infrastructure SHALL enforce NOT NULL constraints on required fields

### Requirement 2

**User Story:** As a developer, I want a soul counter table, so that resurrection metrics are tracked globally

#### Acceptance Criteria

1. THE Infrastructure SHALL create a soul_counter table with columns: id, count, last_updated
2. THE Infrastructure SHALL enforce a single-row constraint (id = 1)
3. THE Infrastructure SHALL provide an increment_soul_counter() RPC function
4. THE Infrastructure SHALL use atomic operations to prevent race conditions
5. THE Infrastructure SHALL update last_updated timestamp on every increment

### Requirement 3

**User Story:** As a developer, I want storage buckets for file uploads and conversions, so that files are securely stored

#### Acceptance Criteria

1. THE Infrastructure SHALL create an "uploads" storage bucket with private access
2. THE Infrastructure SHALL create a "converted" storage bucket with public read access
3. THE Infrastructure SHALL enforce file size limits: 50MB for uploads
4. THE Infrastructure SHALL organize files by user ID and timestamp
5. THE Infrastructure SHALL automatically delete files older than 90 days from uploads bucket

### Requirement 4

**User Story:** As a developer, I want Row Level Security policies, so that users can only access their own data

#### Acceptance Criteria

1. THE Infrastructure SHALL enable RLS on resurrected_apps table
2. THE Infrastructure SHALL create policy allowing users to read their own apps
3. THE Infrastructure SHALL create policy allowing users to read public apps (is_public = true)
4. THE Infrastructure SHALL create policy allowing users to insert/update/delete only their own apps
5. THE Infrastructure SHALL create policy allowing anonymous read access to public apps

### Requirement 5

**User Story:** As a developer, I want real-time subscriptions for the soul counter, so that updates are instant

#### Acceptance Criteria

1. THE Infrastructure SHALL enable real-time replication on soul_counter table
2. THE Infrastructure SHALL configure WebSocket connections for subscriptions
3. WHEN the soul counter increments, THE Infrastructure SHALL broadcast the update to all connected clients
4. THE Infrastructure SHALL handle connection drops gracefully with automatic reconnection
5. THE Infrastructure SHALL limit subscription rate to prevent abuse

### Requirement 6

**User Story:** As a developer, I want database migrations, so that schema changes are version controlled

#### Acceptance Criteria

1. THE Infrastructure SHALL create migration files in supabase/migrations/ directory
2. THE Infrastructure SHALL name migrations with timestamp prefix: YYYYMMDDHHMMSS_description.sql
3. THE Infrastructure SHALL provide rollback scripts for each migration
4. THE Infrastructure SHALL track applied migrations in schema_migrations table
5. THE Infrastructure SHALL prevent running migrations out of order

### Requirement 7

**User Story:** As a developer, I want Edge Functions for serverless logic, so that backend operations are scalable

#### Acceptance Criteria

1. THE Infrastructure SHALL create an Edge Function for file conversion processing
2. THE Infrastructure SHALL create an Edge Function for NFT metadata generation
3. THE Infrastructure SHALL configure CORS headers for cross-origin requests
4. THE Infrastructure SHALL set function timeout to 60 seconds
5. THE Infrastructure SHALL log function executions for monitoring

### Requirement 8

**User Story:** As a developer, I want environment variable management, so that configuration is secure

#### Acceptance Criteria

1. THE Infrastructure SHALL provide .env.example with all required variables
2. THE Infrastructure SHALL document each environment variable with comments
3. THE Infrastructure SHALL validate required variables on application startup
4. THE Infrastructure SHALL use different .env files for development, staging, and production
5. THE Infrastructure SHALL never commit actual .env files to version control

### Requirement 9

**User Story:** As a developer, I want deployment configuration for Vercel/Netlify, so that apps can be deployed easily

#### Acceptance Criteria

1. THE Infrastructure SHALL provide vercel.json with build and routing configuration
2. THE Infrastructure SHALL provide netlify.toml with build and redirect rules
3. THE Infrastructure SHALL configure environment variables in deployment platforms
4. THE Infrastructure SHALL set up preview deployments for pull requests
5. THE Infrastructure SHALL configure custom domains with SSL certificates

### Requirement 10

**User Story:** As a developer, I want monitoring and error tracking, so that issues can be identified quickly

#### Acceptance Criteria

1. THE Infrastructure SHALL integrate Sentry for error tracking
2. THE Infrastructure SHALL log all database errors with context
3. THE Infrastructure SHALL track API response times and error rates
4. THE Infrastructure SHALL send alerts when error rate exceeds 5%
5. THE Infrastructure SHALL provide a dashboard for viewing metrics
