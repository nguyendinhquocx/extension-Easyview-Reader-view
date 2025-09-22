/**
 * Line Highlight Settings Manager
 * Handles user preferences and UI interactions for line highlighting
 */

class LineHighlightSettings {
    constructor() {
        this.defaultSettings = {
            enabled: true,
            color: 'yellow',
            intensity: 'medium' // light, medium, strong
        };

        this.currentSettings = { ...this.defaultSettings };
        this.settingsLoaded = false;

        this.init();
    }

    /**
     * Initialize settings manager
     */
    async init() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.updateUI();
            console.log('LineHighlightSettings: Initialized with settings:', this.currentSettings);
        } catch (error) {
            console.error('LineHighlightSettings: Initialization failed:', error);
        }
    }

    /**
     * Load settings from chrome.storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['lineHighlightSettings']);
            if (result.lineHighlightSettings) {
                this.currentSettings = {
                    ...this.defaultSettings,
                    ...result.lineHighlightSettings
                };
            }
            this.settingsLoaded = true;
            console.log('LineHighlightSettings: Loaded from storage:', this.currentSettings);
        } catch (error) {
            console.error('LineHighlightSettings: Failed to load from storage:', error);
            this.currentSettings = { ...this.defaultSettings };
            this.settingsLoaded = true;
        }
    }

    /**
     * Save settings to chrome.storage
     */
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                lineHighlightSettings: this.currentSettings
            });
            console.log('LineHighlightSettings: Saved to storage:', this.currentSettings);
        } catch (error) {
            console.error('LineHighlightSettings: Failed to save to storage:', error);
        }
    }

    /**
     * Setup event listeners for UI controls
     */
    setupEventListeners() {
        // Toggle switch
        const toggleSwitch = document.getElementById('line-highlight-switch');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', (e) => {
                this.updateSetting('enabled', e.target.checked);
                this.toggleSettingsVisibility(e.target.checked);
            });
        }

        // Color selection
        const colorItems = document.querySelectorAll('.highlight-color-item');
        colorItems.forEach(item => {
            item.addEventListener('click', () => {
                const color = item.getAttribute('data-color');
                this.updateSetting('color', color);
                this.updateColorSelection(color);
            });
        });

        // Intensity slider (using existing slider system)
        this.setupIntensitySlider();

        console.log('LineHighlightSettings: Event listeners setup complete');
    }

    /**
     * Setup intensity slider
     */
    setupIntensitySlider() {
        const intensitySlider = document.querySelector('.highlight-intensity');
        if (intensitySlider) {
            // Listen for slider changes (this would integrate with existing slider system)
            intensitySlider.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                const intensity = this.getIntensityFromValue(value);
                this.updateSetting('intensity', intensity);
            });

            // Also listen for manual slider updates
            const sliderContainer = intensitySlider.closest('.setting-item');
            if (sliderContainer) {
                sliderContainer.addEventListener('click', (e) => {
                    // This would integrate with the existing slider click handling
                    setTimeout(() => {
                        const value = parseInt(intensitySlider.value);
                        const intensity = this.getIntensityFromValue(value);
                        this.updateSetting('intensity', intensity);
                    }, 100);
                });
            }
        }
    }

    /**
     * Convert slider value to intensity name
     */
    getIntensityFromValue(value) {
        switch (value) {
            case 1: return 'light';
            case 2: return 'medium';
            case 3: return 'strong';
            default: return 'medium';
        }
    }

    /**
     * Convert intensity name to slider value
     */
    getValueFromIntensity(intensity) {
        switch (intensity) {
            case 'light': return 1;
            case 'medium': return 2;
            case 'strong': return 3;
            default: return 2;
        }
    }

    /**
     * Update a specific setting
     */
    updateSetting(key, value) {
        if (this.currentSettings[key] !== value) {
            this.currentSettings[key] = value;
            this.saveSettings();
            this.notifySettingsChange();
            console.log(`LineHighlightSettings: Updated ${key} to ${value}`);
        }
    }

    /**
     * Update UI to reflect current settings
     */
    updateUI() {
        // Update toggle switch
        const toggleSwitch = document.getElementById('line-highlight-switch');
        if (toggleSwitch) {
            toggleSwitch.checked = this.currentSettings.enabled;
        }

        // Update color selection
        this.updateColorSelection(this.currentSettings.color);

        // Update intensity slider
        const intensitySlider = document.querySelector('.highlight-intensity');
        if (intensitySlider) {
            intensitySlider.value = this.getValueFromIntensity(this.currentSettings.intensity);
        }

        // Show/hide settings panel
        this.toggleSettingsVisibility(this.currentSettings.enabled);

        console.log('LineHighlightSettings: UI updated');
    }

    /**
     * Update color selection UI
     */
    updateColorSelection(selectedColor) {
        const colorItems = document.querySelectorAll('.highlight-color-item');
        colorItems.forEach(item => {
            const color = item.getAttribute('data-color');
            if (color === selectedColor) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Toggle settings panel visibility
     */
    toggleSettingsVisibility(show) {
        const settingsPanel = document.querySelector('.line-highlight-settings');
        if (settingsPanel) {
            if (show) {
                settingsPanel.classList.remove('hidden');
            } else {
                settingsPanel.classList.add('hidden');
            }
        }
    }

    /**
     * Notify other components about settings changes
     */
    notifySettingsChange() {
        // Use existing event system or create custom event
        const event = new CustomEvent('lineHighlightSettingsChanged', {
            detail: this.currentSettings
        });
        document.dispatchEvent(event);

        // Also update the line highlighter directly if available
        if (window.LineHighlighterAPI) {
            if (this.currentSettings.enabled) {
                window.LineHighlighterAPI.enable();
                window.LineHighlighterAPI.setColor(this.getColorValue(this.currentSettings.color, this.currentSettings.intensity));
            } else {
                window.LineHighlighterAPI.disable();
            }
        }
    }

    /**
     * Get CSS color value based on color and intensity
     */
    getColorValue(color, intensity) {
        const colors = {
            yellow: [255, 255, 0],
            blue: [66, 165, 245],
            green: [76, 175, 80],
            gray: [158, 158, 158]
        };

        const intensities = {
            light: 0.1,
            medium: 0.2,
            strong: 0.3
        };

        const [r, g, b] = colors[color] || colors.yellow;
        const opacity = intensities[intensity] || intensities.medium;

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.currentSettings };
    }

    /**
     * Reset to default settings
     */
    async resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        await this.saveSettings();
        this.updateUI();
        this.notifySettingsChange();
        console.log('LineHighlightSettings: Reset to defaults');
    }

    /**
     * Export settings for backup
     */
    exportSettings() {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    /**
     * Import settings from backup
     */
    async importSettings(settingsJson) {
        try {
            const importedSettings = JSON.parse(settingsJson);
            this.currentSettings = {
                ...this.defaultSettings,
                ...importedSettings
            };
            await this.saveSettings();
            this.updateUI();
            this.notifySettingsChange();
            console.log('LineHighlightSettings: Imported settings:', this.currentSettings);
            return true;
        } catch (error) {
            console.error('LineHighlightSettings: Failed to import settings:', error);
            return false;
        }
    }

    /**
     * Get settings for specific theme
     */
    getThemeAwareSettings(theme) {
        const settings = { ...this.currentSettings };

        // Adjust colors for different themes
        if (theme === 'sepia') {
            if (settings.color === 'yellow') {
                settings.color = 'gray'; // Yellow doesn't work well on sepia
            }
        } else if (theme === 'gray') {
            if (settings.color === 'gray') {
                settings.color = 'yellow'; // Gray on gray is invisible
            }
        }

        return settings;
    }
}

// Global instance
let lineHighlightSettings = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        lineHighlightSettings = new LineHighlightSettings();
    });
} else {
    lineHighlightSettings = new LineHighlightSettings();
}

// Export for other modules
if (typeof window !== 'undefined') {
    window.LineHighlightSettings = LineHighlightSettings;
    window.lineHighlightSettings = lineHighlightSettings;
}