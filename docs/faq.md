# Frequently Asked Questions

## General

### What is Necroverse?

Necroverse is a platform for preserving and running legacy file formats in modern browsers. It allows you to upload, convert, and play legacy files like SWF, JAR, XAP, and DCR files.

### What file formats are supported?

Currently supported formats:
- **SWF** (Shockwave Flash)
- **JAR** (Java Archive)
- **XAP** (Silverlight Application)
- **DCR** (Shockwave Director)
- **EXE**, **DLL**, **OCX** (Windows executables - basic support)

### Is Necroverse free?

Yes, Necroverse is free to use. However, there may be usage limits for free accounts.

### Do I need to create an account?

Account creation is optional for basic usage, but recommended for saving files and accessing advanced features.

## File Upload

### What is the maximum file size?

Currently, the maximum file size is 100MB per file.

### Can I upload multiple files at once?

Yes, you can use the batch conversion feature to upload multiple files at once.

### What happens to my uploaded files?

Files are stored securely in Supabase Storage. You can manage your files in the dashboard.

### Can I delete my files?

Yes, you can delete your files from the dashboard.

## Playback

### How do I play a file?

1. Go to NecroPlay
2. Enter the file ID or browse your files
3. Click Play

### Can I control playback speed?

Yes, you can adjust playback speed from 0.25x to 2x using the speed controls.

### Can I navigate frame by frame?

Yes, use the arrow keys or frame navigation buttons to move frame by frame.

### Can I take screenshots?

Yes, use the screenshot button in the visual controls to capture the current frame.

## Sharing

### Can I share my files?

Yes, you can generate share links and embed codes for your files.

### Can I make files private?

Yes, you can control file visibility (public/private) in the share settings.

### Can others edit my files?

No, files are read-only. Others can view but not edit your files.

## Technical

### How does conversion work?

Files are parsed, converted to web-compatible formats, and stored for playback using runtime engines.

### What browsers are supported?

Chrome/Edge, Firefox, and Safari (latest versions).

### Does it work on mobile?

Yes, but some features may be limited on mobile devices.

### Can I use it offline?

No, Necroverse requires an internet connection for file upload and playback.

## Performance

### Why is playback slow?

Playback performance depends on:
- File complexity
- Browser performance
- System resources
- Network speed

Try reducing playback speed or closing other tabs.

### How can I improve performance?

- Use latest browser
- Close other tabs
- Disable visual enhancements
- Reduce playback speed
- Check system resources

## Troubleshooting

### File won't upload

- Check file size (max 100MB)
- Ensure file format is supported
- Check network connection
- Try refreshing the page

### File won't play

- Check browser console for errors
- Ensure file is fully loaded
- Try refreshing the page
- Check file format compatibility

### Audio not working

- Check browser audio permissions
- Ensure audio codec is supported
- Check volume settings
- Try unmuting audio

## Support

### Where can I get help?

- Check the [Troubleshooting](troubleshooting.md) guide
- Search existing issues on GitHub
- Create a new issue on GitHub

### Can I contribute?

Yes! See the [Contributing Guide](../CONTRIBUTING.md) for details.

### How do I report a bug?

Create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Browser and OS version
- Error messages (if any)

