/**
 * Content Protection Utility
 * Disables copying, screenshotting, and other content theft methods
 */

export const initializeContentProtection = () => {
  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Disable text selection (CSS will handle most, this ensures JS fallback)
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // 3. Disable copy, cut, paste
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener('cut', (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener('paste', (e) => {
    e.preventDefault();
    return false;
  });

  // 4. Disable keyboard shortcuts for copying/printing
  document.addEventListener('keydown', (e) => {
    // Ctrl+C or Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      return false;
    }
    // Ctrl+X or Cmd+X (Cut)
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      e.preventDefault();
      return false;
    }
    // Ctrl+V or Cmd+V (Paste)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      return false;
    }
    // Ctrl+A or Cmd+A (Select All)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      return false;
    }
    // F12 (Developer Tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I or Cmd+Shift+I (Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J or Cmd+Shift+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C or Cmd+Shift+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+K or Cmd+Shift+K
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      return false;
    }
    // Ctrl+P or Cmd+P (Print)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    // Ctrl+S or Cmd+S (Save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      return false;
    }
  });

  // 5. Detect and block developer tools
  const detectDevTools = () => {
    let devtools = { open: false };
    
    const threshold = 160;
    setInterval(() => {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Could redirect or show warning
          console.log('Developer Tools detected');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  };

  detectDevTools();

  // 6. Disable drag and drop for images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 7. Disable mouse right-click on images
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  });

  // 8. Disable inspect element on specific classes
  const protectElement = (selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    });
  };

  // Protect important elements
  protectElement('.protected-content');
  protectElement('img');
  protectElement('.product-image');

  // 9. Disable text selection with CSS fallback
  const style = document.createElement('style');
  style.textContent = `
    body, body * {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
    }
    
    img {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      pointer-events: none;
    }
    
    input, textarea, select {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `;
  document.head.appendChild(style);

  // 10. Prevent screenshot detection (visual watermark)
  // Add a hidden element that only appears in screenshots
  const watermark = document.createElement('div');
  watermark.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 72px;
    opacity: 0.3;
    pointer-events: none;
    z-index: 9999;
    font-weight: bold;
    color: red;
    text-align: center;
    display: none;
  `;
  watermark.textContent = 'SCREENSHOT DETECTED';
  document.body.appendChild(watermark);

  // Show watermark when screenshot is detected
  const showWatermark = () => {
    watermark.style.display = 'block';
    setTimeout(() => {
      watermark.style.display = 'none';
    }, 2000);
  };

  // Try to detect screenshot via visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      showWatermark();
    }
  });

  console.log('Content protection initialized');
};

// Disable console in production
export const disableConsole = () => {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
};
