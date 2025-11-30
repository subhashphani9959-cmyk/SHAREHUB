# 🚀 ShareHub - File & App Sharing Application

A modern, privacy-focused file sharing web application that lets you share files and applications between your devices instantly.

## Features

✨ **Key Features:**
- 📤 **File Upload** - Drag and drop or click to upload files (up to 100 MB total storage)
- 🔗 **Easy Sharing** - Share unique codes to connect devices
- 📱 **QR Code Support** - Scan QR codes to connect devices quickly
- 💾 **Local Storage** - All files stored locally on your device (no cloud)
- 📊 **Stats Dashboard** - Track files, storage usage, and device connections
- 📥 **Downloads** - Download files from your connected devices
- 🗑️ **Management** - Delete files and manage storage
- 💾 **Backup & Restore** - Export and import your data as JSON backup
- 🔐 **Privacy First** - Everything stays on your device or local network

## Getting Started

### Method 1: Direct Browser Open
1. Simply open `index.html` in any modern web browser
2. No installation or server required!

### Method 2: Local Server (Recommended)
For better functionality, serve the files using a local server:

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Using Node.js (with http-server):**
```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

## How to Use

### Upload Files
1. Go to the "📤 Upload Files" section
2. Click the upload area or drag files into it
3. Select multiple files to upload at once
4. Files are instantly stored locally

### Share with Another Device
1. Copy your **Share Code** from the "Share & Connect" section
2. On another device, open ShareHub and go to **My Devices** tab
3. Click "➕ Add New Device" and paste the share code
4. Both devices are now connected!

### Alternative: Use QR Code
1. Go to the **QR Code** tab
2. Point another device's camera at the QR code (or scan with phone)
3. Devices will connect automatically

### Download Files
1. Find the file you want in the uploaded files list
2. Click the "⬇️ Download" button
3. File saves to your downloads folder

### Backup Your Data
1. Go to **Settings & Advanced** section
2. Click "💾 Export as ZIP" to create a backup
3. Store the backup file somewhere safe
4. Use "📂 Import from ZIP" to restore later

## Technical Details

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Storage:** Browser LocalStorage (IndexedDB compatible)
- **QR Codes:** QRCode.js library
- **No Dependencies:** Works with no server or installation needed

### Storage Information
- **Max Storage:** 100 MB per device
- **Storage Type:** Browser LocalStorage
- **Data Persistence:** Data persists until manually cleared or browser cache is cleared

### Browser Compatibility
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Architecture

### File Structure
```
share me/
├── index.html      # Main UI (HTML structure and styles)
├── app.js          # Application logic
└── README.md       # This file
```

### How It Works

1. **Local Storage** - Files are stored in your browser's localStorage
2. **Device Identification** - Each device gets a unique ID automatically
3. **Share Codes** - Alphanumeric codes enable device pairing
4. **QR Codes** - Generated from device info and share code
5. **File Management** - Upload, download, delete, and backup files
6. **Device Registry** - Connected devices are stored locally

## Advanced Features

### Import/Export Backup
- Export all your files as a JSON backup file
- Import previously exported backups
- Useful for transferring between devices or creating backups

### Device Management
- See all connected devices
- Track device names and last connection time
- Add new devices by sharing codes

### Statistics Dashboard
- Total files uploaded
- Total storage used
- Storage usage percentage
- Real-time updates

## Privacy & Security

🔒 **Privacy Features:**
- ✅ All files stored locally on your device
- ✅ No data sent to external servers
- ✅ No account required
- ✅ No tracking or analytics
- ✅ Works offline

## Troubleshooting

### Files Not Appearing
- Make sure you're using the same browser on the same device
- Clear browser cache and reload the page
- Check if LocalStorage is enabled in your browser settings

### Storage Limit Reached
- Export and backup your current files
- Clear some old files using the "🗑️ Clear All Files" button
- Import the backup after clearing

### QR Code Not Showing
- Wait a few seconds for it to load
- Refresh the page
- Use the Share Code method instead

### Share Code Not Working
- Make sure both devices are on the same network
- Try refreshing both devices
- Generate a new share code by pressing F5

## Tips & Best Practices

1. **Backup Regularly** - Use the export feature to backup important files
2. **Clean Up** - Delete old files to make room for new ones
3. **Multiple Devices** - You can connect multiple devices at once
4. **Network** - For best results, devices should be on the same WiFi network
5. **Browser** - Use the same browser for consistency

## Limitations

- **Storage Limit:** 100 MB per device (browser limitation)
- **File Types:** Works with any file type (limited by storage)
- **Network:** Best on local network, not optimized for internet sharing
- **Device Sync:** Manual sharing required (not automatic cloud sync)

## Future Enhancements

Potential features for future versions:
- [ ] Database backend for remote sharing
- [ ] End-to-end encryption
- [ ] Real-time file sync
- [ ] Web socket support for instant updates
- [ ] Mobile app version
- [ ] Folder support
- [ ] File preview
- [ ] Bandwidth throttling
- [ ] Share links with passwords
- [ ] File versioning

## License

This project is provided as-is for personal use.

## Support

For issues or suggestions:
1. Check the Troubleshooting section above
2. Try clearing browser cache and localStorage
3. Test in a different browser
4. Check browser console for error messages (F12)

---

**Enjoy sharing! 🎉**

Made with ❤️ for easy file sharing between your devices.
