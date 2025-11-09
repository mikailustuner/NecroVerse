# File Format Support

This document describes the file formats supported by Necroverse and their capabilities.

## SWF (Shockwave Flash)

### Supported Features

- **ActionScript v1.0**: Full interpreter support
- **Timeline Animation**: Frame-by-frame playback
- **Audio Playback**: MP3 and ADPCM audio
- **Interactive Elements**: Buttons, sprites, drag operations
- **Shapes**: Vector graphics rendering
- **Text**: Text rendering support

### Limitations

- ActionScript v2.0+ not supported
- Some advanced SWF tags may not be fully supported
- Video playback not yet implemented

## JAR (Java Archive)

### Supported Features

- **Java Bytecode**: Basic JVM interpreter
- **Exception Handling**: Try-catch-finally blocks
- **Method Invocation**: Virtual, static, special methods
- **Field Access**: Static and instance fields
- **Array Operations**: Array load/store operations

### Limitations

- Not all Java bytecode opcodes are supported
- Reflection not supported
- Native methods not supported
- Some advanced Java features may not work

## XAP (Silverlight Application)

### Supported Features

- **XAML Parsing**: Full XML parsing
- **Brushes**: SolidColorBrush, LinearGradientBrush, RadialGradientBrush
- **Transforms**: Translate, Rotate, Scale, Skew
- **Elements**: Canvas, Rectangle, Ellipse, TextBlock, Button, Path
- **Attached Properties**: Canvas.Left, Canvas.Top, etc.

### Limitations

- Some advanced XAML features may not be supported
- MediaElement not yet implemented
- Some Silverlight-specific features may not work

## DCR (Shockwave Director)

### Supported Features

- **Lingo Scripts**: Basic Lingo interpreter
- **Sprite Channels**: Sprite channel management
- **Frame Scripts**: Frame-based script execution
- **Timeline Control**: Play, stop, goto frame

### Limitations

- Not all Lingo commands are supported
- Some Director-specific features may not work
- Advanced Lingo features may not be supported

## EXE, DLL, OCX (Windows Executables)

### Supported Features

- **PE Format Parsing**: Basic PE header parsing
- **Metadata Extraction**: Version, sections, timestamps

### Limitations

- Execution not yet implemented
- Requires WebAssembly runtime (planned)
- Some advanced features may not be supported

## Conversion Pipeline

Files are converted through the following pipeline:

1. **Upload**: File uploaded to Supabase Storage
2. **Detection**: File type detected by extension and content
3. **Parsing**: File parsed into internal representation
4. **Conversion**: File converted to web-compatible format
5. **Storage**: Converted file stored in database
6. **Playback**: File played using appropriate runtime engine

## Export Formats

### PNG

Export current frame as PNG image.

### GIF

Export animation as animated GIF.

### MP4

Export animation as MP4 video.

### WebAssembly

Export to WebAssembly format (planned).

### WebGL

Export to WebGL format (planned).

