# 🔧 SHAREH UB - TROUBLESHOOTING GUIDE

## ❌ Files Not Syncing Between Devices?

### ✅ Quick Fix Checklist

1. **Both devices have same share code?**
   - Device A Share Code: ABC12345
   - Device B Should have: ABC12345
   - ✅ Fix: Make sure you copied the code correctly

2. **Devices are connected in "My Devices"?**
   - Go to "My Devices" tab
   - Should see connected device listed
   - If empty, click "Add Device" and enter code
   - ✅ Fix: Add device if missing

3. **Both using same browser?**
   - Chrome + Chrome = Works ✅
   - Safari + Safari = Works ✅
   - Chrome + Safari = May not work ❌
   - ✅ Fix: Use same browser on both devices

4. **On same WiFi network?**
   - Both devices connected to same WiFi = Works ✅
   - One on WiFi, one on 4G = Doesn't work ❌
   - ✅ Fix: Connect both to same WiFi

5. **Uploaded a file after connecting?**
   - Upload file AFTER devices are connected
   - Don't upload before connecting
   - Wait 2-3 seconds for sync
   - ✅ Fix: Re-upload file after connection

---

## 🔄 How to Test Syncing

### Simple Test:
```
1. Open ShareHub on Computer (Window A)
2. Open ShareHub on Computer (Window B)
   - Use different browser or private window
3. In Window A, go to "My Devices"
4. Click "Add Device"
5. Copy share code from Window B
6. Paste in Window A and connect
7. Upload a file in Window A
8. Check Window B after 2 seconds
9. File should appear! ✅
```

---

## 🚀 Fixing Common Issues

### Issue: "Cannot connect to your own device!"

**Cause:** You tried to connect a device to itself
**Solution:** Make sure you're connecting to a DIFFERENT device
**How to fix:**
- Phone: Copy code from PHONE
- Computer: Paste into COMPUTER
- NOT: Copy from PHONE, paste into PHONE

### Issue: Files appear for a second then disappear

**Cause:** Browser cache or localStorage issue
**Solution:**
1. Press F12 (open DevTools)
2. Click "Storage" tab
3. Click "Clear All"
4. Close DevTools
5. Refresh page
6. Reconnect devices

### Issue: "Already connected to this device!"

**Cause:** Device already in your connections list
**Solution:**
1. Go to "My Devices" tab
2. Look for the device in list
3. If already there, don't add again
4. Click "Refresh" button to refresh list

### Issue: Nothing happens when I click "Add Device"

**Cause:** Browser blocked modal dialog
**Solution:**
1. Check if a dialog appeared behind window
2. Close any popups
3. Try again in different browser
4. Or use QR code method instead

### Issue: QR scanner not working on phone

**Cause:** Camera permission not granted
**Solution:**
1. Phone Settings → Chrome → Permissions
2. Enable Camera permission
3. Reload ShareHub page
4. Try "Start Camera Scan" again

---

## 🎯 Step-by-Step Connection Test

### Using Two Phones on Same WiFi:

```
PHONE A:
1. Open ShareHub
2. Go to "Share Code" tab
3. Copy the 8-character code
   Example: ABCD1234

PHONE B:
1. Open ShareHub
2. Go to "My Devices" tab
3. Click "Add Device"
4. Paste code: ABCD1234
5. Device Name: "Phone A"
6. Click "Connect"
7. Should say "Connected!"

TEST SYNC:
PHONE A:
1. Upload a photo
2. Wait 2 seconds
3. Check "Uploaded Files"

PHONE B:
1. Go to "Uploaded Files"
2. Photo from Phone A should appear!
3. ✅ Syncing works!
```

---

## 🔍 Debug Information

### Check Device Info:
```
Go to Settings (⚙️ More Settings)
You should see:
- Device ID: DEV-XXXXXXX
- Share Code: XXXXXXXX
- Files Uploaded: (number)
- Connected Devices: (number)
```

### Check Sync Status:
Look at **bottom-left corner** of screen:
```
✅ "🔄 Syncing..." = Active sync
✅ "Synced!" = Last sync successful
❌ Nothing visible = No connection
```

---

## 💻 Network Troubleshooting

### Finding Your Computer's IP Address:

**Windows:**
```
1. Open Command Prompt
2. Type: ipconfig
3. Look for "IPv4 Address"
4. Example: 192.168.1.100
5. On phone, visit: http://192.168.1.100:8000
```

**Mac:**
```
1. Open Terminal
2. Type: ifconfig
3. Look for "inet" (not inet6)
4. Example: 192.168.1.100
5. On phone, visit: http://192.168.1.100:8000
```

### Check Network Connection:
```
✅ Both on WiFi "HOME-5G"
✅ Both on WiFi "HOME"
❌ One on "HOME", one on "HOME-5G" (different networks)
❌ One on WiFi, one on 4G (different networks)
```

---

## 📱 Mobile-Specific Fixes

### iPhone Not Syncing:

**Problem:** Files not appearing on iPhone
**Checklist:**
- [ ] Both on same WiFi
- [ ] iPhone has internet connection
- [ ] Device is in "My Devices" list
- [ ] Using same browser (Safari on both)
- [ ] Wait 3-5 seconds after upload

**Fix:**
1. Close Safari completely
2. Force-close app (swipe up)
3. Reopen ShareHub
4. Refresh page
5. Reconnect device
6. Try upload again

### Android Not Syncing:

**Problem:** Files not appearing on Android
**Checklist:**
- [ ] Chrome app is up to date
- [ ] Same WiFi network
- [ ] Camera permission granted
- [ ] 2-3 seconds wait time

**Fix:**
1. Close Chrome app
2. Clear Chrome cache (Settings → Privacy)
3. Reopen ShareHub
4. Check "My Devices" tab
5. Click "Refresh" button
6. Try upload again

---

## 🎓 Understanding the Sync System

### How SessionStorage Works:
```
Computer:
- Uploads file.txt
- Stores in: shareh_files_ABC12345
- Data includes: file content + metadata

Phone:
- Checks shareh_files_ABC12345 every 2 seconds
- If new file found, imports it
- Shows notification "New file from device!"
```

### Why 2-Second Delay?
```
- Prevents excessive checking (saves battery)
- Allows server to process (if hosted)
- Good balance between speed and efficiency
- You'll see file within 2-3 seconds of upload
```

### What If Browser Tab Closes?
```
❌ Tab closed = Sync stops
✅ Same device, new tab = Needs reconnection
✅ Different tab = Can continue syncing

Solution: Keep tabs open while syncing
```

---

## 📊 Browser Compatibility

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Best |
| Firefox | ✅ | ✅ | Good |
| Safari | ✅ | ✅ | Good |
| Edge | ✅ | ✅ | Good |
| Opera | ✅ | ✅ | Good |

**Cross-browser issue:**
- Chrome Desktop + Safari Phone = May have issues
- Solution: Use same browser on both

---

## 🆘 Still Having Issues?

### Get More Details:
1. Press F12 (Developer Tools)
2. Click "Console" tab
3. Look for error messages
4. Screenshot any errors
5. Share with support

### What to Check:
```javascript
// In console, type:
console.log(localStorage.getItem('deviceId'))
// Should show your device ID

console.log(localStorage.getItem('shareCode'))
// Should show your share code

console.log(JSON.parse(localStorage.getItem('shareHubDevices')))
// Should show connected devices
```

---

## ✅ Verify Everything Works

### Full Test Checklist:
- [ ] Can see "Share Code" (8 characters)
- [ ] Can generate new "Share Code" via F5
- [ ] Can see QR code in "QR Code" tab
- [ ] Can upload a file
- [ ] Can download uploaded file
- [ ] Can add device with share code
- [ ] Device shows in "My Devices" list
- [ ] Can see connected device
- [ ] Can upload file after connecting
- [ ] File syncs to other device within 3 seconds

If ALL checked ✅ = System works correctly!

---

## 🎊 Success Indicators

### Files Are Syncing:
```
✅ File uploaded on Device A
✅ File appears on Device B within 3 seconds
✅ Notification appears: "New file from..."
✅ File is in "Uploaded Files" list
✅ Can download the file
```

### System Is Working:
```
✅ Sync status shows "Syncing..." at bottom
✅ Devices stay connected after reload
✅ Multiple devices can sync together
✅ No error messages in console
✅ Smooth, responsive UI
```

---

**Need more help?** Check DEVICE_SYNC_GUIDE.md for detailed instructions!

Remember: **Same WiFi network + Same browser + Connected devices = Syncing works!** ✅
