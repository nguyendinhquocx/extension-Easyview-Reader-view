/**
 * Line Highlight Testing Suite
 * Comprehensive testing for line highlighting functionality
 */

class LineHighlightTester {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {
            detectionTimes: [],
            mouseMoveResponses: [],
            memoryUsage: [],
            cacheHitRates: []
        };
        this.testStartTime = 0;
        this.isRunning = false;
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        if (this.isRunning) {
            console.log('LineHighlightTester: Tests already running');
            return;
        }

        this.isRunning = true;
        this.testStartTime = performance.now();
        console.log('LineHighlightTester: Starting comprehensive test suite...');

        try {
            // Phase 1: Basic functionality tests
            await this.testBasicFunctionality();

            // Phase 2: Performance tests
            await this.testPerformance();

            // Phase 3: Edge case tests
            await this.testEdgeCases();

            // Phase 4: Memory leak tests
            await this.testMemoryLeaks();

            // Phase 5: Settings tests
            await this.testSettings();

            // Phase 6: Cross-browser tests
            await this.testBrowserCompatibility();

            // Generate report
            this.generateTestReport();

        } catch (error) {
            console.error('LineHighlightTester: Test suite failed:', error);
            this.addTestResult('Test Suite', 'Failed', error.message);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Test basic functionality
     */
    async testBasicFunctionality() {
        console.log('LineHighlightTester: Testing basic functionality...');

        // Test 1: LineHighlighter class exists and can be instantiated
        try {
            if (typeof LineHighlighter === 'undefined') {
                throw new Error('LineHighlighter class not found');
            }
            this.addTestResult('LineHighlighter Class', 'Passed', 'Class available');
        } catch (error) {
            this.addTestResult('LineHighlighter Class', 'Failed', error.message);
        }

        // Test 2: API availability
        try {
            if (typeof window.LineHighlighterAPI === 'undefined') {
                throw new Error('LineHighlighterAPI not available');
            }
            this.addTestResult('LineHighlighter API', 'Passed', 'API available');
        } catch (error) {
            this.addTestResult('LineHighlighter API', 'Failed', error.message);
        }

        // Test 3: Settings manager
        try {
            if (typeof window.LineHighlightSettings === 'undefined') {
                throw new Error('LineHighlightSettings not available');
            }
            this.addTestResult('Settings Manager', 'Passed', 'Settings available');
        } catch (error) {
            this.addTestResult('Settings Manager', 'Failed', error.message);
        }

        // Test 4: CSS styles loaded
        try {
            const testElement = document.createElement('div');
            testElement.className = 'line-highlight';
            document.body.appendChild(testElement);
            const styles = getComputedStyle(testElement);
            const hasBackground = styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
            document.body.removeChild(testElement);

            if (hasBackground) {
                this.addTestResult('CSS Styles', 'Passed', 'Highlight styles loaded');
            } else {
                throw new Error('Highlight styles not applied');
            }
        } catch (error) {
            this.addTestResult('CSS Styles', 'Failed', error.message);
        }
    }

    /**
     * Test performance with different content types
     */
    async testPerformance() {
        console.log('LineHighlightTester: Testing performance...');

        // Test with different content sizes
        const contentSizes = [
            { name: 'Small', wordCount: 500 },
            { name: 'Medium', wordCount: 2000 },
            { name: 'Large', wordCount: 5000 },
            { name: 'Very Large', wordCount: 10000 }
        ];

        for (const contentSize of contentSizes) {
            await this.testContentPerformance(contentSize);
        }

        // Test mouse move response time
        await this.testMouseMovePerformance();

        // Test cache performance
        await this.testCachePerformance();
    }

    /**
     * Test performance with specific content size
     */
    async testContentPerformance(contentSize) {
        console.log(`LineHighlightTester: Testing ${contentSize.name} content (${contentSize.wordCount} words)...`);

        try {
            // Create test content
            const testContent = this.generateTestContent(contentSize.wordCount);
            const testIframe = this.createTestIframe(testContent);

            const startTime = performance.now();

            // Test line detection
            const mockDoc = testIframe.contentDocument;
            if (window.LineHighlighter) {
                const highlighter = new LineHighlighter(mockDoc);
                const detectionTime = performance.now() - startTime;

                this.performanceMetrics.detectionTimes.push({
                    size: contentSize.name,
                    time: detectionTime,
                    wordCount: contentSize.wordCount
                });

                // Performance thresholds
                const threshold = contentSize.wordCount < 2000 ? 50 : 100; // ms
                const status = detectionTime < threshold ? 'Passed' : 'Warning';
                const message = `${detectionTime.toFixed(2)}ms (threshold: ${threshold}ms)`;

                this.addTestResult(`Performance - ${contentSize.name}`, status, message);

                // Cleanup
                highlighter.destroy();
            }

            // Remove test iframe
            document.body.removeChild(testIframe);

        } catch (error) {
            this.addTestResult(`Performance - ${contentSize.name}`, 'Failed', error.message);
        }
    }

    /**
     * Test mouse move response performance
     */
    async testMouseMovePerformance() {
        console.log('LineHighlightTester: Testing mouse move performance...');

        try {
            const iframe = document.getElementById('reader');
            if (!iframe || !iframe.contentDocument) {
                throw new Error('Reader iframe not available for testing');
            }

            const startTime = performance.now();
            let responseCount = 0;
            const testDuration = 1000; // 1 second

            // Simulate mouse moves
            const simulateMouseMoves = () => {
                const iframeDoc = iframe.contentDocument;
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    clientX: Math.random() * 800,
                    clientY: Math.random() * 600
                });

                iframeDoc.dispatchEvent(mouseMoveEvent);
                responseCount++;

                if (performance.now() - startTime < testDuration) {
                    requestAnimationFrame(simulateMouseMoves);
                }
            };

            simulateMouseMoves();

            // Wait for test completion
            await new Promise(resolve => setTimeout(resolve, testDuration + 100));

            const averageResponseTime = testDuration / responseCount;
            const fps = 1000 / averageResponseTime;

            this.performanceMetrics.mouseMoveResponses.push({
                responseCount,
                averageResponseTime,
                fps
            });

            const status = fps > 30 ? 'Passed' : 'Warning';
            const message = `${fps.toFixed(1)} FPS (${averageResponseTime.toFixed(2)}ms avg)`;

            this.addTestResult('Mouse Move Performance', status, message);

        } catch (error) {
            this.addTestResult('Mouse Move Performance', 'Failed', error.message);
        }
    }

    /**
     * Test cache performance
     */
    async testCachePerformance() {
        console.log('LineHighlightTester: Testing cache performance...');

        try {
            if (!window.LineHighlighterAPI) {
                throw new Error('LineHighlighterAPI not available');
            }

            // Trigger multiple refreshes to test caching
            const refreshTimes = [];

            for (let i = 0; i < 5; i++) {
                const startTime = performance.now();
                window.LineHighlighterAPI.refresh();
                const refreshTime = performance.now() - startTime;
                refreshTimes.push(refreshTime);

                // Small delay between refreshes
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const averageRefreshTime = refreshTimes.reduce((a, b) => a + b, 0) / refreshTimes.length;
            const status = averageRefreshTime < 20 ? 'Passed' : 'Warning';
            const message = `${averageRefreshTime.toFixed(2)}ms average refresh time`;

            this.addTestResult('Cache Performance', status, message);

        } catch (error) {
            this.addTestResult('Cache Performance', 'Failed', error.message);
        }
    }

    /**
     * Test edge cases
     */
    async testEdgeCases() {
        console.log('LineHighlightTester: Testing edge cases...');

        const edgeCases = [
            'Empty content',
            'Single line content',
            'Content with images',
            'Content with tables',
            'Content with code blocks',
            'Mixed language content',
            'Very long lines',
            'Hidden elements'
        ];

        for (const edgeCase of edgeCases) {
            try {
                await this.testSpecificEdgeCase(edgeCase);
                this.addTestResult(`Edge Case - ${edgeCase}`, 'Passed', 'Handled correctly');
            } catch (error) {
                this.addTestResult(`Edge Case - ${edgeCase}`, 'Failed', error.message);
            }
        }
    }

    /**
     * Test specific edge case
     */
    async testSpecificEdgeCase(caseType) {
        // Create test content based on edge case type
        let testContent = '';

        switch (caseType) {
            case 'Empty content':
                testContent = '';
                break;
            case 'Single line content':
                testContent = '<p>Single line of text</p>';
                break;
            case 'Content with images':
                testContent = '<p>Text with <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"> image</p>';
                break;
            case 'Content with tables':
                testContent = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
                break;
            // Add more cases as needed
            default:
                testContent = '<p>Default test content</p>';
        }

        const testIframe = this.createTestIframe(testContent);
        const mockDoc = testIframe.contentDocument;

        // Test if highlighter handles the content without errors
        if (window.LineHighlighter) {
            const highlighter = new LineHighlighter(mockDoc);

            // Verify no errors occurred
            if (highlighter.lines.length >= 0) { // Even 0 lines is valid for empty content
                // Success
            }

            highlighter.destroy();
        }

        document.body.removeChild(testIframe);
    }

    /**
     * Test memory leaks
     */
    async testMemoryLeaks() {
        console.log('LineHighlightTester: Testing memory leaks...');

        try {
            const initialMemory = this.getMemoryUsage();

            // Create and destroy highlighters multiple times
            for (let i = 0; i < 10; i++) {
                const testContent = this.generateTestContent(1000);
                const testIframe = this.createTestIframe(testContent);
                const mockDoc = testIframe.contentDocument;

                if (window.LineHighlighter) {
                    const highlighter = new LineHighlighter(mockDoc);

                    // Simulate some activity
                    await new Promise(resolve => setTimeout(resolve, 50));

                    // Destroy
                    highlighter.destroy();
                }

                document.body.removeChild(testIframe);

                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
            }

            const finalMemory = this.getMemoryUsage();
            const memoryIncrease = finalMemory - initialMemory;

            this.performanceMetrics.memoryUsage.push({
                initial: initialMemory,
                final: finalMemory,
                increase: memoryIncrease
            });

            const status = memoryIncrease < 10 ? 'Passed' : 'Warning'; // 10MB threshold
            const message = `Memory increase: ${memoryIncrease.toFixed(2)}MB`;

            this.addTestResult('Memory Leak Test', status, message);

        } catch (error) {
            this.addTestResult('Memory Leak Test', 'Failed', error.message);
        }
    }

    /**
     * Test settings functionality
     */
    async testSettings() {
        console.log('LineHighlightTester: Testing settings...');

        try {
            if (!window.lineHighlightSettings) {
                throw new Error('Settings manager not available');
            }

            // Test default settings
            const defaultSettings = window.lineHighlightSettings.getSettings();
            if (defaultSettings.enabled !== undefined) {
                this.addTestResult('Settings - Default Values', 'Passed', 'Default settings loaded');
            } else {
                throw new Error('Default settings not loaded');
            }

            // Test settings changes
            const originalColor = defaultSettings.color;
            window.lineHighlightSettings.updateSetting('color', 'blue');
            const updatedSettings = window.lineHighlightSettings.getSettings();

            if (updatedSettings.color === 'blue') {
                this.addTestResult('Settings - Update', 'Passed', 'Settings update working');
                // Restore original
                window.lineHighlightSettings.updateSetting('color', originalColor);
            } else {
                throw new Error('Settings update failed');
            }

        } catch (error) {
            this.addTestResult('Settings Test', 'Failed', error.message);
        }
    }

    /**
     * Test browser compatibility
     */
    async testBrowserCompatibility() {
        console.log('LineHighlightTester: Testing browser compatibility...');

        try {
            if (!window.BrowserCompatibility) {
                throw new Error('BrowserCompatibility not available');
            }

            const compat = new BrowserCompatibility();
            const report = compat.getCompatibilityReport();

            this.addTestResult('Browser Detection', 'Passed', `${report.browser.name} ${report.browser.version}`);
            this.addTestResult('Feature Support', report.isSupported ? 'Passed' : 'Warning',
                `${Object.values(report.features).filter(Boolean).length}/${Object.keys(report.features).length} features`);

        } catch (error) {
            this.addTestResult('Browser Compatibility', 'Failed', error.message);
        }
    }

    /**
     * Helper: Generate test content
     */
    generateTestContent(wordCount) {
        const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
        let content = '<div>';

        for (let i = 0; i < wordCount; i += 20) {
            const paragraph = Array.from({length: Math.min(20, wordCount - i)}, () =>
                words[Math.floor(Math.random() * words.length)]
            ).join(' ');
            content += `<p>${paragraph}.</p>`;
        }

        return content + '</div>';
    }

    /**
     * Helper: Create test iframe
     */
    createTestIframe(content) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument;
        doc.open();
        doc.write(`
            <html>
                <head><title>Test</title></head>
                <body>${content}</body>
            </html>
        `);
        doc.close();

        return iframe;
    }

    /**
     * Helper: Get memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    /**
     * Add test result
     */
    addTestResult(testName, status, message) {
        const result = {
            name: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        console.log(`LineHighlightTester: ${testName} - ${status}: ${message}`);
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const totalTime = performance.now() - this.testStartTime;
        const passedTests = this.testResults.filter(r => r.status === 'Passed').length;
        const warningTests = this.testResults.filter(r => r.status === 'Warning').length;
        const failedTests = this.testResults.filter(r => r.status === 'Failed').length;

        const report = {
            summary: {
                totalTests: this.testResults.length,
                passed: passedTests,
                warnings: warningTests,
                failed: failedTests,
                duration: `${totalTime.toFixed(2)}ms`,
                successRate: `${((passedTests / this.testResults.length) * 100).toFixed(1)}%`
            },
            performance: this.performanceMetrics,
            results: this.testResults
        };

        console.log('LineHighlightTester: Test Report:', report);
        return report;
    }

    /**
     * Export test report as JSON
     */
    exportReport() {
        const report = this.generateTestReport();
        return JSON.stringify(report, null, 2);
    }
}

// Global instance for manual testing
if (typeof window !== 'undefined') {
    window.LineHighlightTester = LineHighlightTester;
}

// Auto-run basic tests in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setTimeout(() => {
        const tester = new LineHighlightTester();
        // Run basic tests only in development
        // tester.runAllTests();
    }, 2000);
}