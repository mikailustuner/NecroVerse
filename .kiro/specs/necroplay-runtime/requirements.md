# Requirements Document

## Introduction

NecroPlay Runtime is the public-facing arcade platform where resurrected applications come to life. It provides a gallery of resurrected experiences, a hybrid runtime environment for executing legacy code, playback controls, performance monitoring, and social features for sharing and commenting on resurrections.

## Glossary

- **NecroPlay**: The public arcade platform for resurrected applications
- **Resurrected App**: A legacy application converted to modern web format
- **Runtime Environment**: The execution context for resurrected applications (canvas, iframe, or WebGL)
- **Playback Controls**: UI elements for controlling app execution (play, pause, stop, speed)
- **Performance Monitor**: Real-time tracking of FPS, memory usage, and render time
- **Soul Counter**: Global metric showing total number of resurrections
- **Graveyard**: The collection of all public resurrected applications

## Requirements

### Requirement 1

**User Story:** As a user, I want to browse a gallery of resurrected applications, so that I can discover and experience revived legacy software

#### Acceptance Criteria

1. WHEN a user navigates to NecroPlay, THE NecroPlay SHALL display a grid of resurrected applications
2. THE NecroPlay SHALL load public applications from Supabase with pagination
3. THE NecroPlay SHALL display each app as a card with thumbnail, name, original technology, and resurrection date
4. WHEN a user hovers over an app card, THE NecroPlay SHALL apply a glowing hover effect
5. THE NecroPlay SHALL allow users to filter apps by technology type (SWF, JAR, XAP, DCR)

### Requirement 2

**User Story:** As a user, I want to launch a resurrected application in fullscreen, so that I can experience it without distractions

#### Acceptance Criteria

1. WHEN a user clicks an app card, THE NecroPlay SHALL navigate to the app runner view
2. WHEN the app runner loads, THE NecroPlay SHALL display a ritual loading animation
3. WHEN loading completes, THE NecroPlay SHALL render the app in a fullscreen canvas or iframe
4. THE NecroPlay SHALL apply CRT scanline overlay effects to the runtime view
5. WHEN a user presses F key, THE NecroPlay SHALL toggle true fullscreen mode

### Requirement 3

**User Story:** As a user, I want playback controls for resurrected applications, so that I can control execution and navigate through content

#### Acceptance Criteria

1. THE NecroPlay SHALL display playback controls: Play, Pause, Stop, and Speed selector
2. WHEN a user clicks Play, THE NecroPlay SHALL start or resume app execution
3. WHEN a user clicks Pause, THE NecroPlay SHALL freeze app execution
4. WHEN a user clicks Stop, THE NecroPlay SHALL reset app to initial state
5. THE NecroPlay SHALL provide speed options: 0.5x, 1x, 1.5x, 2x

### Requirement 4

**User Story:** As a user, I want to see performance metrics while an app runs, so that I can understand execution quality

#### Acceptance Criteria

1. THE NecroPlay SHALL display an FPS counter in the top-right corner
2. THE NecroPlay SHALL update FPS counter every 500ms
3. THE NecroPlay SHALL display memory usage as a percentage
4. THE NecroPlay SHALL show render time in milliseconds
5. WHEN performance drops below 30 FPS, THE NecroPlay SHALL display a warning indicator

### Requirement 5

**User Story:** As a user, I want keyboard shortcuts for common actions, so that I can control apps efficiently

#### Acceptance Criteria

1. WHEN a user presses Space, THE NecroPlay SHALL toggle play/pause
2. WHEN a user presses Esc, THE NecroPlay SHALL exit fullscreen or return to gallery
3. WHEN a user presses Left Arrow, THE NecroPlay SHALL navigate to previous frame (if applicable)
4. WHEN a user presses Right Arrow, THE NecroPlay SHALL navigate to next frame (if applicable)
5. THE NecroPlay SHALL display a keyboard shortcuts help overlay when user presses ?

### Requirement 6

**User Story:** As a user, I want to view detailed information about a resurrected app, so that I can learn about its origin and resurrection process

#### Acceptance Criteria

1. THE NecroPlay SHALL display an info drawer accessible via an info button
2. WHEN the info drawer opens, THE NecroPlay SHALL show original file name, technology type, and resurrection date
3. THE NecroPlay SHALL display resurrection logs showing the transformation process
4. THE NecroPlay SHALL show NFT address if the app is bound to blockchain
5. THE NecroPlay SHALL display the resurrector's name (if available)

### Requirement 7

**User Story:** As a user, I want to share resurrected applications, so that others can experience them

#### Acceptance Criteria

1. THE NecroPlay SHALL provide a Share button in the app runner
2. WHEN a user clicks Share, THE NecroPlay SHALL display sharing options: Copy Link, Twitter, Discord
3. WHEN a user selects Copy Link, THE NecroPlay SHALL copy the app URL to clipboard
4. THE NecroPlay SHALL generate embed code for websites
5. THE NecroPlay SHALL allow users to toggle app visibility between public and private

### Requirement 8

**User Story:** As a user, I want to take screenshots of running apps, so that I can capture and share moments

#### Acceptance Criteria

1. THE NecroPlay SHALL provide a Screenshot button in the playback controls
2. WHEN a user clicks Screenshot, THE NecroPlay SHALL capture the current canvas frame
3. THE NecroPlay SHALL download the screenshot as a PNG file
4. THE NecroPlay SHALL apply the necro-dark border and watermark to screenshots
5. THE NecroPlay SHALL display a success message with occult styling

### Requirement 9

**User Story:** As a user, I want to comment on resurrected applications, so that I can share feedback and engage with the community

#### Acceptance Criteria

1. THE NecroPlay SHALL display a comments section below the app runner
2. WHEN a user submits a comment, THE NecroPlay SHALL save it to Supabase
3. THE NecroPlay SHALL display comments with username, timestamp, and occult-styled formatting
4. THE NecroPlay SHALL allow users to upvote comments
5. THE NecroPlay SHALL require authentication for commenting

### Requirement 10

**User Story:** As a user, I want to see analytics for resurrected apps, so that I can understand their popularity and performance

#### Acceptance Criteria

1. THE NecroPlay SHALL track view count for each app
2. THE NecroPlay SHALL track average session duration
3. THE NecroPlay SHALL display analytics in the info drawer
4. THE NecroPlay SHALL show error rate and crash statistics
5. THE NecroPlay SHALL update analytics in real-time using Supabase subscriptions
