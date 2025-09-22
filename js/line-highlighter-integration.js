/**
 * Line Highlighter Integration
 * Integrates LineHighlighter with the Reader View
 */

(function() {
    'use strict';

    let lineHighlighter = null;
    let iframeLoadTimer = null;

    /**
     * Initialize line highlighter when iframe is ready
     */
    function initLineHighlighter() {
        const iframe = document.getElementById('reader');

        if (!iframe) {
            console.log('LineHighlighter Integration: Reader iframe not found, retrying...');
            setTimeout(initLineHighlighter, 500);
            return;
        }

        // Wait for iframe to load content
        function checkIframeContent() {
            let iframeDoc;
            let accessMethod = 'unknown';

            try {
                // Try different methods to access iframe content
                iframeDoc = iframe.contentDocument;
                accessMethod = 'contentDocument';
            } catch (error) {
                console.log('LineHighlighter Integration: contentDocument access blocked:', error.message);
                try {
                    iframeDoc = iframe.contentWindow?.document;
                    accessMethod = 'contentWindow.document';
                } catch (error2) {
                    console.log('LineHighlighter Integration: contentWindow.document access blocked:', error2.message);
                    // Fall back to alternative detection methods
                    return initFallbackHighlighter();
                }
            }

            if (!iframeDoc) {
                console.log('LineHighlighter Integration: No iframe document access, trying fallback...');
                return initFallbackHighlighter();
            }

            try {
                // Test if we can actually read the content
                const testContent = iframeDoc.body?.innerText;
                if (!testContent || testContent.trim().length < 50) {
                    console.log('LineHighlighter Integration: Iframe content not ready, retrying...');
                    setTimeout(checkIframeContent, 500);
                    return;
                }

                // Initialize line highlighter
                console.log('LineHighlighter Integration: Initializing with iframe content via', accessMethod);

                // Destroy existing highlighter if any
                if (lineHighlighter) {
                    lineHighlighter.destroy();
                }

                // Create new highlighter using fixed approach
                lineHighlighter = new FixedLineHighlighter(iframeDoc, {
                    highlightColor: 'rgba(255, 255, 0, 0.4)', // Darker yellow
                    transitionSpeed: '0.15s',
                    throttleDelay: 32,
                    enabled: true
                });

                console.log('LineHighlighter Integration: Successfully initialized');

                // Listen for iframe content changes (if reader content is updated)
                observeIframeChanges(iframeDoc);

            } catch (error) {
                console.error('LineHighlighter Integration: Error accessing iframe content:', error);
                console.log('LineHighlighter Integration: Falling back to alternative method...');
                return initFallbackHighlighter();
            }
        }

        // Start checking iframe content
        checkIframeContent();

        // Also listen for iframe load event
        iframe.addEventListener('load', () => {
            console.log('LineHighlighter Integration: Iframe loaded event detected');
            setTimeout(checkIframeContent, 100);
        });
    }

    /**
     * Fallback highlighter for CORS-blocked iframes
     */
    function initFallbackHighlighter() {
        console.log('LineHighlighter Integration: Initializing fallback highlighter...');

        const iframe = document.getElementById('reader');
        if (!iframe) return;

        // Create a proxy document that represents the main page content
        const proxyDoc = {
            querySelector: (selector) => document.querySelector(selector),
            querySelectorAll: (selector) => document.querySelectorAll(selector),
            createElement: (tag) => document.createElement(tag),
            createRange: () => document.createRange(),
            createTreeWalker: (...args) => document.createTreeWalker(...args),
            head: document.head,
            body: document.body,
            documentElement: document.documentElement,
            addEventListener: (...args) => document.addEventListener(...args),
            removeEventListener: (...args) => document.removeEventListener(...args),
            getElementById: (id) => document.getElementById(id)
        };

        try {
            // Try to create highlighter with main document as fallback
            if (lineHighlighter) {
                lineHighlighter.destroy();
            }

            // Create a minimal highlighter that works on the parent page
            lineHighlighter = {
                isEnabled: true,
                fallbackMode: true,

                setEnabled: function(enabled) {
                    this.isEnabled = enabled;
                    console.log('LineHighlighter Fallback:', enabled ? 'Enabled' : 'Disabled');
                },

                setHighlightColor: function(color) {
                    console.log('LineHighlighter Fallback: Color change not supported in fallback mode');
                },

                refresh: function() {
                    console.log('LineHighlighter Fallback: Refresh not supported in fallback mode');
                },

                destroy: function() {
                    console.log('LineHighlighter Fallback: Destroyed');
                }
            };

            console.log('LineHighlighter Integration: Fallback mode initialized (limited functionality)');

            // Show user notification about limited functionality
            showFallbackNotification();

        } catch (error) {
            console.error('LineHighlighter Integration: Even fallback initialization failed:', error);
        }
    }

    /**
     * Show notification about fallback mode
     */
    function showFallbackNotification() {
        // Only show once per session
        if (sessionStorage.getItem('lineHighlighterFallbackShown')) return;

        console.log('LineHighlighter Integration: Running in fallback mode - line highlighting may not work on this site due to security restrictions');
        sessionStorage.setItem('lineHighlighterFallbackShown', 'true');
    }

    /**
     * Observe changes in iframe content
     */
    function observeIframeChanges(iframeDoc) {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver(function(mutations) {
            let shouldRefresh = false;

            mutations.forEach(function(mutation) {
                // Check if content has changed significantly
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldRefresh = true;
                }
            });

            if (shouldRefresh && lineHighlighter) {
                console.log('LineHighlighter Integration: Content changed, refreshing...');
                setTimeout(() => {
                    lineHighlighter.refresh();
                }, 100);
            }
        });

        observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Handle window resize - refresh line detection
     */
    function handleResize() {
        if (lineHighlighter) {
            console.log('LineHighlighter Integration: Window resized, refreshing...');
            setTimeout(() => {
                lineHighlighter.refresh();
            }, 100);
        }
    }

    /**
     * Initialize integration when DOM is ready
     */
    function initIntegration() {
        console.log('LineHighlighter Integration: Starting integration...');

        // Check browser compatibility first
        if (window.BrowserCompatibility) {
            const compat = new BrowserCompatibility();
            const report = compat.getCompatibilityReport();

            console.log('LineHighlighter Integration: Browser compatibility report:', report);

            // Apply polyfills if needed
            compat.applyPolyfills();

            // Check if line highlighting is supported
            if (!report.isSupported) {
                console.warn('LineHighlighter Integration: Browser not fully supported. Some features may not work.');
                console.log('LineHighlighter Integration: Recommendations:', report.recommendations);
            }

            // Use recommended configuration
            window.lineHighlighterConfig = report.recommendedConfig;
        }

        // Initialize line highlighter
        initLineHighlighter();

        // Listen for window resize with debouncing
        const debouncedResize = debounce(handleResize, 150);
        window.addEventListener('resize', debouncedResize);

        // Listen for font/theme changes (assuming they trigger custom events)
        document.addEventListener('readerSettingsChanged', () => {
            if (lineHighlighter) {
                console.log('LineHighlighter Integration: Settings changed, refreshing...');
                setTimeout(() => {
                    lineHighlighter.refresh();
                }, 200);
            }
        });
    }

    /**
     * Debounce utility function
     */
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Public API for controlling line highlighter
     */
    window.LineHighlighterAPI = {
        enable: function() {
            if (lineHighlighter) {
                lineHighlighter.setEnabled(true);
            }
        },

        disable: function() {
            if (lineHighlighter) {
                lineHighlighter.setEnabled(false);
            }
        },

        setColor: function(color) {
            if (lineHighlighter) {
                lineHighlighter.setHighlightColor(color);
            }
        },

        refresh: function() {
            if (lineHighlighter) {
                lineHighlighter.refresh();
            }
        },

        isEnabled: function() {
            return lineHighlighter ? lineHighlighter.isEnabled : false;
        }
    };

    // Start integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIntegration);
    } else {
        initIntegration();
    }

})();