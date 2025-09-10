// PWA Install functionality
let deferredPrompt;
const installButton = document.getElementById('installButton');
let isDownloading = false;

// Show download progress
function showDownloadProgress() {
  if (installButton) {
    isDownloading = true;
    installButton.innerHTML = '⬇️ Downloading...';
    installButton.style.background = 'rgba(244, 100, 26, 0.9)';
    installButton.disabled = true;
  }
}

// Show ready state
function showReadyState() {
  if (installButton) {
    isDownloading = false;
    installButton.innerHTML = '📱 Install App (Offline Ready!)';
    installButton.style.background = 'rgba(0, 150, 0, 0.9)';
    installButton.disabled = false;
  }
}

// Listen for service worker updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      showReadyState();
    }
  });
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  if (installButton) {
    installButton.style.display = 'block';
    // Check if service worker is ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        showReadyState();
      });
    }
  }
});

// Handle install button click
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt && !isDownloading) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Show success message
        installButton.innerHTML = '✅ Installing...';
        installButton.style.background = 'rgba(0, 150, 0, 0.9)';
      }
      
      // Clear the deferredPrompt variable
      deferredPrompt = null;
      // Hide the install button after a delay
      setTimeout(() => {
        if (installButton) {
          installButton.style.display = 'none';
        }
      }, 2000);
    }
  });
}

// Listen for the appinstalled event
window.addEventListener('appinstalled', (evt) => {
  console.log('RX Lifestyle app was installed');
  // Hide the install button
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Check if app is already installed
window.addEventListener('DOMContentLoaded', () => {
  // Check if the app is running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    console.log('App is running in standalone mode');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  
  // For iOS Safari, check if it's running in standalone mode
  if (('standalone' in window.navigator) && (window.navigator.standalone)) {
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
});
