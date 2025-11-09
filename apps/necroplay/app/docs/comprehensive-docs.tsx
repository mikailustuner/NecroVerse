// Comprehensive documentation sections - to be added to main docs page

export const comprehensiveSections = [
  {
    id: "project-structure",
    title: "Project Structure",
    icon: "📁",
    content: `
# Project Structure

## Monorepo Architecture
NecroVerse uses a **monorepo** structure managed by **pnpm workspaces** and **Turbo**.

\`\`\`
necroverse/
├── apps/                    # Applications
│   ├── necrodev/           # Resurrection Lab (Port 3001)
│   │   ├── app/            # Next.js 14 app directory
│   │   │   ├── api/        # API routes
│   │   │   ├── components/ # React components
│   │   │   ├── lab/        # Lab page
│   │   │   └── page.tsx    # Home page
│   │   └── lib/            # Utilities
│   │
│   └── necroplay/          # Graveyard Arcade (Port 3002)
│       ├── app/            # Next.js 14 app directory
│       │   ├── docs/       # Documentation
│       │   ├── play/       # Player page
│       │   └── page.tsx    # Gallery page
│       └── lib/            # Utilities
│
├── packages/               # Shared packages
│   ├── graveyard-runtime/  # Runtime engines
│   │   ├── src/
│   │   │   ├── awt/        # AWT emulation
│   │   │   ├── converters/ # File converters
│   │   │   ├── engines/    # Runtime engines
│   │   │   ├── jvm/        # JVM components
│   │   │   ├── midp/       # MIDP emulation
│   │   │   ├── parsers/    # File parsers
│   │   │   ├── renderers/  # Renderers
│   │   │   ├── runtime/    # Runtime managers
│   │   │   └── utils/      # Utilities
│   │   └── __tests__/      # Tests
│   │
│   └── ui/                 # Shared UI components
│       └── src/
│           ├── components/ # React components
│           └── styles/     # Shared styles
│
├── supabase/              # Backend
│   ├── migrations/        # Database migrations
│   ├── config.toml        # Supabase config
│   └── seed.sql          # Seed data
│
├── docs/                  # Documentation
│   ├── api/              # API docs
│   ├── architecture/     # Architecture docs
│   ├── examples/         # Examples
│   └── user-guide/       # User guides
│
├── e2e/                  # End-to-end tests
├── .kiro/                # Kiro IDE config
│   ├── hooks/            # Git hooks
│   ├── specs/            # Specifications
│   └── steering/         # AI steering rules
│
└── Configuration files
    ├── package.json      # Root package
    ├── pnpm-workspace.yaml
    ├── turbo.json        # Turbo config
    ├── tsconfig.json     # TypeScript config
    └── playwright.config.ts
\`\`\`

---

## Key Directories

### /apps/necrodev
**Resurrection Lab** - Upload and convert legacy files

**Features:**
- File upload with drag & drop
- Real-time conversion logs
- File comparison view
- Batch conversion
- Version history

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- Supabase Client

### /apps/necroplay
**Graveyard Arcade** - Play resurrected content

**Features:**
- File gallery
- Runtime player
- Documentation
- Search & filter
- Fullscreen mode

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- Runtime engines

### /packages/graveyard-runtime
**Core runtime package** - Shared across apps

**Modules:**
- \`awt/\` - Java AWT emulation
- \`converters/\` - File format converters
- \`engines/\` - Runtime engines (SWF, JAR, XAP, DCR)
- \`jvm/\` - JVM interpreter components
- \`midp/\` - MIDP (J2ME) emulation
- \`parsers/\` - File format parsers
- \`renderers/\` - Canvas/WebGL renderers
- \`runtime/\` - Runtime managers
- \`utils/\` - Shared utilities

**Size:** ~15,000 lines of TypeScript

### /packages/ui
**Shared UI components**

**Components:**
- Button (variants: violet, cyan, warning)
- GlitchText (animated text effect)
- LoadingRing (loading spinner)
- ErrorDisplay (error messages)
- Card, Modal, Tooltip, etc.

**Styling:**
- Tailwind CSS
- Dark theme by default
- Purple/cyan accent colors
- VHS corruption effects

### /supabase
**Backend infrastructure**

**Database Tables:**
- \`files\` - Uploaded files metadata
- \`graveyard_logs\` - Conversion logs
- \`users\` - User accounts (future)

**Storage Buckets:**
- \`uploads\` - Original files (private)
- \`converted\` - Converted files (public)

**Migrations:**
- 001: Initial schema
- 002: Disable RLS (development)
- 003: Add public flag

---

## File Counts

### Total Lines of Code
- **TypeScript:** ~25,000 lines
- **React Components:** ~8,000 lines
- **CSS/Tailwind:** ~2,000 lines
- **Tests:** ~1,500 lines
- **Documentation:** ~3,000 lines

### File Breakdown
- **Source Files:** 150+
- **Test Files:** 25+
- **Config Files:** 15+
- **Documentation:** 20+

---

## Dependencies

### Production
- **next:** 14.2.33
- **react:** 18.3.1
- **@supabase/supabase-js:** 2.80.0
- **framer-motion:** 10.18.0
- **tailwindcss:** 3.4.18
- **jszip:** 3.10.1

### Development
- **typescript:** 5.9.3
- **eslint:** 8.57.1
- **prettier:** 3.6.2
- **vitest:** 1.6.1
- **playwright:** 1.56.1
- **turbo:** 1.13.4

---

## Build System

### Turbo Configuration
\`\`\`json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
\`\`\`

### Scripts
\`\`\`bash
# Development
pnpm dev              # Start all apps
pnpm dev:necrodev     # Start NecroDev only
pnpm dev:necroplay    # Start NecroPlay only

# Build
pnpm build            # Build all apps
pnpm build:necrodev   # Build NecroDev
pnpm build:necroplay  # Build NecroPlay

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests

# Linting
pnpm lint             # Lint all code
pnpm lint:fix         # Fix linting issues

# Formatting
pnpm format           # Format all code
pnpm format:check     # Check formatting
\`\`\`

---

## Environment Variables

### Required
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
NODE_ENV=development
PORT=3001  # NecroDev
PORT=3002  # NecroPlay
\`\`\`

### Setup
1. Copy \`.env.example\` to \`.env.local\`
2. Fill in Supabase credentials
3. Restart development server

---

## Ports

- **3001** - NecroDev (Resurrection Lab)
- **3002** - NecroPlay (Graveyard Arcade)
- **54321** - Supabase Local (if using)
- **54323** - Supabase Studio (if using)

---

## Git Workflow

### Branches
- \`main\` - Production
- \`develop\` - Development
- \`feature/*\` - Features
- \`fix/*\` - Bug fixes
- \`docs/*\` - Documentation

### Commit Convention
\`\`\`
💀 feat: Add new feature
🔧 fix: Fix bug
📚 docs: Update documentation
🎨 style: Code style changes
♻️ refactor: Code refactoring
✅ test: Add tests
⚡ perf: Performance improvements
\`\`\`

### Kiro Hooks
- \`on_commit\` - Dark commit ritual
- \`on_file_save\` - Auto-format
- \`on_error\` - Error tracking
- \`on_test_fail\` - Test failure handling
    `,
  },
  {
    id: "ui-components",
    title: "UI Components",
    icon: "🎨",
    content: `
# UI Component Library

## Design System

### Color Palette
\`\`\`css
--background: #0a0612    /* Deep purple-black */
--shadow: #1a0f2e        /* Dark purple */
--text: #f5f5f5          /* Off-white */
--accent-glow: #a855f7   /* Purple glow */
--highlight: #06ffa5     /* Cyan highlight */
--warning: #ff006e       /* Pink warning */
\`\`\`

### Typography
- **Font Family:** 'Orbitron', monospace
- **Sizes:** 12px, 14px, 16px, 20px, 24px, 32px, 48px, 64px
- **Weights:** 400 (normal), 700 (bold)

### Spacing
- **Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Grid:** 8px base unit

---

## Core Components

### Button
\`\`\`typescript
<Button variant="violet" onClick={handleClick}>
  Click Me
</Button>

// Variants
variant: "violet" | "cyan" | "warning" | "ghost"

// Sizes
size: "sm" | "md" | "lg"

// States
disabled: boolean
loading: boolean
\`\`\`

**Features:**
- Hover effects
- Click animations
- Loading state
- Disabled state
- Icon support

### GlitchText
\`\`\`typescript
<GlitchText intensity="high">
  Necroverse
</GlitchText>

// Props
intensity: "low" | "medium" | "high"
speed: number (ms)
\`\`\`

**Effects:**
- Random character glitching
- Color shifting
- Position jittering
- Scanline overlay

### LoadingRing
\`\`\`typescript
<LoadingRing size="lg" color="purple" />

// Props
size: "sm" | "md" | "lg"
color: "purple" | "cyan" | "white"
\`\`\`

**Animation:**
- Rotating ring
- Pulsing glow
- Smooth transitions

### ErrorDisplay
\`\`\`typescript
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>

// Props
error: Error | string
onRetry?: () => void
onDismiss?: () => void
showStack?: boolean
\`\`\`

**Features:**
- Error message
- Stack trace (optional)
- Retry button
- Dismiss button
- Auto-dismiss timer

---

## Layout Components

### Card
\`\`\`typescript
<Card variant="elevated" glow>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>

// Variants
variant: "flat" | "elevated" | "outlined"
glow: boolean
corruption: boolean  // VHS effect
\`\`\`

### Modal
\`\`\`typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="lg"
>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>

// Sizes
size: "sm" | "md" | "lg" | "xl" | "full"

// Features
- Backdrop blur
- Escape to close
- Click outside to close
- Scroll lock
- Focus trap
\`\`\`

### Drawer
\`\`\`typescript
<Drawer
  isOpen={isOpen}
  onClose={handleClose}
  position="right"
>
  Content
</Drawer>

// Positions
position: "left" | "right" | "top" | "bottom"

// Features
- Slide animation
- Backdrop
- Swipe to close (mobile)
\`\`\`

---

## Form Components

### Input
\`\`\`typescript
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={handleChange}
  error={error}
  icon={<SearchIcon />}
/>

// Types
type: "text" | "email" | "password" | "number" | "search"

// States
error: string
disabled: boolean
loading: boolean
\`\`\`

### Select
\`\`\`typescript
<Select
  options={options}
  value={value}
  onChange={handleChange}
  placeholder="Select..."
/>

// Options format
options: Array<{
  value: string
  label: string
  icon?: ReactNode
}>
\`\`\`

### FileUpload
\`\`\`typescript
<FileUpload
  accept=".swf,.jar,.xap,.dcr"
  maxSize={50 * 1024 * 1024}  // 50MB
  onUpload={handleUpload}
  multiple
/>

// Features
- Drag & drop
- File validation
- Progress bar
- Preview
- Multiple files
\`\`\`

---

## Animation Components

### FadeIn
\`\`\`typescript
<FadeIn delay={0.2} duration={0.5}>
  <Content />
</FadeIn>
\`\`\`

### SlideIn
\`\`\`typescript
<SlideIn direction="left" distance={50}>
  <Content />
</SlideIn>

// Directions
direction: "left" | "right" | "up" | "down"
\`\`\`

### ScaleIn
\`\`\`typescript
<ScaleIn from={0.8} to={1}>
  <Content />
</ScaleIn>
\`\`\`

### Glitch
\`\`\`typescript
<Glitch intensity="medium">
  <Content />
</Glitch>

// Effects
- Random glitching
- Color aberration
- Scanlines
- Noise overlay
\`\`\`

---

## Special Effects

### VHS Corruption
\`\`\`css
.vhs-corruption {
  position: relative;
  overflow: hidden;
}

.vhs-corruption::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(168, 85, 247, 0.8), 
    transparent
  );
  animation: scan 3s linear infinite;
}
\`\`\`

### Glow Effect
\`\`\`css
.glow {
  box-shadow: 
    0 0 10px rgba(168, 85, 247, 0.5),
    0 0 20px rgba(168, 85, 247, 0.3),
    0 0 30px rgba(168, 85, 247, 0.1);
}
\`\`\`

### Data Veins
\`\`\`css
.data-veins {
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(168, 85, 247, 0.5),
    transparent
  );
  animation: flow 4s ease-in-out infinite;
}
\`\`\`

---

## Responsive Design

### Breakpoints
\`\`\`css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
\`\`\`

### Mobile-First Approach
\`\`\`typescript
// Default: Mobile
<div className="text-sm md:text-base lg:text-lg">
  Responsive Text
</div>

// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>
\`\`\`

---

## Accessibility

### ARIA Labels
\`\`\`typescript
<Button
  aria-label="Upload file"
  aria-describedby="upload-help"
>
  <UploadIcon />
</Button>
\`\`\`

### Keyboard Navigation
- Tab: Navigate between elements
- Enter/Space: Activate buttons
- Escape: Close modals/drawers
- Arrow keys: Navigate lists

### Screen Reader Support
- Semantic HTML
- ARIA roles
- Alt text for images
- Focus indicators

---

## Theme Customization

### Tailwind Config
\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0a0612',
        shadow: '#1a0f2e',
        text: '#f5f5f5',
        'accent-glow': '#a855f7',
        highlight: '#06ffa5',
        warning: '#ff006e',
      },
      fontFamily: {
        sans: ['Orbitron', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'scan': 'scan 3s linear infinite',
        'flow': 'flow 4s ease-in-out infinite',
      },
    },
  },
}
\`\`\`

### CSS Variables
\`\`\`css
:root {
  --background: #0a0612;
  --shadow: #1a0f2e;
  --text: #f5f5f5;
  --accent-glow: #a855f7;
  --highlight: #06ffa5;
  --warning: #ff006e;
  
  --spacing-unit: 8px;
  --border-radius: 8px;
  --transition-speed: 0.3s;
}
\`\`\`
    `,
  },
];
