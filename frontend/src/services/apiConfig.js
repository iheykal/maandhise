export const getApiBaseUrl = () => {
    // 0. Hardcoded fix for custom domain (Highest priority safeguard)
    // This ensures that even if an environment variable is set incorrectly, 
    // the custom domain will always point to the correct backend.
    if (typeof window !== 'undefined' && (window.location.hostname === 'sahalcard.com' || window.location.hostname === 'www.sahalcard.com')) {
        return `${window.location.protocol}//${window.location.hostname}/api`;
    }

    // 1. Check env var
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // 2. Check if running in browser
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // 3. Localhost or Local Network (Mobile testing)
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLocalNetwork = hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.16.');

        if (isLocalhost || isLocalNetwork) {
            // Use the same hostname but port 5001 for backend
            return `${window.location.protocol}//${hostname}:5001/api`;
        }
    }

    // 4. Production Fallback (Default)
    return 'https://maandhise252.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
