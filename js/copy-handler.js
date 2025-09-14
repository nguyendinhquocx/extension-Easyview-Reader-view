// Copy functionality with proper event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing copy functionality...');
    
    // Function to handle copy click
    function handleCopyClick(event) {
        console.log('Copy button clicked!');
        const clickedButton = event.currentTarget;
        try {
            copyAllText(clickedButton);
        } catch (error) {
            console.error('Copy error:', error);
            showCopyNotification('Copy failed: ' + error.message);
        }
    }
    
    // Attach event listener with multiple retry attempts
    let retryCount = 0;
    const maxRetries = 20;
    
    function attachCopyListener() {
        const copyButtons = document.querySelectorAll('[data-cmd="copy"]');
        let attached = false;

        copyButtons.forEach(copyButton => {
            if (copyButton && !copyButton.hasAttribute('copy-listener-attached')) {
                copyButton.setAttribute('copy-listener-attached', 'true');
                copyButton.addEventListener('click', handleCopyClick);
                console.log('Copy event listener attached to button:', copyButton.classList.toString());
                attached = true;
            }
        });

        return attached;
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
function testCopy(copyButton) {
    const testText = 'Test copy functionality works!\n\nThis is a demo copy from Easyview Reader.\nCopy button is working correctly!';
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(testText).then(() => {
            showCopySuccess(copyButton);
        });
    } else {
        fallbackCopyTextToClipboard(testText, copyButton);
    }
}

function copyAllText(clickedButton) {
    try {
        console.log('Starting copy process...');

        let textContent = '';
        const iframe = document.getElementById('reader');
        const copyButton = clickedButton || document.querySelector('[data-cmd="copy"]');

        // Try simple test first if no content
        if (window.copyTestMode || !iframe || !iframe.contentDocument) {
            console.log('No iframe content, running test copy...');
            return testCopy(copyButton);
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
                    console.log('Text copied successfully! (' + textContent.length + ' chars)');
                    showCopySuccess(copyButton);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    fallbackCopyTextToClipboard(textContent, copyButton);
                });
            } else {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(textContent, copyButton);
            }
        } else {
            console.log('No text content found to copy');
        }
        
    } catch (error) {
        console.error('Copy failed:', error);
    }
}

function copyUsingSelection() {
    try {
        // Try to select all content and copy
        const iframe = document.getElementById('reader');
        const copyButton = document.querySelector('[data-cmd="copy"]');
        
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
                console.log('Text copied successfully using selection method!');
                showCopySuccess(copyButton);
            } else {
                console.log('Selection copy method failed');
            }
            
            // Clear selection
            selection.removeAllRanges();
        } else {
            console.log('Cannot access iframe for selection copy');
        }
    } catch (error) {
        console.error('Selection copy failed:', error);
    }
}

function fallbackCopyTextToClipboard(text, copyButton) {
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
            console.log('Text copied successfully!');
            showCopySuccess(copyButton);
        } else {
            console.log('Copy failed. Please try selecting text manually.');
        }
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
        console.log('Copy failed. Please try selecting text manually.');
    }

    document.body.removeChild(textArea);
}

function showCopySuccess(copyButton) {
    if (!copyButton) return;
    
    // Add copy-done class to show checkmark icon
    copyButton.classList.add('copy-done');
    
    // Remove after 1.5 seconds to revert to normal copy icon
    setTimeout(() => {
        copyButton.classList.remove('copy-done');
    }, 1500);
}