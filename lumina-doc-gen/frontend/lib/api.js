const API_BASE_URL = 'http://localhost:4000/api/v1';

export const api = {
    generatePdf: async (type, data, styleConfig) => {
        try {
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, data, styleConfig }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            const blob = await response.blob();
            return window.URL.createObjectURL(blob);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    parseStyle: async (prompt) => {
        try {
            const response = await fetch(`${API_BASE_URL}/parse-style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            if (!response.ok) throw new Error('Failed to parse style');
            return await response.json();
        } catch (error) {
            console.error('AI Parse Error:', error);
            // Fallback just in case
            return {};
        }
    }
};
