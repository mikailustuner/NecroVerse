# Necroverse

**Where Dead Tech Breathes Again**

Necroverse is a full-stack dark-aesthetic project that resurrects dead technologies. It consists of two sub-platforms:

- **NecroDev** - Resurrection Lab: Upload and convert legacy file formats (.swf, .jar, .xap, .dcr)
- **NecroPlay** - Graveyard Arcade: Experience resurrected technologies in a hybrid runtime environment

## 🎨 Visual Aesthetic

Necroverse features a dark, cyberpunk-necromancy aesthetic with:

- **Color Palette**:
  - Background: `#0a0612` (deep cosmic black)
  - Accent Glow: `#a855f7` (neon violet)
  - Highlight: `#00fff7` (toxic aqua)
  - Warning: `#ff006e` (blood magenta)
  - Text: `#f5f5f5` (off-white)

- **Visual Effects**:
  - CRT scanline overlay
  - Pulsing hover effects
  - Bloom/glow behind active elements
  - Data veins animation
  - VHS corruption effects

## 🏗️ Project Structure

```
necroverse/
├── apps/
│   ├── necrodev/      # Resurrection Lab (port 3001)
│   └── necroplay/      # Graveyard Arcade (port 3002)
├── packages/
│   ├── graveyard-runtime/  # File conversion & runtime utilities
│   └── ui/                 # Shared UI components
├── supabase/
│   ├── migrations/     # Database migrations
│   └── seed.sql        # Seed data
└── public/
    └── assets/         # Fonts, images, sound effects
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Supabase account (for database and storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd necroverse
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/001_initial_schema.sql`
   - Create storage buckets: `uploads` (private) and `converted` (public)
   - See `SETUP.md` for detailed instructions

5. Run the development servers:
```bash
pnpm dev
```

This will start:
- NecroDev at http://localhost:3001
- NecroPlay at http://localhost:3002

## 📦 Features

### NecroDev (Resurrection Lab)

- **File Upload**: Drag & drop or browse for legacy files
- **Real-time Logs**: Live console feed showing resurrection progress
- **File Conversion**: Automatic conversion for SWF, JAR, XAP, DCR, EXE, DLL, OCX files
- **Archive View**: Grid of all resurrected files
- **File Comparison**: Compare original and converted files side-by-side
- **Version History**: Track file versions and changes
- **Batch Conversion**: Convert multiple files at once
- **Export**: Export files as PNG, GIF, or MP4

### NecroPlay (Graveyard Arcade)

- **Grid View**: Browse all resurrected experiences
- **Runtime Viewer**: Fullscreen playback with hybrid runtime
  - **SWF**: Custom runtime with ActionScript v1.0 support
  - **JAR**: JVM interpreter with exception handling
  - **XAP**: XAML parser and Silverlight renderer
  - **DCR**: Lingo interpreter with sprite management
- **File Info**: Side drawer with resurrection details and logs
- **Playback Controls**: Play/Pause/Stop, timeline scrubber, frame navigation, speed control
- **Keyboard Shortcuts**: Space, Arrow keys, F, Esc key bindings
- **Visual Enhancements**: CRT scanlines, pixel perfect mode, zoom, screenshot
- **Performance Monitoring**: FPS tracking, memory usage, render profiling
- **Sharing**: Share links, embed codes, public/private visibility
- **Comments**: Comment system for files
- **Analytics**: View statistics, performance metrics, error tracking

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Runtime**: Custom interpreters (JVM, ActionScript, Lingo)
- **Rendering**: HTML5 Canvas, WebGL
- **Audio**: Web Audio API
- **Testing**: Vitest, Playwright
- **Monorepo**: pnpm workspaces + Turborepo

## 🧪 Testing

Run tests:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📚 Documentation

- [API Reference](docs/api/README.md)
- [Architecture](docs/architecture/README.md)
- [Getting Started](docs/user-guide/getting-started.md)
- [File Format Support](docs/user-guide/file-format-support.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)
- [Contributing](CONTRIBUTING.md)

## 🎯 File Conversion

Necroverse supports conversion for:

- **SWF** (Shockwave Flash): Custom runtime with ActionScript v1.0, audio playback, interactive elements
- **JAR** (Java Archive): JVM interpreter with exception handling, method invocation, field access
- **XAP** (Silverlight): XAML parser with HTML conversion, brushes, transforms
- **DCR** (Shockwave Director): Lingo interpreter with sprite management, frame scripts
- **EXE, DLL, OCX** (Windows Executables): PE format parsing, metadata extraction

### Export Formats

- **PNG**: Export current frame as PNG image
- **GIF**: Export animation as animated GIF
- **MP4**: Export animation as MP4 video
- **WebAssembly**: Export to WebAssembly format (planned)
- **WebGL**: Export to WebGL format (planned)

## 🎮 Easter Eggs

- Click the Necroverse logo 3 times on the landing page to toggle "Blood Mode" (red accent palette)

## 📝 Commit Style

```bash
git commit -m "💀 Reanimation successful: necro-runtime online"
git commit -m "🧠 Added postMortem hook for Supabase souls"
git commit -m "⚗️ New converter MCP: SWF2JSX ritual complete"
```

## 📄 License

MIT

## 🙏 Acknowledgments

Built for the Kiroween hackathon. Git commit to the darkness.

