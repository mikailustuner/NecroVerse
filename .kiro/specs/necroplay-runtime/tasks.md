# Implementation Plan

- [ ] 1. Set up NecroPlay Next.js application
  - Create apps/necroplay directory with Next.js 14 App Router
  - Configure TypeScript and ESLint
  - Set up Tailwind CSS with necro theme
  - Install dependencies: Framer Motion, @necroverse/ui, @necroverse/graveyard-runtime
  - Create app/layout.tsx with providers
  - _Requirements: 1.1, 2.1_

- [ ] 2. Build app gallery view
  - Create app/page.tsx for gallery
  - Implement AppGallery component with grid layout
  - Load public apps from Supabase with pagination
  - Add stagger animations for app cards
  - Implement CRT overlay effect
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Build app card component
  - Create AppCard component
  - Display thumbnail, name, technology, and date
  - Implement hover animation (lift and glow)
  - Show view count and comment count
  - Display NFT badge if bound
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. Implement gallery filtering
  - Add filter buttons for technology types
  - Implement filter state management
  - Update Supabase query based on filter
  - Add filter animations
  - _Requirements: 1.5_

- [ ] 5. Build app runner page
  - Create app/play/[id]/page.tsx
  - Load app data from Supabase
  - Implement loading ritual animation
  - Add fullscreen mode support
  - Integrate DarkHeader
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Build runtime canvas component
  - Create RuntimeCanvas component with canvas ref
  - Initialize RuntimeEngine with app data
  - Implement play/pause/stop controls
  - Handle speed changes
  - Add cleanup on unmount
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Build runtime engine service
  - Create RuntimeEngine class
  - Select appropriate interpreter based on technology
  - Implement initialize(), play(), pause(), setSpeed() methods
  - Implement render loop with requestAnimationFrame
  - Add canvas resize handling
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 8. Build playback controls component
  - Create PlaybackControls component
  - Implement Play, Pause, Stop buttons
  - Add speed selector (0.5x, 1x, 1.5x, 2x)
  - Add Screenshot, Share, and Info buttons
  - Implement slide-in animation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Implement keyboard shortcuts
  - Create useKeyboardShortcuts hook
  - Implement Space for play/pause toggle
  - Implement Esc for exit fullscreen
  - Implement Arrow keys for frame navigation
  - Add ? key for help overlay
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Build performance monitor component
  - Create PerformanceMonitor component
  - Track FPS with rolling average
  - Track memory usage percentage
  - Track render time in milliseconds
  - Display warning when FPS drops below 30
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 11. Build info drawer component
  - Create InfoDrawer component
  - Display app metadata (name, tech, date)
  - Show resurrection logs
  - Display NFT address if bound
  - Show resurrector name
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Implement sharing functionality
  - Create share modal with options
  - Implement copy link to clipboard
  - Generate embed code
  - Add social media share buttons (Twitter, Discord)
  - Implement public/private visibility toggle
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Implement screenshot functionality
  - Create screenshot capture from canvas
  - Download as PNG with necro-dark border
  - Add watermark to screenshot
  - Display success toast with occult styling
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 14. Build comment section
  - Create CommentSection component
  - Load comments from Supabase
  - Implement comment submission
  - Display comments with username and timestamp
  - Add upvote functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Implement analytics tracking
  - Track view count on app load
  - Track session duration
  - Track user interactions (play, pause, share, screenshot)
  - Save analytics events to Supabase
  - Display analytics in info drawer
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 16. Write integration tests
  - Test app gallery loading and filtering
  - Test app runner with sample apps
  - Test playback controls
  - Test keyboard shortcuts
  - Test analytics tracking
  - _Requirements: All_
