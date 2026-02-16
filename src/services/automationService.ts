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
    },

    triggerInvoiceCreated: async (userId: string, invoice: any) => {
        try {
            const response = await fetch(`${automationService.getApiUrl()}/webhook/invoice-created`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, invoice })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to trigger invoice notification:', error);
        }
    },

    triggerEstimateCreated: async (userId: string, estimate: any) => {
        try {
            const response = await fetch(`${automationService.getApiUrl()}/webhook/estimate-created`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, estimate })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to trigger estimate notification:', error);
        }
    },

    triggerOrderPlaced: async (userId: string, order: any) => {
        try {
            const response = await fetch(`${automationService.getApiUrl()}/webhook/order-placed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, order })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('Webhook responded with error:', response.status, errorText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to trigger order notification (Backend likely offline or erroring):', error);
            // Don't throw - allow UI to proceed even if notification fails
            return null;
        }
    }
};
