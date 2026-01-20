
export const getImageUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Absolute URL (external)
    return `http://localhost:3000${path}`; // Relative URL (local)
};
