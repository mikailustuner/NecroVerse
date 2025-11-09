# Implementation Plan

- [ ] 1. Set up Supabase project and configuration
  - Create Supabase project
  - Create supabase/ directory structure
  - Create config.toml with project settings
  - Set up environment variables
  - Initialize Supabase CLI
  - _Requirements: 1.1, 8.1, 8.2, 8.3_

- [ ] 2. Create initial database schema migration
  - Create supabase/migrations/001_initial_schema.sql
  - Define resurrected_apps table with all columns
  - Define soul_counter table with single-row constraint
  - Define resurrection_history table
  - Define comments table
  - Define analytics_events table
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Create database indexes
  - Add index on resurrected_apps(user_id)
  - Add index on resurrected_apps(is_public)
  - Add index on resurrected_apps(original_tech)
  - Add index on resurrection_history(app_id)
  - Add index on comments(app_id)
  - Add index on analytics_events(app_id)
  - _Requirements: 1.1, 1.2_

- [ ] 4. Create database triggers
  - Create update_updated_at() trigger function
  - Create increment_comment_count() trigger function
  - Apply triggers to appropriate tables
  - _Requirements: 1.1_

- [ ] 5. Create Row Level Security policies migration
  - Create supabase/migrations/002_rls_policies.sql
  - Enable RLS on all tables
  - Create policies for resurrected_apps (read own, read public, insert, update, delete)
  - Create policies for resurrection_history
  - Create policies for comments
  - Create policies for analytics_events
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Create RPC functions migration
  - Create supabase/migrations/003_functions.sql
  - Implement increment_soul_counter() function
  - Implement get_soul_counter() function
  - Implement increment_view_count() function
  - Implement get_app_analytics() function
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Configure storage buckets
  - Create uploads bucket (private, 50MB limit)
  - Create converted bucket (public, 100MB limit)
  - Create thumbnails bucket (public, 5MB limit)
  - Configure allowed MIME types for each bucket
  - Set up automatic file deletion after 90 days
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Create storage policies
  - Create policies for uploads bucket (user upload/read own)
  - Create policies for converted bucket (public read, authenticated write)
  - Create policies for thumbnails bucket (public read, authenticated write)
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 9. Create process-resurrection Edge Function
  - Create supabase/functions/process-resurrection/index.ts
  - Initialize Supabase client
  - Implement file upload to storage
  - Trigger resurrection process
  - Increment soul counter
  - Return success response
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Create generate-nft-metadata Edge Function
  - Create supabase/functions/generate-nft-metadata/index.ts
  - Accept app data and metadata
  - Generate NFT metadata JSON
  - Include attributes and properties
  - Return formatted metadata
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Configure real-time subscriptions
  - Enable real-time replication on soul_counter table
  - Configure WebSocket connections
  - Set up broadcast for soul counter updates
  - Implement connection drop handling
  - Set rate limits for subscriptions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Create environment variable templates
  - Create .env.example with all required variables
  - Document each variable with comments
  - Create separate templates for dev, staging, prod
  - Add validation script for required variables
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Create Vercel deployment configuration
  - Create vercel.json with build settings
  - Configure routes for NecroDev and NecroPlay
  - Set up environment variables
  - Configure preview deployments
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14. Create Netlify deployment configuration
  - Create netlify.toml with build settings
  - Configure redirects
  - Set up environment variables
  - Configure custom domain
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Create Docker Compose configuration
  - Create docker-compose.yml for local development
  - Configure Postgres service
  - Configure Supabase Studio service
  - Configure NecroDev and NecroPlay services
  - Set up volumes for data persistence
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 16. Set up Sentry error tracking
  - Create monitoring/sentry.config.js
  - Initialize Sentry with DSN
  - Configure error filtering (remove PII)
  - Set up performance monitoring
  - Configure replay integration
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17. Create performance monitoring service
  - Create services/performanceMonitor.ts
  - Implement trackMetric() method
  - Implement getAverage() method
  - Send alerts for slow operations
  - Track resurrection time, FPS, memory usage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 18. Write database migration tests
  - Test schema creation
  - Test RLS policies with different user roles
  - Test RPC functions
  - Test triggers
  - _Requirements: All database_

- [ ]* 19. Write storage integration tests
  - Test file upload to each bucket
  - Test file download
  - Test storage policies
  - Test file size limits
  - _Requirements: All storage_

- [ ]* 20. Write Edge Function tests
  - Test process-resurrection function
  - Test generate-nft-metadata function
  - Test error handling
  - Test CORS configuration
  - _Requirements: All Edge Functions_
