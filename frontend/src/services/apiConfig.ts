export const getApiBaseUrl = (): string => {
    // 1. Check env var (highest priority)
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
            // This is crucial for testing on mobile devices connected to the same WiFi
            return `${window.location.protocol}//${hostname}:5001/api`;
        }
    }

    // 4. Production Fallback (Force the correct backend URL)
    // This solves the issue where custom domains (sahalcard.com) don't have the backend
    return 'https://maandhise252.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
