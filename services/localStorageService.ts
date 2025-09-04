

import { UserProfile } from '../types';
import { LOCALSTORAGE_KEYS } from '../constants';

// --- TRL-7 Refactor ---
// This service is now ONLY responsible for handling the auth token in localStorage.
// All other data is managed by the in-memory apiService to simulate a backend.

function getItem<T>(key: string): T | null {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue) as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error);
        localStorage.removeItem(key); // Clear potentially corrupted data
        return null;
    }
}

function setItem<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error);
    }
}

function removeItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error);
    }
}

// --- Auth Token Management ---
const getAuthData = (): { token: string; user: UserProfile } | null => {
    return getItem<{ token: string; user: UserProfile }>(LOCALSTORAGE_KEYS.AUTH_TOKEN);
};

const setAuthData = (token: string, user: UserProfile): void => {
    const data = { token, user };
    setItem<{ token: string; user: UserProfile }>(LOCALSTORAGE_KEYS.AUTH_TOKEN, data);
};

const removeAuthData = (): void => {
    removeItem(LOCALSTORAGE_KEYS.AUTH_TOKEN);
};

export const localStorageService = {
    getAuthData,
    setAuthData,
    removeAuthData,
};
