
import { API_URL } from '../api/client';

/**
 * Resolves a potentially relative backend URL or a local file URI to a full usable URI.
 * @param path - The image path from the backend (e.g. "/uploads/foo.jpg") or local URI (e.g. "file://...")
 * @returns A full URL string or null if the path is invalid.
 */
export const getApiImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('file://')) return path;

  // Handle relative paths
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Ensure we don't double slash if API_URL ends with /
  // But strictly speaking, our API_URL usually doesn't end with / based on conventions.
  // However, best to be safe if we were doing complex joining.
  // For now, simpler is better assuming API_URL is like "http://localhost:3000/api" or "http://localhost:3000"
  // Wait, usually API_URL in client.ts includes /api.
  // Images are usually served from root, e.g. http://localhost:3000/uploads/...
  // So we might need to strip '/api' if it exists, or use a separate BASE_URL.

  // Let's assume for now that we can derive base URL from API_URL.
  // If API_URL is "http://192.168.1.5:3000/api", we want "http://192.168.1.5:3000"

  const baseUrl = API_URL?.replace(/\/api\/?$/, '') || '';
  return `${baseUrl}${cleanPath}`;
};
