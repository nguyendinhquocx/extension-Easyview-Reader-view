/**
 * Browser Compatibility Checker for Line Highlighting
 * Tests various browser features and provides fallbacks
 */

class BrowserCompatibility {
    constructor() {
        this.features = {
            intersectionObserver: false,
            mutationObserver: false,
            getComputedStyle: false,
            querySelector: false,
            getBoundingClientRect: false,
            cssTransitions: false,
            performance: false,
            requestAnimationFrame: false,
            modernEvents: false
        };

        this.browserInfo = {
            name: 'unknown',
            version: 'unknown',
            engine: 'unknown',
            isSupported: false
        };

        this.checkFeatures();
        this.detectBrowser();
    }

    /**
     * Check for required browser features
     */
    checkFeatures() {
        // IntersectionObserver (for performance optimization)
        this.features.intersectionObserver = 'IntersectionObserver' in window;

        // MutationObserver (for content change detection)
        this.features.mutationObserver = 'MutationObserver' in window;

        // getComputedStyle (for layout calculations)
        this.features.getComputedStyle = 'getComputedStyle' in window;

        // querySelector (for DOM traversal)
        this.features.querySelector = 'querySelector' in document;

        // getBoundingClientRect (for position calculations)
        this.features.getBoundingClientRect = 'getBoundingClientRect' in Element.prototype;

        // CSS Transitions (for smooth animations)
        this.features.cssTransitions = this.checkCSSTransitions();

        // Performance API (for timing measurements)
        this.features.performance = 'performance' in window && 'now' in performance;

        // requestAnimationFrame (for smooth animations)
        this.features.requestAnimationFrame = 'requestAnimationFrame' in window;

        // Modern event handling
        this.features.modernEvents = 'addEventListener' in window;

        console.log('BrowserCompatibility: Feature check results:', this.features);
    }

    /**
     * Check CSS transition support
     */
    checkCSSTransitions() {
        const testElement = document.createElement('div');
        const transitionProperties = [
            'transition',
            'webkitTransition',
            'mozTransition',
            'oTransition',
            'msTransition'
        ];

        return transitionProperties.some(property =>
            property in testElement.style
        );
    }

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;

        // Chrome/Chromium detection
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            this.browserInfo.name = 'Chrome';
            this.browserInfo.engine = 'Blink';
            const match = userAgent.match(/Chrome\/(\d+)/);
            if (match) {
                this.browserInfo.version = match[1];
                this.browserInfo.isSupported = parseInt(match[1]) >= 90;
            }
        }
        // Edge detection
        else if (userAgent.includes('Edg')) {
            this.browserInfo.name = 'Edge';
            this.browserInfo.engine = 'Blink';
            const match = userAgent.match(/Edg\/(\d+)/);
            if (match) {
                this.browserInfo.version = match[1];
                this.browserInfo.isSupported = parseInt(match[1]) >= 90;
            }
        }
        // Firefox detection
        else if (userAgent.includes('Firefox')) {
            this.browserInfo.name = 'Firefox';
            this.browserInfo.engine = 'Gecko';
            const match = userAgent.match(/Firefox\/(\d+)/);
            if (match) {
                this.browserInfo.version = match[1];
                this.browserInfo.isSupported = parseInt(match[1]) >= 85;
            }
        }
        // Safari detection
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            this.browserInfo.name = 'Safari';
            this.browserInfo.engine = 'WebKit';
            const match = userAgent.match(/Version\/(\d+)/);
            if (match) {
                this.browserInfo.version = match[1];
                this.browserInfo.isSupported = parseInt(match[1]) >= 14;
            }
        }

        console.log('BrowserCompatibility: Browser info:', this.browserInfo);
    }

    /**
     * Check if line highlighting is fully supported
     */
    isLineHighlightingSupported() {
        const requiredFeatures = [
            'querySelector',
            'getBoundingClientRect',
            'modernEvents'
        ];

        const hasRequiredFeatures = requiredFeatures.every(
            feature => this.features[feature]
        );

        return hasRequiredFeatures && this.browserInfo.isSupported;
    }

    /**
     * Get recommended configuration based on browser capabilities
     */
    getRecommendedConfig() {
        const config = {
            throttleDelay: 16, // 60fps default
            debounceDelay: 150,
            cacheEnabled: true,
            animationsEnabled: this.features.cssTransitions,
            performanceMonitoring: this.features.performance
        };

        // Adjust for older browsers
        if (!this.browserInfo.isSupported) {
            config.throttleDelay = 33; // 30fps for older browsers
            config.debounceDelay = 300;
            config.cacheEnabled = false;
        }

        // Safari-specific adjustments
        if (this.browserInfo.name === 'Safari') {
            config.throttleDelay = 20; // Slightly slower for Safari
        }

        // Firefox-specific adjustments
        if (this.browserInfo.name === 'Firefox') {
            config.debounceDelay = 100; // Firefox handles debouncing well
        }

        return config;
    }

    /**
     * Get polyfills or fallbacks needed
     */
    getRequiredPolyfills() {
        const polyfills = [];

        if (!this.features.mutationObserver) {
            polyfills.push('mutation-observer');
        }

        if (!this.features.intersectionObserver) {
            polyfills.push('intersection-observer');
        }

        if (!this.features.requestAnimationFrame) {
            polyfills.push('request-animation-frame');
        }

        if (!this.features.performance) {
            polyfills.push('performance-now');
        }

        return polyfills;
    }

    /**
     * Apply polyfills if needed
     */
    applyPolyfills() {
        // requestAnimationFrame polyfill
        if (!this.features.requestAnimationFrame) {
            window.requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function(callback) {
                    return setTimeout(callback, 16);
                };
        }

        // performance.now polyfill
        if (!this.features.performance) {
            window.performance = window.performance || {};
            window.performance.now = window.performance.now ||
                Date.now ||
                function() { return new Date().getTime(); };
        }

        console.log('BrowserCompatibility: Applied polyfills for missing features');
    }

    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            features: this.features,
            isSupported: this.isLineHighlightingSupported(),
            recommendedConfig: this.getRecommendedConfig(),
            requiredPolyfills: this.getRequiredPolyfills(),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get performance recommendations
     */
    getRecommendations() {
        const recommendations = [];

        if (!this.browserInfo.isSupported) {
            recommendations.push('Browser version is outdated. Update for better performance.');
        }

        if (!this.features.cssTransitions) {
            recommendations.push('CSS transitions not supported. Highlighting will be instant.');
        }

        if (!this.features.intersectionObserver) {
            recommendations.push('IntersectionObserver not available. Using fallback detection.');
        }

        if (!this.features.performance) {
            recommendations.push('Performance API not available. Using Date.now() fallback.');
        }

        return recommendations;
    }

    /**
     * Test line highlighting functionality
     */
    testLineHighlighting() {
        const testResults = {
            domAccess: false,
            rangeAPI: false,
            eventHandling: false,
            cssManipulation: false,
            overallScore: 0
        };

        try {
            // Test DOM access
            const testDiv = document.createElement('div');
            testDiv.textContent = 'Test content';
            document.body.appendChild(testDiv);
            testResults.domAccess = testDiv.parentNode === document.body;
            document.body.removeChild(testDiv);

            // Test Range API
            const range = document.createRange();
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            testResults.rangeAPI = range && walker;

            // Test event handling
            let eventHandled = false;
            const testEvent = () => { eventHandled = true; };
            document.addEventListener('test', testEvent);
            document.dispatchEvent(new Event('test'));
            document.removeEventListener('test', testEvent);
            testResults.eventHandling = eventHandled;

            // Test CSS manipulation
            const cssTestDiv = document.createElement('div');
            cssTestDiv.style.backgroundColor = 'red';
            testResults.cssManipulation = cssTestDiv.style.backgroundColor === 'red';

        } catch (error) {
            console.error('BrowserCompatibility: Test failed:', error);
        }

        // Calculate overall score
        const scores = Object.values(testResults).filter(v => typeof v === 'boolean');
        testResults.overallScore = (scores.filter(Boolean).length / scores.length) * 100;

        console.log('BrowserCompatibility: Test results:', testResults);
        return testResults;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibility;
} else if (typeof window !== 'undefined') {
    window.BrowserCompatibility = BrowserCompatibility;
}