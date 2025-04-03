/**
 * Debug Utilities
 * Tools for troubleshooting and debugging
 */

/**
 * Check if login buttons are properly set up
 */
function debugLoginButtons() {
  const loginButtons = document.querySelectorAll('#loginButton, .login-button');
  console.group('Login Button Debug');
  console.log(`Found ${loginButtons.length} login buttons`);
  
  loginButtons.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, {
      id: btn.id,
      class: btn.className,
      isVisible: btn.offsetParent !== null,
      hasClickHandler: btn.onclick !== null || btn._events?.click,
      computedStyle: {
        display: window.getComputedStyle(btn).display,
        pointerEvents: window.getComputedStyle(btn).pointerEvents,
        zIndex: window.getComputedStyle(btn).zIndex,
      }
    });
  });
  console.groupEnd();
}

/**
 * Check form submission settings
 */
function debugForms() {
  const forms = document.querySelectorAll('form');
  console.group('Form Debug');
  console.log(`Found ${forms.length} forms`);
  
  forms.forEach((form, index) => {
    console.log(`Form ${index + 1}:`, {
      id: form.id,
      class: form.className,
      action: form.action,
      method: form.method,
      hasSubmitHandler: form.onsubmit !== null || form._events?.submit,
      submitButton: form.querySelector('button[type="submit"], input[type="submit"]')
    });
    
    // Check all input fields
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log(`Form ${index + 1} inputs:`, Array.from(inputs).map(input => ({
      name: input.name,
      id: input.id,
      type: input.type,
      value: input.value
    })));
  });
  console.groupEnd();
}

/**
 * Run all debug checks
 */
function runDebugChecks() {
  console.log('Running debug diagnostics...');
  debugLoginButtons();
  debugForms();
}

// Export functions
export { debugLoginButtons, debugForms, runDebugChecks };
