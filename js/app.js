// Productivity Dashboard Application
// Main application entry point

console.log('Productivity Dashboard initialized');

// Main Dashboard Controller
class Dashboard {
    constructor() {
        this.components = {};
        this.services = {};
        this.settings = {
            customName: '',
            timerDuration: 25,
            theme: 'light'
        };
        
        // Initialize services
        this.services.timeService = new TimeService();
        this.services.timerService = new TimerService();
        this.services.storageService = new StorageService();
        
        // Load settings
        this.loadSettings();
        
        // Initialize components
        this.initializeComponents();
        this.bindEvents();
    }

    loadSettings() {
        const savedSettings = this.services.storageService.load('productivity-dashboard-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Update timer service with custom duration
        this.services.timerService.setDuration(this.settings.timerDuration);
    }

    saveSettings() {
        this.services.storageService.save('productivity-dashboard-settings', this.settings);
    }

    initializeComponents() {
        // Initialize Greeting Display
        const greetingContainer = document.getElementById('greeting-display');
        if (greetingContainer) {
            this.components.greetingDisplay = new GreetingDisplay(greetingContainer, this.services.timeService, this.settings.customName);
        }
        
        // Initialize Focus Timer
        this.initializeFocusTimer();
        
        // Initialize Task Manager
        this.initializeTaskManager();
        
        // Initialize Quick Links
        this.initializeQuickLinks();
        
        // Initialize Theme Toggle
        this.initializeThemeToggle();
        
        // Initialize Settings Modal
        this.initializeSettingsModal();
    }

    initializeThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        
        // Update icon based on current theme
        this.updateThemeIcon();
        
        themeToggle.addEventListener('click', () => {
            this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.settings.theme);
            this.updateThemeIcon();
            this.saveSettings();
        });
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.settings.theme === 'light' ? '🌙' : '☀️';
        }
    }

    initializeSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const modal = document.getElementById('settings-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-settings');
        const saveBtn = document.getElementById('save-settings');
        const customNameInput = document.getElementById('custom-name');
        const timerDurationInput = document.getElementById('timer-duration');

        // Open modal
        settingsBtn.addEventListener('click', () => {
            customNameInput.value = this.settings.customName;
            timerDurationInput.value = this.settings.timerDuration;
            modal.classList.add('show');
        });

        // Close modal
        const closeModal = () => {
            modal.classList.remove('show');
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Save settings
        saveBtn.addEventListener('click', () => {
            const newName = customNameInput.value.trim();
            const newDuration = parseInt(timerDurationInput.value);

            if (newDuration >= 1 && newDuration <= 120) {
                this.settings.customName = newName;
                this.settings.timerDuration = newDuration;
                
                // Update components
                this.services.timerService.setDuration(newDuration);
                if (this.components.greetingDisplay) {
                    this.components.greetingDisplay.setCustomName(newName);
                }
                
                this.saveSettings();
                closeModal();
                
                // Show success message
                this.showNotification('Settings saved successfully! 🎉');
            } else {
                alert('Timer duration must be between 1 and 120 minutes.');
            }
        });
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--text-accent);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px var(--shadow);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    initializeFocusTimer() {
        const timerDisplay = document.getElementById('timer-display');
        const startBtn = document.getElementById('timer-start');
        const stopBtn = document.getElementById('timer-stop');
        const resetBtn = document.getElementById('timer-reset');

        if (timerDisplay && startBtn && stopBtn && resetBtn) {
            // Update display when timer changes
            this.services.timerService.onUpdate((state) => {
                timerDisplay.textContent = state.formattedTime;
            });

            // Handle completion
            this.services.timerService.onComplete(() => {
                this.showNotification('Focus session completed! Great job! 🎉');
                // Optional: Play notification sound
                this.playNotificationSound();
            });

            // Bind button events
            startBtn.addEventListener('click', () => {
                this.services.timerService.start();
            });

            stopBtn.addEventListener('click', () => {
                this.services.timerService.stop();
            });

            resetBtn.addEventListener('click', () => {
                this.services.timerService.reset();
            });

            // Initialize display
            timerDisplay.textContent = this.services.timerService.getFormattedTime();
        }
    }

    playNotificationSound() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    initializeTaskManager() {
        const taskInput = document.getElementById('task-input');
        const addTaskBtn = document.getElementById('add-task');
        const taskList = document.getElementById('task-list');

        if (taskInput && addTaskBtn && taskList) {
            this.tasks = this.services.storageService.loadTasks();
            this.renderTasks();

            // Add task functionality
            const addTask = () => {
                const text = taskInput.value.trim();
                if (text) {
                    const task = {
                        id: this.services.storageService.generateId(),
                        text: this.services.storageService.sanitizeText(text),
                        completed: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    
                    this.tasks.push(task);
                    this.saveTasks();
                    this.renderTasks();
                    taskInput.value = '';
                }
            };

            addTaskBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        }
    }

    initializeQuickLinks() {
        const linkNameInput = document.getElementById('link-name');
        const linkUrlInput = document.getElementById('link-url');
        const addLinkBtn = document.getElementById('add-link');
        const linksList = document.getElementById('links-list');

        if (linkNameInput && linkUrlInput && addLinkBtn && linksList) {
            // Load saved links or use defaults
            this.links = this.services.storageService.loadLinks();
            
            // If no saved links, add default ones
            if (this.links.length === 0) {
                this.links = [
                    {
                        id: 'default-1',
                        name: 'Google',
                        url: 'https://google.com',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: 'default-2',
                        name: 'Gmail',
                        url: 'https://gmail.com',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: 'default-3',
                        name: 'Calendar',
                        url: 'https://calendar.google.com',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
                this.saveLinks();
            }
            
            this.renderLinks();

            // Add link functionality
            const addLink = () => {
                const name = linkNameInput.value.trim();
                const url = linkUrlInput.value.trim();
                
                if (name && url) {
                    try {
                        // Validate URL
                        new URL(url);
                        
                        const link = {
                            id: this.services.storageService.generateId(),
                            name: this.services.storageService.sanitizeText(name),
                            url: url,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        
                        this.links.push(link);
                        this.saveLinks();
                        this.renderLinks();
                        linkNameInput.value = '';
                        linkUrlInput.value = '';
                    } catch (error) {
                        alert('Please enter a valid URL (e.g., https://example.com)');
                    }
                }
            };

            addLinkBtn.addEventListener('click', addLink);
            linkNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addLink();
                }
            });
            linkUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addLink();
                }
            });
        }
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="task-delete">Delete</button>
            `;

            // Toggle task completion
            const checkbox = li.querySelector('.task-checkbox');
            const taskText = li.querySelector('.task-text');
            
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                task.updatedAt = new Date();
                taskText.classList.toggle('completed', task.completed);
                this.saveTasks();
            });

            // Delete task
            const deleteBtn = li.querySelector('.task-delete');
            deleteBtn.addEventListener('click', () => {
                this.tasks = this.tasks.filter(t => t.id !== task.id);
                this.saveTasks();
                this.renderTasks();
            });

            taskList.appendChild(li);
        });
    }

    renderLinks() {
        const linksList = document.getElementById('links-list');
        if (!linksList) return;

        linksList.innerHTML = '';
        
        this.links.forEach(link => {
            const div = document.createElement('div');
            div.className = 'link-item';
            
            div.innerHTML = `
                <span class="link-text">${link.name}</span>
                <button class="link-delete">×</button>
            `;

            // Open link
            const linkText = div.querySelector('.link-text');
            linkText.addEventListener('click', () => {
                window.open(link.url, '_blank');
            });

            // Delete link
            const deleteBtn = div.querySelector('.link-delete');
            deleteBtn.addEventListener('click', () => {
                this.links = this.links.filter(l => l.id !== link.id);
                this.saveLinks();
                this.renderLinks();
            });

            linksList.appendChild(div);
        });
    }

    saveTasks() {
        this.services.storageService.saveTasks(this.tasks);
    }

    saveLinks() {
        this.services.storageService.saveLinks(this.links);
    }

    bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D for dark mode toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                document.getElementById('theme-toggle').click();
            }
            
            // Ctrl/Cmd + , for settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                document.getElementById('settings-btn').click();
            }
        });
    }

    initialize() {
        console.log('Dashboard initializing...');
        
        // Start time service
        this.services.timeService.startUpdates();
        
        // Start greeting display
        if (this.components.greetingDisplay) {
            this.components.greetingDisplay.start();
        }
        
        console.log('Dashboard initialized successfully!');
    }

    checkBrowserSupport() {
        if (typeof Storage === "undefined") {
            console.warn('Local Storage not supported');
            alert('Your browser does not support Local Storage. Data will not be saved between sessions.');
            return false;
        }
        return true;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.checkBrowserSupport();
    dashboard.initialize();
});