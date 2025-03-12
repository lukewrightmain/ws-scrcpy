import { html } from '../../ui/HtmlTag';
import GoogDeviceDescriptor from '../../../types/GoogDeviceDescriptor';
import { StreamClientScrcpy } from './StreamClientScrcpy';
import { ParamsDeviceTracker } from '../../../types/ParamsDeviceTracker';
import KeyEvent from '../android/KeyEvent';

// Grid view CSS
const GRID_CSS = `
.device-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(200px, 1fr));
    gap: 20px;
    padding: 20px;
    background-color: #121212;
}

.device-grid-item {
    border: 2px solid #444;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--device-list-default-color);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    position: relative;
    max-width: 100%;
}

.device-grid-item.dragging {
    opacity: 0.8;
    z-index: 1000;
}

.device-grid-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    border-color: #666;
}

.device-grid-header {
    padding: 10px;
    background-color: #333;
    color: white;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    z-index: 2;
}

.device-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-right: 10px;
    overflow: hidden;
}

.device-controls {
    display: flex;
    gap: 5px;
}

.fullscreen-button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    opacity: 0.7;
    transition: opacity 0.2s, background-color 0.2s;
}

.fullscreen-button:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
}

.fullscreen-button svg {
    width: 16px;
    height: 16px;
    fill: white;
}

.device-grid-content {
    position: relative;
    width: 100%;
    background-color: #000;
    flex: 1;
    display: flex;
    overflow: hidden;
    /* Aspect ratio will be set dynamically based on device */
}

/* Fullscreen specific styles */
.device-grid-item.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 10000 !important;
    margin: 0 !important;
    border-radius: 0 !important;
}

.fullscreen-exit {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 15px;
    cursor: pointer;
    z-index: 10001;
    display: none;
}

.device-grid-item.fullscreen .fullscreen-exit {
    display: block;
}

/* Device view styling to exactly match standalone view */
.device-view {
    display: flex;
    flex-direction: column;
    background-color: #000;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.video {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: black;
    flex-grow: 1;
}

.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.top-controls {
    position: fixed;
    top: 15px;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.back-button {
    padding: 10px 20px;
    background-color: #333;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.back-button:hover {
    background-color: #555;
}

.size-control, .bitrate-control, .quality-control {
    display: flex;
    align-items: center;
    background-color: #333;
    padding: 5px 15px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.size-control label, .bitrate-control label, .quality-control label {
    color: white;
    margin-right: 10px;
    font-weight: bold;
}

.size-slider, .bitrate-slider, .quality-select {
    width: 150px;
}

.quality-option {
    padding: 5px;
    margin: 3px 0;
}

.quality-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
}

.quality-low {
    background-color: #ff4d4d;
}

.quality-medium {
    background-color: #ffcc00;
}

.quality-high {
    background-color: #4CAF50;
}

body.grid-view {
    overflow: auto;
    background-color: #121212;
    margin: 0;
    padding-top: 60px;
}

body.grid-view #devices {
    display: none;
}

.device-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.device-id {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.8em;
    opacity: 0.8;
    max-width: 100%;
}

.device-grid-item.active {
    border: 2px solid #4CAF50;
    box-shadow: 0 6px 16px rgba(0,156,0,0.4);
}

.keyboard-status {
    position: fixed;
    bottom: 15px;
    right: 15px;
    background-color: rgba(0,0,0,0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 5px;
}

.keyboard-status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #4CAF50;
}
`;

export class GridView {
    private static styleElement?: HTMLStyleElement;
    private static gridContainer?: HTMLDivElement;
    private static devices: GoogDeviceDescriptor[] = [];
    private static streamClients: Map<string, StreamClientScrcpy> = new Map();
    private static sizeSlider?: HTMLInputElement;
    private static bitrateSlider?: HTMLInputElement;
    private static qualitySelect?: HTMLSelectElement;
    private static defaultSize = 300; // Default size in pixels
    private static defaultBitrate = 4; // Default bitrate in Mbps
    private static bitrateDisplay?: HTMLSpanElement;
    private static activeDeviceId: string | null = null;
    private static keyboardCaptureEnabled = true;
    private static keyboardStatusElement?: HTMLElement;
    
    // Quality presets for easier selection
    private static qualityPresets = [
        { name: 'Low', bitrate: 1, maxFps: 30, maxSize: 800 },
        { name: 'Medium', bitrate: 4, maxFps: 30, maxSize: 1080 },
        { name: 'High', bitrate: 8, maxFps: 60, maxSize: 0 },
        { name: 'Ultra', bitrate: 16, maxFps: 60, maxSize: 0 }
    ];

    public static initialize(_params: ParamsDeviceTracker): void {
        // No need to store params anymore since we're using iframes with direct URLs
        
        // Add CSS for grid view
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = GRID_CSS;
        document.head.appendChild(this.styleElement);
    }

    public static createMirrorAllButton(devices: GoogDeviceDescriptor[]): HTMLElement {
        this.devices = devices;
        
        const button = html`<button class="mirror-all-button">Mirror All Devices</button>`.content.firstElementChild as HTMLButtonElement;
        button.addEventListener('click', this.onMirrorAllClick);
        
        // Apply some styling to the button
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.marginTop = '10px';
        button.style.marginBottom = '10px';
        button.style.fontWeight = 'bold';
        
        return button;
    }

    private static onMirrorAllClick = (): void => {
        // Hide the device list
        document.body.classList.add('grid-view');
        
        // Create grid container
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'device-grid';
        document.body.appendChild(this.gridContainer);
        
        // Add top controls container
        const topControls = document.createElement('div');
        topControls.className = 'top-controls';
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = '← Back to List';
        backButton.addEventListener('click', this.onBackButtonClick);
        topControls.appendChild(backButton);
        
        // Add size control
        const sizeControl = document.createElement('div');
        sizeControl.className = 'size-control';
        
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Device Size:';
        sizeControl.appendChild(sizeLabel);
        
        this.sizeSlider = document.createElement('input');
        this.sizeSlider.type = 'range';
        this.sizeSlider.min = '200';
        this.sizeSlider.max = '600';
        this.sizeSlider.value = this.defaultSize.toString();
        this.sizeSlider.className = 'size-slider';
        this.sizeSlider.addEventListener('input', this.onSizeChange);
        sizeControl.appendChild(this.sizeSlider);
        
        // Add size display
        const sizeDisplay = document.createElement('span');
        sizeDisplay.style.color = 'white';
        sizeDisplay.style.marginLeft = '10px';
        sizeDisplay.textContent = `${this.defaultSize}px`;
        this.sizeSlider.addEventListener('input', () => {
            sizeDisplay.textContent = `${this.sizeSlider?.value}px`;
        });
        sizeControl.appendChild(sizeDisplay);
        
        topControls.appendChild(sizeControl);
        
        // Add quality control dropdown (replaces bitrate control)
        const qualityControl = document.createElement('div');
        qualityControl.className = 'quality-control';
        
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Quality:';
        qualityControl.appendChild(qualityLabel);
        
        this.qualitySelect = document.createElement('select');
        this.qualitySelect.className = 'quality-select';
        
        // Add quality options
        this.qualityPresets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.className = 'quality-option';
            
            // Add quality indicator
            let qualityClass = 'quality-medium';
            if (preset.name === 'Low') qualityClass = 'quality-low';
            if (preset.name === 'High' || preset.name === 'Ultra') qualityClass = 'quality-high';
            
            option.textContent = `${preset.name} (${preset.bitrate} Mbps)`;
            option.selected = preset.name === 'Medium'; // Default to Medium
            
            // Add the quality class to the option
            option.classList.add(qualityClass);
            
            if (this.qualitySelect) {
                this.qualitySelect.appendChild(option);
            }
        });
        
        if (this.qualitySelect) {
            this.qualitySelect.addEventListener('change', this.onQualityChange);
            qualityControl.appendChild(this.qualitySelect);
        }
        
        // Still include the manual bitrate slider for fine-tuning
        const bitrateControl = document.createElement('div');
        bitrateControl.className = 'bitrate-control';
        
        const bitrateLabel = document.createElement('label');
        bitrateLabel.textContent = 'Custom Bitrate:';
        bitrateControl.appendChild(bitrateLabel);
        
        this.bitrateSlider = document.createElement('input');
        this.bitrateSlider.type = 'range';
        this.bitrateSlider.min = '1';
        this.bitrateSlider.max = '20'; // Increased max bitrate
        this.bitrateSlider.step = '1';
        this.bitrateSlider.value = this.defaultBitrate.toString();
        this.bitrateSlider.className = 'bitrate-slider';
        this.bitrateSlider.addEventListener('change', this.onBitrateChange);
        bitrateControl.appendChild(this.bitrateSlider);
        
        // Add bitrate display
        this.bitrateDisplay = document.createElement('span');
        this.bitrateDisplay.style.color = 'white';
        this.bitrateDisplay.style.marginLeft = '10px';
        this.bitrateDisplay.textContent = `${this.defaultBitrate} Mbps`;
        this.bitrateSlider.addEventListener('input', () => {
            if (this.bitrateDisplay) {
                this.bitrateDisplay.textContent = `${this.bitrateSlider?.value} Mbps`;
            }
        });
        bitrateControl.appendChild(this.bitrateDisplay);
        
        topControls.appendChild(qualityControl);
        topControls.appendChild(bitrateControl);
        
        document.body.appendChild(topControls);
        
        // Add keyboard status indicator
        this.createKeyboardStatusIndicator();
        
        // Setup keyboard event handling
        this.setupKeyboardCapture();
        
        // Create a grid item for each device
        this.devices.forEach(device => {
            if (device.state === 'device') {
                this.addDeviceToGrid(device);
            }
        });
    };

    private static onSizeChange = (): void => {
        if (!this.sizeSlider) return;
        
        const newSize = parseInt(this.sizeSlider.value);
        const gridItems = document.querySelectorAll('.device-grid-item');
        
        gridItems.forEach((item) => {
            const element = item as HTMLElement;
            
            // Skip elements that are in fullscreen mode
            if (element.classList.contains('fullscreen')) {
                return;
            }
            
            const aspectRatio = parseFloat(element.dataset.aspectRatio || '0.5');
            
            if (aspectRatio > 0) {
                // For absolutely positioned elements (ones that have been dragged),
                // we only want to update the width and keep their position
                if (element.style.position === 'absolute') {
                    element.style.width = `${newSize}px`;
                    // Make sure the content area has the right aspect ratio
                    const content = element.querySelector('.device-grid-content') as HTMLElement;
                    if (content) {
                        content.style.aspectRatio = aspectRatio.toString();
                    }
                } else {
                    // For grid-positioned elements, we can just set the width
                    element.style.width = `${newSize}px`;
                    element.style.height = 'auto';
                    
                    // Make sure the content area has the right aspect ratio
                    const content = element.querySelector('.device-grid-content') as HTMLElement;
                    if (content) {
                        content.style.aspectRatio = aspectRatio.toString();
                    }
                }
            }
        });
    };
    
    private static onQualityChange = (): void => {
        if (!this.qualitySelect) return;
        
        const selectedIndex = parseInt(this.qualitySelect.value);
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= this.qualityPresets.length) {
            console.error('Invalid quality preset index');
            return;
        }
        
        const preset = this.qualityPresets[selectedIndex];
        
        console.log(`Changing quality to ${preset.name}: ${preset.bitrate}Mbps, ${preset.maxFps}fps, maxSize: ${preset.maxSize}`);
        
        // Update bitrate slider to match selected preset
        if (this.bitrateSlider && this.bitrateDisplay) {
            this.bitrateSlider.value = preset.bitrate.toString();
            this.bitrateDisplay.textContent = `${preset.bitrate} Mbps`;
        }
        
        // Apply the new quality settings
        this.refreshAllStreams(preset.bitrate, preset.maxFps, preset.maxSize);
    };
    
    private static onBitrateChange = (): void => {
        if (!this.bitrateSlider) return;
        
        const newBitrate = parseInt(this.bitrateSlider.value);
        console.log(`Changing bitrate to ${newBitrate} Mbps (custom)`);
        
        // Get current quality preset for other settings
        let maxFps = 60;
        let maxSize = 0;
        
        if (this.qualitySelect) {
            const selectedIndex = parseInt(this.qualitySelect.value);
            if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < this.qualityPresets.length) {
                const preset = this.qualityPresets[selectedIndex];
                maxFps = preset.maxFps;
                maxSize = preset.maxSize;
            }
        }
        
        // Reload all streams with the new bitrate but keep other settings
        this.refreshAllStreams(newBitrate, maxFps, maxSize);
    };
    
    private static refreshAllStreams = (bitrate: number, maxFps: number = 60, maxSize: number = 0): void => {
        // Convert Mbps to bps (scrcpy expects bits per second)
        const bitrateBps = bitrate * 1000000; // Convert Mbps to bps
        
        // Add visual indicator during refresh
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '2000';
        notification.style.fontWeight = 'bold';
        notification.textContent = `Updating streams with ${bitrate}Mbps quality...`;
        document.body.appendChild(notification);
        
        console.log(`Debug: Refreshing all streams with: ${bitrate}Mbps (${bitrateBps}bps), maxFps=${maxFps}, maxSize=${maxSize}`);
        
        // Get all device iframes
        const gridItems = document.querySelectorAll('.device-grid-item');
        
        let refreshCount = 0;
        const totalStreams = gridItems.length;
        
        gridItems.forEach((item) => {
            const element = item as HTMLElement;
            const udid = element.id.replace('grid-item-', '');
            const contentArea = document.getElementById(`grid-device-${udid}`);
            
            if (contentArea) {
                // Find the device from the stored devices array
                const device = this.devices.find(d => d.udid === udid);
                if (device) {
                    // Remove current stream
                    while (contentArea.firstChild) {
                        contentArea.removeChild(contentArea.firstChild);
                    }
                    
                    // Restart stream with new bitrate
                    this.startDeviceStream(device, contentArea, bitrateBps, maxFps, maxSize)
                        .then(() => {
                            refreshCount++;
                            console.log(`Refreshed ${refreshCount}/${totalStreams} streams`);
                            if (refreshCount === totalStreams) {
                                // Remove notification when all streams are refreshed
                                setTimeout(() => {
                                    if (document.body.contains(notification)) {
                                        document.body.removeChild(notification);
                                    }
                                }, 1000);
                            }
                        });
                }
            }
        });
        
        // Fallback in case some streams don't refresh properly
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 6000);
    };

    private static onBackButtonClick = (): void => {
        // Stop all streams
        this.streamClients.forEach(client => {
            client.onDisconnected();
        });
        this.streamClients.clear();
        
        // Remove keyboard event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove keyboard status indicator
        if (this.keyboardStatusElement && document.body.contains(this.keyboardStatusElement)) {
            document.body.removeChild(this.keyboardStatusElement);
        }
        
        // Remove grid elements
        if (this.gridContainer) {
            document.body.removeChild(this.gridContainer);
            this.gridContainer = undefined;
        }
        
        // Remove top controls
        const topControls = document.querySelector('.top-controls');
        if (topControls) {
            document.body.removeChild(topControls);
        }
        
        // Show device list again
        document.body.classList.remove('grid-view');
    };

    private static addDeviceToGrid(device: GoogDeviceDescriptor): void {
        if (!this.gridContainer) return;
        
        const deviceName = `${device['ro.product.manufacturer'] || ''} ${device['ro.product.model'] || ''}`;
        const udid = device.udid;
        
        // Create grid item
        const gridItem = document.createElement('div');
        gridItem.className = 'device-grid-item';
        gridItem.id = `grid-item-${udid}`;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'device-grid-header';
        
        // Create device info container
        const deviceInfo = document.createElement('div');
        deviceInfo.className = 'device-info';
        deviceInfo.innerHTML = `
            <span class="device-name">${deviceName}</span>
            <span class="device-id">${udid}</span>
        `;
        
        // Create controls container
        const deviceControls = document.createElement('div');
        deviceControls.className = 'device-controls';
        
        // Create fullscreen button
        const fullscreenButton = document.createElement('button');
        fullscreenButton.className = 'fullscreen-button';
        fullscreenButton.title = 'Fullscreen';
        fullscreenButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
        `;
        fullscreenButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering drag
            this.toggleFullscreen(gridItem);
        });
        
        // Add exit fullscreen button (normally hidden)
        const exitFullscreenButton = document.createElement('button');
        exitFullscreenButton.className = 'fullscreen-exit';
        exitFullscreenButton.textContent = 'Exit Fullscreen';
        exitFullscreenButton.addEventListener('click', () => {
            this.exitFullscreen(gridItem);
        });
        
        // Add all elements to the header
        deviceControls.appendChild(fullscreenButton);
        header.appendChild(deviceInfo);
        header.appendChild(deviceControls);
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'device-grid-content';
        content.id = `grid-device-${udid}`;
        
        // Get device dimensions for proper aspect ratio
        // Default to 16:9 if not available
        let width = 360;
        let height = 720;
        
        // Use type assertion to access device properties as a dynamic object
        const deviceProps = device as unknown as Record<string, string>;
        
        if (deviceProps['ro.product.display.width'] && deviceProps['ro.product.display.height']) {
            width = parseInt(deviceProps['ro.product.display.width']);
            height = parseInt(deviceProps['ro.product.display.height']);
        } else if (deviceProps['ro.product.lcd.width'] && deviceProps['ro.product.lcd.height']) {
            width = parseInt(deviceProps['ro.product.lcd.width']);
            height = parseInt(deviceProps['ro.product.lcd.height']);
        } else if (deviceProps['ro.rootless.display.width'] && deviceProps['ro.rootless.display.height']) {
            width = parseInt(deviceProps['ro.rootless.display.width']);
            height = parseInt(deviceProps['ro.rootless.display.height']);
        } else if (deviceProps['ro.sf.lcd_width'] && deviceProps['ro.sf.lcd_height']) {
            width = parseInt(deviceProps['ro.sf.lcd_width']);
            height = parseInt(deviceProps['ro.sf.lcd_height']);
        }
        
        // Apply aspect ratio
        const aspectRatio = width / height;
        content.style.aspectRatio = `${aspectRatio}`;
        
        // Store aspect ratio as data attribute for resizing
        gridItem.dataset.aspectRatio = aspectRatio.toString();
        
        // Set initial size based on default or slider value
        const initialSize = this.sizeSlider ? parseInt(this.sizeSlider.value) : this.defaultSize;
        gridItem.style.width = `${initialSize}px`;
        
        // Add to grid
        gridItem.appendChild(header);
        gridItem.appendChild(content);
        gridItem.appendChild(exitFullscreenButton);
        this.gridContainer.appendChild(gridItem);
        
        // Start stream for this device
        const bitrate = this.bitrateSlider ? parseInt(this.bitrateSlider.value) * 1000000 : this.defaultBitrate * 1000000;
        this.startDeviceStream(device, content, bitrate, 60, 0);
        
        // Make the grid item draggable
        this.makeElementDraggable(gridItem, header);
        
        // Add click handler to set as active device
        content.addEventListener('click', () => {
            this.setActiveDevice(udid);
        });
        
        // If this is the first device, make it active by default
        if (!this.activeDeviceId) {
            this.setActiveDevice(udid);
        }
    }

    // Method to make an element draggable
    private static makeElementDraggable(element: HTMLElement, handle: HTMLElement): void {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const dragMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
            
            // Add a class to indicate it's being dragged
            element.classList.add('dragging');
            
            // Bring to front
            element.style.zIndex = '1000';
        };
        
        const elementDrag = (e: MouseEvent) => {
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.position = 'absolute';
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        };
        
        const closeDragElement = () => {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            element.classList.remove('dragging');
            
            // Reset z-index after a short delay
            setTimeout(() => {
                element.style.zIndex = '';
            }, 200);
        };
        
        handle.onmousedown = dragMouseDown;
    }

    private static startDeviceStream(
        device: GoogDeviceDescriptor, 
        container: HTMLElement, 
        bitrate: number = 4000000, 
        maxFps: number = 60, 
        maxSize: number = 0
    ): Promise<void> {
        return new Promise((resolve) => {
            const udid = device.udid;
            
            // Set up stream container
            container.style.width = '100%';
            container.style.height = '100%';
            
            try {
                // Create direct URL to stream this device
                const protocol = window.location.protocol;
                const host = window.location.host;
                const pathname = window.location.pathname;
                
                // Format quality parameters with proper units
                // VideoSettings bitrate is in bps, not Mbps or bytes per second
                const bitrateParam = Math.floor(bitrate); // Integer bitrate, no decimals
                const maxFpsParam = Math.floor(maxFps); // Integer fps
                const maxSizeParam = Math.floor(maxSize); // Integer size
                
                // Format quality parameters string to debug what we're sending
                const qualityParams = 
                    `&bitrate=${bitrateParam}` +
                    `&maxFps=${maxFpsParam}` +
                    `&maxSize=${maxSizeParam}` +
                    `&videoBuffer=50` + 
                    `&videoCodec=h264` +
                    `&iFrameInterval=10`;  // Add explicit I-frame interval for better quality
                
                // Log each parameter we're adding for debugging
                console.log('Stream quality parameters:');
                console.log(`  bitrate: ${bitrateParam} bps (${bitrateParam/1000000} Mbps)`);
                console.log(`  maxFps: ${maxFpsParam} fps`);
                console.log(`  maxSize: ${maxSizeParam} px`);
                console.log(`  iFrameInterval: 10 seconds`);
                
                // The WebSocket URL includes the proxy-adb action and tcp port
                const wsUrl = `ws://${host}/?action=proxy-adb&remote=tcp:8886&udid=${udid}`;
                
                // Create the URL with the exact format that works
                const streamUrl = `${protocol}//${host}${pathname}#!action=stream&udid=${udid}&player=mse&ws=${encodeURIComponent(wsUrl)}${qualityParams}`;
                
                console.log(`Creating stream with URL: ${streamUrl}`);
                
                // Create device view container
                const deviceViewContainer = document.createElement('div');
                deviceViewContainer.className = 'device-view';
                container.appendChild(deviceViewContainer);
                
                // Create video container
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video';
                videoContainer.style.position = 'relative';
                videoContainer.style.overflow = 'hidden';
                deviceViewContainer.appendChild(videoContainer);
                
                // Create loading message
                const loadingMessage = document.createElement('div');
                loadingMessage.textContent = `Starting stream (${bitrate/1000000}Mbps)...`;
                loadingMessage.style.color = 'white';
                loadingMessage.style.padding = '10px';
                loadingMessage.style.textAlign = 'center';
                loadingMessage.style.position = 'absolute';
                loadingMessage.style.top = '50%';
                loadingMessage.style.left = '50%';
                loadingMessage.style.transform = 'translate(-50%, -50%)';
                loadingMessage.style.zIndex = '1';
                videoContainer.appendChild(loadingMessage);
                
                // Create an iframe but position it to fill the video area
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.background = '#000';
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                
                // Set a specific style to focus on just showing the video part of the page
                iframe.onload = () => {
                    try {
                        console.log(`Iframe for ${udid} loaded with quality ${bitrate/1000000}Mbps`);
                        
                        // Remove the loading message
                        if (videoContainer.contains(loadingMessage)) {
                            videoContainer.removeChild(loadingMessage);
                        }
                        
                        // Try to inject CSS to hide everything except the video
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            if (iframeDoc) {
                                const style = iframeDoc.createElement('style');
                                style.textContent = `
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        overflow: hidden;
                                    }
                                    .device-view {
                                        position: fixed;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        z-index: 9999;
                                        display: flex;
                                    }
                                    .control-buttons-list {
                                        display: none !important;
                                    }
                                    .more-box {
                                        display: none !important;
                                    }
                                    .video {
                                        width: 100% !important;
                                        height: 100% !important;
                                    }
                                    .back-to-devices {
                                        display: none !important;
                                    }
                                    /* Hide everything except the device-view and video elements */
                                    body > *:not(.device-view) {
                                        display: none !important;
                                    }
                                    /* Make sure video content is properly scaled */
                                    video, canvas {
                                        width: 100% !important;
                                        height: 100% !important;
                                        object-fit: contain !important;
                                    }
                                `;
                                iframeDoc.head.appendChild(style);
                                
                                // Inject a script to listen for our keyboard messages
                                const script = iframeDoc.createElement('script');
                                script.textContent = `
                                    // Listen for messages from parent window
                                    window.addEventListener('message', function(event) {
                                        try {
                                            // Only process keyboard events
                                            if (event.data && event.data.type === 'keyboard-event') {
                                                console.log('Received keyboard event:', event.data);
                                                
                                                // Try to find the StreamClient instance
                                                let client = null;
                                                
                                                // Try different ways to find the client
                                                if (window.scrcpy && window.scrcpy.client) {
                                                    client = window.scrcpy.client;
                                                } else if (window.application && window.application.streamClient) {
                                                    client = window.application.streamClient;
                                                } else {
                                                    // Look for the client in the global scope
                                                    for (const key in window) {
                                                        const obj = window[key];
                                                        if (obj && typeof obj.control === 'function' && 
                                                            typeof obj.control.keyEvent === 'function') {
                                                            client = obj;
                                                            break;
                                                        }
                                                    }
                                                }
                                                
                                                if (client) {
                                                    // Found a client, use its control methods
                                                    console.log('Found client, sending key event');
                                                    
                                                    // Check what methods are available
                                                    if (typeof client.control?.keyEvent === 'function') {
                                                        client.control.keyEvent(
                                                            event.data.action,
                                                            event.data.keyCode,
                                                            event.data.metaState || 0,
                                                            event.data.repeat || 0
                                                        );
                                                    } else if (typeof client.sendKeyEvent === 'function') {
                                                        client.sendKeyEvent(
                                                            event.data.action,
                                                            event.data.keyCode,
                                                            event.data.metaState || 0,
                                                            event.data.repeat || 0
                                                        );
                                                    } else {
                                                        // Try to simulate a keypress on the video element
                                                        const video = document.querySelector('video');
                                                        if (video) {
                                                            const eventType = event.data.action === 0 ? 'keydown' : 'keyup';
                                                            const keyEvent = new KeyboardEvent(eventType, {
                                                                bubbles: true,
                                                                cancelable: true,
                                                                key: event.data.key,
                                                                keyCode: event.data.keyCode
                                                            });
                                                            video.dispatchEvent(keyEvent);
                                                        }
                                                    }
                                                } else {
                                                    console.warn('Could not find StreamClient instance in iframe');
                                                }
                                            }
                                        } catch (e) {
                                            console.error('Error handling keyboard event in iframe:', e);
                                        }
                                    });
                                    
                                    console.log('GridView keyboard handler initialized in iframe');
                                `;
                                iframeDoc.body.appendChild(script);
                                
                                // Also look for quality-related elements in the iframe to verify our settings were applied
                                setTimeout(() => {
                                    try {
                                        const videoSettingsElements = iframeDoc.querySelectorAll('[data-video-settings]');
                                        if (videoSettingsElements && videoSettingsElements.length > 0) {
                                            console.log('Found video settings in iframe:', 
                                                videoSettingsElements[0].getAttribute('data-video-settings'));
                                        } else {
                                            console.log('No video settings elements found in iframe');
                                        }
                                    } catch (e) {
                                        console.warn('Error inspecting iframe video settings', e);
                                    }
                                }, 2000);
                            }
                        } catch (e) {
                            console.warn('Could not inject CSS into iframe', e);
                        }
                        
                        // Add quality indicator to the video container
                        const qualityIndicator = document.createElement('div');
                        qualityIndicator.style.position = 'absolute';
                        qualityIndicator.style.top = '10px';
                        qualityIndicator.style.right = '10px';
                        qualityIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        qualityIndicator.style.color = 'white';
                        qualityIndicator.style.padding = '5px';
                        qualityIndicator.style.borderRadius = '3px';
                        qualityIndicator.style.fontSize = '12px';
                        qualityIndicator.textContent = `${bitrate/1000000}Mbps`;
                        videoContainer.appendChild(qualityIndicator);
                        
                        // Signal that the stream is ready
                        resolve();
                    } catch (e) {
                        console.error('Error setting up iframe', e);
                        resolve(); // Still resolve even on error
                    }
                };
                
                // Set iframe src right away
                iframe.src = streamUrl;
                videoContainer.appendChild(iframe);
                
                // Store a reference so we can clean up when done
                this.streamClients.set(udid, {
                    onDisconnected: () => {
                        if (container.contains(deviceViewContainer)) {
                            container.removeChild(deviceViewContainer);
                        }
                    }
                } as StreamClientScrcpy);
                
                // Fallback if video doesn't appear within 15 seconds
                setTimeout(() => {
                    if (videoContainer.contains(loadingMessage)) {
                        videoContainer.removeChild(loadingMessage);
                    }
                    resolve(); // Still resolve after timeout
                }, 15000);
                
            } catch (e) {
                console.error('Failed to start stream for device', udid, e);
                container.innerHTML = `<div style="color:white;padding:10px;text-align:center">Failed to start stream: ${e}</div>`;
                resolve(); // Still resolve even on error
            }
        });
    }

    // Method to toggle fullscreen for a device
    private static toggleFullscreen(element: HTMLElement): void {
        if (element.classList.contains('fullscreen')) {
            this.exitFullscreen(element);
        } else {
            this.enterFullscreen(element);
        }
    }

    // Method to enter fullscreen
    private static enterFullscreen(element: HTMLElement): void {
        // Save original position and size before going fullscreen
        element.dataset.originalWidth = element.style.width;
        element.dataset.originalPosition = element.style.position;
        element.dataset.originalTop = element.style.top;
        element.dataset.originalLeft = element.style.left;
        
        // Add fullscreen class
        element.classList.add('fullscreen');
        
        // Try to use the Fullscreen API if available
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.warn('Error attempting to enable fullscreen:', err);
                // Fallback to CSS-based fullscreen
            });
        } else if ((element as any).webkitRequestFullscreen) {
            (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
            (element as any).msRequestFullscreen();
        }
        
        // Update fullscreen button to show exit icon
        const fullscreenButton = element.querySelector('.fullscreen-button') as HTMLElement;
        if (fullscreenButton) {
            fullscreenButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            `;
            fullscreenButton.title = 'Exit Fullscreen';
        }
        
        // Hide the quality controls when in fullscreen
        const topControls = document.querySelector('.top-controls');
        if (topControls) {
            (topControls as HTMLElement).style.visibility = 'hidden';
        }
    }

    // Method to exit fullscreen
    private static exitFullscreen(element: HTMLElement): void {
        // Restore original position and size
        if (element.dataset.originalWidth) {
            element.style.width = element.dataset.originalWidth;
        }
        if (element.dataset.originalPosition) {
            element.style.position = element.dataset.originalPosition;
        }
        if (element.dataset.originalTop) {
            element.style.top = element.dataset.originalTop;
        }
        if (element.dataset.originalLeft) {
            element.style.left = element.dataset.originalLeft;
        }
        
        // Remove fullscreen class
        element.classList.remove('fullscreen');
        
        // Exit document fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.warn('Error attempting to exit fullscreen:', err);
            });
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        
        // Update fullscreen button to show enter icon
        const fullscreenButton = element.querySelector('.fullscreen-button') as HTMLElement;
        if (fullscreenButton) {
            fullscreenButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            `;
            fullscreenButton.title = 'Fullscreen';
        }
        
        // Show the quality controls again
        const topControls = document.querySelector('.top-controls');
        if (topControls) {
            (topControls as HTMLElement).style.visibility = 'visible';
        }
    }

    private static createKeyboardStatusIndicator(): void {
        this.keyboardStatusElement = document.createElement('div');
        this.keyboardStatusElement.className = 'keyboard-status';
        
        const indicator = document.createElement('div');
        indicator.className = 'keyboard-status-indicator';
        
        const text = document.createElement('span');
        text.textContent = 'Keyboard: Active';
        
        this.keyboardStatusElement.appendChild(indicator);
        this.keyboardStatusElement.appendChild(text);
        
        // Add click handler to toggle keyboard capture
        this.keyboardStatusElement.addEventListener('click', () => {
            this.toggleKeyboardCapture();
        });
        
        document.body.appendChild(this.keyboardStatusElement);
    }
    
    private static setupKeyboardCapture(): void {
        // Enable keyboard capture by default
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    
    private static toggleKeyboardCapture(): void {
        this.keyboardCaptureEnabled = !this.keyboardCaptureEnabled;
        
        if (this.keyboardStatusElement) {
            const indicator = this.keyboardStatusElement.querySelector('.keyboard-status-indicator') as HTMLElement;
            const text = this.keyboardStatusElement.querySelector('span');
            
            if (indicator) {
                indicator.style.backgroundColor = this.keyboardCaptureEnabled ? '#4CAF50' : '#FF5252';
            }
            
            if (text) {
                text.textContent = `Keyboard: ${this.keyboardCaptureEnabled ? 'Active' : 'Disabled'}`;
            }
        }
    }
    
    private static handleKeyDown = (e: KeyboardEvent): void => {
        if (!this.keyboardCaptureEnabled || !this.activeDeviceId) return;
        this.sendKeyEvent(e, 0); // 0 = ACTION_DOWN
    };
    
    private static handleKeyUp = (e: KeyboardEvent): void => {
        if (!this.keyboardCaptureEnabled || !this.activeDeviceId) return;
        this.sendKeyEvent(e, 1); // 1 = ACTION_UP
    };
    
    private static sendKeyEvent(e: KeyboardEvent, action: number): void {
        // Don't capture when user is typing in an input field
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        
        // Get the active device ID
        const activeId = this.activeDeviceId;
        if (!activeId) return;
        
        // Find the iframe for this device
        const iframe = document.getElementById(`grid-device-${activeId}`)?.querySelector('iframe');
        if (!iframe) {
            console.error('Cannot find iframe for device:', activeId);
            return;
        }
        
        // Map the key to an Android keycode
        const keyCode = this.mapKeyToAndroidKeyCode(e);
        if (!keyCode) return;
        
        try {
            // Focus the iframe - this is essential for key events to propagate correctly
            iframe.focus();
            
            // Method 1: Try to access the application's keyboard handler directly
            // This would be the most reliable, but requires access to the application object
            try {
                if (iframe.contentWindow) {
                    const windowAny = iframe.contentWindow as any;
                    if (windowAny.application) {
                        const app = windowAny.application;
                        if (app.streamClient && typeof app.streamClient.control?.keyEvent === 'function') {
                            console.log(`Sending key event via application.streamClient: key=${e.key}, keyCode=${keyCode}, action=${action}`);
                            app.streamClient.control.keyEvent(action, keyCode, e.metaKey ? 1 : 0, 0);
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not access application object in iframe:', err);
            }
            
            // Method 2: Create and dispatch a direct keyboard event to the iframe
            // This works if the application has its own global keyboard handlers
            const eventType = action === 0 ? 'keydown' : 'keyup';
            const keyEvent = new KeyboardEvent(eventType, {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                which: e.which,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                bubbles: true,
                cancelable: true
            });
            
            // Dispatch directly to the iframe document
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    console.log(`Dispatching ${eventType} event to iframe document: key=${e.key}, keyCode=${keyCode}`);
                    iframeDoc.dispatchEvent(keyEvent);
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            } catch (err) {
                console.warn('Error dispatching event to iframe document:', err);
            }
            
            // Method 3: As a last resort, use postMessage
            // This might work if the application has a message handler
            if (iframe.contentWindow) {
                console.log(`Falling back to postMessage: key=${e.key}, keyCode=${keyCode}, action=${action}`);
                iframe.contentWindow.postMessage({
                    type: 'keyboard-event',
                    action: action,
                    keyCode: keyCode,
                    metaState: e.metaKey ? 1 : 0,
                    repeat: 0,
                    key: e.key
                }, '*');
                e.preventDefault();
                e.stopPropagation();
            }
        } catch (err) {
            console.error('Error sending key event to iframe:', err);
        }
    }
    
    private static mapKeyToAndroidKeyCode(e: KeyboardEvent): number | null {
        // Map common keys
        switch (e.key) {
            // Navigation keys
            case 'ArrowUp': return KeyEvent.KEYCODE_DPAD_UP;
            case 'ArrowDown': return KeyEvent.KEYCODE_DPAD_DOWN;
            case 'ArrowLeft': return KeyEvent.KEYCODE_DPAD_LEFT;
            case 'ArrowRight': return KeyEvent.KEYCODE_DPAD_RIGHT;
            
            // Control keys
            case 'Enter': return KeyEvent.KEYCODE_ENTER;
            case 'Backspace': return KeyEvent.KEYCODE_DEL;
            case 'Delete': return KeyEvent.KEYCODE_FORWARD_DEL;
            case 'Escape': return KeyEvent.KEYCODE_BACK; // Map Escape to Back button
            case 'Tab': return KeyEvent.KEYCODE_TAB;
            case ' ': return KeyEvent.KEYCODE_SPACE;
            case 'Home': return KeyEvent.KEYCODE_HOME;
            case 'End': return KeyEvent.KEYCODE_MOVE_END;
            case 'PageUp': return KeyEvent.KEYCODE_PAGE_UP;
            case 'PageDown': return KeyEvent.KEYCODE_PAGE_DOWN;
            
            // System keys
            case 'ContextMenu': return KeyEvent.KEYCODE_MENU;
            case 'F5': return KeyEvent.KEYCODE_REFRESH; // Often used for refresh

            // Function keys
            case 'F1': return KeyEvent.KEYCODE_F1;
            case 'F2': return KeyEvent.KEYCODE_F2;
            case 'F3': return KeyEvent.KEYCODE_F3;
            case 'F4': return KeyEvent.KEYCODE_F4;
            case 'F5': return KeyEvent.KEYCODE_F5;
            case 'F6': return KeyEvent.KEYCODE_F6;
            case 'F7': return KeyEvent.KEYCODE_F7;
            case 'F8': return KeyEvent.KEYCODE_F8;
            case 'F9': return KeyEvent.KEYCODE_F9;
            case 'F10': return KeyEvent.KEYCODE_F10;
            case 'F11': return KeyEvent.KEYCODE_F11;
            case 'F12': return KeyEvent.KEYCODE_F12;
            
            // Modifier keys
            case 'Shift': return KeyEvent.KEYCODE_SHIFT_LEFT;
            case 'Control': return KeyEvent.KEYCODE_CTRL_LEFT;
            case 'Alt': return KeyEvent.KEYCODE_ALT_LEFT;
            case 'Meta': return KeyEvent.KEYCODE_META_LEFT;
            
            // Map letters and numbers directly
            default:
                if (e.key.length === 1) {
                    const charCode = e.key.charCodeAt(0);
                    
                    // A-Z (both uppercase and lowercase use the same Android keycodes)
                    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
                        // Convert to uppercase for key codes (Android uses uppercase ASCII values)
                        return e.key.toUpperCase().charCodeAt(0);
                    }
                    
                    // 0-9
                    if (charCode >= 48 && charCode <= 57) {
                        return charCode;
                    }
                    
                    // Common punctuation
                    switch (e.key) {
                        case '.': return KeyEvent.KEYCODE_PERIOD;
                        case ',': return KeyEvent.KEYCODE_COMMA;
                        case '/': return KeyEvent.KEYCODE_SLASH;
                        case '\\': return KeyEvent.KEYCODE_BACKSLASH;
                        case ';': return KeyEvent.KEYCODE_SEMICOLON;
                        case '\'': return KeyEvent.KEYCODE_APOSTROPHE;
                        case '[': return KeyEvent.KEYCODE_LEFT_BRACKET;
                        case ']': return KeyEvent.KEYCODE_RIGHT_BRACKET;
                        case '-': return KeyEvent.KEYCODE_MINUS;
                        case '=': return KeyEvent.KEYCODE_EQUALS;
                        case '`': return KeyEvent.KEYCODE_GRAVE;
                    }
                }
        }
        
        // For unmapped keys, log and return null
        console.log('Unmapped key:', e.key, 'code:', e.code);
        return null;
    }

    private static setActiveDevice(udid: string): void {
        // Remove active class from previous active device
        if (this.activeDeviceId) {
            const prevActiveItem = document.getElementById(`grid-item-${this.activeDeviceId}`);
            if (prevActiveItem) {
                prevActiveItem.classList.remove('active');
            }
        }
        
        // Set new active device
        this.activeDeviceId = udid;
        
        // Add active class to new active device
        const activeItem = document.getElementById(`grid-item-${udid}`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        console.log(`Active device set to: ${udid}`);
    }
} 