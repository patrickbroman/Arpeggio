class InputInterface {
    constructor() {
        this.keyEventListeners = []; // Listeners for key events
        this.initKeyboardEvents(); // Initialize keyboard event handling
    }

    // Add a listener for key events
    addKeyEventListener(listener) {
        if (typeof listener.keyEvent === 'function') {
            this.keyEventListeners.push(listener);
        } else {
            throw new Error("Listener must have a 'keyEvent' method");
        }
    }

    // Remove a listener for key events
    removeKeyEventListener(listener) {
        this.keyEventListeners = this.keyEventListeners.filter(l => l !== listener);
    }

    // Initialize keyboard events
    initKeyboardEvents() {
        // Listen for keydown and keyup events
        window.addEventListener('keydown', event => this.handleKeyEvent(event, 'keydown'));
        window.addEventListener('keyup', event => this.handleKeyEvent(event, 'keyup'));
    }

    // Handle keyboard events
    handleKeyEvent(event, eventType) {
        const { key, code, keyCode } = event; // Extract key details
        // Dispatch to all registered listeners
        this.keyEventListeners.forEach(listener => listener.keyEvent({ key, code, keyCode, eventType }));
    }
}
