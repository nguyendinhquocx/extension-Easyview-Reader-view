/**
 * PaginationReader - Book-style pagination for Reader View
 * Provides horizontal page navigation like reading a real book
 */

class PaginationReader {
    constructor(iframe) {
        this.iframe = iframe;
        this.iframeDoc = null;
        this.iframeBody = null;

        // State
        this.mode = 'pagination'; // 'pagination' or 'scroll'
        this.currentPage = 1;
        this.totalPages = 0;
        this.isCalculating = false;

        // Configuration
        this.config = {
            maxWidth: 850, // Max width for pagination content (same as default page width)
            pageGap: 40, // Gap between pages in pixels
            animationDuration: 400, // ms
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            clickZonePercent: 30, // 30% edges for navigation
            debounceDelay: 300, // Resize debounce
            throttleDelay: 50, // Navigation throttle
        };

        // Cache
        this.pageWidth = 0;
        this.contentWidth = 0;
        this.lastResizeTime = 0;

        // URL tracking
        this.currentUrl = null;

        // Event handlers (bound for cleanup)
        this.boundHandlers = {
            keydown: null,
            click: null,
            resize: null,
            wheel: null,
        };

        // Wheel scroll tracking
        this.lastWheelTime = 0;
        this.wheelThreshold = 300; // ms between wheel navigations

        this.initialized = false;
    }

    /**
     * Initialize pagination reader
     */
    async init() {
        if (this.initialized) return;

        try {
            // Get iframe document
            this.iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            this.iframeBody = this.iframeDoc.body;

            if (!this.iframeBody) {
                console.warn('PaginationReader: Cannot access iframe body');
                return false;
            }

            // Get current URL
            this.currentUrl = this.getCurrentUrl();

            // Load saved mode preference
            await this.loadPreferences();

            // Load saved page position for this URL
            await this.loadPagePosition();

            // Cleanup old position data (run occasionally)
            this.scheduleCleanup();

            // Apply initial mode
            if (this.mode === 'pagination') {
                this.enablePagination();
            } else {
                this.enableScroll();
            }

            this.initialized = true;
            return true;

        } catch (error) {
            console.error('PaginationReader init error:', error);
            return false;
        }
    }

    /**
     * Enable pagination mode
     */
    enablePagination() {
        if (!this.iframeBody) return;

        this.mode = 'pagination';

        // Apply pagination CSS
        this.applyPaginationLayout();

        // Calculate pages
        this.calculatePages();

        // Setup navigation
        this.setupNavigation();

        // Update UI
        this.updateModeUI();

        // Save preference
        this.savePreferences();

        console.log('Pagination mode enabled');
    }

    /**
     * Enable scroll mode
     */
    enableScroll() {
        if (!this.iframeBody) return;

        this.mode = 'scroll';

        // Remove pagination CSS
        this.removePaginationLayout();

        // Remove navigation listeners
        this.removeNavigation();

        // Update UI
        this.updateModeUI();

        // Save preference
        this.savePreferences();

        console.log('Scroll mode enabled');
    }

    /**
     * Apply pagination CSS layout
     */
    applyPaginationLayout() {
        if (!this.iframeBody) return;

        const doc = this.iframeDoc;

        // Add pagination class to iframe body
        this.iframeBody.classList.add('pagination-mode');
        this.iframeBody.classList.remove('scroll-mode');

        // Add class to main body to hide floating buttons
        document.body.classList.add('pagination-active');

        // Use max-width to limit content, margin auto to center (like scroll mode)
        const columnWidth = this.config.maxWidth;

        // Apply column styles - KEEP scroll mode's margin: auto for centering
        const style = `
            body.pagination-mode {
                /* Layout - use max-width + margin auto like scroll mode */
                width: ${columnWidth}px !important;
                max-width: ${columnWidth}px !important;
                margin: 30px auto 0 auto !important;

                /* Column properties */
                column-width: ${columnWidth}px !important;
                column-gap: ${this.config.pageGap}px !important;
                column-fill: auto !important;

                /* Pagination behavior */
                overflow-x: hidden !important;
                overflow-y: hidden !important;
                height: calc(100vh - 100px) !important;
                position: relative !important;
                box-sizing: border-box !important;
            }

            body.pagination-mode * {
                break-inside: avoid-column !important;
            }

            body.pagination-mode p,
            body.pagination-mode div,
            body.pagination-mode img,
            body.pagination-mode figure,
            body.pagination-mode table,
            body.pagination-mode pre,
            body.pagination-mode blockquote {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }

            body.pagination-mode h1,
            body.pagination-mode h2,
            body.pagination-mode h3,
            body.pagination-mode h4 {
                break-after: avoid !important;
            }

            body.pagination-mode {
                transition: transform ${this.config.animationDuration}ms ${this.config.animationEasing};
                will-change: transform;
            }
        `;

        // Inject or update style
        let styleEl = doc.getElementById('pagination-styles');
        if (!styleEl) {
            styleEl = doc.createElement('style');
            styleEl.id = 'pagination-styles';
            doc.head.appendChild(styleEl);
        }
        styleEl.textContent = style;
    }

    /**
     * Remove pagination layout
     */
    removePaginationLayout() {
        if (!this.iframeBody) return;

        this.iframeBody.classList.remove('pagination-mode');
        this.iframeBody.classList.add('scroll-mode');

        // Remove class from main body
        document.body.classList.remove('pagination-active');

        // Remove transform
        this.iframeBody.style.transform = '';

        const doc = this.iframeDoc;
        const styleEl = doc.getElementById('pagination-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }

    /**
     * Calculate total pages
     */
    calculatePages() {
        if (!this.iframeBody || this.isCalculating) return;

        this.isCalculating = true;

        try {
            // Force layout update
            this.iframeBody.offsetHeight;

            // Get content dimensions
            const contentWidth = this.iframeBody.scrollWidth;

            // Single page mode: each page = maxWidth + gap
            const columnWidth = this.config.maxWidth + this.config.pageGap;

            // Calculate total pages
            this.totalPages = Math.ceil(contentWidth / columnWidth);
            this.contentWidth = contentWidth;

            // Ensure current page is valid
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
            if (this.currentPage < 1) {
                this.currentPage = 1;
            }

            // Update page indicator (currently hidden)
            this.updatePageIndicator();

            console.log(`[Pagination] Pages calculated: ${this.totalPages} pages, width: ${contentWidth}px, maxWidth: ${this.config.maxWidth}px`);

        } catch (error) {
            console.error('Calculate pages error:', error);
        } finally {
            this.isCalculating = false;
        }
    }

    /**
     * Navigate to specific page
     */
    goToPage(pageNumber, animate = true) {
        if (!this.iframeBody || this.mode !== 'pagination') return;

        // Clamp page number
        pageNumber = Math.max(1, Math.min(pageNumber, this.totalPages));

        if (pageNumber === this.currentPage) return;

        this.currentPage = pageNumber;

        // Calculate offset (single page mode)
        const columnWidth = this.config.maxWidth + this.config.pageGap;
        const offset = -((pageNumber - 1) * columnWidth);

        // Apply transform
        if (animate) {
            this.iframeBody.style.transition = `transform ${this.config.animationDuration}ms ${this.config.animationEasing}`;
        } else {
            this.iframeBody.style.transition = 'none';
        }

        this.iframeBody.style.transform = `translateX(${offset}px)`;

        // Update UI
        this.updatePageIndicator();

        // Save position
        this.savePagePosition();
    }

    /**
     * Navigate to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    /**
     * Navigate to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigation() {
        // Remove any existing listeners first to prevent duplicates
        this.removeNavigation();

        // Keyboard navigation - use capture phase to run first
        this.boundHandlers.keydown = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });

        // Also add to window for better capture
        window.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });

        // Add to iframe document as well
        if (this.iframeDoc) {
            this.iframeDoc.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });
        }

        // Click zone navigation
        this.boundHandlers.click = this.handleClick.bind(this);
        this.iframe.addEventListener('click', this.boundHandlers.click);

        // Wheel/scroll navigation (horizontal)
        this.boundHandlers.wheel = this.handleWheel.bind(this);
        document.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
        window.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
        if (this.iframeDoc) {
            this.iframeDoc.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
        }

        // Resize handling
        this.boundHandlers.resize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundHandlers.resize);

        console.log('Pagination navigation setup complete with capture phase + wheel support');
    }

    /**
     * Remove navigation listeners
     */
    removeNavigation() {
        if (this.boundHandlers.keydown) {
            document.removeEventListener('keydown', this.boundHandlers.keydown, { capture: true });
            window.removeEventListener('keydown', this.boundHandlers.keydown, { capture: true });
            if (this.iframeDoc) {
                this.iframeDoc.removeEventListener('keydown', this.boundHandlers.keydown, { capture: true });
            }
        }
        if (this.boundHandlers.click) {
            this.iframe.removeEventListener('click', this.boundHandlers.click);
        }
        if (this.boundHandlers.wheel) {
            document.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
            window.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
            if (this.iframeDoc) {
                this.iframeDoc.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
            }
        }
        if (this.boundHandlers.resize) {
            window.removeEventListener('resize', this.boundHandlers.resize);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        // Debug logging for ALL keydown events in pagination mode
        console.log(`[Pagination] Keydown: ${e.key}, mode: ${this.mode}, eventPhase: ${e.eventPhase}`);

        if (this.mode !== 'pagination') return;

        let handled = false;

        switch (e.key) {
            case 'ArrowLeft':
                console.log('[Pagination] ArrowLeft detected - going to prev page');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.prevPage();
                handled = true;
                break;
            case 'ArrowRight':
                console.log('[Pagination] ArrowRight detected - going to next page');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.nextPage();
                handled = true;
                break;
            case 'Home':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.goToPage(1);
                handled = true;
                break;
            case 'End':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.goToPage(this.totalPages);
                handled = true;
                break;
            case 'PageUp':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                // Jump 3 spreads (6 pages) back
                this.goToPage(Math.max(1, this.currentPage - 3));
                handled = true;
                break;
            case 'PageDown':
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                // Jump 3 spreads (6 pages) forward
                this.goToPage(Math.min(this.totalPages, this.currentPage + 3));
                handled = true;
                break;
        }

        if (handled) {
            console.log(`[Pagination] ✓ ${e.key} handled, page ${this.currentPage}/${this.totalPages}`);
        }
    }

    /**
     * Handle click zone navigation
     */
    handleClick(e) {
        if (this.mode !== 'pagination') return;

        const clickX = e.clientX;
        const windowWidth = window.innerWidth;
        const zoneSize = windowWidth * (this.config.clickZonePercent / 100);

        // Left zone - previous page
        if (clickX < zoneSize) {
            this.prevPage();
        }
        // Right zone - next page
        else if (clickX > windowWidth - zoneSize) {
            this.nextPage();
        }
        // Center zone - do nothing (allow text selection)
    }

    /**
     * Handle wheel/scroll navigation (horizontal scroll)
     */
    handleWheel(e) {
        if (this.mode !== 'pagination') return;

        const now = Date.now();

        // Debounce - prevent too sensitive scrolling
        if (now - this.lastWheelTime < this.wheelThreshold) {
            return;
        }

        // Detect horizontal scroll (deltaX) or shift+vertical scroll
        const deltaX = e.deltaX;
        const deltaY = e.deltaY;

        // Check if horizontal scroll or shift+scroll
        const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY) || e.shiftKey;

        if (isHorizontalScroll) {
            // Prevent default scroll behavior
            e.preventDefault();
            e.stopPropagation();

            const scrollAmount = e.shiftKey ? deltaY : deltaX;

            // Navigate based on scroll direction
            if (scrollAmount > 0) {
                // Scroll right → next page
                this.nextPage();
                this.lastWheelTime = now;
                console.log('[Pagination] Wheel: next page');
            } else if (scrollAmount < 0) {
                // Scroll left → previous page
                this.prevPage();
                this.lastWheelTime = now;
                console.log('[Pagination] Wheel: previous page');
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const now = Date.now();

        // Debounce
        if (now - this.lastResizeTime < this.config.debounceDelay) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.lastResizeTime = now;

            if (this.mode === 'pagination') {
                // Recalculate layout (maxWidth is fixed, but recalc pages in case content changed)
                this.calculatePages();
                this.goToPage(this.currentPage, false);
            }
        }, this.config.debounceDelay);
    }

    /**
     * Toggle between pagination and scroll modes
     */
    toggleMode() {
        if (this.mode === 'pagination') {
            this.enableScroll();
        } else {
            this.enablePagination();
        }
    }

    /**
     * Update page indicator UI (currently hidden by CSS)
     */
    updatePageIndicator() {
        const indicator = document.getElementById('page-indicator');
        if (!indicator) return;

        // Page indicator is permanently hidden, but keep code for debugging
        if (this.mode === 'pagination' && this.totalPages > 0) {
            indicator.textContent = `${this.currentPage} / ${this.totalPages}`;
        }
    }

    /**
     * Update mode toggle button UI
     */
    updateModeUI() {
        const toggleBtn = document.querySelector('[data-cmd="toggle-pagination"]');
        if (!toggleBtn) return;

        if (this.mode === 'pagination') {
            toggleBtn.classList.add('pagination-active');
            toggleBtn.title = 'Switch to Scroll Mode';
        } else {
            toggleBtn.classList.remove('pagination-active');
            toggleBtn.title = 'Switch to Book Mode';
        }

        // Disable page width slider in pagination mode
        this.updatePageWidthSlider();
    }

    /**
     * Update page width slider state
     */
    updatePageWidthSlider() {
        // Find parent setting-item by checking for .page-width child
        const allSettingItems = document.querySelectorAll('.setting-item');
        let pageWidthSetting = null;
        allSettingItems.forEach(item => {
            if (item.querySelector('.page-width')) {
                pageWidthSetting = item;
            }
        });

        if (pageWidthSetting) {
            if (this.mode === 'pagination') {
                pageWidthSetting.style.opacity = '0.5';
                pageWidthSetting.style.pointerEvents = 'none';
                pageWidthSetting.title = 'Page width is locked in pagination mode';
            } else {
                pageWidthSetting.style.opacity = '1';
                pageWidthSetting.style.pointerEvents = 'auto';
                pageWidthSetting.title = '';
            }
        }
    }


    /**
     * Get current URL from iframe
     */
    getCurrentUrl() {
        try {
            if (this.iframeDoc) {
                const domain = this.iframeDoc.getElementById('reader-domain');
                if (domain && domain.href) {
                    return domain.href;
                }
            }

            // Fallback: try to get from parent window
            const params = new URLSearchParams(window.location.search);
            const tabId = params.get('id');
            if (tabId) {
                // URL will be available after article loads
                return window.location.href;
            }

            return null;
        } catch (error) {
            console.error('Error getting current URL:', error);
            return null;
        }
    }

    /**
     * Create hash from URL for storage key
     */
    getUrlHash(url) {
        if (!url) return null;

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'pagePos_' + Math.abs(hash).toString(36);
    }

    /**
     * Load page position from storage
     */
    async loadPagePosition() {
        if (!this.currentUrl) return;

        try {
            const key = this.getUrlHash(this.currentUrl);
            if (!key) return;

            const result = await chrome.storage.local.get([key]);
            const positionData = result[key];

            if (positionData && positionData.page && positionData.timestamp) {
                // Check if data is not too old (30 days)
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                if (positionData.timestamp > thirtyDaysAgo) {
                    // Restore page position after pagination is enabled
                    if (this.mode === 'pagination' && positionData.page > 0) {
                        setTimeout(() => {
                            this.goToPage(positionData.page, false);
                            console.log(`Restored position: page ${positionData.page}`);
                        }, 300);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading page position:', error);
        }
    }

    /**
     * Save current page position
     */
    async savePagePosition() {
        if (!this.currentUrl || this.mode !== 'pagination') return;

        try {
            const key = this.getUrlHash(this.currentUrl);
            if (!key) return;

            const positionData = {
                page: this.currentPage,
                totalPages: this.totalPages,
                timestamp: Date.now(),
                url: this.currentUrl
            };

            await chrome.storage.local.set({
                [key]: positionData
            });
        } catch (error) {
            console.error('Error saving page position:', error);
        }
    }

    /**
     * Schedule cleanup of old position data
     */
    scheduleCleanup() {
        // Run cleanup with 10% probability (to avoid doing it every time)
        if (Math.random() < 0.1) {
            setTimeout(() => {
                this.cleanupOldPositions();
            }, 2000); // Delay 2s to not block init
        }
    }

    /**
     * Cleanup old position data (older than 30 days)
     */
    async cleanupOldPositions() {
        try {
            const allData = await chrome.storage.local.get(null);
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const keysToRemove = [];

            for (const key in allData) {
                // Check if it's a position key
                if (key.startsWith('pagePos_')) {
                    const data = allData[key];

                    // Check timestamp
                    if (data && data.timestamp) {
                        if (data.timestamp < thirtyDaysAgo) {
                            keysToRemove.push(key);
                        }
                    } else {
                        // Invalid data, remove it
                        keysToRemove.push(key);
                    }
                }
            }

            if (keysToRemove.length > 0) {
                await chrome.storage.local.remove(keysToRemove);
                console.log(`Cleaned up ${keysToRemove.length} old position entries`);
            }
        } catch (error) {
            console.error('Error cleaning up old positions:', error);
        }
    }

    /**
     * Load preferences from storage
     */
    async loadPreferences() {
        try {
            const result = await chrome.storage.local.get(['readingMode']);

            if (result.readingMode) {
                this.mode = result.readingMode;
            }
        } catch (error) {
            console.error('Load preferences error:', error);
        }
    }

    /**
     * Save preferences to storage
     */
    async savePreferences() {
        try {
            await chrome.storage.local.set({
                readingMode: this.mode
            });
        } catch (error) {
            console.error('Save preferences error:', error);
        }
    }


    /**
     * Cleanup
     */
    destroy() {
        this.removeNavigation();
        this.removePaginationLayout();
        clearTimeout(this.resizeTimeout);
        clearTimeout(this.indicatorTimeout);
        this.initialized = false;
    }
}

// Export for use in reader.js
window.PaginationReader = PaginationReader;
