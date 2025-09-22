/**
 * LineHighlighter - Highlights text lines on hover for better reading experience
 * Author: Easyview Reader View
 * Version: 1.0.0
 */

class LineHighlighter {
    constructor(iframeDocument, options = {}) {
        this.doc = iframeDocument;
        this.options = {
            highlightColor: 'rgba(255, 255, 0, 0.2)', // Yellow with 20% opacity
            transitionSpeed: '0.15s',
            throttleDelay: 16, // 60fps
            enabled: true,
            cacheEnabled: true,
            maxCacheSize: 1000, // Maximum number of cached line positions
            debounceDelay: 150, // Debounce delay for resize events
            ...options
        };

        // State management
        this.isEnabled = this.options.enabled;
        this.currentHighlight = null;
        this.lines = [];
        this.lineElements = [];
        this.lastMouseY = -1;
        this.contentContainer = null;

        // Performance optimization
        this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), this.options.throttleDelay);
        this.debouncedRefresh = this.debounce(this.refresh.bind(this), this.options.debounceDelay);

        // Caching system
        this.cache = {
            linePositions: new Map(),
            viewportDimensions: { width: 0, height: 0 },
            contentHash: '',
            lastCacheTime: 0,
            isValid: false
        };

        // Performance monitoring
        this.performance = {
            lastDetectionTime: 0,
            averageDetectionTime: 0,
            detectionCount: 0,
            maxDetectionTime: 0
        };

        this.init();
    }

    /**
     * Initialize the line highlighter
     */
    init() {
        try {
            console.log('LineHighlighter: Initializing...');
            this.findContentContainer();
            this.injectStyles();
            this.detectLines();
            this.attachEvents();
            console.log('LineHighlighter: Initialized successfully with', this.lines.length, 'lines');
        } catch (error) {
            console.error('LineHighlighter: Initialization failed:', error);
        }
    }

    /**
     * Find the main content container in iframe
     */
    findContentContainer() {
        // Try different selectors for content area
        const selectors = [
            'article',
            '.content',
            '#content',
            '.post-content',
            '.entry-content',
            '.article-content',
            'main',
            'body'
        ];

        for (const selector of selectors) {
            const element = this.doc.querySelector(selector);
            if (element && element.innerText.trim().length > 100) {
                this.contentContainer = element;
                console.log('LineHighlighter: Content container found:', selector);
                return;
            }
        }

        // Fallback to body
        this.contentContainer = this.doc.body;
        console.log('LineHighlighter: Using body as content container');
    }

    /**
     * Inject CSS styles for highlighting
     */
    injectStyles() {
        const styleId = 'line-highlighter-styles';

        // Remove existing styles if any
        const existingStyle = this.doc.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = this.doc.createElement('style');
        style.id = styleId;
        style.textContent = `
            .line-highlight {
                background-color: ${this.options.highlightColor} !important;
                transition: background-color ${this.options.transitionSpeed} ease-in-out !important;
                display: block !important;
                width: 100% !important;
                margin-left: -20px !important;
                margin-right: -20px !important;
                padding-left: 20px !important;
                padding-right: 20px !important;
                box-sizing: border-box !important;
            }

            .line-highlight-wrapper {
                position: relative !important;
                display: block !important;
                line-height: inherit !important;
            }
        `;

        this.doc.head.appendChild(style);
        console.log('LineHighlighter: Styles injected');
    }

    /**
     * Detect visual lines in the content with caching
     */
    detectLines() {
        if (!this.contentContainer) return;

        const startTime = performance.now();

        // Check if we can use cached results
        if (this.options.cacheEnabled && this.isCacheValid()) {
            console.log('LineHighlighter: Using cached line positions');
            this.loadFromCache();
            return;
        }

        this.lines = [];
        this.lineElements = [];

        try {
            // Get all text nodes
            const walker = this.doc.createTreeWalker(
                this.contentContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        // Skip empty or whitespace-only nodes
                        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;

                        // Skip script and style elements
                        const parent = node.parentElement;
                        if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(parent.tagName)) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        // Skip hidden elements
                        if (parent && parent.style &&
                           (parent.style.display === 'none' || parent.style.visibility === 'hidden')) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                },
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            // Group text nodes by visual lines
            this.groupTextNodesByLines(textNodes);

            // Cache the results
            if (this.options.cacheEnabled) {
                this.updateCache();
            }

        } catch (error) {
            console.error('LineHighlighter: Error detecting lines:', error);
        }

        // Update performance metrics
        const detectionTime = performance.now() - startTime;
        this.updatePerformanceMetrics(detectionTime);

        console.log('LineHighlighter: Detected', this.lines.length, 'lines in', detectionTime.toFixed(2), 'ms');
    }

    /**
     * Group text nodes by their visual lines
     */
    groupTextNodesByLines(textNodes) {
        const lines = new Map(); // y-position -> nodes

        textNodes.forEach(textNode => {
            const range = this.doc.createRange();
            range.selectNode(textNode);
            const rect = range.getBoundingClientRect();

            if (rect.height === 0) return; // Skip invisible nodes

            const lineY = Math.round(rect.top);

            if (!lines.has(lineY)) {
                lines.set(lineY, []);
            }

            lines.get(lineY).push({
                node: textNode,
                rect: rect,
                element: textNode.parentElement
            });
        });

        // Convert to array and sort by Y position
        this.lines = Array.from(lines.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([y, nodes]) => ({
                y: y,
                nodes: nodes,
                elements: [...new Set(nodes.map(n => n.element))] // Unique parent elements
            }));
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
        if (!this.contentContainer) return;

        this.contentContainer.addEventListener('mousemove', this.throttledMouseMove);
        this.contentContainer.addEventListener('mouseleave', this.clearHighlight.bind(this));

        // Also listen on document for better coverage
        this.doc.addEventListener('mouseleave', this.clearHighlight.bind(this));

        console.log('LineHighlighter: Events attached');
    }

    /**
     * Handle mouse move events with improved stability
     */
    handleMouseMove(event) {
        if (!this.isEnabled) return;

        const mouseY = event.clientY;

        // Skip if mouse hasn't moved much vertically (increased threshold)
        if (Math.abs(mouseY - this.lastMouseY) < 8) return;
        this.lastMouseY = mouseY;

        const lineIndex = this.getLineAtPosition(mouseY);

        // Only highlight if line changed (prevent unnecessary re-highlighting)
        if (lineIndex !== this.currentHighlight) {
            this.highlightLine(lineIndex);
        }
    }

    /**
     * Get line index at given Y position with improved accuracy
     */
    getLineAtPosition(mouseY) {
        let closestLine = -1;
        let minDistance = Infinity;

        // Adjust mouseY relative to iframe position
        const iframeRect = this.doc.documentElement.getBoundingClientRect();
        const adjustedMouseY = mouseY - iframeRect.top;

        this.lines.forEach((line, index) => {
            // Calculate line height for better detection
            const lineHeight = 20; // Approximate line height
            const lineTop = line.y - lineHeight / 2;
            const lineBottom = line.y + lineHeight / 2;

            // Check if mouse is within line bounds
            if (adjustedMouseY >= lineTop && adjustedMouseY <= lineBottom) {
                const distance = Math.abs(line.y - adjustedMouseY);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestLine = index;
                }
            }
        });

        // Use wider tolerance for line detection
        if (closestLine === -1) {
            this.lines.forEach((line, index) => {
                const distance = Math.abs(line.y - adjustedMouseY);
                if (distance < minDistance && distance < 25) {
                    minDistance = distance;
                    closestLine = index;
                }
            });
        }

        return closestLine;
    }

    /**
     * Highlight a specific line using range-based highlighting
     */
    highlightLine(lineIndex) {
        // Clear current highlight
        this.clearHighlight();

        if (lineIndex === -1 || lineIndex >= this.lines.length) return;

        const line = this.lines[lineIndex];

        try {
            // Create highlighting for each text segment in the line
            line.textSegments.forEach(segment => {
                this.highlightTextSegment(segment);
            });

            this.currentHighlight = lineIndex;
        } catch (error) {
            console.error('LineHighlighter: Error highlighting line:', error);
        }
    }

    /**
     * Highlight a specific text segment
     */
    highlightTextSegment(segment) {
        try {
            const range = this.doc.createRange();
            range.setStart(segment.textNode, segment.startIndex);
            range.setEnd(segment.textNode, segment.endIndex);

            // Create a span wrapper for the highlighted text
            const highlightSpan = this.doc.createElement('span');
            highlightSpan.className = 'line-highlight-span';
            highlightSpan.style.cssText = `
                background-color: ${this.options.highlightColor} !important;
                transition: background-color ${this.options.transitionSpeed} ease-in-out !important;
                display: inline !important;
                border-radius: 2px !important;
                padding: 1px 2px !important;
                margin: 0 !important;
            `;

            // Wrap the range content
            try {
                range.surroundContents(highlightSpan);
            } catch (e) {
                // Fallback: clone contents and replace
                const contents = range.extractContents();
                highlightSpan.appendChild(contents);
                range.insertNode(highlightSpan);
            }

            // Store reference for cleanup
            if (!this.highlightedSpans) {
                this.highlightedSpans = [];
            }
            this.highlightedSpans.push(highlightSpan);

        } catch (error) {
            console.error('LineHighlighter: Error highlighting text segment:', error);
            // Fallback to element highlighting
            if (segment.element && segment.element.classList) {
                segment.element.classList.add('line-highlight');
            }
        }
    }

    /**
     * Clear current highlight
     */
    clearHighlight() {
        if (this.currentHighlight === null) return;

        try {
            // Remove highlight spans
            if (this.highlightedSpans) {
                this.highlightedSpans.forEach(span => {
                    if (span && span.parentNode) {
                        // Move text content back to parent and remove span
                        const parent = span.parentNode;
                        while (span.firstChild) {
                            parent.insertBefore(span.firstChild, span);
                        }
                        parent.removeChild(span);
                    }
                });
                this.highlightedSpans = [];
            }

            // Also remove any class-based highlights (fallback)
            const highlightedElements = this.doc.querySelectorAll('.line-highlight');
            highlightedElements.forEach(element => {
                element.classList.remove('line-highlight');
            });

            // Normalize text nodes to merge any split text nodes
            if (this.contentContainer) {
                this.normalizeTextNodes(this.contentContainer);
            }

        } catch (error) {
            console.error('LineHighlighter: Error clearing highlight:', error);
        }

        this.currentHighlight = null;
    }

    /**
     * Normalize text nodes to merge split nodes
     */
    normalizeTextNodes(container) {
        try {
            // Use built-in normalize method if available
            if (container.normalize) {
                container.normalize();
            }
        } catch (error) {
            // Ignore normalization errors
        }
    }

    /**
     * Enable/disable line highlighting
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearHighlight();
        }
        console.log('LineHighlighter:', enabled ? 'Enabled' : 'Disabled');
    }

    /**
     * Update highlight color
     */
    setHighlightColor(color) {
        this.options.highlightColor = color;
        this.injectStyles(); // Re-inject styles with new color
    }

    /**
     * Refresh line detection (call when content changes)
     */
    refresh() {
        this.clearHighlight();
        this.detectLines();
        console.log('LineHighlighter: Refreshed');
    }

    /**
     * Destroy the highlighter and cleanup
     */
    destroy() {
        this.clearHighlight();

        if (this.contentContainer) {
            this.contentContainer.removeEventListener('mousemove', this.throttledMouseMove);
            this.contentContainer.removeEventListener('mouseleave', this.clearHighlight);
        }

        this.doc.removeEventListener('mouseleave', this.clearHighlight);

        // Remove injected styles
        const style = this.doc.getElementById('line-highlighter-styles');
        if (style) style.remove();

        console.log('LineHighlighter: Destroyed');
    }

    /**
     * Cache management methods
     */
    isCacheValid() {
        if (!this.cache.isValid) return false;

        // Check if viewport dimensions changed
        const currentWidth = this.doc.documentElement.clientWidth;
        const currentHeight = this.doc.documentElement.clientHeight;

        if (this.cache.viewportDimensions.width !== currentWidth ||
            this.cache.viewportDimensions.height !== currentHeight) {
            return false;
        }

        // Check if content hash changed (basic content change detection)
        const currentHash = this.generateContentHash();
        if (this.cache.contentHash !== currentHash) {
            return false;
        }

        // Cache expires after 30 seconds
        const cacheAge = Date.now() - this.cache.lastCacheTime;
        return cacheAge < 30000;
    }

    generateContentHash() {
        if (!this.contentContainer) return '';

        // Simple hash based on content length and first/last 100 chars
        const text = this.contentContainer.innerText || '';
        const firstPart = text.substring(0, 100);
        const lastPart = text.substring(text.length - 100);
        return `${text.length}-${firstPart.length}-${lastPart.length}`;
    }

    updateCache() {
        this.cache.linePositions.clear();

        // Cache line positions
        this.lines.forEach((line, index) => {
            this.cache.linePositions.set(index, {
                y: line.y,
                elements: line.elements.map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent ? el.textContent.substring(0, 50) : ''
                }))
            });
        });

        this.cache.viewportDimensions = {
            width: this.doc.documentElement.clientWidth,
            height: this.doc.documentElement.clientHeight
        };
        this.cache.contentHash = this.generateContentHash();
        this.cache.lastCacheTime = Date.now();
        this.cache.isValid = true;

        console.log('LineHighlighter: Cache updated with', this.lines.length, 'lines');
    }

    loadFromCache() {
        // Note: For now, we'll still need to re-detect because we need live DOM references
        // This method could be enhanced to store more data for full cache utilization
        console.log('LineHighlighter: Cache validation passed, but still need to re-detect for DOM references');
        this.cache.isValid = false; // Force re-detection for now
    }

    clearCache() {
        this.cache.linePositions.clear();
        this.cache.isValid = false;
        console.log('LineHighlighter: Cache cleared');
    }

    /**
     * Performance monitoring
     */
    updatePerformanceMetrics(detectionTime) {
        this.performance.detectionCount++;
        this.performance.lastDetectionTime = detectionTime;
        this.performance.maxDetectionTime = Math.max(this.performance.maxDetectionTime, detectionTime);

        // Calculate moving average
        const oldAvg = this.performance.averageDetectionTime;
        this.performance.averageDetectionTime =
            (oldAvg * (this.performance.detectionCount - 1) + detectionTime) / this.performance.detectionCount;
    }

    getPerformanceStats() {
        return {
            ...this.performance,
            cacheHitRate: this.cache.isValid ? 'Cache enabled' : 'Cache disabled',
            totalLines: this.lines.length
        };
    }

    /**
     * Enhanced edge case handling
     */
    groupTextNodesByLines(textNodes) {
        const lines = [];

        // Process each text node to extract visual lines
        textNodes.forEach(textNode => {
            if (!textNode.textContent.trim()) return;

            const parentElement = textNode.parentElement;
            if (!parentElement) return;

            // Extract lines from this text node
            this.extractLinesFromTextNode(textNode, lines);
        });

        // Sort lines by Y position and filter
        this.lines = lines
            .sort((a, b) => a.y - b.y)
            .filter(line => !line.isEmpty);
    }

    /**
     * Extract visual lines from a text node using word-by-word analysis
     */
    extractLinesFromTextNode(textNode, lines) {
        const text = textNode.textContent;
        const words = text.split(/(\s+)/); // Split keeping whitespace
        const range = this.doc.createRange();

        let currentLineY = null;
        let currentLineStartIndex = 0;
        let wordStartIndex = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordEndIndex = wordStartIndex + word.length;

            // Skip pure whitespace unless it's the last word
            if (word.trim() === '' && i < words.length - 1) {
                wordStartIndex = wordEndIndex;
                continue;
            }

            try {
                // Get position of this word
                range.setStart(textNode, wordStartIndex);
                range.setEnd(textNode, Math.min(wordEndIndex, text.length));

                const rect = range.getBoundingClientRect();
                if (rect.height === 0 || rect.width === 0) {
                    wordStartIndex = wordEndIndex;
                    continue;
                }

                const wordY = Math.round(rect.top);

                // Check if this word is on a new line
                if (currentLineY === null || Math.abs(wordY - currentLineY) > 5) {
                    // Save previous line if exists
                    if (currentLineY !== null && currentLineStartIndex < wordStartIndex) {
                        this.addTextLine(lines, textNode, currentLineStartIndex, wordStartIndex, currentLineY);
                    }

                    // Start new line
                    currentLineY = wordY;
                    currentLineStartIndex = wordStartIndex;
                }

                wordStartIndex = wordEndIndex;

            } catch (error) {
                wordStartIndex = wordEndIndex;
                continue;
            }
        }

        // Add the last line
        if (currentLineY !== null && currentLineStartIndex < text.length) {
            this.addTextLine(lines, textNode, currentLineStartIndex, text.length, currentLineY);
        }
    }

    /**
     * Add a text line to the lines array
     */
    addTextLine(lines, textNode, startIndex, endIndex, y) {
        const lineText = textNode.textContent.substring(startIndex, endIndex).trim();
        if (lineText.length < 2) return; // Skip very short lines

        // Check if this line already exists at similar Y position
        const existingLineIndex = lines.findIndex(line => Math.abs(line.y - y) <= 3);

        const parentElement = textNode.parentElement;
        const lineData = {
            textNode: textNode,
            startIndex: startIndex,
            endIndex: endIndex,
            text: lineText,
            element: parentElement
        };

        if (existingLineIndex !== -1) {
            // Merge with existing line
            lines[existingLineIndex].textSegments.push(lineData);
            if (!lines[existingLineIndex].elements.includes(parentElement)) {
                lines[existingLineIndex].elements.push(parentElement);
            }
        } else {
            // Create new line
            lines.push({
                y: y,
                textSegments: [lineData],
                elements: [parentElement],
                hasImages: this.elementHasImages(parentElement),
                hasLinks: this.elementHasLinks(parentElement),
                isEmpty: false
            });
        }
    }

    /**
     * Check if element contains images
     */
    elementHasImages(element) {
        return element && (
            element.tagName === 'IMG' ||
            element.querySelector('img') ||
            element.style.backgroundImage
        );
    }

    /**
     * Check if element contains links
     */
    elementHasLinks(element) {
        return element && (
            element.tagName === 'A' ||
            element.closest('a')
        );
    }

    getUniqueElements(elements) {
        const uniqueElements = [];
        const seen = new Set();

        elements.forEach(element => {
            if (element && !seen.has(element)) {
                seen.add(element);
                uniqueElements.push(element);
            }
        });

        return uniqueElements;
    }

    checkForImages(nodes) {
        return nodes.some(nodeData => {
            const element = nodeData.element;
            return element && (
                element.tagName === 'IMG' ||
                element.querySelector('img') ||
                element.style.backgroundImage
            );
        });
    }

    checkForLinks(nodes) {
        return nodes.some(nodeData => {
            const element = nodeData.element;
            return element && (
                element.tagName === 'A' ||
                element.closest('a')
            );
        });
    }

    checkIfEmpty(nodes) {
        const totalText = nodes.reduce((text, nodeData) => {
            return text + (nodeData.node.textContent || '').trim();
        }, '');
        return totalText.length < 3; // Consider lines with less than 3 chars as empty
    }

    /**
     * Debounce function for resize events
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function for performance
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LineHighlighter;
} else if (typeof window !== 'undefined') {
    window.LineHighlighter = LineHighlighter;
}