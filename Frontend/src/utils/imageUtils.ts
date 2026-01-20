
export const getImageUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Absolute URL (external)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_URL}${path}`; // Relative URL (local)
};
