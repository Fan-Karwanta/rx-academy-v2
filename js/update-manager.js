/**
 * Update Manager - Handles automatic app updates
 * Ensures users always get the latest version without manual cache clearing
 */

class UpdateManager {
  constructor() {
    this.updateAvailable = false;
    this.registration = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');

        // Listen for service worker updates
        this.registration.addEventListener('updatefound', () => {
          console.log('🔄 New service worker found, preparing update...');
          const newWorker = this.registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📦 New content is available, update ready!');
              this.showUpdateNotification();
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            this.showUpdateNotification();
          }
        });

        // Check for updates every 30 seconds when app is active
        setInterval(() => {
          if (document.visibilityState === 'visible') {
            this.checkForUpdates();
          }
        }, 30000);

        // Check for updates when page becomes visible
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.checkForUpdates();
          }
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.log('Update check failed:', error);
      }
    }
  }

  showUpdateNotification() {
    if (this.updateAvailable) return; // Don't show multiple notifications
    this.updateAvailable = true;

    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 320px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 8px;
            height: 8px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">
              🚀 New Update Available!
            </div>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 12px;">
              A new version of RX Magazine is ready with improvements and fixes.
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="update-now-btn" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
              ">
                Update Now
              </button>
              <button id="update-later-btn" style="
                background: transparent;
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                opacity: 0.8;
                transition: all 0.2s;
              ">
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        #update-now-btn:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: translateY(-1px);
        }
        #update-later-btn:hover {
          background: rgba(255,255,255,0.1) !important;
        }
      </style>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('update-now-btn').addEventListener('click', () => {
      this.applyUpdate();
    });

    document.getElementById('update-later-btn').addEventListener('click', () => {
      this.dismissNotification();
    });

    // Auto-dismiss after 10 seconds if no action
    setTimeout(() => {
      if (document.getElementById('update-notification')) {
        this.dismissNotification();
      }
    }, 10000);
  }

  async applyUpdate() {
    try {
      // Show loading state
      const notification = document.getElementById('update-notification');
      if (notification) {
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 320px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            text-align: center;
          ">
            <div style="margin-bottom: 8px;">🔄 Updating...</div>
            <div style="font-size: 12px; opacity: 0.9;">
              Please wait while we apply the latest updates
            </div>
          </div>
        `;
      }

      // Tell the service worker to skip waiting and activate
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Wait a moment for the service worker to activate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear all caches to ensure fresh content
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Reload the page to get the updated version
      window.location.reload(true);

    } catch (error) {
      console.error('Error applying update:', error);
      this.dismissNotification();
    }
  }

  dismissNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        notification.remove();
        this.updateAvailable = false;
      }, 300);
    }
  }

  // Force check for updates (can be called manually)
  async forceUpdate() {
    console.log('🔍 Forcing update check...');
    await this.checkForUpdates();
  }
}

// Initialize update manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.updateManager = new UpdateManager();
  });
} else {
  window.updateManager = new UpdateManager();
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
