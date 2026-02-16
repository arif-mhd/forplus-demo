const STORAGE_KEY = 'lumina_docs';

export const saveDocument = (doc) => {
    if (typeof window === 'undefined') return;

    const docs = getDocuments();
    const existingIndex = docs.findIndex(d => d.id === doc.id);

    const docToSave = {
        ...doc,
        updatedAt: new Date().toISOString(),
        preview: doc.preview || null // Optional preview string
    };

    if (existingIndex >= 0) {
        docs[existingIndex] = docToSave;
    } else {
        docs.unshift(docToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return docToSave;
};

export const getDocuments = () => {
    if (typeof window === 'undefined') return [];
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
};

export const deleteDocument = (id) => {
    if (typeof window === 'undefined') return;
    const docs = getDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};
