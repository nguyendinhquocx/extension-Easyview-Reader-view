/**
 * Fixed Line Highlighter - Ultra-simple approach
 * Uses inline styles for precise positioning without coordinate issues
 */

class FixedLineHighlighter {
    constructor(iframeDocument, options = {}) {
        this.doc = iframeDocument;
        this.options = {
            highlightColor: 'rgba(255, 255, 0, 0.4)', // Darker yellow
            transitionSpeed: '0.15s',
            throttleDelay: 32, // Slower for stability
            enabled: true,
            ...options
        };

        this.isEnabled = this.options.enabled;
        this.currentHighlight = null;
        this.currentElement = null;
        this.lastMouseY = -1;

        this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), this.options.throttleDelay);

        this.init();
    }

    /**
     * Initialize with simple approach
     */
    init() {
        try {
            console.log('FixedLineHighlighter: Initializing...');
            this.addStyles();
            this.attachEvents();
            console.log('FixedLineHighlighter: Initialized successfully');
        } catch (error) {
            console.error('FixedLineHighlighter: Initialization failed:', error);
        }
    }

    /**
     * Add CSS styles
     */
    addStyles() {
        const styleId = 'fixed-line-highlighter-styles';

        // Remove existing styles
        const existingStyle = this.doc.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = this.doc.createElement('style');
        style.id = styleId;
        style.textContent = `
            .line-highlight-element {
                background: linear-gradient(to right,
                    ${this.options.highlightColor},
                    ${this.options.highlightColor}
                ) !important;
                transition: background ${this.options.transitionSpeed} ease !important;
                display: block !important;
                margin-left: -15px !important;
                margin-right: -15px !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
                border-radius: 3px !important;
            }

            .line-highlight-text {
                background: ${this.options.highlightColor} !important;
                transition: background ${this.options.transitionSpeed} ease !important;
                border-radius: 2px !important;
                padding: 1px 0 !important;
            }
        `;

        this.doc.head.appendChild(style);
        console.log('FixedLineHighlighter: Styles added');
    }

    /**
     * Attach events with simple detection
     */
    attachEvents() {
        this.doc.addEventListener('mousemove', this.throttledMouseMove);
        this.doc.addEventListener('mouseleave', this.clearHighlight.bind(this));

        console.log('FixedLineHighlighter: Events attached');
    }

    /**
     * Handle mouse move with element-based detection
     */
    handleMouseMove(event) {
        if (!this.isEnabled) return;

        // Skip if mouse hasn't moved much
        if (Math.abs(event.clientY - this.lastMouseY) < 10) return;
        this.lastMouseY = event.clientY;

        // Get element at mouse position
        const element = this.doc.elementFromPoint(event.clientX, event.clientY);

        if (!element) {
            this.clearHighlight();
            return;
        }

        // Find the best element to highlight
        const targetElement = this.findBestElementToHighlight(element);

        if (targetElement && targetElement !== this.currentElement) {
            this.highlightElement(targetElement);
        }
    }

    /**
     * Find the best element to highlight (text container)
     */
    findBestElementToHighlight(element) {
        // Skip non-text elements
        if (!element || !element.textContent || element.textContent.trim().length < 5) {
            return null;
        }

        // Skip script, style, etc.
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(element.tagName)) {
            return null;
        }

        // Find the best text container
        let current = element;

        // Go up to find paragraph-level element
        while (current && current !== this.doc.body) {
            if (this.isGoodTextContainer(current)) {
                return current;
            }
            current = current.parentElement;
        }

        // If no good container found, use the original element
        return this.isGoodTextContainer(element) ? element : null;
    }

    /**
     * Check if element is good for highlighting
     */
    isGoodTextContainer(element) {
        if (!element || !element.textContent) return false;

        const text = element.textContent.trim();
        const tagName = element.tagName;

        // Good containers
        if (['P', 'DIV', 'SPAN', 'LI', 'TD', 'TH', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
            return text.length > 5 && text.length < 1000;
        }

        // Check if it's a text node container
        if (element.children.length === 0 && text.length > 5) {
            return true;
        }

        return false;
    }

    /**
     * Highlight an element
     */
    highlightElement(element) {
        this.clearHighlight();

        try {
            // Method 1: Try to highlight individual lines within the element
            if (this.highlightElementLines(element)) {
                this.currentElement = element;
                return;
            }

            // Method 2: Fallback to element highlighting
            element.classList.add('line-highlight-element');
            this.currentElement = element;

        } catch (error) {
            console.error('FixedLineHighlighter: Error highlighting element:', error);
        }
    }

    /**
     * Try to highlight individual lines within an element
     */
    highlightElementLines(element) {
        try {
            const text = element.textContent;
            if (text.length > 200) return false; // Too long, use element highlighting

            // Check if element has simple text content
            if (element.children.length === 0) {
                // Simple text node, highlight as single line
                element.classList.add('line-highlight-text');
                return true;
            }

            // For elements with children, highlight the whole element
            return false;

        } catch (error) {
            return false;
        }
    }

    /**
     * Clear current highlight
     */
    clearHighlight() {
        if (!this.currentElement) return;

        try {
            // Remove highlight classes
            this.currentElement.classList.remove('line-highlight-element', 'line-highlight-text');

            // Also remove from any child elements
            const highlightedElements = this.doc.querySelectorAll('.line-highlight-element, .line-highlight-text');
            highlightedElements.forEach(el => {
                el.classList.remove('line-highlight-element', 'line-highlight-text');
            });

        } catch (error) {
            console.error('FixedLineHighlighter: Error clearing highlight:', error);
        }

        this.currentElement = null;
    }

    /**
     * Enable/disable highlighting
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearHighlight();
        }
        console.log('FixedLineHighlighter:', enabled ? 'Enabled' : 'Disabled');
    }

    /**
     * Set highlight color
     */
    setHighlightColor(color) {
        this.options.highlightColor = color;
        this.addStyles(); // Re-inject styles
    }

    /**
     * Refresh (no-op for this simple implementation)
     */
    refresh() {
        this.clearHighlight();
        console.log('FixedLineHighlighter: Refreshed');
    }

    /**
     * Destroy
     */
    destroy() {
        this.clearHighlight();

        // Remove events
        this.doc.removeEventListener('mousemove', this.throttledMouseMove);
        this.doc.removeEventListener('mouseleave', this.clearHighlight);

        // Remove styles
        const style = this.doc.getElementById('fixed-line-highlighter-styles');
        if (style) style.remove();

        console.log('FixedLineHighlighter: Destroyed');
    }

    /**
     * Throttle utility
     */
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;

        return (...args) => {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.FixedLineHighlighter = FixedLineHighlighter;
}