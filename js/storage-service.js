/**
 * Storage Service - Centralized Local Storage operations for the Productivity Dashboard
 * 
 * Responsibilities:
 * - Provide consistent API for data persistence using Local Storage
 * - Handle storage errors and quota management gracefully
 * - Implement data validation and schema management
 * - Support tasks and quick links data models
 * - Provide graceful degradation when Local Storage unavailable
 */

class StorageService {
    constructor() {
        this.storagePrefix = 'productivity-dashboard-';
        this.version = '1.0.0';
        this.isAvailable = this.checkStorageAvailability();
        this.memoryFallback = {}; // In-memory storage when Local Storage unavailable
        
        // Storage keys
        this.keys = {
            tasks: this.storagePrefix + 'tasks',
            links: this.storagePrefix + 'links',
            timer: this.storagePrefix + 'timer',
            version: this.storagePrefix + 'version'
        };

        // Initialize version if not set
        if (this.isAvailable) {
            this.initializeVersion();
        }
    }

    /**
     * Check if Local Storage is available and functional
     * @returns {boolean} True if Local Storage is available
     */
    checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('Local Storage is not available:', error.message);
            return false;
        }
    }

    /**
     * Initialize storage version for schema management
     * @private
     */
    initializeVersion() {
        try {
            const currentVersion = localStorage.getItem(this.keys.version);
            if (!currentVersion) {
                localStorage.setItem(this.keys.version, this.version);
            }
        } catch (error) {
            console.error('Failed to initialize storage version:', error);
        }
    }

    /**
     * Generate a unique UUID for new items
     * @returns {string} UUID string
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Validate task object structure
     * @param {Object} task - Task object to validate
     * @returns {boolean} True if valid
     */
    validateTask(task) {
        if (!task || typeof task !== 'object') {
            return false;
        }

        // Required fields
        if (!task.id || typeof task.id !== 'string') return false;
        if (!task.text || typeof task.text !== 'string') return false;
        if (typeof task.completed !== 'boolean') return false;
        if (!task.createdAt || !(task.createdAt instanceof Date)) return false;
        if (!task.updatedAt || !(task.updatedAt instanceof Date)) return false;

        // Validation rules
        if (task.text.length < 1 || task.text.length > 500) return false;
        if (task.updatedAt < task.createdAt) return false;

        return true;
    }

    /**
     * Validate quick link object structure
     * @param {Object} link - Link object to validate
     * @returns {boolean} True if valid
     */
    validateLink(link) {
        if (!link || typeof link !== 'object') {
            return false;
        }

        // Required fields
        if (!link.id || typeof link.id !== 'string') return false;
        if (!link.name || typeof link.name !== 'string') return false;
        if (!link.url || typeof link.url !== 'string') return false;
        if (!link.createdAt || !(link.createdAt instanceof Date)) return false;
        if (!link.updatedAt || !(link.updatedAt instanceof Date)) return false;

        // Validation rules
        if (link.name.length < 1 || link.name.length > 50) return false;
        if (link.updatedAt < link.createdAt) return false;

        // URL validation
        try {
            const url = new URL(link.url);
            if (!['http:', 'https:'].includes(url.protocol)) return false;
        } catch {
            return false;
        }

        return true;
    }

    /**
     * Sanitize text input to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>]/g, '').trim();
    }

    /**
     * Save data to storage with error handling
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @returns {boolean} True if successful
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data, (key, value) => {
                // Convert Date objects to ISO strings for storage
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            });

            if (this.isAvailable) {
                localStorage.setItem(key, serializedData);
            } else {
                // Fallback to memory storage
                this.memoryFallback[key] = serializedData;
            }
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded. Consider clearing old data.');
                this.handleQuotaExceeded();
            } else {
                console.error('Failed to save data:', error);
            }
            return false;
        }
    }

    /**
     * Load data from storage with error handling
     * @param {string} key - Storage key
     * @returns {*} Loaded data or null if not found
     */
    load(key) {
        try {
            let serializedData;
            
            if (this.isAvailable) {
                serializedData = localStorage.getItem(key);
            } else {
                serializedData = this.memoryFallback[key];
            }

            if (!serializedData) {
                return null;
            }

            return JSON.parse(serializedData, (key, value) => {
                // Convert ISO strings back to Date objects
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * Handle storage quota exceeded error
     * @private
     */
    handleQuotaExceeded() {
        // Try to free up space by removing oldest data
        // This is a simple implementation - in production you might want more sophisticated cleanup
        console.warn('Attempting to free storage space...');
        
        // Could implement cleanup logic here
        // For now, just log the warning
    }

    /**
     * Save tasks array to storage
     * @param {Array} tasks - Array of task objects
     * @returns {boolean} True if successful
     */
    saveTasks(tasks) {
        if (!Array.isArray(tasks)) {
            console.error('Tasks must be an array');
            return false;
        }

        // Validate all tasks
        for (const task of tasks) {
            if (!this.validateTask(task)) {
                console.error('Invalid task object:', task);
                return false;
            }
        }

        return this.save(this.keys.tasks, tasks);
    }

    /**
     * Load tasks array from storage
     * @returns {Array} Array of task objects or empty array
     */
    loadTasks() {
        const tasks = this.load(this.keys.tasks);
        return Array.isArray(tasks) ? tasks : [];
    }

    /**
     * Save quick links array to storage
     * @param {Array} links - Array of link objects
     * @returns {boolean} True if successful
     */
    saveLinks(links) {
        if (!Array.isArray(links)) {
            console.error('Links must be an array');
            return false;
        }

        // Validate all links
        for (const link of links) {
            if (!this.validateLink(link)) {
                console.error('Invalid link object:', link);
                return false;
            }
        }

        return this.save(this.keys.links, links);
    }

    /**
     * Load quick links array from storage
     * @returns {Array} Array of link objects or empty array
     */
    loadLinks() {
        const links = this.load(this.keys.links);
        return Array.isArray(links) ? links : [];
    }

    /**
     * Save timer state to storage
     * @param {Object} timerState - Timer state object
     * @returns {boolean} True if successful
     */
    saveTimerState(timerState) {
        if (!timerState || typeof timerState !== 'object') {
            console.error('Timer state must be an object');
            return false;
        }

        return this.save(this.keys.timer, timerState);
    }

    /**
     * Load timer state from storage
     * @returns {Object|null} Timer state object or null
     */
    loadTimerState() {
        return this.load(this.keys.timer);
    }

    /**
     * Clear all application data
     * @returns {boolean} True if successful
     */
    clearAll() {
        try {
            if (this.isAvailable) {
                Object.values(this.keys).forEach(key => {
                    localStorage.removeItem(key);
                });
            } else {
                this.memoryFallback = {};
            }
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return {
                available: false,
                used: Object.keys(this.memoryFallback).length,
                type: 'memory'
            };
        }

        try {
            let used = 0;
            Object.values(this.keys).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    used += item.length;
                }
            });

            return {
                available: true,
                used: used,
                type: 'localStorage'
            };
        } catch (error) {
            return {
                available: false,
                error: error.message,
                type: 'localStorage'
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
} else if (typeof window !== 'undefined') {
    window.StorageService = StorageService;
}