// ShareHub - File Sharing Application Logic

class ShareHub {
    constructor() {
        this.files = this.loadFiles();
        this.deviceId = this.generateDeviceId();
        this.shareCode = this.generateShareCode();
        this.maxStorageMB = 100; // 100 MB limit
        this.connectedDevices = this.loadDevices();
        this.syncEnabled = true;
        this.syncInterval = null;
        
        this.initializeEventListeners();
        this.updateUI();
        this.generateQRCode();
        this.startSync();
        this.checkForIncomingShares();
    }

    // Start real-time sync
    startSync() {
        // Check for synced files every 2 seconds
        this.syncInterval = setInterval(() => {
            this.syncFilesWithConnectedDevices();
        }, 2000);
    }

    // Sync files with connected devices using LocalStorage Bridge
    syncFilesWithConnectedDevices() {
        // Store current device's files in a sharable location
        const shareKey = `shareh_files_${this.shareCode}`;
        const filesData = {
            deviceId: this.deviceId,
            shareCode: this.shareCode,
            files: this.files.map(f => ({
                id: f.id,
                name: f.name,
                size: f.size,
                type: f.type,
                uploadDate: f.uploadDate,
                uploadedFrom: f.uploadedFrom,
                data: this.arrayBufferToBase64(f.data)
            })),
            timestamp: new Date().getTime(),
            deviceName: this.getDeviceName()
        };
        
        // Store with timestamp
        sessionStorage.setItem(shareKey, JSON.stringify(filesData));
    }

    // Check for incoming shares from connected devices
    checkForIncomingShares() {
        // Periodically check for files from other devices
        setInterval(() => {
            if (this.connectedDevices.length === 0) return;

            this.connectedDevices.forEach(device => {
                const incomingKey = `shareh_files_${device.shareCode}`;
                const incomingData = sessionStorage.getItem(incomingKey);
                
                if (incomingData) {
                    try {
                        const remoteFiles = JSON.parse(incomingData);
                        if (remoteFiles.deviceId !== this.deviceId) {
                            this.mergeRemoteFiles(remoteFiles, device);
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }
            });
        }, 2000);
    }

    // Merge remote files from connected device
    mergeRemoteFiles(remoteData, device) {
        let newFilesAdded = 0;
        
        remoteData.files.forEach(remoteFile => {
            // Check if file already exists
            if (!this.files.some(f => f.id === remoteFile.id)) {
                const newFile = {
                    id: remoteFile.id,
                    name: remoteFile.name,
                    size: remoteFile.size,
                    type: remoteFile.type,
                    uploadDate: remoteFile.uploadDate,
                    uploadedFrom: remoteFile.uploadedFrom,
                    data: this.base64ToArrayBuffer(remoteFile.data),
                    receivedFrom: device.name || 'Connected Device'
                };
                
                this.files.push(newFile);
                newFilesAdded++;
            }
        });

        if (newFilesAdded > 0) {
            this.saveFiles();
            this.updateUI();
            this.updateSyncStatus('Synced!', true);
            this.showNotification(`✅ ${newFilesAdded} new file(s) from ${device.name || 'device'}!`, 'success');
        }
    }

    // Update sync status indicator
    updateSyncStatus(text, isActive) {
        const status = document.getElementById('syncStatus');
        if (status) {
            status.textContent = text;
            if (isActive) {
                status.classList.add('active');
            } else {
                status.classList.remove('active');
            }
        }
    }

    // Get device name based on user agent
    getDeviceName() {
        const ua = navigator.userAgent;
        if (ua.includes('iPhone')) return '📱 iPhone';
        if (ua.includes('iPad')) return '📱 iPad';
        if (ua.includes('Android')) return '📱 Android';
        if (ua.includes('Windows')) return '💻 Windows';
        if (ua.includes('Mac')) return '🍎 Mac';
        if (ua.includes('Linux')) return '🐧 Linux';
        return '💻 Device';
    }

    // Generate unique device ID
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    // Generate share code
    generateShareCode() {
        let shareCode = localStorage.getItem('shareCode');
        if (!shareCode) {
            shareCode = this.generateRandomCode(8);
            localStorage.setItem('shareCode', shareCode);
        }
        return shareCode;
    }

    // Generate random alphanumeric code
    generateRandomCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Share code copy
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            this.copyToClipboard(this.shareCode);
        });

        // QR code download
        document.getElementById('downloadQRBtn').addEventListener('click', () => {
            this.downloadQRCode();
        });

        // QR Scanner buttons
        document.getElementById('startScannerBtn').addEventListener('click', () => {
            this.startQRScanner();
        });

        document.getElementById('uploadQRBtn').addEventListener('click', () => {
            document.getElementById('qrImageInput').click();
        });

        document.getElementById('qrImageInput').addEventListener('change', (e) => {
            this.scanQRFromImage(e.target.files[0]);
        });

        // Add device button
        document.getElementById('addDeviceBtn').addEventListener('click', () => {
            this.showAddDeviceDialog();
        });

        // Refresh devices button
        if (document.getElementById('refreshDevicesBtn')) {
            document.getElementById('refreshDevicesBtn').addEventListener('click', () => {
                this.updateDevicesList();
                this.showNotification('Device list refreshed', 'success');
            });
        }

        // Clear storage
        document.getElementById('clearStorageBtn').addEventListener('click', () => {
            if (confirm('Are you sure? This will delete all uploaded files.')) {
                this.clearAllFiles();
            }
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportAsZip();
        });

        // Import data
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importInput').click();
        });

        document.getElementById('importInput').addEventListener('change', (e) => {
            this.importFromZip(e.target.files[0]);
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
    }

    // Handle file uploads
    handleFiles(fileList) {
        const files = Array.from(fileList);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: 'FILE-' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result,
                    uploadDate: new Date().toLocaleString(),
                    uploadedFrom: this.deviceId
                };

                // Check storage limit
                const totalSize = this.getTotalStorageUsed() + file.size;
                if (totalSize > this.maxStorageMB * 1024 * 1024) {
                    this.showNotification('Storage limit reached! Max ' + this.maxStorageMB + ' MB', 'error');
                    return;
                }

                this.files.push(fileData);
                this.saveFiles();
                this.updateUI();
                this.showNotification(`✅ "${file.name}" uploaded successfully!`, 'success');
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Save files to local storage
    saveFiles() {
        // Convert ArrayBuffer to string for storage
        const filesForStorage = this.files.map(file => ({
            ...file,
            data: this.arrayBufferToBase64(file.data)
        }));
        localStorage.setItem('shareHubFiles', JSON.stringify(filesForStorage));
    }

    // Load files from local storage
    loadFiles() {
        const stored = localStorage.getItem('shareHubFiles');
        if (!stored) return [];
        
        const files = JSON.parse(stored);
        return files.map(file => ({
            ...file,
            data: this.base64ToArrayBuffer(file.data)
        }));
    }

    // Convert ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Convert Base64 to ArrayBuffer
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Load connected devices
    loadDevices() {
        const stored = localStorage.getItem('shareHubDevices');
        return stored ? JSON.parse(stored) : [];
    }

    // Save connected devices
    saveDevices() {
        localStorage.setItem('shareHubDevices', JSON.stringify(this.connectedDevices));
    }

    // Get total storage used
    getTotalStorageUsed() {
        return this.files.reduce((total, file) => total + file.size, 0);
    }

    // Update UI elements
    updateUI() {
        this.updateFilesList();
        this.updateStats();
        this.updateShareCode();
        this.updateDevicesList();
    }

    // Update files list display
    updateFilesList() {
        const filesList = document.getElementById('filesList');
        
        if (this.files.length === 0) {
            filesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No files uploaded yet</p></div>';
            return;
        }

        filesList.innerHTML = this.files.map(file => {
            const sourceInfo = file.receivedFrom ? ` (from ${file.receivedFrom})` : '';
            return `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">📄 ${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)} • ${file.uploadDate}${sourceInfo}</div>
                    </div>
                    <div class="file-actions">
                        <button class="btn-download" onclick="shareHub.downloadFile('${file.id}')">⬇️ Download</button>
                        <button class="btn-delete" onclick="shareHub.deleteFile('${file.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update stats display
    updateStats() {
        const totalSize = this.getTotalStorageUsed();
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        const storageUsedPercent = ((totalSize / (this.maxStorageMB * 1024 * 1024)) * 100).toFixed(0);

        document.getElementById('fileCount').textContent = this.files.length;
        document.getElementById('totalSize').textContent = totalSizeMB + ' MB';
        document.getElementById('storageUsed').textContent = Math.min(storageUsedPercent, 100) + '%';
    }

    // Update share code display
    updateShareCode() {
        document.getElementById('shareCode').textContent = this.shareCode;
        document.getElementById('currentDeviceId').textContent = this.deviceId;
    }

    // Update devices list
    updateDevicesList() {
        const deviceList = document.getElementById('deviceList');
        let html = `
            <div class="device-item">
                <div>
                    <div class="device-name">💻 This Device</div>
                    <div class="device-status"><span class="online">Online</span></div>
                </div>
                <div style="font-family: monospace; font-size: 0.85em; color: #999;">${this.deviceId}</div>
            </div>
        `;

        this.connectedDevices.forEach(device => {
            html += `
                <div class="device-item">
                    <div>
                        <div class="device-name">${device.name}</div>
                        <div class="device-status">${device.lastSeen ? 'Last seen: ' + device.lastSeen : 'Never connected'}</div>
                    </div>
                    <div style="font-family: monospace; font-size: 0.85em; color: #999;">${device.id}</div>
                </div>
            `;
        });

        deviceList.innerHTML = html;
    }

    // Generate QR code
    generateQRCode() {
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = ''; // Clear previous QR code
        
        const qrData = {
            deviceId: this.deviceId,
            shareCode: this.shareCode,
            timestamp: new Date().getTime()
        };

        new QRCode(qrContainer, {
            text: JSON.stringify(qrData),
            width: 200,
            height: 200,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Download file
    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const blob = new Blob([file.data], { type: file.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`✅ "${file.name}" downloaded!`, 'success');
    }

    // Delete file
    deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        const file = this.files.find(f => f.id === fileId);
        this.files = this.files.filter(f => f.id !== fileId);
        this.saveFiles();
        this.updateUI();
        this.showNotification(`🗑️ "${file.name}" deleted`, 'success');
    }

    // Clear all files
    clearAllFiles() {
        this.files = [];
        this.saveFiles();
        this.updateUI();
        this.showNotification('All files cleared', 'success');
    }

    // Export as ZIP
    exportAsZip() {
        if (this.files.length === 0) {
            this.showNotification('No files to export', 'error');
            return;
        }

        // Create a simple JSON export (full ZIP support requires a library)
        const exportData = {
            exportDate: new Date().toLocaleString(),
            deviceId: this.deviceId,
            files: this.files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                uploadDate: f.uploadDate,
                data: this.arrayBufferToBase64(f.data)
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ShareHub-Backup-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Backup exported successfully', 'success');
    }

    // Import from ZIP/JSON
    importFromZip(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                importData.files.forEach(fileData => {
                    const newFile = {
                        id: 'FILE-' + Math.random().toString(36).substr(2, 9),
                        name: fileData.name,
                        size: fileData.size,
                        type: fileData.type,
                        data: this.base64ToArrayBuffer(fileData.data),
                        uploadDate: fileData.uploadDate,
                        uploadedFrom: 'Import'
                    };
                    this.files.push(newFile);
                });

                this.saveFiles();
                this.updateUI();
                this.showNotification(`✅ ${importData.files.length} files imported!`, 'success');
            } catch (error) {
                this.showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Download QR Code
    downloadQRCode() {
        const qrCanvas = document.querySelector('#qrContainer canvas');
        if (!qrCanvas) {
            this.showNotification('QR code not ready yet', 'error');
            return;
        }

        const url = qrCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `ShareHub-QR-${this.deviceId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this.showNotification('QR code downloaded', 'success');
    }

    // Start QR Code Scanner from camera
    startQRScanner() {
        const video = document.getElementById('qrScanner');
        const btn = document.getElementById('startScannerBtn');
        
        if (video.style.display === 'none') {
            btn.textContent = '⏹️ Stop Camera';
            video.style.display = 'block';
            
            navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            }).then(stream => {
                video.srcObject = stream;
                video.play();
                this.scanQRFromVideo(video);
            }).catch(err => {
                this.showNotification('Cannot access camera: ' + err.message, 'error');
                btn.textContent = '📷 Start Camera Scan';
                video.style.display = 'none';
            });
        } else {
            btn.textContent = '📷 Start Camera Scan';
            video.style.display = 'none';
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        }
    }

    // Scan QR from video stream
    scanQRFromVideo(video) {
        const canvas = document.getElementById('qrCanvas');
        const context = canvas.getContext('2d');
        let scanning = true;

        const scanFrame = () => {
            if (!scanning) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = this.decodeQRCode(imageData);

            if (code) {
                scanning = false;
                this.handleScannedQRCode(code);
                video.style.display = 'none';
                document.getElementById('startScannerBtn').textContent = '📷 Start Camera Scan';
                if (video.srcObject) {
                    video.srcObject.getTracks().forEach(track => track.stop());
                }
            } else {
                requestAnimationFrame(scanFrame);
            }
        };

        scanFrame();
    }

    // Scan QR from uploaded image
    scanQRFromImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('qrCanvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = this.decodeQRCode(imageData);

                if (code) {
                    this.handleScannedQRCode(code);
                } else {
                    this.showNotification('No valid QR code found in image', 'error');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Simple QR code decoder using jsQR
    decodeQRCode(imageData) {
        if (typeof jsQR === 'undefined') {
            return null;
        }
        
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            return code ? code.data : null;
        } catch (e) {
            return null;
        }
    }

    // Handle scanned QR code
    handleScannedQRCode(codeData) {
        try {
            const data = JSON.parse(codeData);
            if (data.shareCode && data.deviceId) {
                // Auto-connect with scanned share code
                const deviceName = data.name || 'Scanned Device';
                this.connectToDevice(data.shareCode, deviceName);
            }
        } catch (e) {
            // If it's just a share code string
            this.connectToDevice(codeData, 'Scanned Device');
        }
    }

    // Connect to device with share code
    connectToDevice(shareCode, deviceName) {
        shareCode = shareCode.trim().toUpperCase();

        if (!shareCode || shareCode.length < 6) {
            this.showNotification('Invalid share code', 'error');
            return;
        }

        if (shareCode === this.shareCode) {
            this.showNotification('Cannot connect to your own device!', 'error');
            return;
        }

        // Check if already connected
        if (this.connectedDevices.some(d => d.shareCode === shareCode)) {
            this.showNotification('Already connected to this device!', 'error');
            return;
        }

        const device = {
            id: 'DEV-' + Math.random().toString(36).substr(2, 9),
            name: deviceName,
            shareCode: shareCode,
            addedDate: new Date().toLocaleString(),
            lastSeen: new Date().toLocaleString(),
            connected: true
        };

        this.connectedDevices.push(device);
        this.saveDevices();
        this.updateUI();
        this.showNotification(`✅ Connected to ${deviceName}! Files will sync automatically.`, 'success');
    }

    // Show add device dialog
    showAddDeviceDialog() {
        // Create modal dialog
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
        `;

        content.innerHTML = `
            <h3 style="color: #667eea; margin-bottom: 20px; text-align: center;">Connect Device</h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #333;">
                    Enter Share Code from Other Device:
                </label>
                <input type="text" id="shareCodeInput" placeholder="e.g., ABC12345" 
                    style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; 
                    font-size: 16px; text-transform: uppercase;" />
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #333;">
                    Device Name (Optional):
                </label>
                <input type="text" id="deviceNameInput" placeholder="e.g., My Phone" 
                    style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; 
                    font-size: 16px;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="connectBtn" style="
                    padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
                ">Connect</button>
                <button id="cancelBtn" style="
                    padding: 12px; background: #f0f2ff; color: #667eea; border: 2px solid #667eea; 
                    border-radius: 8px; font-weight: 600; cursor: pointer;
                ">Cancel</button>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f0f2ff; border-radius: 8px; 
                border-left: 4px solid #667eea; font-size: 0.9em; color: #666;">
                <strong>How to connect:</strong>
                <ol style="margin: 10px 0 0 20px;">
                    <li>Open ShareHub on another device</li>
                    <li>Go to "My Devices" tab</li>
                    <li>Find the Share Code (8-character code)</li>
                    <li>Paste it here and click Connect</li>
                    <li>Files will sync automatically!</li>
                </ol>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('connectBtn').addEventListener('click', () => {
            const shareCode = document.getElementById('shareCodeInput').value.trim().toUpperCase();
            const deviceName = document.getElementById('deviceNameInput').value.trim() || `Device ${this.connectedDevices.length + 1}`;

            if (!shareCode || shareCode.length < 6) {
                this.showNotification('Please enter a valid share code (at least 6 characters)', 'error');
                return;
            }

            if (shareCode === this.shareCode) {
                this.showNotification('Cannot connect to your own device!', 'error');
                return;
            }

            const device = {
                id: 'DEV-' + Math.random().toString(36).substr(2, 9),
                name: deviceName,
                shareCode: shareCode,
                addedDate: new Date().toLocaleString(),
                lastSeen: new Date().toLocaleString(),
                connected: true
            };

            // Check if device already connected
            if (this.connectedDevices.some(d => d.shareCode === shareCode)) {
                this.showNotification('This device is already connected!', 'error');
                return;
            }

            this.connectedDevices.push(device);
            this.saveDevices();
            this.updateUI();
            this.showNotification(`✅ Connected to ${deviceName}! Files will sync automatically.`, 'success');
            
            document.body.removeChild(modal);
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Allow Enter key to submit
        document.getElementById('shareCodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('connectBtn').click();
            }
        });
    }

    // Switch tabs
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    // Show settings
    showSettings() {
        const settings = `
Device Information:
- Device ID: ${this.deviceId}
- Share Code: ${this.shareCode}
- Files Uploaded: ${this.files.length}
- Storage Used: ${(this.getTotalStorageUsed() / (1024 * 1024)).toFixed(2)} MB / ${this.maxStorageMB} MB
- Connected Devices: ${this.connectedDevices.length}

Note: All data is stored locally on this device.
        `;
        alert(settings);
    }

    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('✅ Copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('✅ Copied to clipboard!', 'success');
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Initialize ShareHub when DOM is ready
let shareHub;
document.addEventListener('DOMContentLoaded', () => {
    shareHub = new ShareHub();
});
