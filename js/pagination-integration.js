/**
 * Pagination Integration
 * Integrates PaginationReader with existing reader.js
 */

(function() {
    'use strict';

    let paginationReader = null;
    let originalAddEventListeners = null;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('Pagination integration initializing...');

        // Wait for iframe to be available
        waitForIframe();

        // Setup toggle button listener
        setupToggleButton();

        // Setup settings panel
        setupSettingsPanel();
    }

    function waitForIframe() {
        const iframe = document.getElementById('reader');

        if (!iframe) {
            setTimeout(waitForIframe, 100);
            return;
        }

        // Wait for iframe content to load
        const checkIframeContent = () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                if (iframeDoc && iframeDoc.body && iframeDoc.body.dataset.loaded === 'true') {
                    // Iframe content is ready
                    initializePagination(iframe);
                } else {
                    setTimeout(checkIframeContent, 100);
                }
            } catch (error) {
                // CORS or not ready yet
                setTimeout(checkIframeContent, 100);
            }
        };

        // Also listen for iframe load event
        iframe.addEventListener('load', () => {
            setTimeout(() => checkIframeContent(), 200);
        });

        checkIframeContent();
    }

    function initializePagination(iframe) {
        if (!window.PaginationReader) {
            console.warn('PaginationReader class not found. Make sure pagination-reader.js is loaded.');
            return;
        }

        try {
            paginationReader = new window.PaginationReader(iframe);
            const success = paginationReader.init();

            if (success) {
                console.log('Pagination initialized successfully');
            } else {
                console.warn('Pagination initialization failed');
            }
        } catch (error) {
            console.error('Error initializing pagination:', error);
        }
    }

    function setupToggleButton() {
        const toggleBtns = document.querySelectorAll('[data-cmd="toggle-pagination"]');

        if (toggleBtns.length === 0) {
            console.warn('Pagination toggle button not found');
            return;
        }

        toggleBtns.forEach(toggleBtn => {
            toggleBtn.addEventListener('click', () => {
                if (paginationReader) {
                    paginationReader.toggleMode();
                } else {
                    console.warn('PaginationReader not initialized yet');
                }
            });
        });

        console.log(`Pagination toggle button setup complete (${toggleBtns.length} buttons)`);
    }

    function setupSettingsPanel() {
        // Watch for font size changes
        watchFontSizeChanges();

        console.log('Settings panel setup complete');
    }

    function watchFontSizeChanges() {
        const fontSizeInput = document.querySelector('.font-size');

        if (!fontSizeInput) {
            console.warn('Font size input not found');
            return;
        }

        // Listen for changes
        fontSizeInput.addEventListener('change', () => {
            if (paginationReader && paginationReader.mode === 'pagination') {
                // Recalculate pages after font size changes
                setTimeout(() => {
                    paginationReader.calculatePages();
                    console.log('[Pagination] Recalculated pages after font size change');
                }, 100);
            }
        });

        // Also watch for slider events (jRange custom events)
        const settingsItem = fontSizeInput.closest('.setting-item');
        if (settingsItem) {
            settingsItem.addEventListener('click', () => {
                setTimeout(() => {
                    if (paginationReader && paginationReader.mode === 'pagination') {
                        paginationReader.calculatePages();
                    }
                }, 200);
            });
        }

        console.log('Font size change watcher setup complete');
    }

    // Expose for debugging
    window.paginationDebug = {
        getReader: () => paginationReader,
        reinit: () => {
            const iframe = document.getElementById('reader');
            if (iframe) {
                initializePagination(iframe);
            }
        }
    };

})();
