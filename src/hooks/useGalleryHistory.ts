import { useState, useCallback, useEffect } from 'react';
import { GallerySession } from '@/types/photobooth';

const GALLERY_STORAGE_KEY = 'photobooth-gallery-history';
const MAX_GALLERY_ITEMS = 20; // Limit to prevent localStorage overflow

export const useGalleryHistory = () => {
  const [sessions, setSessions] = useState<GallerySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GallerySession[];
        setSessions(parsed);
      }
    } catch (error) {
      console.error('Error loading gallery history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  const saveToStorage = useCallback((updatedSessions: GallerySession[]) => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error saving gallery history:', error);
      // If storage is full, try removing oldest items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const trimmed = updatedSessions.slice(0, Math.floor(updatedSessions.length / 2));
        try {
          localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(trimmed));
          setSessions(trimmed);
        } catch {
          console.error('Unable to save gallery history - storage full');
        }
      }
    }
  }, []);

  // Add a new session to the gallery
  const addSession = useCallback((session: Omit<GallerySession, 'id' | 'timestamp'>) => {
    const newSession: GallerySession = {
      ...session,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setSessions(prev => {
      // Add new session at the beginning, limit total items
      const updated = [newSession, ...prev].slice(0, MAX_GALLERY_ITEMS);
      saveToStorage(updated);
      return updated;
    });

    return newSession.id;
  }, [saveToStorage]);

  // Remove a session from the gallery
  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all sessions
  const clearAll = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(GALLERY_STORAGE_KEY);
  }, []);

  // Get a specific session by ID
  const getSession = useCallback((sessionId: string) => {
    return sessions.find(s => s.id === sessionId);
  }, [sessions]);

  return {
    sessions,
    isLoading,
    addSession,
    removeSession,
    clearAll,
    getSession,
    hasHistory: sessions.length > 0,
  };
};
