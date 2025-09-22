/**
 * Simple Line Highlighter - Overlay-based approach
 * Uses CSS overlay instead of DOM manipulation for more stable highlighting
 */

class SimpleLineHighlighter {
    constructor(iframeDocument, options = {}) {
        this.doc = iframeDocument;
        this.options = {
            highlightColor: 'rgba(255, 255, 0, 0.2)',
            transitionSpeed: '0.15s',
            throttleDelay: 16,
            enabled: true,
            ...options
        };

        this.isEnabled = this.options.enabled;
        this.currentHighlight = null;
        this.lines = [];
        this.contentContainer = null;
        this.overlay = null;

        this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), this.options.throttleDelay);

        this.init();
    }

    /**
     * Initialize the highlighter
     */
    init() {
        try {
            console.log('SimpleLineHighlighter: Initializing...');
            this.findContentContainer();
            this.createOverlay();
            this.detectLines();
            this.attachEvents();
            console.log('SimpleLineHighlighter: Initialized with', this.lines.length, 'lines');
        } catch (error) {
            console.error('SimpleLineHighlighter: Initialization failed:', error);
        }
    }

    /**
     * Find content container
     */
    findContentContainer() {
        const selectors = ['article', '.content', '#content', 'main', 'body'];

        for (const selector of selectors) {
            const element = this.doc.querySelector(selector);
            if (element && element.innerText.trim().length > 100) {
                this.contentContainer = element;
                console.log('SimpleLineHighlighter: Content container found:', selector);
                return;
            }
        }

        this.contentContainer = this.doc.body;
    }

    /**
     * Create overlay for highlighting with fixed positioning
     */
    createOverlay() {
        // Remove existing overlay
        const existingOverlay = this.doc.getElementById('line-highlight-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        this.overlay = this.doc.createElement('div');
        this.overlay.id = 'line-highlight-overlay';
        this.overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 1000 !important;
            overflow: hidden !important;
        `;

        this.doc.body.appendChild(this.overlay);
        console.log('SimpleLineHighlighter: Overlay created');
    }

    /**
     * Detect lines in content
     */
    detectLines() {
        if (!this.contentContainer) return;

        this.lines = [];
        const range = this.doc.createRange();

        // Get all text nodes
        const walker = this.doc.createTreeWalker(
            this.contentContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                    const parent = node.parentElement;
                    if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Analyze each text node line by line
        textNodes.forEach(textNode => {
            this.analyzeTextNodeLines(textNode, range);
        });

        // Sort and clean lines
        this.lines = this.lines
            .sort((a, b) => a.top - b.top)
            .filter(line => line.height > 5); // Filter very small lines

        console.log('SimpleLineHighlighter: Detected', this.lines.length, 'text lines');
    }

    /**
     * Analyze text node to extract line rectangles
     */
    analyzeTextNodeLines(textNode, range) {
        const text = textNode.textContent;
        let lastBottom = -1;
        let currentLineStart = 0;

        // Sample text at intervals to detect line breaks
        for (let i = 0; i < text.length; i += 10) {
            try {
                range.setStart(textNode, i);
                range.setEnd(textNode, Math.min(i + 10, text.length));

                const rect = range.getBoundingClientRect();
                if (rect.height === 0) continue;

                const rectTop = Math.round(rect.top);
                const rectBottom = Math.round(rect.bottom);

                // Check if we've moved to a new line
                if (lastBottom !== -1 && rectTop > lastBottom + 3) {
                    // Save previous line
                    this.addLineFromRange(textNode, currentLineStart, i, range);
                    currentLineStart = i;
                }

                lastBottom = rectBottom;

            } catch (error) {
                continue;
            }
        }

        // Add the last line
        if (currentLineStart < text.length) {
            this.addLineFromRange(textNode, currentLineStart, text.length, range);
        }
    }

    /**
     * Add a line from text range with proper positioning
     */
    addLineFromRange(textNode, startIndex, endIndex, range) {
        try {
            range.setStart(textNode, startIndex);
            range.setEnd(textNode, Math.min(endIndex, textNode.textContent.length));

            const rect = range.getBoundingClientRect();
            if (rect.height < 5) return; // Skip very small lines

            // Use document-relative positioning instead of container-relative
            const scrollTop = this.doc.documentElement.scrollTop || this.doc.body.scrollTop;
            const scrollLeft = this.doc.documentElement.scrollLeft || this.doc.body.scrollLeft;

            this.lines.push({
                top: rect.top + scrollTop,
                left: Math.max(0, rect.left + scrollLeft - 10), // Add margin
                width: Math.min(this.doc.documentElement.clientWidth, rect.width + 20),
                height: rect.height,
                text: textNode.textContent.substring(startIndex, endIndex).trim(),
                originalRect: rect // Store original for debugging
            });

        } catch (error) {
            // Skip problematic ranges
        }
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
        if (!this.contentContainer) return;

        this.contentContainer.addEventListener('mousemove', this.throttledMouseMove);
        this.contentContainer.addEventListener('mouseleave', this.clearHighlight.bind(this));
        this.doc.addEventListener('mouseleave', this.clearHighlight.bind(this));

        console.log('SimpleLineHighlighter: Events attached');
    }

    /**
     * Handle mouse move events with proper coordinate calculation
     */
    handleMouseMove(event) {
        if (!this.isEnabled) return;

        // Get mouse position relative to the iframe document
        const mouseY = event.clientY + this.doc.documentElement.scrollTop;

        const lineIndex = this.getLineAtPosition(mouseY);

        if (lineIndex !== this.currentHighlight) {
            this.highlightLine(lineIndex);
        }
    }

    /**
     * Get line at position
     */
    getLineAtPosition(mouseY) {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            if (mouseY >= line.top && mouseY <= line.top + line.height) {
                return i;
            }
        }

        // Fallback: find closest line
        let closestIndex = -1;
        let minDistance = Infinity;

        this.lines.forEach((line, index) => {
            const lineCenter = line.top + line.height / 2;
            const distance = Math.abs(mouseY - lineCenter);
            if (distance < minDistance && distance < 15) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    /**
     * Highlight line using overlay
     */
    highlightLine(lineIndex) {
        this.clearHighlight();

        if (lineIndex === -1 || lineIndex >= this.lines.length) return;

        const line = this.lines[lineIndex];

        // Create highlight element
        const highlight = this.doc.createElement('div');
        highlight.className = 'line-highlight-overlay';
        highlight.style.cssText = `
            position: absolute !important;
            top: ${line.top}px !important;
            left: ${line.left}px !important;
            width: ${line.width}px !important;
            height: ${line.height}px !important;
            background-color: ${this.options.highlightColor} !important;
            border-radius: 2px !important;
            transition: opacity ${this.options.transitionSpeed} ease-in-out !important;
            opacity: 1 !important;
            pointer-events: none !important;
        `;

        this.overlay.appendChild(highlight);
        this.currentHighlight = lineIndex;
        this.currentHighlightElement = highlight;
    }

    /**
     * Clear highlight
     */
    clearHighlight() {
        if (this.currentHighlightElement) {
            this.currentHighlightElement.remove();
            this.currentHighlightElement = null;
        }
        this.currentHighlight = null;
    }

    /**
     * Enable/disable highlighting
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearHighlight();
        }
    }

    /**
     * Set highlight color
     */
    setHighlightColor(color) {
        this.options.highlightColor = color;
    }

    /**
     * Refresh line detection
     */
    refresh() {
        this.clearHighlight();
        this.detectLines();
    }

    /**
     * Destroy highlighter
     */
    destroy() {
        this.clearHighlight();

        if (this.overlay) {
            this.overlay.remove();
        }

        if (this.contentContainer) {
            this.contentContainer.removeEventListener('mousemove', this.throttledMouseMove);
            this.contentContainer.removeEventListener('mouseleave', this.clearHighlight);
        }

        this.doc.removeEventListener('mouseleave', this.clearHighlight);
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
    window.SimpleLineHighlighter = SimpleLineHighlighter;
}