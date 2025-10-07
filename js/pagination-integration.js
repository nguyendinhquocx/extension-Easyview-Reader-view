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
        const toggleBtn = document.querySelector('[data-cmd="toggle-pagination"]');

        if (!toggleBtn) {
            console.warn('Pagination toggle button not found');
            return;
        }

        toggleBtn.addEventListener('click', () => {
            if (paginationReader) {
                paginationReader.toggleMode();
            } else {
                console.warn('PaginationReader not initialized yet');
            }
        });

        console.log('Pagination toggle button setup complete');
    }

    function setupSettingsPanel() {
        const modeOptions = document.querySelectorAll('.reading-mode-option');

        if (modeOptions.length === 0) {
            console.warn('Reading mode options not found in settings');
            return;
        }

        modeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedMode = option.dataset.mode;

                // Update active state
                modeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Toggle pagination reader
                if (paginationReader) {
                    if (selectedMode === 'pagination' && paginationReader.mode !== 'pagination') {
                        paginationReader.enablePagination();
                    } else if (selectedMode === 'scroll' && paginationReader.mode !== 'scroll') {
                        paginationReader.enableScroll();
                    }
                } else {
                    console.warn('PaginationReader not initialized yet');
                }
            });
        });

        // Sync initial state with pagination reader mode
        setTimeout(() => {
            if (paginationReader) {
                updateSettingsPanelState(paginationReader.mode);
            }
        }, 500);

        console.log('Settings panel setup complete');
    }

    function updateSettingsPanelState(mode) {
        const modeOptions = document.querySelectorAll('.reading-mode-option');
        modeOptions.forEach(option => {
            if (option.dataset.mode === mode) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    // Expose for debugging and internal use
    window.paginationDebug = {
        getReader: () => paginationReader,
        reinit: () => {
            const iframe = document.getElementById('reader');
            if (iframe) {
                initializePagination(iframe);
            }
        },
        updateSettingsPanel: updateSettingsPanelState
    };

    // Export for use by pagination-reader
    window.paginationIntegration = {
        updateSettingsPanel: updateSettingsPanelState
    };

})();
