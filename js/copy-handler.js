// Copy functionality with proper event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing copy functionality...');
    
    // Function to handle copy click
    function handleCopyClick() {
        console.log('Copy button clicked!');
        try {
            copyAllText();
        } catch (error) {
            console.error('Copy error:', error);
            showCopyNotification('Copy failed: ' + error.message);
        }
    }
    
    // Attach event listener with multiple retry attempts
    let retryCount = 0;
    const maxRetries = 20;
    
    function attachCopyListener() {
        const copyButton = document.querySelector('[data-cmd="copy"]');
        if (copyButton && !copyButton.hasAttribute('copy-listener-attached')) {
            copyButton.setAttribute('copy-listener-attached', 'true');
            copyButton.addEventListener('click', handleCopyClick);
            console.log('Copy event listener attached successfully');
            return true;
        }
        return false;
    }
    
    function tryAttach() {
        if (attachCopyListener()) {
            return; // Success
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
            console.log('Retrying to attach copy listener... attempt', retryCount);
            setTimeout(tryAttach, 250);
        } else {
            console.error('Failed to attach copy listener after', maxRetries, 'attempts');
        }
    }
    
    // Start trying immediately
    tryAttach();
    
    // Also observe DOM changes
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            attachCopyListener();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

// Simple test function first
function testCopy() {
    const testText = 'Test copy functionality works!\n\nThis is a demo copy from Easyview Reader.\nCopy button is working correctly!';
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(testText).then(() => {
            showCopyNotification('✅ Test copy successful! Check clipboard.');
        });
    } else {
        fallbackCopyTextToClipboard(testText);
    }
}

function copyAllText() {
    try {
        console.log('Starting copy process...');
        
        let textContent = '';
        const iframe = document.getElementById('reader');
        
        // Try simple test first if no content
        if (window.copyTestMode || !iframe || !iframe.contentDocument) {
            console.log('No iframe content, running test copy...');
            return testCopy();
        }
        
        if (iframe) {
            console.log('Iframe found, attempting to access content...');
            
            try {
                // Try to access iframe content directly
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.body) {
                    textContent = iframeDoc.body.innerText || iframeDoc.body.textContent || '';
                    console.log('Got text from iframe:', textContent.substring(0, 100) + '...');
                } else {
                    console.log('Cannot access iframe document, trying alternative...');
                }
            } catch (iframeError) {
                console.log('Iframe access blocked by CORS, using alternative method:', iframeError.message);
            }
            
            // Alternative: If iframe access fails, try to get text from parent page
            if (!textContent) {
                console.log('Trying to get text from main document...');
                // Look for text content in main document
                const contentDiv = document.querySelector('#content');
                if (contentDiv) {
                    textContent = contentDiv.innerText || contentDiv.textContent || '';
                }
            }
            
            // Last resort: Try to select all and copy using execCommand
            if (!textContent) {
                console.log('Using selection-based copy as fallback...');
                return copyUsingSelection();
            }
        }
        
        if (textContent.trim()) {
            // Copy to clipboard using modern API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textContent).then(() => {
                    showCopyNotification('Text copied successfully! (' + textContent.length + ' chars)');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    fallbackCopyTextToClipboard(textContent);
                });
            } else {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(textContent);
            }
        } else {
            console.log('No text content found to copy');
            showCopyNotification('No text content found to copy');
        }
        
    } catch (error) {
        console.error('Copy failed:', error);
        showCopyNotification('Copy failed: ' + error.message);
    }
}

function copyUsingSelection() {
    try {
        // Try to select all content and copy
        const iframe = document.getElementById('reader');
        if (iframe && iframe.contentDocument) {
            const iframeDoc = iframe.contentDocument;
            const selection = iframeDoc.getSelection();
            const range = iframeDoc.createRange();
            range.selectNodeContents(iframeDoc.body);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Focus iframe and copy
            iframe.contentWindow.focus();
            const success = iframeDoc.execCommand('copy');
            
            if (success) {
                showCopyNotification('Text copied successfully using selection method!');
            } else {
                showCopyNotification('Selection copy method failed');
            }
            
            // Clear selection
            selection.removeAllRanges();
        } else {
            showCopyNotification('Cannot access iframe for selection copy');
        }
    } catch (error) {
        console.error('Selection copy failed:', error);
        showCopyNotification('Selection copy failed: ' + error.message);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification('Text copied successfully!');
        } else {
            showCopyNotification('Copy failed. Please try selecting text manually.');
        }
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
        showCopyNotification('Copy failed. Please try selecting text manually.');
    }

    document.body.removeChild(textArea);
}

function showCopyNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}