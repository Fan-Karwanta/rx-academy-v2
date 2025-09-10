// PWA Install Prompt Handler
let deferredPrompt;
let installButton;

// Create install button
function createInstallButton() {
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.innerHTML = '📱 Install App';
  installButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: #f4641a;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(244, 100, 26, 0.3);
    transition: all 0.3s ease;
    display: none;
  `;
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'scale(1.05)';
    installButton.style.boxShadow = '0 6px 16px rgba(244, 100, 26, 0.4)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'scale(1)';
    installButton.style.boxShadow = '0 4px 12px rgba(244, 100, 26, 0.3)';
  });
  
  installButton.addEventListener('click', installApp);
  document.body.appendChild(installButton);
}

// Show install button
function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'block';
    setTimeout(() => {
      installButton.style.opacity = '1';
    }, 100);
  }
}

// Hide install button
function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Install app function
async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      hideInstallButton();
    } else {
      console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
  }
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Listen for appinstalled event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  hideInstallButton();
  deferredPrompt = null;
});

// Check if app is already installed
function checkIfInstalled() {
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    hideInstallButton();
    return true;
  }
  return false;
}

// Initialize install functionality
function initPWAInstall() {
  createInstallButton();
  
  // Check if already installed
  if (checkIfInstalled()) {
    return;
  }
  
  // For iOS Safari - show install instructions
  if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
    const isIOSChrome = navigator.userAgent.match(/CriOS/);
    if (!isIOSChrome && !window.navigator.standalone) {
      showIOSInstallPrompt();
    }
  }
}

// iOS install prompt
function showIOSInstallPrompt() {
  const iosPrompt = document.createElement('div');
  iosPrompt.id = 'ios-install-prompt';
  iosPrompt.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      <h3 style="margin: 0 0 10px 0; color: #333;">Install RX Products</h3>
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
        Tap <strong>Share</strong> button below, then <strong>Add to Home Screen</strong>
      </p>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #f4641a;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      ">Got it!</button>
    </div>
  `;
  document.body.appendChild(iosPrompt);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (iosPrompt.parentElement) {
      iosPrompt.remove();
    }
  }, 10000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWAInstall);
} else {
  initPWAInstall();
}
