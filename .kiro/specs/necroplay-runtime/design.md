# NecroPlay Runtime Design Document

## Overview

NecroPlay is the public arcade platform where resurrected applications are hosted and executed. Built with Next.js 14, it features a gallery view, fullscreen app runner with playback controls, performance monitoring, social features, and seamless integration with the Graveyard Runtime for executing legacy code.

## Architecture

```
apps/necroplay/
├── app/
│   ├── page.tsx                 # Gallery view
│   ├── play/[id]/page.tsx       # App runner
│   └── layout.tsx
├── components/
│   ├── AppGallery.tsx
│   ├── AppCard.tsx
│   ├── AppRunner.tsx
│   ├── PlaybackControls.tsx
│   ├── PerformanceMonitor.tsx
│   ├── InfoDrawer.tsx
│   └── CommentSection.tsx
├── services/
│   ├── runtimeEngine.ts
│   ├── performanceTracker.ts
│   └── analyticsService.ts
└── hooks/
    ├── useAppRunner.ts
    ├── usePlaybackControls.ts
    └── usePerformanceMonitor.ts
```

## Components and Interfaces

### Gallery View

```typescript
export default function NecroPlayGallery() {
  const [apps, setApps] = useState<ResurrectedApp[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const { soulCount } = useSoulCounter();

  useEffect(() => {
    loadPublicApps();
  }, [filter]);

  return (
    <div className="min-h-screen bg-void">
      <DarkHeader soulCount={soulCount} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-arcane mb-4">
            <GlitchText>The Graveyard</GlitchText>
          </h1>
          <p className="text-text-secondary">
            {apps.length} souls resurrected and counting...
          </p>
        </div>
        
        <div className="flex gap-2 mb-6">
          <FilterButton 
            active={filter === null} 
            onClick={() => setFilter(null)}
          >
            All
          </FilterButton>
          <FilterButton 
            active={filter === 'swf'} 
            onClick={() => setFilter('swf')}
          >
            Flash
          </FilterButton>
          <FilterButton 
            active={filter === 'jar'} 
            onClick={() => setFilter('jar')}
          >
            Java
          </FilterButton>
          <FilterButton 
            active={filter === 'xap'} 
            onClick={() => setFilter('xap')}
          >
            Silverlight
          </FilterButton>
          <FilterButton 
            active={filter === 'dcr'} 
            onClick={() => setFilter('dcr')}
          >
            Director
          </FilterButton>
        </div>
        
        <AppGallery apps={apps} />
      </div>
      
      <CRTOverlay />
    </div>
  );
}
```

### App Gallery

```typescript
interface AppGalleryProps {
  apps: ResurrectedApp[];
}

export const AppGallery: React.FC<AppGalleryProps> = ({ apps }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      {apps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </motion.div>
  );
};
```

### App Card

```typescript
interface AppCardProps {
  app: ResurrectedApp;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const router = useRouter();

  return (
    <motion.div
      variants={animationPresets.fadeIn}
      whileHover={{ y: -8 }}
    >
      <Card 
        hover 
        onClick={() => router.push(`/play/${app.id}`)}
        className="cursor-pointer"
      >
        <div className="aspect-video bg-void/50 rounded-t-lg overflow-hidden relative">
          {app.thumbnail ? (
            <img src={app.thumbnail} alt={app.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <SkullIcon size="xl" className="text-arcane/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-void/80 rounded text-xs text-aqua border border-aqua/30">
            {app.originalTech.toUpperCase()}
          </div>
        </div>
        
        <CardBody>
          <h3 className="text-lg font-bold text-text-primary mb-2">{app.name}</h3>
          <p className="text-text-secondary text-sm mb-4">
            Resurrected {formatDate(app.createdAt)}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-text-muted">
                <EyeIcon size="xs" />
                {app.viewCount || 0}
              </span>
              <span className="flex items-center gap-1 text-text-muted">
                <CommentIcon size="xs" />
                {app.commentCount || 0}
              </span>
            </div>
            
            {app.nftAddress && (
              <GhostIcon size="sm" className="text-ghost" title="NFT Bound" />
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
```

### App Runner

```typescript
export default function AppRunnerPage({ params }: { params: { id: string } }) {
  const { app, loading, error } = useApp(params.id);
  const { 
    isPlaying, 
    speed, 
    play, 
    pause, 
    stop, 
    setSpeed 
  } = usePlaybackControls();
  const { fps, memory, renderTime } = usePerformanceMonitor();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useKeyboardShortcuts({
    ' ': () => isPlaying ? pause() : play(),
    'Escape': () => setIsFullscreen(false),
    'f': () => setIsFullscreen(true),
    '?': () => setShowHelp(true),
  });

  if (loading) return <LoadingRitual />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-void`}>
      {!isFullscreen && <DarkHeader />}
      
      <div className="relative h-screen flex flex-col">
        <div className="flex-1 relative">
          <RuntimeCanvas app={app} isPlaying={isPlaying} speed={speed} />
          <CRTOverlay />
          
          <PerformanceMonitor 
            fps={fps} 
            memory={memory} 
            renderTime={renderTime}
            className="absolute top-4 right-4"
          />
        </div>
        
        <PlaybackControls
          isPlaying={isPlaying}
          speed={speed}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSpeedChange={setSpeed}
          onScreenshot={takeScreenshot}
          onShare={() => setShowShare(true)}
          onInfo={() => setShowInfo(true)}
        />
      </div>
      
      <Drawer isOpen={showInfo} onClose={() => setShowInfo(false)} side="right">
        <InfoDrawer app={app} />
      </Drawer>
    </div>
  );
}
```

### Playback Controls

```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onScreenshot: () => void;
  onShare: () => void;
  onInfo: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onScreenshot,
  onShare,
  onInfo
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-void/90 backdrop-blur-md border-t border-arcane/20 p-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            icon={<StopIcon />}
            onClick={onStop}
          >
            Stop
          </Button>
          
          <Select
            value={speed}
            onChange={onSpeedChange}
            options={[
              { value: 0.5, label: '0.5x' },
              { value: 1, label: '1x' },
              { value: 1.5, label: '1.5x' },
              { value: 2, label: '2x' },
            ]}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            icon={<CameraIcon />}
            onClick={onScreenshot}
          >
            Screenshot
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            icon={<ShareIcon />}
            onClick={onShare}
          >
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            icon={<InfoIcon />}
            onClick={onInfo}
          >
            Info
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
```

### Performance Monitor

```typescript
interface PerformanceMonitorProps {
  fps: number;
  memory: number;
  renderTime: number;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  fps,
  memory,
  renderTime,
  className
}) => {
  const fpsColor = fps >= 60 ? 'ghost' : fps >= 30 ? 'aqua' : 'blood';

  return (
    <div className={`bg-void/80 backdrop-blur-sm border border-arcane/30 rounded-lg p-3 ${className}`}>
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">FPS</span>
          <span className={`text-${fpsColor} font-bold`}>{fps.toFixed(0)}</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Memory</span>
          <span className="text-text-primary">{memory.toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Render</span>
          <span className="text-text-primary">{renderTime.toFixed(1)}ms</span>
        </div>
      </div>
    </div>
  );
};
```

### Runtime Canvas

```typescript
interface RuntimeCanvasProps {
  app: ResurrectedApp;
  isPlaying: boolean;
  speed: number;
}

export const RuntimeCanvas: React.FC<RuntimeCanvasProps> = ({
  app,
  isPlaying,
  speed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<RuntimeEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const runtime = new RuntimeEngine(canvasRef.current, app);
    runtimeRef.current = runtime;
    
    runtime.initialize();
    
    return () => {
      runtime.destroy();
    };
  }, [app]);

  useEffect(() => {
    if (!runtimeRef.current) return;
    
    if (isPlaying) {
      runtimeRef.current.play();
    } else {
      runtimeRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!runtimeRef.current) return;
    runtimeRef.current.setSpeed(speed);
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
```

## Services

### Runtime Engine

```typescript
export class RuntimeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private app: ResurrectedApp;
  private interpreter: Interpreter;
  private isPlaying: boolean = false;
  private speed: number = 1;
  private frameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, app: ResurrectedApp) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.app = app;
    
    // Select appropriate interpreter
    switch (app.originalTech) {
      case 'swf':
        this.interpreter = new ActionScriptInterpreter();
        break;
      case 'jar':
        this.interpreter = new JVMInterpreter();
        break;
      case 'xap':
        this.interpreter = new XAMLRenderer();
        break;
      case 'dcr':
        this.interpreter = new LingoInterpreter();
        break;
    }
  }

  async initialize() {
    await this.interpreter.load(this.app.codeFiles);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  play() {
    this.isPlaying = true;
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  private loop = () => {
    if (!this.isPlaying) return;

    this.interpreter.update(this.speed);
    this.interpreter.render(this.ctx);

    this.frameId = requestAnimationFrame(this.loop);
  };

  private resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  destroy() {
    this.pause();
    window.removeEventListener('resize', this.resize);
  }
}
```

## Data Models

```typescript
interface ResurrectedApp {
  id: string;
  name: string;
  originalTech: 'swf' | 'jar' | 'xap' | 'dcr';
  createdAt: Date;
  codeFiles: CodeFile[];
  entryPoint: string;
  thumbnail?: string;
  nftAddress?: string;
  isPublic: boolean;
  viewCount?: number;
  commentCount?: number;
  metadata?: {
    originalFileName: string;
    complexity: number;
    linesOfCode: number;
  };
}
```

## Testing Strategy

- Unit tests for runtime engine and interpreters
- Integration tests for playback controls
- E2E tests for full user journey
- Performance tests for FPS and memory usage
- Test with various resurrected apps
