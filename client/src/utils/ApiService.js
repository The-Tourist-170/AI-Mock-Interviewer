const API_BASE_URL = 'https://server-ai-mock-interviewer.onrender.com/api/v1';

export const apiService = {
    startInterview: async () => {
        const response = await fetch(`${API_BASE_URL}/interviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to start interview');
        return response.json();
    },

    sendMessage: async (id, message) => {
        const response = await fetch(`${API_BASE_URL}/interviews/${id}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message, sender: 'USER' }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },

    getReport: async (id) => {
        const response = await fetch(`${API_BASE_URL}/interviews/${id}/report`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to get report');
        return response.json();
    },
};