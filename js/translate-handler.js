/**
 * Translate Handler - Handles translation functionality
 * Author: Easyview Reader View
 * Version: 1.0.0
 */

class TranslateHandler {
    constructor() {
        this.isTranslating = false;
        this.originalContent = null;
        this.targetLanguage = 'vi'; // Vietnamese
        this.initializeTranslateHandler();
    }

    /**
     * Initialize translate functionality
     */
    initializeTranslateHandler() {
        console.log('TranslateHandler: Initializing...');
        this.attachEventListeners();
    }

    /**
     * Attach event listeners for translate button
     */
    attachEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupTranslateButton();
            });
        } else {
            this.setupTranslateButton();
        }
    }

    /**
     * Setup translate button event listener
     */
    setupTranslateButton() {
        const translateButton = document.querySelector('[data-cmd="translate"]');

        if (translateButton) {
            translateButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.handleTranslateClick();
            });
            console.log('TranslateHandler: Event listener attached successfully');
        } else {
            console.warn('TranslateHandler: Translate button not found');
        }
    }

    /**
     * Handle translate button click
     */
    handleTranslateClick() {
        console.log('TranslateHandler: Translate button clicked');

        if (this.isTranslating) {
            this.showTranslateNotification('Translation in progress...');
            return;
        }

        this.startTranslation();
    }

    /**
     * Start translation process
     */
    async startTranslation() {
        try {
            this.setTranslatingState(true);
            console.log('TranslateHandler: Starting translation...');

            // Direct local translation - simple and reliable
            this.triggerLocalTranslation();

        } catch (error) {
            console.error('TranslateHandler: Translation error:', error);
        } finally {
            // Remove translating state after 3 seconds
            setTimeout(() => {
                this.setTranslatingState(false);
            }, 3000);
        }
    }

    /**
     * Simple translation trigger - CSP compliant
     */
    triggerLocalTranslation() {
        try {
            console.log('TranslateHandler: Triggering local translation...');

            // Method 1: Set meta tags to trigger Chrome translate
            this.setTranslationMeta();

            // Method 2: Create hidden text to trigger translation detection
            this.createTranslationTrigger();

            // Method 3: Dispatch events to trigger Chrome's translation
            this.dispatchTranslationEvents();

            console.log('TranslateHandler: Local translation methods completed');

        } catch (error) {
            console.warn('TranslateHandler: Local translation trigger failed:', error);
        }
    }

    /**
     * Set meta tags for translation
     */
    setTranslationMeta() {
        // Set document language
        document.documentElement.setAttribute('translate', 'yes');
        document.documentElement.setAttribute('lang', 'en');
        document.body.setAttribute('translate', 'yes');

        // Also set iframe content attributes
        const iframe = document.getElementById('reader');
        if (iframe && iframe.contentDocument) {
            try {
                iframe.contentDocument.documentElement.setAttribute('translate', 'yes');
                iframe.contentDocument.documentElement.setAttribute('lang', 'en');
                iframe.contentDocument.body.setAttribute('translate', 'yes');
            } catch (e) {
                console.log('TranslateHandler: Could not set iframe attributes');
            }
        }

        // Add meta tags
        const metaTags = [
            { name: 'google', content: 'translate' },
            { 'http-equiv': 'content-language', content: 'en' }
        ];

        metaTags.forEach(attrs => {
            // Remove existing meta if any
            const existing = document.querySelector(`meta[name="${attrs.name}"], meta[http-equiv="${attrs['http-equiv']}"]`);
            if (existing) existing.remove();

            // Create new meta
            const meta = document.createElement('meta');
            Object.entries(attrs).forEach(([key, value]) => {
                meta.setAttribute(key, value);
            });
            document.head.appendChild(meta);
        });

        console.log('TranslateHandler: Meta tags added');
    }

    /**
     * Create hidden elements to trigger translation
     */
    createTranslationTrigger() {
        // Remove existing trigger
        const existing = document.getElementById('translate-trigger');
        if (existing) existing.remove();

        // Create hidden element with English text
        const trigger = document.createElement('div');
        trigger.id = 'translate-trigger';
        trigger.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            opacity: 0;
            pointer-events: none;
            font-size: 1px;
        `;
        trigger.setAttribute('translate', 'yes');
        trigger.innerHTML = `
            <p>This is an English article that should be translated to Vietnamese.</p>
            <p>Please translate this content automatically.</p>
            <p>Chrome browser translation feature should detect this English text.</p>
        `;

        document.body.appendChild(trigger);
        console.log('TranslateHandler: Trigger element created');
    }

    /**
     * Dispatch events to trigger Chrome translation
     */
    dispatchTranslationEvents() {
        try {
            // Focus on document to trigger detection
            document.body.focus();

            // Dispatch various events that might trigger translation
            const events = [
                'DOMContentLoaded',
                'load',
                'pageshow',
                'focus'
            ];

            events.forEach(eventType => {
                try {
                    const event = new Event(eventType, {
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(event);
                } catch (e) {
                    console.warn(`Failed to dispatch ${eventType}:`, e);
                }
            });

            // Try to trigger via window events
            setTimeout(() => {
                try {
                    window.dispatchEvent(new Event('load'));
                    window.dispatchEvent(new Event('DOMContentLoaded'));
                } catch (e) {
                    console.warn('Window event dispatch failed:', e);
                }
            }, 100);

            console.log('TranslateHandler: Events dispatched');

        } catch (error) {
            console.warn('Event dispatch failed:', error);
        }
    }


    /**
     * Translate using Google Translate API (Method 1)
     */
    async translateWithGoogleTranslate(iframe) {
        try {
            console.log('TranslateHandler: Attempting Google Translate API...');

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc) return false;

            // Check if Google Translate is available
            if (typeof google !== 'undefined' && google.translate) {
                const translateElement = new google.translate.TranslateElement({
                    pageLanguage: 'auto',
                    includedLanguages: 'vi',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, null);

                // Apply to iframe content
                translateElement.showBanner = false;
                return true;
            }

            return false;
        } catch (error) {
            console.warn('TranslateHandler: Google Translate API failed:', error);
            return false;
        }
    }

    /**
     * Translate using Chrome built-in translate (Method 2)
     */
    async translateWithChromeBuiltIn(iframe) {
        try {
            console.log('TranslateHandler: Attempting Chrome built-in translate...');

            // Method 2A: Direct DOM manipulation (works in content script)
            try {
                console.log('TranslateHandler: Applying direct translation triggers...');

                // Set translation attributes directly
                document.body.setAttribute('translate', 'yes');
                document.documentElement.setAttribute('translate', 'yes');
                document.documentElement.lang = 'en';

                // Create meta tag for language detection
                let existingMeta = document.querySelector('meta[http-equiv="content-language"]');
                if (existingMeta) existingMeta.remove();

                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', 'content-language');
                meta.setAttribute('content', 'en');
                document.head.appendChild(meta);

                console.log('TranslateHandler: Translation triggers applied successfully');
                return true;
            } catch (directError) {
                console.warn('Direct translation trigger failed:', directError);
            }

            // Method 2B: Simulate right-click translate
            await this.simulateContextMenuTranslate();
            return true;

        } catch (error) {
            console.warn('TranslateHandler: Chrome built-in translate failed:', error);
            throw new Error('All translation methods failed');
        }
    }

    /**
     * Simulate context menu translate action
     */
    async simulateContextMenuTranslate() {
        try {
            console.log('TranslateHandler: Simulating context menu translate...');

            // Send message to background script to trigger translation
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'TRANSLATE_PAGE',
                    targetLanguage: this.targetLanguage
                });
            } else {
                // Alternative: Try to programmatically trigger translation
                this.triggerPageTranslation();
            }
        } catch (error) {
            console.warn('TranslateHandler: Context menu simulation failed:', error);
        }
    }

    /**
     * Trigger page translation programmatically
     */
    triggerPageTranslation() {
        try {
            // Set attributes to help Chrome detect translation need
            document.documentElement.setAttribute('translate', 'yes');
            document.body.setAttribute('translate', 'yes');

            // Try to detect current language
            const detectedLang = this.detectPageLanguage();
            if (detectedLang && detectedLang !== 'vi') {
                document.documentElement.lang = detectedLang;

                // Create a hidden element to trigger translation
                const trigger = document.createElement('div');
                trigger.style.display = 'none';
                trigger.setAttribute('translate', 'yes');
                trigger.textContent = 'Translate this content to Vietnamese';
                document.body.appendChild(trigger);

                // Trigger focus to potentially activate translation
                trigger.focus();

                setTimeout(() => {
                    document.body.removeChild(trigger);
                }, 1000);
            }
        } catch (error) {
            console.warn('TranslateHandler: Page translation trigger failed:', error);
        }
    }

    /**
     * Detect page language
     */
    detectPageLanguage() {
        // Simple language detection based on common English words
        const iframe = document.getElementById('reader');
        if (!iframe || !iframe.contentDocument) return 'en';

        const content = iframe.contentDocument.body.textContent || '';
        const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

        let englishCount = 0;
        const words = content.toLowerCase().split(/\s+/);

        for (const word of words.slice(0, 100)) { // Check first 100 words
            if (englishWords.includes(word)) {
                englishCount++;
            }
        }

        return englishCount > 10 ? 'en' : 'auto';
    }

    /**
     * Set translating state
     */
    setTranslatingState(isTranslating) {
        this.isTranslating = isTranslating;
        const translateButton = document.querySelector('[data-cmd="translate"]');

        if (translateButton) {
            if (isTranslating) {
                translateButton.classList.add('translating');
                translateButton.title = 'Translating...';
            } else {
                translateButton.classList.remove('translating');
                translateButton.title = 'Translate to Vietnamese';
            }
        }
    }

    /**
     * Show translate notification
     */
    showTranslateNotification(message) {
        console.log('TranslateHandler:', message);

        // Try to use existing notification system
        if (window.showCopyNotification) {
            window.showCopyNotification(message);
        } else {
            // Fallback notification
            this.showFallbackNotification(message);
        }
    }

    /**
     * Show fallback notification
     */
    showFallbackNotification(message) {
        // Create simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize translate handler when DOM is ready - avoid conflicts
function initializeTranslateHandler() {
    if (window.translateHandler) {
        console.log('TranslateHandler: Already initialized');
        return;
    }

    // Add small delay to avoid conflicts with other handlers
    setTimeout(() => {
        window.translateHandler = new TranslateHandler();
    }, 150); // Delay after copy handler
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTranslateHandler);
} else {
    initializeTranslateHandler();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslateHandler;
}