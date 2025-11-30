// ShareHub - File Sharing Application Logic

class ShareHub {
    constructor() {
        this.files = this.loadFiles();
        this.deviceId = this.generateDeviceId();
        this.shareCode = this.generateShareCode();
        this.maxStorageMB = 100; // 100 MB limit
        this.connectedDevices = this.loadDevices();
        
        this.initializeEventListeners();
        this.updateUI();
        this.generateQRCode();
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

        // Add device button
        document.getElementById('addDeviceBtn').addEventListener('click', () => {
            this.showAddDeviceDialog();
        });

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

        filesList.innerHTML = this.files.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">📄 ${this.escapeHtml(file.name)}</div>
                    <div class="file-size">${this.formatFileSize(file.size)} • Uploaded ${file.uploadDate}</div>
                </div>
                <div class="file-actions">
                    <button class="btn-download" onclick="shareHub.downloadFile('${file.id}')">⬇️ Download</button>
                    <button class="btn-delete" onclick="shareHub.deleteFile('${file.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
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

    // Show add device dialog
    showAddDeviceDialog() {
        const code = prompt('Enter the share code from the other device:');
        if (!code) return;

        const device = {
            id: code,
            name: `Device ${this.connectedDevices.length + 1}`,
            shareCode: code,
            addedDate: new Date().toLocaleString(),
            lastSeen: new Date().toLocaleString()
        };

        // Check if device already exists
        if (this.connectedDevices.some(d => d.id === device.id)) {
            this.showNotification('Device already connected', 'error');
            return;
        }

        this.connectedDevices.push(device);
        this.saveDevices();
        this.updateUI();
        this.showNotification('✅ Device connected successfully!', 'success');
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
