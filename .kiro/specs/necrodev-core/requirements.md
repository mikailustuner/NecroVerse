# Requirements Document

## Introduction

NecroDev Core is the resurrection IDE that enables developers to upload, analyze, and transform legacy technology files into modern web applications. It provides an AI-driven interface for code analysis, soul extraction, and modern code generation with real-time feedback and occult-themed user experience.

## Glossary

- **NecroDev**: The resurrection IDE application
- **Legacy File**: Source files from deprecated technologies (.swf, .jar, .xap, .dcr, .exe, .dll, .ocx)
- **Soul Extraction**: The process of analyzing and extracting core logic from legacy files
- **Resurrection**: Converting legacy code into modern React/TypeScript equivalents
- **Analysis Engine**: The core service that parses and understands legacy file formats
- **Code Generator**: The service that produces modern code from extracted souls
- **Resurrection Session**: A single upload-to-export workflow instance
- **Archive**: The collection of all resurrected files stored in the system

## Requirements

### Requirement 1

**User Story:** As a developer with legacy files, I want to upload files via drag-and-drop or file browser, so that I can begin the resurrection process quickly

#### Acceptance Criteria

1. WHEN a user drags a file over the upload zone, THE NecroDev SHALL display a glowing border animation
2. WHEN a user drops a valid legacy file, THE NecroDev SHALL accept the file and display upload progress
3. WHEN a user drops an invalid file type, THE NecroDev SHALL display an occult-styled error message
4. THE NecroDev SHALL support file types: .swf, .jar, .xap, .dcr, .exe, .dll, .ocx
5. THE NecroDev SHALL limit file uploads to 50MB maximum size

### Requirement 2

**User Story:** As a developer, I want to see real-time analysis of my uploaded file, so that I understand what technology is being resurrected

#### Acceptance Criteria

1. WHEN a file upload completes, THE NecroDev SHALL trigger the analysis engine automatically
2. WHILE analysis is running, THE NecroDev SHALL display a ritual-themed loading animation
3. WHEN analysis completes, THE NecroDev SHALL display technology type, complexity score, and confidence percentage
4. THE NecroDev SHALL extract metadata including original file name, size, and creation date
5. IF analysis fails, THEN THE NecroDev SHALL display the failure reason in occult terminology

### Requirement 3

**User Story:** As a developer, I want to view extracted code structure and logic, so that I can verify the soul extraction was successful

#### Acceptance Criteria

1. WHEN analysis completes, THE NecroDev SHALL display the extracted code structure in a tree view
2. THE NecroDev SHALL highlight key components: classes, functions, event handlers, and UI elements
3. WHEN a user clicks on a structure element, THE NecroDev SHALL display detailed information in a side panel
4. THE NecroDev SHALL show complexity metrics for each extracted component
5. THE NecroDev SHALL allow users to exclude specific components from resurrection

### Requirement 4

**User Story:** As a developer, I want to generate modern React/TypeScript code from the extracted soul, so that I can use the resurrected code in modern applications

#### Acceptance Criteria

1. WHEN a user clicks the "Resurrect" button, THE NecroDev SHALL trigger the code generation process
2. WHILE code generation is running, THE NecroDev SHALL display progress with occult status messages
3. WHEN generation completes, THE NecroDev SHALL display the generated code with syntax highlighting
4. THE NecroDev SHALL organize generated code into logical files: components, utilities, types, and styles
5. THE NecroDev SHALL generate TypeScript interfaces for all data structures

### Requirement 5

**User Story:** As a developer, I want to view generated code in a Monaco editor, so that I can review and understand the resurrected implementation

#### Acceptance Criteria

1. WHEN code generation completes, THE NecroDev SHALL display code in a Monaco editor instance
2. THE NecroDev SHALL apply the necro-dark theme to the editor
3. THE NecroDev SHALL provide file tabs for navigating between generated files
4. THE NecroDev SHALL enable syntax highlighting for TypeScript and JSX
5. THE NecroDev SHALL allow users to copy code to clipboard with a single click

### Requirement 6

**User Story:** As a developer, I want to export resurrected code in multiple formats, so that I can integrate it into different workflows

#### Acceptance Criteria

1. WHEN code generation completes, THE NecroDev SHALL offer export options: ZIP download, GitHub Gist, or deploy to NecroPlay
2. WHEN a user selects ZIP download, THE NecroDev SHALL package all files and trigger browser download
3. WHEN a user selects deploy to NecroPlay, THE NecroDev SHALL save the resurrected app to Supabase
4. THE NecroDev SHALL include package.json and README.md in all exports
5. THE NecroDev SHALL generate installation instructions in the README

### Requirement 7

**User Story:** As a developer, I want to see a live console feed during resurrection, so that I can monitor the process and debug issues

#### Acceptance Criteria

1. THE NecroDev SHALL display a console panel at the bottom of the interface
2. WHEN any resurrection step executes, THE NecroDev SHALL log the action with timestamp
3. THE NecroDev SHALL use occult terminology in console messages
4. THE NecroDev SHALL color-code messages: info (ghost green), warning (blood magenta), error (blood magenta)
5. THE NecroDev SHALL allow users to clear the console or export logs

### Requirement 8

**User Story:** As a developer, I want to view my resurrection history, so that I can revisit previous projects

#### Acceptance Criteria

1. THE NecroDev SHALL display an archive view showing all past resurrections
2. WHEN a user opens the archive, THE NecroDev SHALL load resurrection history from Supabase
3. THE NecroDev SHALL display each resurrection as a card with thumbnail, name, date, and technology type
4. WHEN a user clicks a history card, THE NecroDev SHALL load that resurrection session
5. THE NecroDev SHALL allow users to delete resurrections from history

### Requirement 9

**User Story:** As a developer, I want to compare original and resurrected code side-by-side, so that I can verify the transformation accuracy

#### Acceptance Criteria

1. THE NecroDev SHALL provide a comparison view with split panels
2. WHEN comparison view is active, THE NecroDev SHALL display original file structure on the left
3. WHEN comparison view is active, THE NecroDev SHALL display generated code on the right
4. THE NecroDev SHALL highlight corresponding sections between original and generated code
5. THE NecroDev SHALL allow users to toggle between comparison and full-screen code view

### Requirement 10

**User Story:** As a developer, I want to batch process multiple files, so that I can resurrect entire projects efficiently

#### Acceptance Criteria

1. THE NecroDev SHALL accept multiple file uploads simultaneously
2. WHEN multiple files are uploaded, THE NecroDev SHALL queue them for sequential processing
3. THE NecroDev SHALL display a batch progress indicator showing completed/total resurrections
4. WHEN all files are processed, THE NecroDev SHALL offer bulk export options
5. THE NecroDev SHALL allow users to cancel individual items in the batch queue
