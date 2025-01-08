class MIDIInterface {

    static NOTE_ON = 0x90; // MIDI "Note On" status byte
    static NOTE_OFF = 0x80; // MIDI "Note Off" status byte

    constructor() {
        this.noteEventListeners = []; // Listeners for note events
        this.midiAccess = null; // Web MIDI API access object
        this.initMIDI(); // Initialize MIDI
    }

    // Add a listener for note events
    addNoteEventListener(listener) {
        if (typeof listener.noteEvent === 'function') {
            this.noteEventListeners.push(listener);
        } else {
            throw new Error("Listener must have a 'noteEvent' method");
        }
    }

    // Initialize Web MIDI API
    async initMIDI() {
        try {
            // Request access to MIDI devices
            this.midiAccess = await navigator.requestMIDIAccess();
            console.log("MIDI Access granted.");

            // Add event listeners for MIDI inputs
            this.midiAccess.inputs.forEach(input => this.setupInput(input));

            // Listen for new devices being connected
            this.midiAccess.onstatechange = event => {
                if (event.port.type === "input" && event.port.state === "connected") {
                    this.setupInput(event.port);
                }
            };
        } catch (error) {
            console.error("Failed to get MIDI access:", error);
        }
    }

    // Set up a MIDI input device
    setupInput(input) {
        console.log(`Setting up MIDI input: ${input.name}`);
        input.onmidimessage = this.handleMIDIMessage.bind(this);
    }

    // Handle incoming MIDI messages
    handleMIDIMessage(message) {
        const [status, noteNumber, velocity] = message.data;

        if (status >= MIDIInterface.NOTE_ON && status < (MIDIInterface.NOTE_ON + 16)) {
            // Note On event
            if (velocity > 0) {
                this.dispatchNoteEvent(noteNumber, MIDIInterface.NOTE_ON);
            } else {
                // If velocity is 0, it's treated as Note Off
                this.dispatchNoteEvent(noteNumber, MIDIInterface.NOTE_OFF);
            }
        } else if (status >= MIDIInterface.NOTE_OFF && status < (MIDIInterface.NOTE_OFF + 16)) {
            // Note Off event
            this.dispatchNoteEvent(noteNumber, MIDIInterface.NOTE_OFF);
        }
    }

    // Notify all registered listeners about a note event
    dispatchNoteEvent(noteNumber, eventType) {
        this.noteEventListeners.forEach(listener => listener.noteEvent(noteNumber, eventType));
    }
}