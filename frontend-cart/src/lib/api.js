const API_URL = "http://localhost:7071/api";

export const api = {
    uploadBrochure: async (file) => {
        // 1. Get SAS Token
        const sasResponse = await fetch(`${API_URL}/generate_sas_token?filename=${encodeURIComponent(file.name)}`);
        if (!sasResponse.ok) throw new Error("Failed to generate SAS token");
        const { sas_url, blob_name } = await sasResponse.json();

        // 2. Upload to Blob Storage
        const uploadResponse = await fetch(sas_url, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": file.type,
            },
            body: file,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload file to storage");

        // 3. Trigger Processing
        return api.processBrochure(file.name);
    },

    processBrochure: async (filename) => {
        const response = await fetch(`${API_URL}/process_brochure?filename=${encodeURIComponent(filename)}`, {
            method: "POST"
        });
        if (!response.ok) throw new Error("AI Processing failed");
        return response.json();
    },

    searchProducts: async ({ query = '', company = '', source_file = '', skip = 0, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (company) params.append('company', company);
        if (source_file) params.append('source_file', source_file);
        params.append('skip', skip);
        params.append('limit', limit);

        const response = await fetch(`${API_URL}/search_products?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Search failed");
        }
        return response.json(); // Returns { products: [], total: number }
    },

    getCompanies: async () => {
        const response = await fetch(`${API_URL}/companies`);
        if (!response.ok) {
            throw new Error("Failed to fetch companies");
        }
        return response.json();
    },

    // Cart Methods
    getCompanyBrochures: async (company) => {
        const response = await fetch(`${API_URL}/company_brochures?company=${encodeURIComponent(company)}`);
        if (!response.ok) throw new Error("Failed to fetch brochures");
        return response.json();
    },

    updateCompanyEmail: async (company, email) => {
        const response = await fetch(`${API_URL}/update_company_email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company, email })
        });
        if (!response.ok) throw new Error("Failed to update email");
        return response.json();
    },

    // Cart Methods
    getCart: async (sessionId) => {
        const res = await fetch(`${API_URL}/cart/${sessionId}`);
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
    },
    addToCart: async (item) => {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to add to cart');
        return res.json();
    },
    updateCartItem: async (item) => {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to update cart');
        return res.json();
    },
    removeFromCart: async (sessionId, itemId) => {
        const res = await fetch(`${API_URL}/cart/${sessionId}/${itemId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to remove from cart');
        return true;
    }
};
