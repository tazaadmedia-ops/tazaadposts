import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global Cache & Version Control Logic
const checkVersion = async () => {
    try {
        // Fetch version.json with no-cache to get the latest from server
        const response = await fetch('/version.json?t=' + Date.now(), {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const currentVersion = localStorage.getItem('app-version');

        // If we have a stored version and it doesn't match the server version
        if (currentVersion && currentVersion !== data.version) {
            console.log(`[Cache Control] New version detected: ${data.version}. Clearing cache...`);

            // 1. Unregister all service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    await reg.unregister();
                }
            }

            // 2. Clear all browser caches
            if ('caches' in window) {
                const names = await caches.keys();
                for (const name of names) {
                    await caches.delete(name);
                }
            }

            // 3. Clear local storage but preserve the new version key to prevent infinite loop
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem('app-version', data.version);

            // 4. Force hard reload from server
            window.location.reload();
        } else if (!currentVersion) {
            // First time visit, just set the version
            localStorage.setItem('app-version', data.version);
        }
    } catch (error) {
        console.error('[Cache Control] Version check failed:', error);
    }
};

// Execute version check on startup
checkVersion();

// Check periodically every 5 minutes
setInterval(checkVersion, 5 * 60 * 1000);

// Check when user returns to the tab
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkVersion();
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

