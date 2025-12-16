/**
 * Utility function to reset all application state stored in localStorage
 * Useful for testing and development
 */
export function resetAllState() {
    // Clear all localStorage items used by the app
    localStorage.removeItem('quizCompletionState');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('userStats');
    
    // Reload the page to reset React state
    window.location.reload();
}

/**
 * Reset state without reloading the page
 * Useful if you want to reset state programmatically
 */
export function clearAllState() {
    localStorage.removeItem('quizCompletionState');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('userStats');
}

// Make it available globally for easy console access during development
if (typeof window !== 'undefined') {
    (window as any).resetAppState = resetAllState;
    (window as any).clearAppState = clearAllState;
}


