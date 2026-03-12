/**
 * Time Service - Handles all time and date operations for the Productivity Dashboard
 * 
 * Responsibilities:
 * - Format time in HH:MM:SS format
 * - Format date in "Day, Month DD, YYYY" format
 * - Determine appropriate greeting based on time of day
 * - Provide real-time update mechanism
 */

class TimeService {
    constructor() {
        this.updateInterval = null;
        this.callbacks = [];
    }

    /**
     * Format time in HH:MM:SS format
     * @param {Date} date - Date object to format
     * @returns {string} Time in HH:MM:SS format
     */
    formatTime(date = new Date()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Format date in "Day, Month DD, YYYY" format
     * @param {Date} date - Date object to format
     * @returns {string} Date in "Day, Month DD, YYYY" format
     */
    formatDate(date = new Date()) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayNumber = date.getDate();
        const year = date.getFullYear();

        return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
    }

    /**
     * Get appropriate greeting based on time of day
     * @param {Date} date - Date object to check time
     * @returns {string} Appropriate greeting message
     */
    getGreeting(date = new Date()) {
        const hours = date.getHours();

        if (hours >= 5 && hours < 12) {
            return 'Good Morning';
        } else if (hours >= 12 && hours < 17) {
            return 'Good Afternoon';
        } else if (hours >= 17 && hours < 21) {
            return 'Good Evening';
        } else {
            return 'Good Night';
        }
    }

    /**
     * Get current time data object
     * @returns {Object} Object containing formatted time, date, and greeting
     */
    getCurrentTimeData() {
        const now = new Date();
        return {
            time: this.formatTime(now),
            date: this.formatDate(now),
            greeting: this.getGreeting(now),
            timestamp: now
        };
    }

    /**
     * Register a callback to be called on time updates
     * @param {Function} callback - Function to call with time data
     */
    onUpdate(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Remove a callback from the update list
     * @param {Function} callback - Function to remove
     */
    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Start real-time updates (every second)
     */
    startUpdates() {
        if (this.updateInterval) {
            return; // Already running
        }

        // Immediately call callbacks with current time
        this.notifyCallbacks();

        // Set up interval for updates every second
        this.updateInterval = setInterval(() => {
            this.notifyCallbacks();
        }, 1000);
    }

    /**
     * Stop real-time updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Notify all registered callbacks with current time data
     * @private
     */
    notifyCallbacks() {
        const timeData = this.getCurrentTimeData();
        this.callbacks.forEach(callback => {
            try {
                callback(timeData);
            } catch (error) {
                console.error('Error in time service callback:', error);
            }
        });
    }

    /**
     * Check if updates are currently running
     * @returns {boolean} True if updates are active
     */
    isRunning() {
        return this.updateInterval !== null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeService;
}