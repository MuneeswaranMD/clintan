export const automationService = {
    getBackendUrl: () => {
        return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    },

    getApiUrl: () => {
        return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    },

    checkStatus: async () => {
        try {
            const response = await fetch(`${automationService.getBackendUrl()}/health`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Backend responded with error');
        } catch (error) {
            console.error('Backend status check failed:', error);
            return null;
        }
    }
};
