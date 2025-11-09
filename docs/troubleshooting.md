# Troubleshooting

Common issues and solutions for Necroverse.

## File Upload Issues

### File Not Uploading

**Problem**: File upload fails or hangs.

**Solutions**:
- Check file size (max 100MB)
- Ensure file format is supported
- Check network connection
- Try refreshing the page

### File Type Not Recognized

**Problem**: File type not detected correctly.

**Solutions**:
- Ensure file has correct extension (.swf, .jar, .xap, .dcr)
- Check file is not corrupted
- Try renaming file with correct extension

## Playback Issues

### File Not Playing

**Problem**: File uploads but doesn't play.

**Solutions**:
- Check browser console for errors
- Ensure file is fully loaded
- Try refreshing the page
- Check file format compatibility

### Audio Not Playing

**Problem**: Audio doesn't play in SWF files.

**Solutions**:
- Check browser audio permissions
- Ensure audio codec is supported (MP3, ADPCM)
- Check volume settings
- Try unmuting audio

### Slow Performance

**Problem**: Playback is slow or stuttering.

**Solutions**:
- Check browser performance
- Reduce playback speed
- Close other tabs/applications
- Check memory usage
- Try disabling visual enhancements

### Rendering Issues

**Problem**: Graphics not rendering correctly.

**Solutions**:
- Check browser console for errors
- Try disabling pixel perfect mode
- Check zoom level
- Try different browser

## Conversion Issues

### Conversion Fails

**Problem**: File conversion fails.

**Solutions**:
- Check file is not corrupted
- Ensure file format is supported
- Check file size limits
- Try a different file

### Conversion Takes Too Long

**Problem**: Conversion takes a very long time.

**Solutions**:
- Large files take longer to convert
- Check network connection
- Try smaller file first
- Wait for conversion to complete

## Error Messages

### "Unsupported file type"

**Problem**: File type not supported.

**Solution**: Ensure file has supported extension (.swf, .jar, .xap, .dcr, .exe, .dll, .ocx).

### "File too large"

**Problem**: File exceeds size limit.

**Solution**: File must be under 100MB. Try compressing or splitting the file.

### "Conversion failed"

**Problem**: File conversion failed.

**Solution**: File may be corrupted or in unsupported format. Try a different file.

### "Runtime error"

**Problem**: Error during file execution.

**Solution**: Check browser console for details. File may have unsupported features.

## Browser Compatibility

### Supported Browsers

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Known Issues

- Some features may not work in older browsers
- WebGL requires modern browser
- Audio requires browser audio support

## Performance Tips

1. **Close other tabs** to free up memory
2. **Disable extensions** that may interfere
3. **Use latest browser** for best performance
4. **Check system resources** (CPU, memory)
5. **Reduce playback speed** for better performance

## Getting Help

If you're still experiencing issues:

1. Check the [FAQ](faq.md) for common questions
2. Search existing issues on GitHub
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Browser and OS version
   - Error messages (if any)

