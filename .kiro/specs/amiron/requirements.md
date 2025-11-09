# Amiron Requirements Document

## Introduction

Amiron is a web-based resurrection of AmigaOS principles - a lightweight, modular desktop environment that combines retro Workbench aesthetics with the dark, necromantic visual language of NecroNet. The system embraces microkernel-inspired architecture, preemptive multitasking, and low-latency multimedia capabilities while maintaining elegant simplicity. Built entirely for the web using WebAssembly and modern browser APIs, Amiron serves as an interactive playground within the NecroNet ecosystem.

## Glossary

- **Amiron System**: The complete web-based desktop environment including kernel, GUI, and core applications
- **Exec Layer**: The microkernel-inspired task management and scheduling subsystem
- **Intuition Engine**: The lightweight GUI framework inspired by AmigaOS Intuition
- **Workbench Interface**: The desktop shell providing file management and application launching
- **Soul Module**: A loadable component that extends system functionality
- **Ritual API**: The public interface for application development
- **NecroNet Theme**: The dark purple/cyan color scheme matching the existing website aesthetic

## Requirements

### Requirement 1

**User Story:** As a system architect, I want a microkernel-inspired task management layer running in WebAssembly, so that the system maintains modularity and performance in the browser.

#### Acceptance Criteria

1. THE Exec Layer SHALL provide preemptive multitasking with priority-based scheduling
2. WHEN a task is created, THE Exec Layer SHALL allocate isolated memory space with defined boundaries
3. THE Exec Layer SHALL expose message-passing primitives for inter-task communication
4. WHEN a task fails, THE Exec Layer SHALL contain the failure without affecting other running tasks
5. THE Exec Layer SHALL compile to WebAssembly for near-native performance in browsers

### Requirement 2

**User Story:** As a developer, I want a lightweight GUI framework with NecroNet aesthetics, so that applications feel responsive while maintaining visual consistency with the website.

#### Acceptance Criteria

1. THE Intuition Engine SHALL render UI elements with sub-16ms frame times in modern browsers
2. THE Intuition Engine SHALL use the NecroNet color palette (purple, cyan, dark backgrounds)
3. WHEN a window is created, THE Intuition Engine SHALL provide title bar, borders, and resize controls matching Workbench style
4. THE Intuition Engine SHALL implement event-driven input handling with keyboard and mouse support
5. THE Intuition Engine SHALL render using Canvas 2D or WebGPU based on browser support

### Requirement 3

**User Story:** As an end user, I want a desktop shell that manages files and launches applications, so that I can interact with the system intuitively in my browser.

#### Acceptance Criteria

1. THE Workbench Interface SHALL display icons for files, directories, and applications on the desktop
2. WHEN a user double-clicks an icon, THE Workbench Interface SHALL launch the associated application or open the directory
3. THE Workbench Interface SHALL provide a file browser with hierarchical navigation
4. THE Workbench Interface SHALL support drag-and-drop operations for file management
5. THE Workbench Interface SHALL persist desktop layout using browser localStorage

### Requirement 4

**User Story:** As a multimedia application developer, I want low-latency audio and graphics APIs, so that I can create responsive interactive experiences in the browser.

#### Acceptance Criteria

1. THE Amiron System SHALL provide audio output with maximum 20ms latency using Web Audio API
2. THE Amiron System SHALL support hardware-accelerated 2D graphics operations via Canvas or WebGPU
3. WHEN rendering graphics, THE Amiron System SHALL achieve minimum 60 FPS for standard operations
4. THE Amiron System SHALL expose direct canvas access for custom rendering
5. THE Amiron System SHALL support multiple audio channels with independent volume control

### Requirement 5

**User Story:** As a platform maintainer, I want the system to run entirely in web browsers, so that Amiron is instantly accessible without installation.

#### Acceptance Criteria

1. THE Amiron System SHALL execute in modern web browsers without requiring plugins or extensions
2. THE Amiron System SHALL utilize WebAssembly for performance-critical components
3. WHEN rendering graphics, THE Amiron System SHALL utilize WebGPU with Canvas 2D fallback for compatibility
4. THE Amiron System SHALL persist user data using IndexedDB for file storage
5. THE Amiron System SHALL load and initialize within 3 seconds on standard broadband connections

### Requirement 6

**User Story:** As an application developer, I want a clean, documented API, so that I can build third-party applications efficiently.

#### Acceptance Criteria

1. THE Ritual API SHALL provide task creation, synchronization, and termination functions
2. THE Ritual API SHALL provide window creation, event handling, and drawing functions
3. THE Ritual API SHALL provide file I/O operations with path abstraction
4. THE Ritual API SHALL provide audio playback and recording functions
5. THE Ritual API SHALL include TypeScript type definitions and code examples

### Requirement 7

**User Story:** As a system user, I want core applications included in the base system, so that I can perform basic tasks immediately after loading.

#### Acceptance Criteria

1. THE Amiron System SHALL include a text editor application with syntax highlighting
2. THE Amiron System SHALL include a file manager application with copy, move, and delete operations
3. THE Amiron System SHALL include a terminal emulator application with command execution
4. WHEN launched, each core application SHALL integrate seamlessly with the Workbench Interface
5. THE Amiron System SHALL load core applications on-demand to minimize initial load time

### Requirement 8

**User Story:** As an open-source contributor, I want modular architecture with clear boundaries, so that I can contribute to specific components without understanding the entire system.

#### Acceptance Criteria

1. THE Amiron System SHALL organize code into distinct layers: kernel, GUI, filesystem, API, and applications
2. WHEN a layer is modified, THE Amiron System SHALL require recompilation only of dependent layers
3. THE Amiron System SHALL define interface contracts between layers using TypeScript interfaces or Rust traits
4. THE Amiron System SHALL include build scripts that compile each layer independently
5. THE Amiron System SHALL provide contribution guidelines documenting each layer's responsibilities

### Requirement 9

**User Story:** As a NecroNet user, I want Amiron to integrate with the existing ecosystem, so that it feels like a natural extension of the platform.

#### Acceptance Criteria

1. THE Amiron System SHALL use the NecroNet color palette and visual design language
2. THE Amiron System SHALL be accessible from the NecroPlay interface as a resurrected application
3. WHEN launched from NecroPlay, THE Amiron System SHALL open in a new browser tab or embedded iframe
4. THE Amiron System SHALL use the same fonts and animation styles as other NecroNet applications
5. THE Amiron System SHALL increment the soul counter when launched from NecroPlay
