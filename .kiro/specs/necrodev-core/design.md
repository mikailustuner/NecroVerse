# NecroDev Core Design Document

## Overview

NecroDev Core is the resurrection IDE that provides file upload, analysis, code generation, and export capabilities. Built with Next.js 14, it features a split-pane interface with real-time console logging, Monaco editor integration, and seamless connection to the Graveyard Runtime for legacy file processing.

## Architecture

```
apps/necrodev/
├── app/
│   ├── page.tsx                 # Main IDE interface
│   ├── archive/page.tsx         # Resurrection history
│   └── layout.tsx               # Root layout with providers
├── components/
│   ├── FileUploadZone.tsx
│   ├── AnalysisPanel.tsx
│   ├── CodeViewer.tsx
│   ├── ConsolePanel.tsx
│   ├── ActionBar.tsx
│   └── ComparisonView.tsx
├── services/
│   ├── analysisEngine.ts
│   ├── codeGenerator.ts
│   ├── resurrectionSession.ts
│   └── supabaseClient.ts
└── hooks/
    ├── useResurrection.ts
    ├── useFileUpload.ts
    └── useSoulCounter.ts
```

## Components and Interfaces

### Main IDE Interface

```typescript
export default function NecroDev() {
  const [session, setSession] = useState<ResurrectionSession | null>(null);
  const [view, setView] = useState<'editor' | 'comparison' | 'archive'>('editor');
  const { soulCount } = useSoulCounter();

  return (
    <div className="h-screen flex flex-col bg-void">
      <DarkHeader soulCount={soulCount} />
      
      <div className="flex-1 flex">
        <div className="w-1/3 border-r border-arcane/20">
          <FileUploadZone onUpload={handleUpload} />
          {session?.analysis && (
            <AnalysisPanel analysis={session.analysis} />
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <ActionBar
            session={session}
            onResurrect={handleResurrect}
            onExport={handleExport}
            onDeploy={handleDeploy}
          />
          
          {view === 'editor' && (
            <CodeViewer code={session?.resurrectedCode} />
          )}
          
          {view === 'comparison' && (
            <ComparisonView
              original={session?.originalFile}
              resurrected={session?.resurrectedCode}
            />
          )}
        </div>
      </div>
      
      <ConsolePanel logs={session?.logs || []} />
    </div>
  );
}
```

### File Upload Zone

```typescript
interface FileUploadZoneProps {
  onUpload: (file: File) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!isValidLegacyFile(file)) {
      toast.error('⚠️ The artifact resists... invalid format');
      return;
    }
    
    onUpload(file);
  };

  return (
    <motion.div
      className={`
        border-2 border-dashed rounded-lg p-8 m-4
        transition-all duration-300
        ${isDragging ? 'border-arcane bg-arcane/10' : 'border-arcane/30'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <SkullIcon className="mx-auto mb-4 text-arcane" size="xl" />
        <p className="text-text-primary mb-2">
          Drop legacy files to begin resurrection
        </p>
        <p className="text-text-muted text-sm">
          .swf, .jar, .xap, .dcr, .exe, .dll, .ocx
        </p>
        <Button variant="ghost" className="mt-4">
          Or browse files
        </Button>
      </div>
    </motion.div>
  );
};
```

### Analysis Panel

```typescript
interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  return (
    <Card className="m-4">
      <CardHeader>
        <h3 className="text-arcane font-bold">Soul Analysis</h3>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm">Technology</label>
            <p className="text-text-primary font-mono">{analysis.technology}</p>
          </div>
          
          <div>
            <label className="text-text-secondary text-sm">Complexity</label>
            <ProgressBar 
              value={analysis.complexity} 
              max={100}
              color={analysis.complexity > 70 ? 'blood' : 'ghost'}
            />
          </div>
          
          <div>
            <label className="text-text-secondary text-sm">Confidence</label>
            <p className="text-ghost font-bold">{analysis.confidence}%</p>
          </div>
          
          <div>
            <label className="text-text-secondary text-sm">Extracted Components</label>
            <ul className="mt-2 space-y-1">
              {analysis.extractedLogic.map((component, i) => (
                <li key={i} className="text-text-primary text-sm flex items-center gap-2">
                  <LightningIcon size="xs" className="text-aqua" />
                  {component.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
```

### Code Viewer

```typescript
interface CodeViewerProps {
  code?: ResurrectedCode;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const [activeFile, setActiveFile] = useState(0);

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">No resurrected code yet...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex border-b border-arcane/20 overflow-x-auto">
        {code.files.map((file, i) => (
          <button
            key={i}
            onClick={() => setActiveFile(i)}
            className={`
              px-4 py-2 text-sm font-mono
              ${activeFile === i 
                ? 'bg-arcane/20 text-arcane border-b-2 border-arcane' 
                : 'text-text-secondary hover:text-text-primary'}
            `}
          >
            {file.path}
          </button>
        ))}
      </div>
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language="typescript"
          theme="necro-dark"
          value={code.files[activeFile].content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code',
          }}
        />
        
        <button
          onClick={() => copyToClipboard(code.files[activeFile].content)}
          className="absolute top-4 right-4 p-2 bg-void/80 border border-arcane/30 rounded hover:border-arcane"
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
};
```

### Console Panel

```typescript
interface ConsolePanelProps {
  logs: LogEntry[];
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs }) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-48 border-t border-arcane/20 bg-void/50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-arcane/20">
        <h3 className="text-arcane font-mono text-sm">Ritual Console</h3>
        <button className="text-text-secondary hover:text-blood text-sm">
          Clear
        </button>
      </div>
      
      <div ref={consoleRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 ${logColors[log.type]}`}>
            <span className="text-text-muted">[{log.timestamp}]</span>
            {' '}
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Services

### Analysis Engine

```typescript
export class AnalysisEngine {
  async analyze(file: File): Promise<AnalysisResult> {
    const buffer = await file.arrayBuffer();
    const technology = this.detectTechnology(file.name, buffer);
    
    let parser: Parser;
    switch (technology) {
      case 'swf':
        parser = new SWFParser();
        break;
      case 'jar':
        parser = new JARParser();
        break;
      case 'xap':
        parser = new XAPParser();
        break;
      case 'dcr':
        parser = new DCRParser();
        break;
      default:
        throw new Error('Unsupported technology');
    }
    
    const extractedLogic = await parser.parse(buffer);
    const complexity = this.calculateComplexity(extractedLogic);
    const confidence = this.calculateConfidence(extractedLogic);
    
    return {
      technology,
      extractedLogic,
      dependencies: parser.getDependencies(),
      complexity,
      confidence
    };
  }
  
  private detectTechnology(filename: string, buffer: ArrayBuffer): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Verify with magic numbers
    const view = new DataView(buffer);
    if (ext === 'swf' && (view.getUint8(0) === 0x46 || view.getUint8(0) === 0x43)) {
      return 'swf';
    }
    // ... other magic number checks
    
    return ext || 'unknown';
  }
}
```

### Code Generator

```typescript
export class CodeGenerator {
  async generate(analysis: AnalysisResult): Promise<ResurrectedCode> {
    const files: CodeFile[] = [];
    
    // Generate component files
    for (const component of analysis.extractedLogic) {
      const code = await this.generateComponent(component);
      files.push({
        path: `src/components/${component.name}.tsx`,
        content: code,
        type: 'component'
      });
    }
    
    // Generate types
    const types = this.generateTypes(analysis.extractedLogic);
    files.push({
      path: 'src/types/index.ts',
      content: types,
      type: 'utility'
    });
    
    // Generate entry point
    const entryPoint = this.generateEntryPoint(analysis.extractedLogic);
    files.push({
      path: 'src/App.tsx',
      content: entryPoint,
      type: 'component'
    });
    
    return {
      language: 'typescript',
      files,
      entryPoint: 'src/App.tsx',
      framework: 'react'
    };
  }
  
  private async generateComponent(component: CodeStructure): Promise<string> {
    return `
import React from 'react';

interface ${component.name}Props {
  ${component.props.map(p => `${p.name}: ${p.type};`).join('\n  ')}
}

export const ${component.name}: React.FC<${component.name}Props> = ({
  ${component.props.map(p => p.name).join(',\n  ')}
}) => {
  ${component.logic}
  
  return (
    <div className="necro-component">
      {/* Resurrected from ${component.originalSource} */}
      ${component.render}
    </div>
  );
};
    `.trim();
  }
}
```

## Data Models

```typescript
interface ResurrectionSession {
  id: string;
  originalFile: File;
  analysis?: AnalysisResult;
  resurrectedCode?: ResurrectedCode;
  logs: LogEntry[];
  status: 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';
  createdAt: Date;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface AnalysisResult {
  technology: string;
  extractedLogic: CodeStructure[];
  dependencies: string[];
  complexity: number;
  confidence: number;
}

interface CodeStructure {
  name: string;
  type: 'class' | 'function' | 'component' | 'handler';
  props: Array<{ name: string; type: string }>;
  logic: string;
  render?: string;
  originalSource: string;
}
```

## Error Handling

All errors displayed with occult messaging:

```typescript
const errorMessages = {
  INVALID_FILE: '⚠️ The artifact resists resurrection... invalid format detected',
  FILE_TOO_LARGE: '☠️ The soul is too vast... file exceeds 50MB',
  PARSE_ERROR: '⚡ The binding ritual failed... unable to parse file structure',
  GENERATION_ERROR: '🌑 The manifestation falters... code generation incomplete',
  NETWORK_ERROR: '👻 The void consumes the connection... try again',
};
```

## Testing Strategy

- Unit tests for analysis engine and code generator
- Integration tests for full resurrection flow
- E2E tests with Playwright for UI interactions
- Test with sample legacy files for each format
- Performance tests for large file handling
