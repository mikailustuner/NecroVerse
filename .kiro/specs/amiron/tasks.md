# Amiron Implementation Plan

- [x] 1. Initialize project structure and build system





  - Create monorepo structure with packages for exec, intuition, workbench, ritual-api, and pal
  - Set up Rust workspace for exec package with wasm-pack configuration targeting web
  - Configure TypeScript project references for all TypeScript packages
  - Set up Vite for web entry point with WASM loading support
  - Create package.json scripts for building Rust and TypeScript in correct order
  - _Requirements: 8.1, 8.4_

- [x] 2. Implement Platform Abstraction Layer (PAL)




  - [x] 2.1 Create graphics abstraction with Canvas 2D

    - Define GraphicsContext, Surface, Color, Rect, and Point types in TypeScript
    - Implement CanvasGraphics class with canvas element initialization
    - Implement clear, drawRect, drawText, and drawImage methods
    - Add color conversion utilities (Color to CSS string)
    - _Requirements: 5.3, 2.5_
  
  - [x] 2.2 Create storage abstraction with IndexedDB

    - Define FileSystem interface with readFile, writeFile, listDir, createDir, deleteFile methods
    - Implement IndexedDBFileSystem class with database initialization
    - Create object store schema for files with path as key
    - Implement path resolution logic for hierarchical directories
    - Add error handling for quota exceeded and file not found
    - _Requirements: 5.4_
  

  - [x] 2.3 Create audio abstraction with Web Audio API

    - Define AudioContext interface with playSound method
    - Implement WebAudioContext class using Web Audio API
    - Set up AudioContext with proper initialization (user gesture requirement)
    - Create audio buffer management for sound playback
    - _Requirements: 4.1, 4.5_

- [x] 3. Build Exec Layer in Rust/WASM





  - [x] 3.1 Implement core task management


    - Create Task struct with id, priority, and state fields
    - Implement Exec struct with HashMap for tasks and next_id counter
    - Write create_task function that allocates TaskId and initializes task
    - Write terminate_task function that marks task as terminated
    - Add wasm_bindgen annotations for JavaScript interop
    - _Requirements: 1.1, 1.2, 5.2_
  
  - [x] 3.2 Implement message passing system

    - Create message_queues HashMap in Exec struct
    - Implement send_message function that appends to target task's queue
    - Implement receive_message function that pops from task's queue
    - Add Vec<u8> serialization for message data across WASM boundary
    - _Requirements: 1.3_
  
  - [x] 3.3 Implement preemptive scheduler

    - Write schedule function that selects highest-priority ready task
    - Implement task state transitions (Ready → Running → Waiting → Terminated)
    - Add priority comparison logic for task selection
    - _Requirements: 1.1_
  
  - [x] 3.4 Build and test WASM module

    - Configure Cargo.toml with wasm-bindgen dependencies
    - Run wasm-pack build with --target web flag
    - Verify generated JavaScript bindings
    - Test basic task creation and message passing from JavaScript
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 4. Create Intuition Engine GUI framework





  - [x] 4.1 Implement NecroNet theme

    - Create theme.ts with Theme interface definition
    - Define NecroTheme constant with NecroNet color palette (#0a0612, #a855f7, #00fff7, etc.)
    - Add Color and Font type definitions
    - Export theme for use across GUI components
    - _Requirements: 2.2, 9.1, 9.4_
  
  - [x] 4.2 Implement base widget system


    - Create abstract Widget class with bounds, render, and handleEvent methods
    - Implement Button widget with label, onClick callback, and hover state
    - Implement TextField widget with text input and cursor position
    - Implement Label widget for static text display
    - Style widgets using NecroTheme colors
    - _Requirements: 2.5_
  
  - [x] 4.3 Implement window management

    - Create Window class with title, bounds, widgets array, and focused state
    - Implement window chrome rendering (title bar with NecroTheme.accentGlow)
    - Add window border rendering using NecroTheme.shadow
    - Implement title text rendering in title bar
    - Add widget rendering loop within window content area
    - _Requirements: 2.3_
  
  - [x] 4.4 Create event system

    - Define InputEvent type with type, position, button, and key fields
    - Implement event capture from browser DOM events (click, mousemove, keydown)
    - Create event routing that dispatches to focused window
    - Add containsPoint helper for hit testing
    - Implement event propagation to widgets within windows
    - _Requirements: 2.4_
  
  - [x] 4.5 Implement rendering pipeline


    - Create main render loop using requestAnimationFrame
    - Implement frame time measurement to ensure sub-16ms rendering
    - Add clear background with NecroTheme.background
    - Render all windows in z-order
    - Add FPS counter for performance monitoring
    - _Requirements: 2.1, 4.3_

- [x] 5. Build Workbench desktop shell





  - [x] 5.1 Implement desktop icon system


    - Create Icon interface with label, image, position, and target properties
    - Implement Desktop class with icons array
    - Write renderIcon method that draws 48x48 icon with label
    - Add icon background using NecroTheme.shadow
    - Implement iconContainsPoint for click detection
    - _Requirements: 3.1_
  
  - [x] 5.2 Implement desktop persistence


    - Write saveLayout function that serializes icons to localStorage
    - Write loadLayout function that restores icons on startup
    - Store icon positions and targets as JSON
    - Call saveLayout whenever icons are added or moved
    - _Requirements: 3.5, 5.4_
  
  - [x] 5.3 Implement application launching


    - Create application registry mapping targets to application modules
    - Implement handleDoubleClick that detects icon double-clicks
    - Write launchIcon function that loads application module
    - Add window creation for launched applications
    - Integrate with openWindow to display application windows
    - _Requirements: 3.2, 7.5_
  
  - [x] 5.4 Implement window management in desktop


    - Add windows array to Desktop class
    - Write openWindow method that adds window and sets focus
    - Implement window z-order management (focused window on top)
    - Add window dragging by title bar (mousedown, mousemove, mouseup)
    - Implement window focus on click
    - _Requirements: 2.3_

- [x] 6. Create Ritual API public interface





  - [x] 6.1 Implement task API


    - Export createTask function wrapping Exec.create_task
    - Export sendMessage function wrapping Exec.send_message
    - Export receiveMessage function wrapping Exec.receive_message
    - Add TypeScript type definitions for TaskId
    - Initialize execInstance in Amiron.init function
    - _Requirements: 6.1_
  
  - [x] 6.2 Implement window API


    - Export createWindow function that instantiates Window class
    - Export addWidget function that calls window.addWidget
    - Add TypeScript type definitions for Window and Widget
    - Provide helper functions for common window operations
    - _Requirements: 6.2_
  
  - [x] 6.3 Implement file API


    - Export readFile function wrapping FileSystem.readFile
    - Export writeFile function wrapping FileSystem.writeFile
    - Export listDirectory function wrapping FileSystem.listDir
    - Add Result type for error handling
    - Initialize fileSystemInstance in Amiron.init function
    - _Requirements: 6.3_
  
  - [x] 6.4 Implement audio API


    - Export playSound function for simple audio playback
    - Add volume control parameter
    - Handle Web Audio API initialization (user gesture requirement)
    - _Requirements: 6.4_
  
  - [x] 6.5 Create API documentation


    - Write JSDoc comments for all public API functions
    - Generate TypeScript declaration files (.d.ts)
    - Create examples directory with sample applications
    - Write README explaining API usage
    - _Requirements: 6.5_

- [x] 7. Build core applications






  - [x] 7.1 Create text editor application

    - Implement TextEditor class using Ritual API
    - Create window with TextField widget for multi-line editing
    - Add menu bar with File menu (Open, Save, Close)
    - Implement file open using Amiron.readFile
    - Implement file save using Amiron.writeFile
    - Style with NecroTheme colors
    - _Requirements: 7.1_
  
  - [x] 7.2 Create file manager application


    - Implement FileManager class with directory navigation
    - Create window with list widget showing files
    - Add toolbar with buttons (Copy, Move, Delete, New Folder)
    - Implement listDirectory to populate file list
    - Add breadcrumb navigation showing current path
    - Implement file operations using Ritual API
    - _Requirements: 7.2_
  
  - [x] 7.3 Create terminal emulator


    - Implement Terminal class with command input and output
    - Create window with text area for output and input field
    - Add command parser for basic commands (ls, cd, cat, mkdir, rm)
    - Implement command execution using file API
    - Add command history with up/down arrow navigation
    - Style with monospace font and NecroTheme colors
    - _Requirements: 7.3_

- [x] 8. Create web entry point and integration




  - [x] 8.1 Build main HTML and initialization


    - Create index.html with canvas element (fullscreen)
    - Write main.ts that initializes PAL (CanvasGraphics, IndexedDBFileSystem)
    - Load Exec WASM module using dynamic import
    - Initialize Amiron.init with exec and filesystem instances
    - Create Desktop instance and load layout
    - Start render loop
    - _Requirements: 5.1, 5.5_
  
  - [x] 8.2 Add default desktop icons


    - Create icons for Text Editor, File Manager, and Terminal
    - Position icons in grid layout (left side of screen)
    - Set target property to application IDs
    - Add icons to desktop on first launch
    - _Requirements: 3.1, 7.5_
  
  - [x] 8.3 Configure Vite build


    - Set up vite.config.ts with WASM plugin
    - Configure asset handling for WASM files
    - Add development server with hot module replacement
    - Set up production build with optimization
    - Configure base path for deployment
    - _Requirements: 8.4_
  
  - [x] 8.4 Create NecroPlay integration


    - Create AmironApp descriptor with id, name, description
    - Add thumbnail icon matching NecroNet style
    - Implement launch function that opens Amiron in new tab
    - Add to NecroPlay application catalog
    - Test launching from NecroPlay interface
    - _Requirements: 9.2, 9.3, 9.5_
  
  - [x] 8.5 Write integration tests


    - Create Playwright test that launches Amiron
    - Test window creation and rendering
    - Test icon double-click and application launch
    - Test file manager navigation
    - Measure and assert frame rate (60 FPS target)
    - _Requirements: 2.1, 4.3_

- [ ] 9. Polish and optimization
  - [x] 9.1 Implement performance optimizations





    - Add dirty rectangle tracking to minimize redraws
    - Implement object pooling for InputEvent objects
    - Add lazy loading for application modules (dynamic imports)
    - Optimize WASM build size (strip debug symbols)
    - _Requirements: 4.3, 5.5_
  
  - [x] 9.2 Add visual polish





    - Create minimalist SVG icons for all system applications
    - Implement smooth window open animation (fade in)
    - Add hover effects for buttons (color transition)
    - Create loading indicator for async operations
    - Add glow effect to focused window title bar
    - _Requirements: 2.2, 9.4_
  
  - [ ] 9.3 Add boot sequence
    - Create boot screen with Amiron logo
    - Show loading progress for WASM module
    - Display "Initializing Exec Layer..." message
    - Fade to desktop when initialization complete
    - Style boot screen with NecroNet aesthetic
    - _Requirements: 5.5, 9.1_
  
  - [ ] 9.4 Create user documentation
    - Write README with project overview and quick start
    - Create user guide explaining desktop navigation
    - Write developer guide for building applications with Ritual API
    - Add architecture documentation explaining system layers
    - Include screenshots and GIFs demonstrating features
    - _Requirements: 6.5, 8.5_
