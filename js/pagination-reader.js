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

        // Event handlers (bound for cleanup)
        this.boundHandlers = {
            keydown: null,
            click: null,
            resize: null,
        };

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

            // Load saved mode preference
            await this.loadPreferences();

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

        // Add pagination class
        this.iframeBody.classList.add('pagination-mode');
        this.iframeBody.classList.remove('scroll-mode');

        // Calculate page width
        this.pageWidth = window.innerWidth;

        // Apply column styles
        const style = `
            body.pagination-mode {
                column-width: ${this.pageWidth}px !important;
                column-gap: ${this.config.pageGap}px !important;
                column-fill: auto !important;
                overflow-x: hidden !important;
                overflow-y: hidden !important;
                height: 100vh !important;
                width: 100vw !important;
                position: relative !important;
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
            const pageWidth = this.pageWidth + this.config.pageGap;

            // Calculate total pages
            this.totalPages = Math.ceil(contentWidth / pageWidth);
            this.contentWidth = contentWidth;

            // Ensure current page is valid
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
            if (this.currentPage < 1) {
                this.currentPage = 1;
            }

            // Update page indicator
            this.updatePageIndicator();

            console.log(`Pages calculated: ${this.totalPages} pages, width: ${contentWidth}px`);

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

        // Calculate offset
        const pageWidth = this.pageWidth + this.config.pageGap;
        const offset = -(pageNumber - 1) * pageWidth;

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
        // Keyboard navigation
        this.boundHandlers.keydown = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.boundHandlers.keydown);

        // Click zone navigation
        this.boundHandlers.click = this.handleClick.bind(this);
        this.iframe.addEventListener('click', this.boundHandlers.click);

        // Resize handling
        this.boundHandlers.resize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * Remove navigation listeners
     */
    removeNavigation() {
        if (this.boundHandlers.keydown) {
            document.removeEventListener('keydown', this.boundHandlers.keydown);
        }
        if (this.boundHandlers.click) {
            this.iframe.removeEventListener('click', this.boundHandlers.click);
        }
        if (this.boundHandlers.resize) {
            window.removeEventListener('resize', this.boundHandlers.resize);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        if (this.mode !== 'pagination') return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
            case 'Home':
                e.preventDefault();
                this.goToPage(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToPage(this.totalPages);
                break;
            case 'PageUp':
                e.preventDefault();
                this.goToPage(Math.max(1, this.currentPage - 5));
                break;
            case 'PageDown':
                e.preventDefault();
                this.goToPage(Math.min(this.totalPages, this.currentPage + 5));
                break;
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
                // Recalculate layout
                this.pageWidth = window.innerWidth;
                this.applyPaginationLayout();
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
     * Update page indicator UI
     */
    updatePageIndicator() {
        const indicator = document.getElementById('page-indicator');
        if (!indicator) return;

        if (this.mode === 'pagination' && this.totalPages > 0) {
            indicator.textContent = `${this.currentPage} / ${this.totalPages}`;
            indicator.classList.remove('hidden');

            // Auto-hide after 2 seconds
            clearTimeout(this.indicatorTimeout);
            indicator.classList.add('visible');

            this.indicatorTimeout = setTimeout(() => {
                indicator.classList.remove('visible');
            }, 2000);
        } else {
            indicator.classList.add('hidden');
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
    }

    /**
     * Load preferences from storage
     */
    async loadPreferences() {
        try {
            const result = await chrome.storage.local.get(['readingMode', 'pagePosition']);

            if (result.readingMode) {
                this.mode = result.readingMode;
            }

            // Load page position for current URL (will implement later)

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
     * Save current page position
     */
    async savePagePosition() {
        // Will implement with URL tracking
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
