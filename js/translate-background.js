/**
 * Translate Background Handler
 * Handles background translation tasks
 */

// Handle messages from translate handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'TRANSLATE_PAGE') {
        console.log('Background: Received translate request', message);

        // Method 1: Try to inject Google Translate
        handlePageTranslation(sender.tab.id, message.targetLanguage)
            .then(result => {
                sendResponse({ success: true, result });
            })
            .catch(error => {
                console.error('Background: Translation failed', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep message channel open for async response
    }
});

/**
 * Handle page translation
 */
async function handlePageTranslation(tabId, targetLanguage = 'vi') {
    try {
        console.log('Background: Starting translation for tab', tabId);

        // Method 1: Try Chrome's built-in translation API
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: triggerChromeTranslate,
                args: [targetLanguage]
            });
            return { method: 'chrome-builtin', success: true };
        } catch (error) {
            console.warn('Background: Chrome built-in translate failed:', error);
        }

        // Method 2: Try Google Translate injection
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: injectGoogleTranslate,
                args: [targetLanguage]
            });
            return { method: 'google-inject', success: true };
        } catch (error) {
            console.warn('Background: Google Translate injection failed:', error);
        }

        // Method 3: Try attribute-based translation trigger
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: triggerAttributeTranslation,
                args: [targetLanguage]
            });
            return { method: 'attribute-trigger', success: true };
        } catch (error) {
            console.warn('Background: Attribute translation failed:', error);
        }

        throw new Error('All translation methods failed');

    } catch (error) {
        console.error('Background: Translation error:', error);
        throw error;
    }
}

/**
 * Trigger Chrome's built-in translation
 * This function runs in the page context
 */
function triggerChromeTranslate(targetLanguage) {
    try {
        console.log('Content: Triggering Chrome translate to', targetLanguage);

        // Set document language attributes
        document.documentElement.setAttribute('translate', 'yes');
        document.body.setAttribute('translate', 'yes');

        // Try to detect current language
        const currentLang = document.documentElement.lang || 'en';
        if (currentLang === targetLanguage) {
            console.log('Content: Already in target language');
            return;
        }

        // Set language attributes to help Chrome detect translation need
        document.documentElement.lang = currentLang;

        // Create translation trigger elements
        const triggerElement = document.createElement('meta');
        triggerElement.setAttribute('name', 'google');
        triggerElement.setAttribute('content', 'translate');
        document.head.appendChild(triggerElement);

        // Dispatch events that might trigger translation
        const events = ['DOMContentLoaded', 'load', 'readystatechange'];
        events.forEach(eventType => {
            try {
                const event = new Event(eventType, { bubbles: true });
                document.dispatchEvent(event);
            } catch (e) {
                console.warn('Content: Failed to dispatch event', eventType, e);
            }
        });

        // Try to trigger via window object
        if (window.chrome && window.chrome.extension) {
            try {
                window.chrome.extension.getBackgroundPage();
            } catch (e) {
                // Ignore errors
            }
        }

        console.log('Content: Chrome translate trigger completed');
        return true;

    } catch (error) {
        console.error('Content: Chrome translate trigger failed:', error);
        throw error;
    }
}

/**
 * Inject Google Translate widget
 * This function runs in the page context
 */
function injectGoogleTranslate(targetLanguage) {
    try {
        console.log('Content: Injecting Google Translate widget');

        // Check if already injected
        if (document.getElementById('google_translate_element')) {
            console.log('Content: Google Translate already injected');
            return true;
        }

        // Create Google Translate element
        const translateDiv = document.createElement('div');
        translateDiv.id = 'google_translate_element';
        translateDiv.style.cssText = 'position: fixed; top: -9999px; left: -9999px; visibility: hidden;';
        document.body.appendChild(translateDiv);

        // Load Google Translate script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

        // Define initialization function
        window.googleTranslateElementInit = function() {
            try {
                const translator = new google.translate.TranslateElement({
                    pageLanguage: 'auto',
                    includedLanguages: targetLanguage,
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');

                // Auto-trigger translation
                setTimeout(() => {
                    try {
                        const selectElement = document.querySelector('.goog-te-combo');
                        if (selectElement) {
                            selectElement.value = targetLanguage;
                            selectElement.dispatchEvent(new Event('change'));
                        }
                    } catch (e) {
                        console.warn('Content: Auto-trigger failed:', e);
                    }
                }, 1000);

                console.log('Content: Google Translate initialized');
            } catch (error) {
                console.error('Content: Google Translate init failed:', error);
            }
        };

        document.head.appendChild(script);
        return true;

    } catch (error) {
        console.error('Content: Google Translate injection failed:', error);
        throw error;
    }
}

/**
 * Trigger translation via document attributes
 * This function runs in the page context
 */
function triggerAttributeTranslation(targetLanguage) {
    try {
        console.log('Content: Triggering attribute-based translation');

        // Set comprehensive translation attributes
        const attributes = {
            'translate': 'yes',
            'lang': 'en',
            'xml:lang': 'en'
        };

        // Apply to document element
        Object.entries(attributes).forEach(([attr, value]) => {
            document.documentElement.setAttribute(attr, value);
        });

        // Apply to body
        document.body.setAttribute('translate', 'yes');

        // Add meta tags for translation
        const metaTags = [
            { name: 'google-translate-customization', content: '1' },
            { name: 'google', content: 'translate' },
            { 'http-equiv': 'content-language', content: 'en' }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.entries(tag).forEach(([attr, value]) => {
                meta.setAttribute(attr, value);
            });
            document.head.appendChild(meta);
        });

        // Create visible content that might trigger translation
        const triggerText = document.createElement('div');
        triggerText.style.cssText = 'position: absolute; top: -9999px; left: -9999px; opacity: 0;';
        triggerText.setAttribute('translate', 'yes');
        triggerText.textContent = 'Please translate this content to Vietnamese. This is English text that should be translated.';
        document.body.appendChild(triggerText);

        // Focus on the element to potentially trigger translation
        triggerText.focus();

        console.log('Content: Attribute translation setup completed');
        return true;

    } catch (error) {
        console.error('Content: Attribute translation failed:', error);
        throw error;
    }
}