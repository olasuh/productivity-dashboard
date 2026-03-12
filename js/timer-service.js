/**
 * Timer Service - Handles countdown timer functionality for the Productivity Dashboard
 * 
 * Responsibilities:
 * - Manage 25-minute countdown timer
 * - Provide start/stop/reset operations
 * - Format timer display in MM:SS format
 * - Handle timer completion detection
 * - Maintain timer state during pause
 */

class TimerService {
    constructor() {
        this.defaultDuration = 25 * 60 * 1000; // 25 minutes in milliseconds
        this.totalDuration = this.defaultDuration; // Current session duration
        this.remainingTime = this.totalDuration; // Current remaining time
        this.isRunning = false; // Timer running state
        this.startTime = null; // When current session started
        this.intervalId = null; // Interval ID for updates
        this.callbacks = []; // Registered update callbacks
        this.completionCallbacks = []; // Completion notification callbacks
    }

    /**
     * Set custom timer duration
     * @param {number} minutes - Duration in minutes
     */
    setDuration(minutes) {
        if (minutes >= 1 && minutes <= 120) {
            this.totalDuration = minutes * 60 * 1000;
            // If timer is not running, update remaining time
            if (!this.isRunning) {
                this.remainingTime = this.totalDuration;
                this.notifyCallbacks();
            }
        }
    }

    /**
     * Get current duration in minutes
     * @returns {number} Duration in minutes
     */
    getDurationMinutes() {
        return Math.floor(this.totalDuration / (60 * 1000));
    }

    /**
     * Format timer time in MM:SS format
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Time in MM:SS format
     */
    formatTime(milliseconds = this.remainingTime) {
        const totalSeconds = Math.ceil(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get current timer state
     * @returns {Object} Timer state object
     */
    getState() {
        return {
            remainingTime: this.remainingTime,
            isRunning: this.isRunning,
            startTime: this.startTime,
            totalDuration: this.totalDuration,
            formattedTime: this.formatTime()
        };
    }

    /**
     * Start the countdown timer
     */
    start() {
        if (this.isRunning || this.remainingTime <= 0) {
            return; // Already running or completed
        }

        this.isRunning = true;
        this.startTime = Date.now();
        
        // Start interval for updates every 100ms for smooth display
        this.intervalId = setInterval(() => {
            this.updateTimer();
        }, 100);

        // Notify callbacks immediately
        this.notifyCallbacks();
    }

    /**
     * Stop/pause the countdown timer
     */
    stop() {
        if (!this.isRunning) {
            return; // Already stopped
        }

        this.isRunning = false;
        this.startTime = null;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Notify callbacks of state change
        this.notifyCallbacks();
    }

    /**
     * Reset timer to 25 minutes
     */
    reset() {
        this.stop(); // Stop if running
        this.remainingTime = this.totalDuration;
        this.startTime = null;
        
        // Notify callbacks of reset
        this.notifyCallbacks();
    }

    /**
     * Update timer countdown
     * @private
     */
    updateTimer() {
        if (!this.isRunning || !this.startTime) {
            return;
        }

        const elapsed = Date.now() - this.startTime;
        const newRemainingTime = Math.max(0, this.remainingTime - elapsed);
        
        // Update remaining time and start time for next calculation
        this.remainingTime = newRemainingTime;
        this.startTime = Date.now();

        // Check for completion
        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.handleCompletion();
        }

        // Notify callbacks of update
        this.notifyCallbacks();
    }

    /**
     * Handle timer completion
     * @private
     */
    handleCompletion() {
        this.stop(); // Stop the timer
        
        // Notify completion callbacks
        this.completionCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in timer completion callback:', error);
            }
        });
    }

    /**
     * Register a callback for timer updates
     * @param {Function} callback - Function to call with timer state
     */
    onUpdate(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Remove an update callback
     * @param {Function} callback - Function to remove
     */
    removeUpdateCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Register a callback for timer completion
     * @param {Function} callback - Function to call when timer completes
     */
    onComplete(callback) {
        if (typeof callback === 'function') {
            this.completionCallbacks.push(callback);
        }
    }

    /**
     * Remove a completion callback
     * @param {Function} callback - Function to remove
     */
    removeCompletionCallback(callback) {
        const index = this.completionCallbacks.indexOf(callback);
        if (index > -1) {
            this.completionCallbacks.splice(index, 1);
        }
    }

    /**
     * Notify all registered update callbacks
     * @private
     */
    notifyCallbacks() {
        const state = this.getState();
        this.callbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Error in timer service callback:', error);
            }
        });
    }

    /**
     * Get remaining time in milliseconds
     * @returns {number} Remaining time in milliseconds
     */
    getRemainingTime() {
        return this.remainingTime;
    }

    /**
     * Check if timer is currently running
     * @returns {boolean} True if timer is running
     */
    getIsRunning() {
        return this.isRunning;
    }

    /**
     * Get formatted display time
     * @returns {string} Time in MM:SS format
     */
    getFormattedTime() {
        return this.formatTime();
    }

    /**
     * Check if timer has completed (reached 00:00)
     * @returns {boolean} True if timer is at 00:00
     */
    isCompleted() {
        return this.remainingTime <= 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerService;
}