import { html } from '../../ui/HtmlTag';
import GoogDeviceDescriptor from '../../../types/GoogDeviceDescriptor';
import { StreamClientScrcpy } from './StreamClientScrcpy';
import { ParamsDeviceTracker } from '../../../types/ParamsDeviceTracker';

// Grid view CSS
const GRID_CSS = `
.device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
}

.device-grid-content {
    position: relative;
    width: 100%;
    background-color: #000;
    flex: 1;
    display: flex;
    overflow: hidden;
}

/* Device view styling to exactly match standalone view */
.device-view {
    display: flex;
    flex-direction: row;
    background-color: #000;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.control-buttons-list {
    display: flex;
    flex-direction: column;
    background-color: #212121;
    padding: 4px;
    min-width: 48px;
    z-index: 2;
}

.control-button {
    width: 40px;
    height: 40px;
    margin: 4px 0;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    opacity: 0.8;
}

.control-button:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
}

.control-button svg {
    width: 24px;
    height: 24px;
    fill: #fff;
    stroke: #fff;
}

.video {
    position: relative;
    width: 320px;
    height: 720px;
    background-color: black;
    flex-shrink: 0;
}

.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.back-button {
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1000;
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

body.grid-view {
    overflow: auto;
    background-color: #121212;
    margin: 0;
    padding-top: 60px;
}

body.grid-view #devices {
    display: none;
}
`;

export class GridView {
    private static styleElement?: HTMLStyleElement;
    private static gridContainer?: HTMLDivElement;
    private static devices: GoogDeviceDescriptor[] = [];
    private static streamClients: Map<string, StreamClientScrcpy> = new Map();

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
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = '← Back to List';
        backButton.addEventListener('click', this.onBackButtonClick);
        document.body.appendChild(backButton);
        
        // Create a grid item for each device
        this.devices.forEach(device => {
            if (device.state === 'device') {
                this.addDeviceToGrid(device);
            }
        });
    };

    private static onBackButtonClick = (): void => {
        // Stop all streams
        this.streamClients.forEach(client => {
            client.onDisconnected();
        });
        this.streamClients.clear();
        
        // Remove grid elements
        if (this.gridContainer) {
            document.body.removeChild(this.gridContainer);
            this.gridContainer = undefined;
        }
        
        // Remove back button
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            document.body.removeChild(backButton);
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
        
        // Create header
        const header = document.createElement('div');
        header.className = 'device-grid-header';
        header.innerHTML = `
            <span>${deviceName}</span>
            <span>${udid}</span>
        `;
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'device-grid-content';
        content.id = `grid-device-${udid}`;
        
        // Add to grid
        gridItem.appendChild(header);
        gridItem.appendChild(content);
        this.gridContainer.appendChild(gridItem);
        
        // Start stream for this device
        this.startDeviceStream(device, content);
    }

    private static startDeviceStream(device: GoogDeviceDescriptor, container: HTMLElement): void {
        const udid = device.udid;
        
        // Set up stream container
        container.style.width = '100%';
        container.style.height = '100%';
        
        try {
            // Create direct URL to stream this device
            const protocol = window.location.protocol;
            const host = window.location.host;
            const pathname = window.location.pathname;
            
            // Use the exact format that works when clicking H264 Converter
            // The WebSocket URL includes the proxy-adb action and tcp port
            const wsUrl = `ws://${host}/?action=proxy-adb&remote=tcp:8886&udid=${udid}`;
            
            // Create the URL with the exact format that works
            const streamUrl = `${protocol}//${host}${pathname}#!action=stream&udid=${udid}&player=mse&ws=${encodeURIComponent(wsUrl)}`;
            
            console.log('Creating stream with URL:', streamUrl);
            
            // Create device view container to match standalone view exactly
            const deviceViewContainer = document.createElement('div');
            deviceViewContainer.className = 'device-view';
            container.appendChild(deviceViewContainer);
            
            // Create control buttons panel
            const controlButtonsList = document.createElement('div');
            controlButtonsList.className = 'control-buttons-list control-wrapper';
            deviceViewContainer.appendChild(controlButtonsList);
            
            // Add control buttons
            this.addControlButtons(controlButtonsList, udid);
            
            // Create video container
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video';
            videoContainer.style.width = '320px';
            videoContainer.style.height = '720px';
            videoContainer.style.position = 'relative';
            videoContainer.style.overflow = 'hidden';
            deviceViewContainer.appendChild(videoContainer);
            
            // Create loading message
            const loadingMessage = document.createElement('div');
            loadingMessage.textContent = 'Starting stream...';
            loadingMessage.style.color = 'white';
            loadingMessage.style.padding = '10px';
            loadingMessage.style.textAlign = 'center';
            loadingMessage.style.position = 'absolute';
            loadingMessage.style.top = '50%';
            loadingMessage.style.left = '50%';
            loadingMessage.style.transform = 'translate(-50%, -50%)';
            loadingMessage.style.zIndex = '1';
            videoContainer.appendChild(loadingMessage);
            
            // Create an iframe but position it to only show the video area
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
                            `;
                            iframeDoc.head.appendChild(style);
                        }
                    } catch (e) {
                        console.warn('Could not inject CSS into iframe', e);
                    }
                } catch (e) {
                    console.error('Error setting up iframe', e);
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
            }, 15000);
            
        } catch (e) {
            console.error('Failed to start stream for device', udid, e);
            container.innerHTML = `<div style="color:white;padding:10px;text-align:center">Failed to start stream: ${e}</div>`;
        }
    }

    private static addControlButtons(container: HTMLElement, udid: string): void {
        // More options button with input and label
        const moreOptionsId = `input_show_more_${udid}_H264 Converter_0`;
        const moreOptionsInput = document.createElement('input');
        moreOptionsInput.type = 'checkbox';
        moreOptionsInput.id = moreOptionsId;
        container.appendChild(moreOptionsInput);
        
        const moreOptionsLabel = document.createElement('label');
        moreOptionsLabel.htmlFor = moreOptionsId;
        moreOptionsLabel.title = 'More';
        moreOptionsLabel.className = 'control-button';
        moreOptionsLabel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="#fff" class="image image-off"><path d="M0 0h48v48H0z" fill="none"></path><path d="M12 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm24 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path></svg>`;
        container.appendChild(moreOptionsLabel);
        
        // Power button
        const powerButton = document.createElement('button');
        powerButton.className = 'control-button';
        powerButton.title = 'Power';
        powerButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="none" d="M0 0h48v48H0z"></path><path d="M26 6h-4v20h4V6zm9.67 4.33l-2.83 2.83C35.98 15.73 38 19.62 38 24c0 7.73-6.27 14-14 14s-14-6.27-14-14c0-4.38 2.02-8.27 5.16-10.84l-2.83-2.83C8.47 13.63 6 18.52 6 24c0 9.94 8.06 18 18 18s18-8.06 18-18c0-5.48-2.47-10.37-6.33-13.67z" fill="#fff" stroke="#fff"></path></svg>`;
        container.appendChild(powerButton);
        
        // Volume up button
        const volumeUpButton = document.createElement('button');
        volumeUpButton.className = 'control-button';
        volumeUpButton.title = 'Volume up';
        volumeUpButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z" fill="#fff" stroke="#fff"></path><path d="M0 0h48v48H0z" fill="none"></path></svg>`;
        container.appendChild(volumeUpButton);
        
        // Volume down button
        const volumeDownButton = document.createElement('button');
        volumeDownButton.className = 'control-button';
        volumeDownButton.title = 'Volume down';
        volumeDownButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M37 24c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zm-27-6v12h8l10 10V8L18 18h-8z" fill="#fff" stroke="#fff"></path><path d="M0 0h48v48H0z" fill="none"></path></svg>`;
        container.appendChild(volumeDownButton);
        
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'control-button';
        backButton.title = 'Back';
        backButton.innerHTML = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none"><g><path d="M36.7088473,10.9494765 L36.7088478,37.6349688 C36.7088478,39.4039498 35.4820844,40.0949115 33.9646508,39.1757647 L12.1373795,25.9544497 C10.6218013,25.0364267 10.6199459,23.5491414 12.1373794,22.6299946 L33.9646503,9.40868054 C35.4802284,8.49065763 36.7088473,9.16835511 36.7088473,10.9494765 Z M33.5088482,13.4305237 L33.5088482,35.1305245 L15.5088482,24.2805241 L33.5088482,13.4305237 Z" fill="#fff"></path></g></g></svg>`;
        container.appendChild(backButton);
        
        // Home button
        const homeButton = document.createElement('button');
        homeButton.className = 'control-button';
        homeButton.title = 'Home';
        homeButton.innerHTML = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24,35.2 L24,35.2 C30.1855892,35.2 35.2,30.1855892 35.2,24 C35.2,17.8144108 30.1855892,12.8 24,12.8 C17.8144108,12.8 12.8,17.8144108 12.8,24 C12.8,30.1855892 17.8144108,35.2 24,35.2 L24,35.2 Z M24,38.4 L24,38.4 C16.0470996,38.4 9.6,31.9529004 9.6,24 C9.6,16.0470996 16.0470996,9.6 24,9.6 C31.9529004,9.6 38.4,16.0470996 38.4,24 C38.4,31.9529004 31.9529004,38.4 24,38.4 L24,38.4 Z" fill="#fff"></path></svg>`;
        container.appendChild(homeButton);
        
        // Overview button
        const overviewButton = document.createElement('button');
        overviewButton.className = 'control-button';
        overviewButton.title = 'Overview';
        overviewButton.innerHTML = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M12.7921429,12.8 L12.7921429,12.8 C12.7959945,12.8 12.8,12.7959954 12.8,12.7921429 L12.8,35.2078571 C12.8,35.2040055 12.7959954,35.2 12.7921429,35.2 L35.2078571,35.2 C35.2040055,35.2 35.2,35.2040046 35.2,35.2078571 L35.2,12.7921429 C35.2,12.7959945 35.2040046,12.8 35.2078571,12.8 L12.7921429,12.8 Z M12.7921429,9.6 L12.7921429,9.6 L35.2078571,9.6 C36.9718035,9.6 38.4,11.029171 38.4,12.7921429 L38.4,35.2078571 C38.4,36.9718035 36.970829,38.4 35.2078571,38.4 L12.7921429,38.4 C11.0281965,38.4 9.6,36.970829 9.6,35.2078571 L9.6,12.7921429 C9.6,11.0281965 11.029171,9.6 12.7921429,9.6 L12.7921429,9.6 Z" fill="#fff"></path></svg>`;
        container.appendChild(overviewButton);
        
        // Screenshot button
        const screenshotButton = document.createElement('button');
        screenshotButton.className = 'control-button';
        screenshotButton.title = 'Take screenshot';
        screenshotButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="#fff"><circle cx="24" cy="24" r="6.4"></circle><path d="M18 4l-3.66 4H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4h-6.34L30 4H18zm6 30c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10z"></path><path d="M0 0h48v48H0z" fill="none"></path></svg>`;
        container.appendChild(screenshotButton);
        
        // Keyboard capture button
        const keyboardCaptureId = `input_capture_keyboard_${udid}_H264 Converter`;
        const keyboardCaptureInput = document.createElement('input');
        keyboardCaptureInput.type = 'checkbox';
        keyboardCaptureInput.id = keyboardCaptureId;
        container.appendChild(keyboardCaptureInput);
        
        const keyboardCaptureLabel = document.createElement('label');
        keyboardCaptureLabel.htmlFor = keyboardCaptureId;
        keyboardCaptureLabel.title = 'Capture keyboard';
        keyboardCaptureLabel.className = 'control-button';
        keyboardCaptureLabel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="#fff" class="image image-off"><path d="M40 10H8c-2.21 0-3.98 1.79-3.98 4L4 34c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V14c0-2.21-1.79-4-4-4zm-18 6h4v4h-4v-4zm0 6h4v4h-4v-4zm-6-6h4v4h-4v-4zm0 6h4v4h-4v-4zm-2 4h-4v-4h4v4zm0-6h-4v-4h4v4zm18 14H16v-4h16v4zm0-8h-4v-4h4v4zm0-6h-4v-4h4v4zm6 6h-4v-4h4v4zm0-6h-4v-4h4v4z"></path><path d="M0 0h48v48H0zm0 0h48v48H0z" fill="none"></path></svg>`;
        container.appendChild(keyboardCaptureLabel);
        
        // Attach event listeners
        powerButton.addEventListener('click', () => this.sendDeviceButton(udid, 'power'));
        volumeUpButton.addEventListener('click', () => this.sendDeviceButton(udid, 'volume_up'));
        volumeDownButton.addEventListener('click', () => this.sendDeviceButton(udid, 'volume_down'));
        backButton.addEventListener('click', () => this.sendDeviceButton(udid, 'back'));
        homeButton.addEventListener('click', () => this.sendDeviceButton(udid, 'home'));
        overviewButton.addEventListener('click', () => this.sendDeviceButton(udid, 'app_switch'));
        screenshotButton.addEventListener('click', () => this.takeScreenshot(udid));
    }

    private static sendDeviceButton(udid: string, button: string): void {
        // In a real implementation, you would send a command to the device
        console.log(`Sending ${button} button to device ${udid}`);
        // This is a placeholder - actual implementation would depend on your backend
    }

    private static takeScreenshot(udid: string): void {
        // In a real implementation, you would take a screenshot of the device
        console.log(`Taking screenshot of device ${udid}`);
        // This is a placeholder - actual implementation would depend on your backend
    }
} 