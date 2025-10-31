// Hatrick Chrome Extension - Content Script
// Collects page text and handles communication with background script
// 
// Main Features:
// 1. Page text collection and storage
// 2. Inline term explanation dialog
// 3. Text highlighting functionality
// 4. Communication with background script and side panel

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let scrollTimeout;

// ============================================================================
// TEXT PROCESSING FUNCTIONS
// ============================================================================

// Clean and truncate text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n')  // Remove empty lines
    .trim()
    .substring(0, 10000);  // Truncate to 10k characters
}

// Collect page text with better paragraph structure preservation
async function collectPageText() {
  try {
    // Check if chrome extension APIs are available
    if (!chrome || !chrome.storage) {
      console.log('Chrome extension APIs not available, skipping page text collection');
      return;
    }
    
    const pageText = collectStructuredText();
    const url = window.location.href;
    
    await chrome.storage.local.set({
      pageText: pageText,
      currentUrl: url
    });
    
    console.log('Page text collected and saved:', pageText.length, 'characters');
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      console.log('Extension context invalidated - this is normal when reloading the extension');
    } else {
      console.error('Error collecting page text:', error);
    }
  }
}

// Improved text collection that preserves paragraph structure
function collectStructuredText() {
  const paragraphs = [];
  
  // Look for common content elements that typically contain paragraphs
  const contentSelectors = [
    'article', 'main', 'section', 'div.content', 'div.post', 'div.entry',
    'div.article', 'div.story', 'div.text', 'div.body'
  ];
  
  let contentContainer = null;
  
  // Try to find the main content container first
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.length > 200) {
      contentContainer = element;
      break;
    }
  }
  
  // If no specific container found, use body but filter out navigation/menu elements
  if (!contentContainer) {
    contentContainer = document.body;
  }
  
  // Get all paragraph-like elements
  const paragraphElements = contentContainer.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote, article, section');
  
  paragraphElements.forEach(element => {
    // Skip navigation, menu, and other non-content elements
    if (isContentElement(element)) {
      const text = element.innerText.trim();
      if (text.length > 30) { // Lower threshold to catch more content
        paragraphs.push(text);
      }
    }
  });
  
  // If we didn't find enough structured content, fall back to body text
  if (paragraphs.length < 3) {
    const bodyText = document.body.innerText;
    const fallbackParagraphs = bodyText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50);
    
    if (fallbackParagraphs.length > paragraphs.length) {
      return fallbackParagraphs.join('\n\n');
    }
  }
  
  return paragraphs.join('\n\n');
}

// Check if an element is likely to contain main content
function isContentElement(element) {
  const tagName = element.tagName.toLowerCase();
  const className = element.className.toLowerCase();
  const id = element.id.toLowerCase();
  
  // Skip navigation and menu elements
  const skipSelectors = [
    'nav', 'menu', 'header', 'footer', 'aside', 'sidebar',
    'advertisement', 'ad', 'banner', 'popup', 'modal',
    'comment', 'social', 'share', 'related', 'recommended'
  ];
  
  for (const skip of skipSelectors) {
    if (className.includes(skip) || id.includes(skip) || tagName === skip) {
      return false;
    }
  }
  
  // Skip elements that are likely navigation or UI
  if (element.closest('nav, header, footer, aside, .nav, .menu, .sidebar')) {
    return false;
  }
  
  return true;
}

// Debounced scroll handler
function handleScroll() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(collectPageText, 1000);
}

// Initial page text collection
collectPageText();

// Test function to manually highlight paragraphs (for debugging)
window.testHighlightParagraphs = function(count = 3) {
  console.log('Manual test: highlighting', count, 'paragraphs');
  highlightParagraphs(count);
};

// Test background script communication
window.testBackgroundScript = function() {
  console.log('🧪 Testing background script communication...');
  chrome.runtime.sendMessage({ type: 'TEST_BACKGROUND' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Background script test failed:', chrome.runtime.lastError);
    } else {
      console.log('✅ Background script response:', response);
    }
  });
};

// Simple test function
window.simpleTest = function() {
  console.log('🧪 Sending simple test message...');
  chrome.runtime.sendMessage({ type: 'SIMPLE_TEST' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Simple test failed:', chrome.runtime.lastError);
    } else {
      console.log('✅ Simple test response:', response);
    }
  });
};

// Make sure the functions are available globally
if (typeof window !== 'undefined') {
  window.testBackgroundScript = window.testBackgroundScript;
  window.simpleTest = window.simpleTest;
}

// Create a simple test function immediately
window.basicTest = function() {
  console.log('🧪 Basic test running...');
  chrome.runtime.sendMessage({ type: 'SIMPLE_TEST' }, (response) => {
    console.log('📨 Response received:', response);
    if (chrome.runtime.lastError) {
      console.error('❌ Error:', chrome.runtime.lastError);
    } else {
      console.log('✅ Success:', response);
    }
  });
};

console.log('Content script loaded. Test functions available:');
console.log('- testHighlightParagraphs(3) - Full test');
console.log('- testInlineDialog() - Test inline explanation dialog');
console.log('- testCompleteFlow() - Test complete inline explanation flow');
console.log('- checkInlineFlag() - Check inline explanation status');
console.log('- testExplanationDisplay() - Test explanation display in dialog');
console.log('- testBackgroundScript() - Test background script communication');
console.log('- simpleTest() - Simple background script test');

// Test if the function is available
console.log('🔍 testBackgroundScript function available:', typeof window.testBackgroundScript);
console.log('🔍 simpleTest function available:', typeof window.simpleTest);

// Direct test function that doesn't rely on global scope
window.directTest = function() {
  console.log('🧪 Running direct test...');
  chrome.runtime.sendMessage({ type: 'SIMPLE_TEST' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Direct test failed:', chrome.runtime.lastError);
    } else {
      console.log('✅ Direct test response:', response);
    }
  });
};

// Make sure the test functions are available globally
window.hatrickLoaded = true;

// Define test functions - expose them to the main page context
window.testHighlightParagraphs = testHighlightParagraphs;

// Test functions are now defined directly in content.js

window.testInlineDialog = function() {
  console.log('🧪 Testing inline dialog manually...');
  const testRect = { left: 100, top: 100, right: 200, bottom: 120 };
  showInlineExplanationDialog('test term', testRect);
};

window.testCompleteFlow = function() {
  console.log('🧪 Testing complete inline explanation flow...');
  const testRect = { left: 100, top: 100, right: 200, bottom: 120 };
  showInlineExplanationDialog('algorithm', testRect);
  
  // Auto-click explain button after a short delay
  setTimeout(() => {
    const explainBtn = document.querySelector('.hatrick-explain-btn');
    if (explainBtn) {
      console.log('🤖 Auto-clicking explain button...');
      explainBtn.click();
    }
  }, 1000);
};

window.checkInlineFlag = function() {
  console.log('🚩 Inline explanation flag:', window.hatrickUsingInlineExplanation);
  console.log('🔍 Current dialog:', document.getElementById('hatrick-inline-explanation'));
};

window.testExplanationDisplay = function() {
  console.log('🧪 Testing explanation display...');
  const dialog = document.getElementById('hatrick-inline-explanation');
  if (dialog) {
    const explanationSection = dialog.querySelector('.hatrick-dialog-explanation');
    const explanationContent = dialog.querySelector('.hatrick-explanation-content');
    
    console.log('🔍 Dialog found:', dialog);
    console.log('🔍 Explanation section:', explanationSection);
    console.log('🔍 Explanation content:', explanationContent);
    
    if (explanationSection) {
      console.log('🔍 Current display style:', explanationSection.style.display);
      console.log('🔍 Computed display style:', window.getComputedStyle(explanationSection).display);
      
      explanationSection.style.display = 'block';
      explanationSection.style.visibility = 'visible';
      explanationSection.style.opacity = '1';
      explanationContent.innerHTML = '<h4>Test Explanation</h4><p>This is a test explanation to verify the display works.</p>';
      
      console.log('🔍 After setting - display style:', explanationSection.style.display);
      console.log('🔍 After setting - computed display:', window.getComputedStyle(explanationSection).display);
      console.log('✅ Test explanation should now be visible');
    } else {
      console.log('❌ Explanation section not found');
    }
  } else {
    console.log('❌ Dialog not found');
  }
};

window.hatrickTestFunctions = {
  testHighlightParagraphs,
  testInlineDialog: window.testInlineDialog,
  testCompleteFlow: window.testCompleteFlow,
  checkInlineFlag: window.checkInlineFlag,
  testExplanationDisplay: window.testExplanationDisplay,
  testBackgroundScript: window.testBackgroundScript
};

console.log('Hatrick content script fully loaded and ready!');

// ============================================================================
// INLINE TERM EXPLANATION FEATURE
// ============================================================================

let inlineExplanationDialog = null;
let currentSelection = null;
let storedSelection = ''; // Store the selection when dialog is created
let isExplanationLoading = false;
let isDialogBeingShown = false; // Flag to prevent dialog from being hidden while showing

// Create inline explanation dialog
function createInlineExplanationDialog() {
  console.log('🏗️ createInlineExplanationDialog called');
  
  if (inlineExplanationDialog) {
    console.log('🗑️ Removing existing dialog');
    inlineExplanationDialog.remove();
  }

  console.log('🆕 Creating new dialog element');
  const dialog = document.createElement('div');
  dialog.id = 'hatrick-inline-explanation';
  dialog.innerHTML = `
    <div class="hatrick-dialog-content">
      <div class="hatrick-dialog-actions">
        <button class="hatrick-action-btn" id="term-explanation" title="Term Explanation">
          <span class="hatrick-action-icon">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 17.5C9.65 16.65 7.2 16 5.5 16C3.85 16 2.15 16.3 0.75 17.05C0.65 17.1 0.6 17.1 0.5 17.1C0.25 17.1 0 16.85 0 16.6V2C0.6 1.55 1.25 1.25 2 1C3.11 0.65 4.33 0.5 5.5 0.5C7.45 0.5 9.55 0.9 11 2C12.45 0.9 14.55 0.5 16.5 0.5C17.67 0.5 18.89 0.65 20 1C20.75 1.25 21.4 1.55 22 2V16.6C22 16.85 21.75 17.1 21.5 17.1C21.4 17.1 21.35 17.1 21.25 17.05C19.85 16.3 18.15 16 16.5 16C14.8 16 12.35 16.65 11 17.5ZM11 4V15.5C12.35 14.65 14.8 14 16.5 14C17.7 14 18.9 14.15 20 14.5V3C18.9 2.65 17.7 2.5 16.5 2.5C14.8 2.5 12.35 3.15 11 4ZM12 7.5C13.11 6.82 14.6 6.5 16.5 6.5C17.41 6.5 18.26 6.59 19 6.78V5.23C18.13 5.08 17.29 5 16.5 5C14.73 5 13.23 5.28 12 5.84V7.5ZM16.5 7.67C14.79 7.67 13.29 7.93 12 8.46V10.15C13.11 9.5 14.6 9.16 16.5 9.16C17.54 9.16 18.38 9.24 19 9.4V7.9C18.13 7.74 17.29 7.67 16.5 7.67ZM19 10.57C18.13 10.41 17.29 10.33 16.5 10.33C14.67 10.33 13.17 10.6 12 11.13V12.82C13.11 12.16 14.6 11.83 16.5 11.83C17.54 11.83 18.38 11.91 19 12.07V10.57Z" fill="black"/>
            </svg>
          </span>
        </button>
        <button class="hatrick-action-btn" id="add-to-notes" title="Add to Notes">
          <span class="hatrick-action-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 10C16.7 10 17.37 10.13 18 10.35V6L12 0H2C0.89 0 0 0.89 0 2V16C0 17.11 0.9 18 2 18H10.35C10.13 17.37 10 16.7 10 16C10 12.69 12.69 10 16 10ZM11 1.5L16.5 7H11V1.5ZM20 15V17H17V20H15V17H12V15H15V12H17V15H20Z" fill="black"/>
            </svg>
          </span>
        </button>
        <button class="hatrick-action-btn" id="delete-term" title="Delete">
          <span class="hatrick-action-icon">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 0V1H0V3H1V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H13C13.5304 18 14.0391 17.7893 14.4142 17.4142C14.7893 17.0391 15 16.5304 15 16V3H16V1H11V0H5ZM3 3H13V16H3V3ZM5 5V14H7V5H5ZM9 5V14H11V5H9Z" fill="black"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('hatrick-inline-dialog-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-inline-dialog-styles';
    style.textContent = `
      #hatrick-inline-explanation {
        position: fixed;
        z-index: 999999;
        background: white;
        border: 1.5px solid #000;
        border-radius: 17px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.2s ease;
      }
      
      #hatrick-inline-explanation.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hatrick-dialog-content {
        padding: 0;
      }
      
      .hatrick-dialog-actions {
        display: flex;
        align-items: center;
        padding: 6px;
        gap: 4px;
      }
      
      .hatrick-action-btn {
        background: none;
        border: none;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      }
      
      .hatrick-action-btn:hover {
        background-color: #f8f9fa;
        transform: translateY(-1px);
      }
      
      .hatrick-action-btn:hover .hatrick-action-icon {
        color: #333;
      }
      
      .hatrick-action-text {
        color: #333;
        font-size: 13px;
        font-weight: 600;
      }
      
      .hatrick-action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }
      
      .hatrick-action-icon svg {
        width: 100%;
        height: 100%;
        fill: #000;
      }
      
      
      .hatrick-dialog-explanation {
        border-top: 1px solid #eee;
        padding: 16px;
        background: #fafafa;
      }
      
      .hatrick-explanation-content {
        margin-bottom: 16px;
        color: #333;
      }
      
      .hatrick-explanation-content h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #495057;
      }
      
      .hatrick-explanation-content p {
        margin: 0 0 12px 0;
        line-height: 1.5;
      }
      
      .hatrick-dialog-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      
      .hatrick-save-btn, .hatrick-close-explanation-btn {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }
      
      .hatrick-save-btn {
        background: #28a745;
        color: white;
        border-color: #28a745;
      }
      
      .hatrick-save-btn:hover {
        background: #218838;
        border-color: #1e7e34;
      }
      
      .hatrick-close-explanation-btn {
        background: white;
        color: #6c757d;
      }
      
      .hatrick-close-explanation-btn:hover {
        background: #f8f9fa;
        color: #495057;
      }
      
      .hatrick-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-style: italic;
      }
      
      .hatrick-loading::before {
        content: '';
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: hatrick-spin 1s linear infinite;
      }
      
      @keyframes hatrick-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(dialog);
  inlineExplanationDialog = dialog;

  console.log('🔍 Dialog added to document, parent:', dialog.parentNode);
  console.log('🔍 Dialog in DOM:', document.contains(dialog));

  // Add event listeners
  setupInlineDialogEventListeners(dialog);

  return dialog;
}

// Get selected text from the page
function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString().trim();
}

// Setup event listeners for the inline dialog
function setupInlineDialogEventListeners(dialog) {
  console.log('🔗 Setting up event listeners for dialog');
  
  // Check if event listeners are already set up to prevent duplicates
  if (dialog.dataset.listenersSetup === 'true') {
    console.log('🔗 Event listeners already set up, skipping');
    return;
  }
  
  const termBtn = dialog.querySelector('#term-explanation');
  const notesBtn = dialog.querySelector('#add-to-notes');
  const deleteBtn = dialog.querySelector('#delete-term');
  
  console.log('🔗 Found elements:', {
    termBtn: !!termBtn,
    notesBtn: !!notesBtn,
    deleteBtn: !!deleteBtn
  });

  // Set up event listeners for the new button structure
  
  if (termBtn) {
    termBtn.addEventListener('click', async () => {
      console.log('🔗 Term explanation clicked');
      // Use stored selection instead of current selection
      const selectedText = currentSelection || getSelectedText();
      console.log('🔗 Selected text for term explanation:', selectedText);
      if (selectedText) {
        console.log('🔗 Sending showTermExplanation message directly to panel');
        // Send message directly to panel and wait for the explanation
        hideInlineExplanationDialog();
        chrome.runtime.sendMessage({
          type: 'showTermExplanation',
          term: selectedText.trim()
        }, (response) => {
          console.log('🔗 Panel response for term explanation:', response);
        });
      } else {
        console.log('🔗 No selected text available for term explanation');
      }
    });
  }
  
  if (notesBtn) {
    notesBtn.addEventListener('click', () => {
      console.log('🔗 Add to notes clicked');
      const selectedText = currentSelection || getSelectedText();
      console.log('🔗 Selected text for notes:', selectedText);
      if (selectedText) {
        console.log('🔗 Sending addToNotes message directly to panel');
        // Send message directly to panel to add selected text to notes
        chrome.runtime.sendMessage({
          type: 'addToNotes',
          text: selectedText.trim()
        }, (response) => {
          console.log('🔗 Panel response for add to notes:', response);
        });
        // Hide dialog
        hideInlineExplanationDialog();
      } else {
        console.log('🔗 No selected text available for notes');
      }
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      console.log('🔗 Delete clicked - removing highlight');
      removeCurrentHighlight();
      hideInlineExplanationDialog();
    });
  }
  
  // Mark dialog as having listeners set up
  dialog.dataset.listenersSetup = 'true';
  

  // Close dialog when clicking outside
  dialog.addEventListener('click', (e) => {
    console.log('🔍 Dialog clicked, target:', e.target);
    console.log('🔍 Target class:', e.target.className);
    console.log('🔍 Target tag:', e.target.tagName);
    
    if (e.target === dialog) {
      hideInlineExplanationDialog();
    }
  });
}

// Show inline explanation dialog
function showInlineExplanationDialog(selectedText, selectionRect) {
  console.log('🎯 showInlineExplanationDialog called with:', selectedText);
  
  if (!selectedText || selectedText.trim().length === 0) {
    console.log('❌ No selected text, returning');
    return;
  }

  // Set flag to prevent dialog from being hidden while showing
  isDialogBeingShown = true;
  console.log('🚩 Set dialog showing flag');

  // Store the selection so it doesn't get lost when selection is cleared
  storedSelection = selectedText;
  console.log('💾 Stored selection:', storedSelection);

  // Highlight the selected text on the page
  highlightSelectedText(selectedText);

  // Set a flag to indicate we're using inline explanation
  window.hatrickUsingInlineExplanation = true;
  console.log('🚩 Set inline explanation flag');

  console.log('🏗️ Creating dialog...');
  const dialog = createInlineExplanationDialog();
  console.log('✅ Dialog created:', dialog);
  console.log('🔍 Dialog element:', dialog);
  console.log('🔍 Dialog parent:', dialog.parentNode);
  
  // Store current selection
  currentSelection = selectedText.trim();
  console.log('📝 Stored current selection:', currentSelection);

  // Position dialog
  console.log('📍 Positioning dialog...');
  console.log('📍 Selection rect for positioning:', selectionRect);
  positionDialog(dialog, selectionRect);
  console.log('📍 Dialog positioned, final position:', {
    left: dialog.style.left,
    top: dialog.style.top
  });

  // Show dialog with animation
  console.log('🎬 Showing dialog with animation...');
  setTimeout(() => {
    console.log('⏰ Timeout executed - adding show class');
    dialog.classList.add('show');
    console.log('✨ Dialog should now be visible');
    console.log('🔍 Dialog classes:', dialog.className);
    
    // Clear the dialog showing flag after dialog is fully shown
    isDialogBeingShown = false;
    console.log('🚩 Cleared dialog showing flag');
    
    // Clear the selection after a delay to allow user to click the button
    // But keep the highlights visible
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        selection.removeAllRanges();
        console.log('🧹 Cleared selection after delay - but keeping highlights');
      }
    }, 5000); // 5 second delay to give more time
    
    // Event listeners are already set up, no need to re-setup
    console.log('🔗 Event listeners already configured');
  }, 10);
}

// Position dialog relative to selection
function positionDialog(dialog, selectionRect) {
  const dialogRect = dialog.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 10;

  // Default position: bottom-right of selection
  let left = selectionRect.right + margin;
  let top = selectionRect.bottom + margin;

  // Adjust if dialog goes off-screen horizontally
  if (left + dialogRect.width > viewportWidth - margin) {
    left = selectionRect.left - dialogRect.width - margin;
  }

  // Adjust if dialog goes off-screen vertically
  if (top + dialogRect.height > viewportHeight - margin) {
    top = selectionRect.top - dialogRect.height - margin;
  }

  // Ensure dialog stays within viewport
  left = Math.max(margin, Math.min(left, viewportWidth - dialogRect.width - margin));
  top = Math.max(margin, Math.min(top, viewportHeight - dialogRect.height - margin));

  dialog.style.left = left + 'px';
  dialog.style.top = top + 'px';
  
  // Add hover event listeners to keep dialog visible when hovering over it
  dialog.addEventListener('mouseenter', () => {
    console.log('🎯 Mouse entered dialog - keeping it visible');
  });
  
  dialog.addEventListener('mouseleave', () => {
    console.log('🎯 Mouse left dialog - hiding it');
    setTimeout(() => {
      hideInlineExplanationDialog();
    }, 100);
  });
}

// Highlight selected text on the page
function highlightSelectedText(selectedText) {
  console.log('🎨 Highlighting selected text:', selectedText);
  
  // Don't clear existing highlights - let them accumulate
  
  // Add highlight styles if not already present
  if (!document.getElementById('hatrick-selected-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-selected-highlight-styles';
    style.textContent = `
      .hatrick-selected-highlight {
        background-color: #fff3cd !important;
        border-bottom: 2px solid #ffc107 !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
        /* Preserve original text formatting - don't override font properties */
        font-weight: inherit !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-style: inherit !important;
        text-decoration: inherit !important;
        color: inherit !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
        display: inline !important;
        line-height: inherit !important;
      }
      
      .hatrick-selected-highlight:hover {
        background-color: #ffeaa7 !important;
        border-bottom-color: #f39c12 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Only highlight the specific selected text instance, not all occurrences
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    
    try {
      // Create a span around the selected text
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'hatrick-selected-highlight';
      
      // Extract the selected content and wrap it
      const contents = range.extractContents();
      highlightSpan.appendChild(contents);
      range.insertNode(highlightSpan);
      
      // DON'T clear the selection immediately - keep it so dialog stays visible
      // selection.removeAllRanges();
      
      console.log('✅ Specific text instance highlighted');
    } catch (error) {
      console.error('❌ Error highlighting specific text:', error);
      // Fallback: don't highlight anything if there's an error
    }
  }
  
  console.log('✅ Text highlighted on page');
}

// Remove the specific highlight that triggered the current popup
function removeCurrentHighlight() {
  console.log('🗑️ Removing current highlight');
  
  // Find the highlight that contains the current selection or is closest to the dialog
  const dialog = document.getElementById('hatrick-inline-explanation');
  if (!dialog) {
    console.log('❌ No dialog found to determine which highlight to remove');
    return;
  }
  
  // Get the dialog position to find the nearest highlight
  const dialogRect = dialog.getBoundingClientRect();
  const dialogCenterX = dialogRect.left + dialogRect.width / 2;
  const dialogCenterY = dialogRect.top + dialogRect.height / 2;
  
  // Find all highlights and determine which one is closest to the dialog
  const highlights = document.querySelectorAll('.hatrick-selected-highlight');
  let closestHighlight = null;
  let closestDistance = Infinity;
  
  highlights.forEach((highlight) => {
    const highlightRect = highlight.getBoundingClientRect();
    const highlightCenterX = highlightRect.left + highlightRect.width / 2;
    const highlightCenterY = highlightRect.top + highlightRect.height / 2;
    
    // Calculate distance between dialog center and highlight center
    const distance = Math.sqrt(
      Math.pow(dialogCenterX - highlightCenterX, 2) + 
      Math.pow(dialogCenterY - highlightCenterY, 2)
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestHighlight = highlight;
    }
  });
  
  if (closestHighlight) {
    console.log('🎯 Found closest highlight to remove:', closestHighlight.textContent);
    const parent = closestHighlight.parentNode;
    if (parent) {
      // Replace the highlight span with just the text content
      parent.replaceChild(document.createTextNode(closestHighlight.textContent), closestHighlight);
      parent.normalize(); // Merge adjacent text nodes
      console.log('✅ Highlight removed successfully');
    } else {
      console.log('❌ No parent found for highlight');
    }
  } else {
    console.log('❌ No highlights found to remove');
  }
}

// Clear selected text highlights
function clearSelectedHighlights() {
  console.log('🧹 Clearing selected text highlights');
  
  // Debug: Check how many highlights exist
  const highlights = document.querySelectorAll('.hatrick-selected-highlight');
  console.log('🔍 Found', highlights.length, 'selected text highlights to clear');
  
  highlights.forEach((highlight, index) => {
    console.log(`🔍 Processing highlight ${index + 1}:`, highlight);
    const parent = highlight.parentNode;
    if (parent) {
      console.log(`🔍 Replacing highlight ${index + 1} with text:`, highlight.textContent);
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    } else {
      console.log(`❌ No parent found for highlight ${index + 1}`);
    }
  });
  
  // Double-check that highlights are gone
  const remainingHighlights = document.querySelectorAll('.hatrick-selected-highlight');
  console.log('🔍 Remaining highlights after clearing:', remainingHighlights.length);
  
  console.log('✅ Selected highlights cleared');
}

// Clear ALL types of highlights (comprehensive clear)
function clearAllHighlights() {
  console.log('🧹 Clearing ALL highlights from page');
  
  // Clear selected text highlights
  document.querySelectorAll('.hatrick-selected-highlight').forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    }
  });
  
  // Clear Core Finder keyword highlights
  document.querySelectorAll('.hatrick-highlight').forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    }
  });
  
  // Clear paragraph highlights
  document.querySelectorAll('.hatrick-paragraph-highlight').forEach(element => {
    element.classList.remove('hatrick-paragraph-highlight');
    // Remove paragraph numbers
    const numberElement = element.querySelector('.hatrick-paragraph-number');
    if (numberElement) {
      numberElement.remove();
    }
  });
  
  // Remove any tooltips
  document.querySelectorAll('.hatrick-highlight-tooltip').forEach(tooltip => {
    tooltip.remove();
  });
  
  console.log('✅ ALL highlights cleared');
}

// Clear highlights when dialog is closed (only if user explicitly closes it)
function clearHighlightsOnDialogClose() {
  console.log('🧹 Clearing highlights because dialog was closed');
  clearSelectedHighlights();
  storedSelection = '';
}

// Show notification that explanation is ready
function showExplanationReadyNotification() {
  // Create a subtle notification
  const notification = document.createElement('div');
  notification.id = 'hatrick-explanation-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>✅</span>
      <div>
        <div style="font-weight: 600;">Explanation Ready!</div>
        <div style="font-size: 12px; opacity: 0.9;">Click the Hatrick icon to view</div>
      </div>
    </div>
  `;
  
  // Add CSS animation
  if (!document.getElementById('hatrick-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
  
  console.log('✅ Explanation ready notification shown');
}

// Hide inline explanation dialog
function hideInlineExplanationDialog() {
  if (inlineExplanationDialog) {
    inlineExplanationDialog.classList.remove('show');
    setTimeout(() => {
      if (inlineExplanationDialog) {
        inlineExplanationDialog.remove();
        inlineExplanationDialog = null;
      }
    }, 200);
  }
  // Clear selection after a delay to allow message processing
  setTimeout(() => {
    currentSelection = null;
    isExplanationLoading = false;
  }, 1000);
  
  // Don't clear highlights when dialog is closed - keep them persistent
  console.log('🎨 Keeping highlights persistent - not clearing on dialog close');
  
  // Clear the inline explanation flag
  window.hatrickUsingInlineExplanation = false;
  console.log('🚩 Cleared inline explanation flag');
}

// Handle explain button click
async function handleExplainButtonClick() {
  console.log('🔘 Explain button clicked - function called!');
  
  // Use stored selection if current selection is empty
  const selectionToUse = currentSelection || storedSelection;
  console.log('🔍 Current selection:', currentSelection);
  console.log('🔍 Stored selection:', storedSelection);
  console.log('🔍 Using selection:', selectionToUse);
  console.log('🔍 Is explanation loading:', isExplanationLoading);
  
  if (!selectionToUse) {
    console.log('❌ Cannot explain - no selection available');
    return;
  }
  
  if (isExplanationLoading) {
    console.log('❌ Cannot explain - already loading explanation');
    return;
  }
  
  // Set loading flag immediately to prevent double clicks
  isExplanationLoading = true;
  console.log('🚩 Set explanation loading flag to prevent double clicks');

  const explainBtn = inlineExplanationDialog.querySelector('.hatrick-explain-btn');

  console.log('🔄 Starting explanation process...');
  console.log('🔍 Explain button:', explainBtn);
  
  // Verify explain button exists
  if (!explainBtn) {
    console.error('❌ Explain button not found!');
    return;
  }
  console.log('✅ Explain button found');
  
  // Show loading state
  explainBtn.disabled = true;
  explainBtn.innerHTML = '<div class="hatrick-loading">Loading explanation...</div>';
  
  // Add visual feedback that side panel will open
  setTimeout(() => {
    if (explainBtn && explainBtn.innerHTML.includes('Loading explanation')) {
      explainBtn.innerHTML = '<div class="hatrick-loading">Opening side panel...</div>';
    }
  }, 1000);

  try {
    // Get user settings from storage
    console.log('👤 Getting user settings...');
    const userSettings = await chrome.storage.local.get(['userField', 'userExperience']);
    const userField = userSettings.userField || '';
    const userExperience = userSettings.userExperience || 'beginner';
    
    console.log('👤 User settings:', { userField, userExperience });

    // Get page context
    console.log('📄 Getting page context...');
    const pageResult = await chrome.storage.local.get(['pageText']);
    const pageContext = pageResult.pageText || '';
    console.log('📄 Page context length:', pageContext.length);

    // Request explanation from background script
    console.log('🤖 Requesting explanation from background script...');
    console.log('🤖 Request details:', {
      type: 'GET_EXPLANATION',
      term: selectionToUse,
      pageContextLength: pageContext.length,
      userField: userField,
      userExperience: userExperience,
      inline: true
    });
    
    const response = await chrome.runtime.sendMessage({
      type: 'GET_EXPLANATION',
      term: selectionToUse,
      pageContext: pageContext,
      userField: userField,
      userExperience: userExperience,
      inline: true // Flag to indicate this is an inline request
    });
    
    console.log('📥 Received response from background:', response);
    console.log('🤖 Response type:', typeof response);
    console.log('🤖 Response.ok:', response ? response.ok : 'response is null/undefined');

    if (response && response.ok) {
      console.log('✅ Explanation received successfully');
      // Display explanation based on user experience level
      const explanation = userExperience === 'beginner' ? response.beginner : response.advanced;
      console.log('📝 Explanation text:', explanation);
      
      // Send explanation to side panel instead of displaying inline
      console.log('📤 Sending explanation to side panel...');
      const explanationData = {
        beginner: response.beginner,
        advanced: response.advanced,
        userExperience: userExperience
      };
      
      console.log('📤 Explanation data:', explanationData);
      
      await chrome.storage.local.set({
        lastSelection: selectionToUse,
        lastExplanation: explanationData
      });

      console.log('📤 Storage updated with explanation data');

      // Show notification to open side panel
      console.log('🚀 Explanation ready - showing notification to open side panel');
      
      // Update button to show that explanation is ready
      if (explainBtn) {
        explainBtn.innerHTML = '✅ Explanation Ready - Click Extension Icon';
        explainBtn.style.background = '#28a745';
        explainBtn.disabled = false;
        
        // Add click handler to show instruction
        explainBtn.onclick = function() {
          alert('Explanation is ready! Please click the Hatrick extension icon in your browser toolbar to view the full explanation in the side panel.');
        };
      }
      
      // Notification removed per user request

      console.log('✨ Explanation sent to side panel');
    } else {
      console.log('❌ Failed to get explanation:', response);
    }
  } catch (error) {
    console.error('💥 Error getting explanation:', error);
    // Show error in button
    explainBtn.innerHTML = 'Error - Try Again';
    explainBtn.style.background = '#dc3545';
  } finally {
    // Reset button state
    console.log('🔄 Resetting button state...');
    explainBtn.disabled = false;
    explainBtn.textContent = 'Explain';
    explainBtn.style.background = '';
    isExplanationLoading = false;
  }
}

// Handle save to vocabulary
async function handleSaveToVocabulary() {
  console.log('💾 Save to vocabulary clicked for:', currentSelection);
  
  if (!currentSelection) {
    console.log('❌ No current selection to save');
    return;
  }

  try {
    // Get current vocab pocket
    console.log('📚 Getting current vocab pocket...');
    const result = await chrome.storage.local.get(['vocabPocket']);
    const vocabPocket = result.vocabPocket || [];
    console.log('📚 Current vocab pocket:', vocabPocket);
    
    // Add term if not already present
    if (!vocabPocket.includes(currentSelection)) {
      console.log('➕ Adding new term to vocab pocket');
      vocabPocket.push(currentSelection);
      await chrome.storage.local.set({ vocabPocket: vocabPocket });
      console.log('✅ Term saved to vocab pocket');
      
      // Show success feedback
      const saveBtn = inlineExplanationDialog.querySelector('.hatrick-save-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.style.background = '#28a745';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
      }, 2000);
    } else {
      console.log('ℹ️ Term already in vocabulary');
      // Show already saved feedback
      const saveBtn = inlineExplanationDialog.querySelector('.hatrick-save-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Already Saved';
      saveBtn.style.background = '#6c757d';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
      }, 2000);
    }
  } catch (error) {
    console.error('💥 Error saving to vocabulary:', error);
  }
}

// Format explanation text (same as panel.js)
function formatExplanation(explanation) {
  return explanation
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>') // ***text*** -> bold italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')              // **text** -> bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');                         // *text* -> italic
}

// Handle text selection
function handleTextSelection() {
  console.log('🔍 handleTextSelection called');
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  console.log('📝 Selected text:', selectedText);
  console.log('📏 Text length:', selectedText.length);
  
  if (selectedText && selectedText.length > 0) {
    console.log('✅ Valid selection detected, showing dialog');
    // Get selection range and position
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    console.log('📍 Selection rect:', rect);
    
    // Show dialog
    showInlineExplanationDialog(selectedText, rect);
  } else {
    console.log('❌ Invalid selection detected');
    // Don't hide dialog if it's currently being shown or already visible
    if (isDialogBeingShown || (inlineExplanationDialog && inlineExplanationDialog.classList.contains('show'))) {
      console.log('🎨 Dialog is being shown or already visible - keeping it open');
      return; // Don't hide the dialog
    }
    
    // Also don't hide if we have a stored selection (meaning dialog should be visible)
    if (storedSelection && storedSelection.trim().length > 0) {
      console.log('🎨 Have stored selection - keeping dialog open');
      return; // Don't hide the dialog
    }
    
    // Only hide dialog if it's not currently visible and no stored selection
    console.log('🎨 No dialog visible and no stored selection - hiding any existing dialog');
    hideInlineExplanationDialog();
  }
}

// Listen for messages from the panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLEAR_HIGHLIGHTS') {
    console.log('🧹 Received clear ALL highlights message from panel');
    clearAllHighlights(); // Use comprehensive clear function
    storedSelection = '';
    sendResponse({ ok: true });
  }
  
  if (message.type === 'CLEAR_SELECTED_HIGHLIGHTS') {
    console.log('🧹 Received clear selected text highlights message from panel');
    console.log('🧹 Message details:', message);
    clearSelectedHighlights(); // Clear only selected text highlights
    storedSelection = '';
    sendResponse({ ok: true });
  }
});

// Add text selection event listener
// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', (e) => {
  // Handle selection with keyboard (Shift + arrow keys)
  if (e.shiftKey || e.key === 'Shift') {
    setTimeout(handleTextSelection, 10);
  }
});

// Hide dialog when clicking elsewhere
document.addEventListener('click', (e) => {
  if (inlineExplanationDialog && !inlineExplanationDialog.contains(e.target)) {
    const selection = window.getSelection();
    if (selection.toString().trim() === '') {
      hideInlineExplanationDialog();
    }
  }
});

// Hide dialog on scroll
window.addEventListener('scroll', hideInlineExplanationDialog, { passive: true });

// Listen for test messages from the main page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  switch (event.data.type) {
    case 'HATRICK_TEST_COMPLETE_FLOW':
      console.log('🧪 Received test complete flow message');
      showInlineExplanationDialog('algorithm', event.data.testRect);
      setTimeout(() => {
        const explainBtn = document.querySelector('.hatrick-explain-btn');
        if (explainBtn) {
          console.log('🤖 Auto-clicking explain button...');
          explainBtn.click();
        }
      }, 1000);
      break;
      
    case 'HATRICK_TEST_INLINE_DIALOG':
      console.log('🧪 Received test inline dialog message');
      showInlineExplanationDialog('test term', event.data.testRect);
      break;
      
    case 'HATRICK_TEST_EXPLANATION_DISPLAY':
      console.log('🧪 Received test explanation display message');
      const dialog = document.getElementById('hatrick-inline-explanation');
      if (dialog) {
        const explanationSection = dialog.querySelector('.hatrick-dialog-explanation');
        const explanationContent = dialog.querySelector('.hatrick-explanation-content');
        
        if (explanationSection && explanationContent) {
          explanationSection.style.display = 'block';
          explanationContent.innerHTML = '<h4>Test Explanation</h4><p>This is a test explanation to verify the display works.</p>';
          console.log('✅ Test explanation should now be visible');
        }
      } else {
        console.log('❌ Dialog not found for explanation test');
      }
      break;
      
    case 'HATRICK_EXPLAIN_BUTTON_CLICKED':
      console.log('🔘 Received explain button clicked message');
      handleExplainButtonClick();
      break;
  }
});

// Test functions are already defined above - no need to redefine them

console.log('🎯 Test functions now available globally:');
console.log('- testCompleteFlow()');
console.log('- testInlineDialog()');
console.log('- testExplanationDisplay()');

// Verify functions are actually available
console.log('🔍 Function availability check:');
console.log('- testCompleteFlow:', typeof window.testCompleteFlow);
console.log('- testInlineDialog:', typeof window.testInlineDialog);
console.log('- testExplanationDisplay:', typeof window.testExplanationDisplay);

// Listen for scroll events (debounced)
window.addEventListener('scroll', handleScroll, { passive: true });

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message.type, message);
  
  // Check if chrome extension APIs are available
  if (!chrome || !chrome.runtime) {
    console.log('Chrome extension APIs not available');
    sendResponse({ success: false, error: 'Extension context invalidated' });
    return true;
  }
  
  if (message.type === 'PULL_PAGE_TEXT') {
    // Get current page text from storage and send response
    try {
      chrome.storage.local.get(['pageText', 'currentUrl']).then(result => {
        sendResponse({
          pageText: result.pageText || '',
          url: result.currentUrl || ''
        });
      });
    } catch (error) {
      console.log('Error accessing storage:', error);
      sendResponse({ pageText: '', url: '' });
    }
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'HIGHLIGHT_KEYWORDS') {
    // Highlight keywords feature disabled
    console.log('🎨 Highlight keywords feature disabled');
    sendResponse({ success: true, message: 'Highlighting disabled' });
    return true;
  }
  
  if (message.type === 'CLEAR_HIGHLIGHTS') {
    // Clear all highlights
    clearAllHighlights();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'HIGHLIGHT_PARAGRAPHS') {
    // Highlight paragraphs
    console.log('HIGHLIGHT_PARAGRAPHS message received:', message);
    try {
      if (message.paragraphCount && message.paragraphCount > 0) {
        console.log('Calling highlightParagraphs with count:', message.paragraphCount);
        highlightParagraphs(message.paragraphCount);
        sendResponse({ success: true });
      } else {
        console.log('Invalid paragraph count:', message.paragraphCount);
        sendResponse({ success: false, error: 'Invalid paragraph count' });
      }
    } catch (error) {
      console.error('Error highlighting paragraphs:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (message.type === 'CLEAR_PARAGRAPH_HIGHLIGHTS') {
    // Clear paragraph highlights
    clearParagraphHighlights();
    sendResponse({ success: true });
    return true;
  }
  
});

// Handle page navigation (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('🌐 Page navigation detected:', url);
    
    // Collect text after navigation
    setTimeout(collectPageText, 1000);
    
    // Notify panel about navigation for field detection
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'PAGE_NAVIGATED', url: url });
    }, 1500);
  }
}).observe(document, { subtree: true, childList: true });

// Highlighting functionality
let highlightedElements = [];

// Create highlight styles
function injectHighlightStyles() {
  if (document.getElementById('hatrick-highlight-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'hatrick-highlight-styles';
  style.textContent = `
    .hatrick-highlight {
      background-color: #fff3cd !important;
      border-bottom: 2px solid #ffc107 !important;
      padding: 2px 4px !important;
      border-radius: 3px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
      cursor: pointer !important;
    }
    
    .hatrick-highlight:hover {
      background-color: #ffeaa7 !important;
      border-bottom-color: #f39c12 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }
    
    .hatrick-highlight-tooltip {
      position: absolute;
      background: #2c3e50;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      max-width: 250px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .hatrick-highlight-tooltip.show {
      opacity: 1;
    }
    
    .hatrick-highlight-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #2c3e50;
    }
  `;
  document.head.appendChild(style);
}

// Clear all highlights
function clearHighlights() {
  console.log('Clearing highlights...');
  
  // Clear test highlights (from our test function)
  document.querySelectorAll('.hatrick-test').forEach(element => {
    const parent = element.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(element.textContent), element);
      parent.normalize();
    }
  });
  
  // Clear keyword highlights
  document.querySelectorAll('.hatrick-highlight').forEach(element => {
    const parent = element.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(element.textContent), element);
      parent.normalize();
    }
  });
  
  // Clear stored elements array
  highlightedElements = [];
  
  // Remove any tooltips
  document.querySelectorAll('.hatrick-highlight-tooltip').forEach(tooltip => {
    tooltip.remove();
  });
  
  console.log('Highlights cleared');
}

// Simple test function - highlights all instances of "the" with yellow
function quickHighlightTest() {
  console.log('Quick highlight test starting...');
  
  // Clear any existing highlights first
  clearHighlights();
  
  // Add simple test styles
  if (!document.getElementById('hatrick-test-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-test-styles';
    style.textContent = `
      .hatrick-test {
        background-color: #ffeb3b !important;
        color: #000 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        font-weight: bold !important;
        border: 1px solid #ffc107 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Find all text elements and highlight "the"
  const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, article, section');
  let highlightCount = 0;
  let elementCount = 0;
  
  elements.forEach(element => {
    // Skip if element contains other elements or is already highlighted
    if (element.querySelector('script, style, .hatrick-test, .hatrick-highlight')) return;
    
    // Skip if element is a script, style, or other non-content element
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'iframe', 'svg'].includes(tagName)) return;
    
    const originalHTML = element.innerHTML;
    const highlightedHTML = originalHTML.replace(/\b(the)\b/gi, '<span class="hatrick-test">$1</span>');
    
    if (originalHTML !== highlightedHTML) {
      element.innerHTML = highlightedHTML;
      elementCount++;
      
      // Count individual highlights
      const highlights = element.querySelectorAll('.hatrick-test');
      highlightCount += highlights.length;
      
      // Store highlighted elements for cleanup
      highlights.forEach(highlight => {
        highlightedElements.push(highlight);
      });
    }
  });
  
  console.log(`Highlighted ${highlightCount} instances of "the" in ${elementCount} elements`);
  
  // Show alert to user
  if (highlightCount > 0) {
    alert(`✅ Test successful! Highlighted ${highlightCount} instances of "the" on this page.`);
  } else {
    alert(`❌ No instances of "the" found to highlight. Try a different page with more text.`);
  }
  
  return highlightCount;
}

// Highlight keywords function - now working with extracted keywords
function highlightKeywords(keywords) {
  console.log('🎨 Highlighting keywords:', keywords);
  console.log('🎨 Keywords to highlight:', keywords.map(k => k.term));
  
  // Clear any existing highlights first
  clearHighlights();
  
  // Add highlight styles
  if (!document.getElementById('hatrick-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-highlight-styles';
    style.textContent = `
      .hatrick-highlight {
        background-color: #fff3cd !important;
        border-bottom: 2px solid #ffc107 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
      }
      
      .hatrick-highlight:hover {
        background-color: #ffeaa7 !important;
        border-bottom-color: #f39c12 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }
      
      .hatrick-highlight-tooltip {
        position: fixed;
        background: #2c3e50;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        max-width: 250px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        word-wrap: break-word;
      }
      
      .hatrick-highlight-tooltip.show {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  if (!keywords || keywords.length === 0) {
    console.log('⚠️ No keywords to highlight');
    return;
  }
  
  // Find only main content elements (more selective)
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article, section, blockquote');
  let totalHighlights = 0;
  
  textElements.forEach(element => {
    // Skip if element contains scripts or styles
    if (element.querySelector('script, style')) return;
    
    // Skip if element is a script, style, or other non-content element
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'iframe', 'svg', 'img', 'canvas', 'video', 'audio'].includes(tagName)) return;
    
    // Skip if element has no text content
    if (!element.textContent || element.textContent.trim().length === 0) return;
    
    // Skip elements with important data attributes that shouldn't be modified
    if (element.hasAttribute('data-sentry-component') || 
        element.hasAttribute('data-testid') || 
        element.hasAttribute('data-nimg') ||
        element.hasAttribute('data-sentry-source-file')) {
      return;
    }
    
    // Skip elements that are likely navigation or UI components
    if (element.classList.contains('static') || 
        element.classList.contains('flex') || 
        element.classList.contains('items-center') ||
        element.classList.contains('transition-all') ||
        element.classList.contains('nav') ||
        element.classList.contains('menu') ||
        element.classList.contains('header') ||
        element.classList.contains('footer') ||
        element.classList.contains('sidebar') ||
        element.classList.contains('button') ||
        element.classList.contains('btn')) {
      return;
    }
    
    // Skip elements with very short text (likely UI elements)
    if (element.textContent.trim().length < 10) {
      return;
    }
    
    // Skip elements that are likely buttons, links, or small UI text
    if (element.tagName === 'A' || element.tagName === 'BUTTON' || element.tagName === 'LABEL') {
      return;
    }
    
    let originalHTML = element.innerHTML;
    let modifiedHTML = originalHTML;
    let hasChanges = false;
    
    // Process each keyword
    keywords.forEach(keyword => {
      const term = keyword.term;
      const explanation = keyword.explanation;
      
      // Create case-insensitive regex for whole words only
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      
      // Skip very short or common words that might cause over-highlighting
      if (term.length < 3 || 
          ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'].includes(term.toLowerCase())) {
        return;
      }
      
      // Replace all instances of the keyword (only if not already highlighted)
      const newHTML = modifiedHTML.replace(regex, (match) => {
        // Skip if this match is already inside a highlight span
        if (match.includes('<span class="hatrick-highlight"') || match.includes('</span>')) {
          return match;
        }
        
        hasChanges = true;
        totalHighlights++;
        return `<span class="hatrick-highlight" data-explanation="${explanation.replace(/"/g, '&quot;')}" title="${explanation}">${match}</span>`;
      });
      
      modifiedHTML = newHTML;
    });
    
    // Apply changes if any were made
    if (hasChanges) {
      // Use a more careful approach to preserve original formatting
      try {
        // Create a range to work with the element's content
        const range = document.createRange();
        range.selectNodeContents(element);
        
        // Get all text nodes in the element
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          textNodes.push(node);
        }
        
        // Process each text node for highlighting
        textNodes.forEach(textNode => {
          const text = textNode.textContent;
          const parent = textNode.parentNode;
          
          // Skip if parent has important attributes or classes
          if (parent.hasAttribute('data-sentry-component') || 
              parent.hasAttribute('data-testid') || 
              parent.hasAttribute('data-nimg') ||
              parent.classList.contains('static') ||
              parent.classList.contains('flex') ||
              parent.classList.contains('items-center')) {
            return;
          }
          
          // Check if this text node contains any keywords
          keywords.forEach(keyword => {
            const term = keyword.term;
            const explanation = keyword.explanation;
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
            
            if (regex.test(text)) {
              // Split the text and create highlights
              const parts = text.split(regex);
              const matches = text.match(regex);
              
              if (matches && matches.length > 0) {
                const fragment = document.createDocumentFragment();
                
                parts.forEach((part, index) => {
                  if (part) {
                    fragment.appendChild(document.createTextNode(part));
                  }
                  if (matches[index]) {
                    const highlight = document.createElement('span');
                    highlight.className = 'hatrick-highlight';
                    highlight.setAttribute('data-explanation', explanation.replace(/"/g, '&quot;'));
                    highlight.setAttribute('title', explanation);
                    highlight.textContent = matches[index];
                    
                    // Add event listeners for popup dialog
                    highlight.addEventListener('mouseenter', (e) => showHighlightPopup(e));
                    highlight.addEventListener('mouseleave', hideHighlightPopup);
                    highlightedElements.push(highlight);
                    
                    fragment.appendChild(highlight);
                  }
                });
                
                // Only replace if we have a valid parent and the text node is still in the DOM
                if (parent && textNode.parentNode === parent) {
                  parent.replaceChild(fragment, textNode);
                }
              }
            }
          });
        });
      } catch (error) {
        console.error('Error highlighting keywords:', error);
        // Fallback to innerHTML if DOM manipulation fails
        element.innerHTML = modifiedHTML;
        
        // Add event listeners to new highlights in this element
        element.querySelectorAll('.hatrick-highlight').forEach(highlight => {
          highlight.addEventListener('mouseenter', (e) => showHighlightPopup(e));
          highlight.addEventListener('mouseleave', hideHighlightPopup);
          highlightedElements.push(highlight);
        });
      }
    }
  });
  
  console.log(`✅ Highlighted ${totalHighlights} keyword instances across ${textElements.length} elements`);
}

// Show tooltip on hover
function showTooltip(event) {
  const element = event.target;
  const explanation = element.getAttribute('data-explanation');
  
  if (!explanation) return;
  
  // Remove existing tooltip
  const existingTooltip = document.querySelector('.hatrick-highlight-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create new tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'hatrick-highlight-tooltip';
  tooltip.textContent = explanation;
  document.body.appendChild(tooltip);
  
  // Position tooltip
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top - tooltipRect.height - 10;
  
  // Adjust if tooltip goes off screen
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  if (top < 10) {
    top = rect.bottom + 10;
  }
  
  tooltip.style.left = left + window.scrollX + 'px';
  tooltip.style.top = top + window.scrollY + 'px';
  
  // Show tooltip
  setTimeout(() => tooltip.classList.add('show'), 10);
}

// Hide tooltip
function hideTooltip() {
  const tooltip = document.querySelector('.hatrick-highlight-tooltip');
  if (tooltip) {
    tooltip.classList.remove('show');
    setTimeout(() => tooltip.remove(), 300);
  }
}

// Show popup dialog when hovering over a highlight
function showHighlightPopup(event) {
  console.log('🎯 Hovering over highlight, showing popup');
  const highlight = event.target;
  const text = highlight.textContent;
  
  // Get the highlight's position
  const rect = highlight.getBoundingClientRect();
  
  // Store the current selection for the popup
  currentSelection = text;
  
  // Show the popup dialog
  showInlineExplanationDialog(text, rect);
}

// Hide popup dialog when leaving a highlight
function hideHighlightPopup() {
  console.log('🎯 Leaving highlight, hiding popup');
  // Add a small delay to prevent flickering when moving between popup and highlight
  setTimeout(() => {
    const dialog = document.getElementById('hatrick-inline-explanation');
    if (dialog && !dialog.matches(':hover')) {
      hideInlineExplanationDialog();
    }
  }, 100);
}

// Highlight paragraphs
function highlightParagraphs(paragraphCount) {
  console.log('Highlighting paragraphs:', paragraphCount);
  
  // Clear any existing paragraph highlights first
  clearParagraphHighlights();
  
  // Add paragraph highlight styles
  if (!document.getElementById('hatrick-paragraph-styles')) {
    const style = document.createElement('style');
    style.id = 'hatrick-paragraph-styles';
    style.textContent = `
      .hatrick-paragraph-highlight {
        border-right: 4px solid #dc3545 !important;
        padding-right: 15px !important;
        margin-right: 0 !important;
        transition: all 0.3s ease !important;
        display: block !important;
        position: relative !important;
      }
      
      .hatrick-paragraph-highlight:hover {
        border-right-color: #c82333 !important;
        background-color: rgba(220, 53, 69, 0.05) !important;
      }
      
      .hatrick-paragraph-number {
        display: inline-block !important;
        background: #dc3545 !important;
        color: white !important;
        font-size: 11px !important;
        font-weight: bold !important;
        padding: 2px 8px !important;
        border-radius: 4px !important;
        margin-left: 10px !important;
        vertical-align: top !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Find content container
  const contentSelectors = [
    'article', 'main', 'section', 'div.content', 'div.post', 'div.entry',
    'div.article', 'div.story', 'div.text', 'div.body'
  ];
  
  let contentContainer = null;
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.length > 200) {
      contentContainer = element;
      console.log('Found content container:', selector, element);
      break;
    }
  }
  
  if (!contentContainer) {
    contentContainer = document.body;
    console.log('Using document.body as content container');
  }
  
  // Get all paragraph-like elements
  const paragraphElements = contentContainer.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote, article, section');
  
  console.log('Found', paragraphElements.length, 'potential paragraph elements');
  
  // Filter and combine short paragraphs
  const validElements = [];
  paragraphElements.forEach((element, index) => {
    if (isContentElement(element)) {
      const text = element.innerText.trim();
      if (text.length > 30) {
        validElements.push({ element, text, index });
      }
    }
  });
  
  // Combine short paragraphs (less than 15 words) with the next paragraph
  const combinedElements = combineShortParagraphElements(validElements);
  
  let highlightedCount = 0;
  
  combinedElements.forEach((item, index) => {
    if (highlightedCount >= paragraphCount) return;
    
    console.log(`Highlighting combined element ${index}:`, item.element.tagName, item.text.substring(0, 50) + '...');
    
    // Add highlight class to the first element in the combination
    item.element.classList.add('hatrick-paragraph-highlight');
    
    // Add paragraph number as inline element (NO OVERLAP)
    const numberElement = document.createElement('span');
    numberElement.className = 'hatrick-paragraph-number';
    numberElement.textContent = highlightedCount + 1;
    
    // Insert the number at the beginning of the paragraph
    item.element.insertBefore(numberElement, item.element.firstChild);
    
    // If this is a combined paragraph, also highlight the next element(s)
    if (item.combinedWith) {
      item.combinedWith.forEach(combinedElement => {
        combinedElement.classList.add('hatrick-paragraph-highlight');
      });
    }
    
    highlightedCount++;
  });
  
  // Function to combine short paragraph elements
  function combineShortParagraphElements(elements) {
    const combined = [];
    let i = 0;
    
    while (i < elements.length) {
      const current = elements[i];
      const wordCount = current.text.split(/\s+/).length;
      
      // If paragraph has less than 15 words, combine with next paragraph
      if (wordCount < 15 && i + 1 < elements.length) {
        const next = elements[i + 1];
        const combinedText = current.text + ' ' + next.text;
        
        combined.push({
          element: current.element,
          text: combinedText,
          index: current.index,
          combinedWith: [next.element]
        });
        
        i += 2; // Skip both elements since we combined them
      } else {
        combined.push(current);
        i += 1;
      }
    }
    
    console.log(`Combined short paragraph elements: ${elements.length} -> ${combined.length}`);
    return combined;
  }
  
  console.log(`Highlighted ${highlightedCount} paragraphs`);
}

// Clear paragraph highlights
function clearParagraphHighlights() {
  console.log('Clearing paragraph highlights...');
  
  // Remove highlight classes and numbers
  document.querySelectorAll('.hatrick-paragraph-highlight').forEach(element => {
    element.classList.remove('hatrick-paragraph-highlight');
    
    // Remove paragraph numbers
    const numberElement = element.querySelector('.hatrick-paragraph-number');
    if (numberElement) {
      numberElement.remove();
    }
  });
  
  console.log('Paragraph highlights cleared');
}

// Analyze paragraph importance and relevance
function analyzeParagraphImportance(paragraphs) {
  const analyzedParagraphs = paragraphs.map((paragraph, index) => {
    const text = paragraph.textContent.trim();
    const length = text.length;
    const wordCount = text.split(/\s+/).length;
    
    // Calculate importance score based on multiple factors
    let importanceScore = 0;
    let relevanceLevel = 'low'; // grey
    let importanceReason = '';
    
    // Factor 1: Length (longer paragraphs often more important)
    if (length > 200) importanceScore += 2;
    else if (length > 100) importanceScore += 1;
    
    // Factor 2: Position (first and last paragraphs often important)
    if (index === 0) {
      importanceScore += 3;
      importanceReason += 'Introduction paragraph. ';
    }
    if (index === paragraphs.length - 1) {
      importanceScore += 2;
      importanceReason += 'Conclusion paragraph. ';
    }
    
    // Factor 3: Keywords and phrases that indicate importance
    const importantKeywords = [
      'important', 'key', 'main', 'primary', 'essential', 'critical', 'significant',
      'conclusion', 'summary', 'findings', 'results', 'study shows', 'research indicates',
      'however', 'therefore', 'furthermore', 'moreover', 'in addition', 'specifically',
      'for example', 'in particular', 'notably', 'especially', 'particularly'
    ];
    
    const keywordMatches = importantKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    importanceScore += keywordMatches;
    
    if (keywordMatches > 0) {
      importanceReason += `Contains ${keywordMatches} important keywords. `;
    }
    
    // Factor 4: Question marks and exclamation marks (often indicate important points)
    const questionMarks = (text.match(/\?/g) || []).length;
    const exclamationMarks = (text.match(/!/g) || []).length;
    importanceScore += (questionMarks + exclamationMarks);
    
    if (questionMarks > 0 || exclamationMarks > 0) {
      importanceReason += 'Contains questions or emphasis. ';
    }
    
    // Factor 5: Numbers and statistics (often important data)
    const numberMatches = (text.match(/\d+/g) || []).length;
    if (numberMatches > 0) {
      importanceScore += 1;
      importanceReason += 'Contains numerical data. ';
    }
    
    // Factor 6: Technical terms or jargon (indicates specialized content)
    const technicalTerms = [
      'algorithm', 'methodology', 'framework', 'protocol', 'system', 'process',
      'analysis', 'implementation', 'optimization', 'efficiency', 'performance'
    ];
    
    const technicalMatches = technicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    ).length;
    importanceScore += technicalMatches;
    
    if (technicalMatches > 0) {
      importanceReason += 'Contains technical content. ';
    }
    
    // Factor 7: Reference indicators (citations, sources)
    const referenceIndicators = [
      'according to', 'study', 'research', 'data shows', 'findings', 'results',
      'cited', 'reference', 'source', 'journal', 'paper', 'report'
    ];
    
    const referenceMatches = referenceIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator)
    ).length;
    
    if (referenceMatches > 0) {
      importanceScore += 1;
      importanceReason += 'Contains references or citations. ';
    }
    
    // Determine relevance level based on score
    if (importanceScore >= 6) {
      relevanceLevel = 'high'; // red - most important
    } else if (importanceScore >= 3) {
      relevanceLevel = 'medium'; // green - medium importance
    } else if (importanceScore >= 1) {
      relevanceLevel = 'low'; // grey - low importance
    } else {
      relevanceLevel = 'background'; // grey - no relevance or background
    }
    
    // Special case: very short paragraphs are usually background
    if (length < 50) {
      relevanceLevel = 'background';
      importanceReason = 'Short paragraph, likely background information.';
    }
    
    return {
      paragraphNumber: index + 1,
      text: text,
      importanceScore: importanceScore,
      relevanceLevel: relevanceLevel,
      importanceReason: importanceReason.trim() || 'Standard paragraph content.',
      wordCount: wordCount,
      length: length
    };
  });
  
  return analyzedParagraphs;
}

// ============================================================================
// FIELD DETECTION FUNCTIONS
// ============================================================================

// Auto-field detection functionality has been removed
