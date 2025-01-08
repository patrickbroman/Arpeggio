const SPEEDUP = 3.0;
const NOTE_SIZE = 50;
const NOTE_SPACING = 68;

class IntervalWidget {
    static ARC_UP = -1;
    static ARC_DOWN = 1;
    
    constructor(x1, x2, y, letterString, arcDirection = IntervalWidget.ARC_UP) {
        this.arcDirection = arcDirection;
        this.x1 = x1;
        this.x2 = x2;
        this.y = y;
        this.letterString = letterString;
    }

    render(ctx) {
        let x1 = this.x1;
        let x2 = this.x2;
        let y = this.y;
        let letterString = this.letterString;

        let midX = (x1 + x2) / 2;

        ctx.font = "30px futura";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.fillStyle = 'white';
        let textMeasure = ctx.measureText(letterString);
        ctx.fillText(letterString, midX, y+3);

        ctx.lineWidth = 6;
        let arcRadius = 20;
        let arcHeight = 10;

        ctx.strokeStyle = "#444";
        
        ctx.beginPath();
        ctx.moveTo(x1 + arcRadius, y);
        ctx.lineTo(midX - textMeasure.width/2 - 4, y);
        ctx.arcTo(x1, y, x1, y  + this.arcDirection * arcHeight, arcRadius);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 - arcRadius, y);
        ctx.lineTo(midX + textMeasure.width/2 + 4, y);
        ctx.arcTo(x2, y, x2, y + this.arcDirection * arcHeight, arcRadius);
        ctx.stroke();
    }
}

class Digikeys {
    static PLAYING = 0;
    static HIGHLIGHTING = 1;

    // Define color constants for different states
    static COLOR_NOT_HIGHLIGHTED_NOT_PRESSED = "#252525";
    static COLOR_NOT_HIGHLIGHTED_PRESSED = "#555";
    static COLOR_HIGHLIGHTED_NOT_PRESSED = "#A05F8C";
    static COLOR_HIGHLIGHTED_PRESSED = brightenColor(Digikeys.COLOR_HIGHLIGHTED_NOT_PRESSED, 0.5);
    
    static INTERVAL_MODE_STEPS = 0;
    static INTERVAL_MODE_NAMES = 1;

    static ACCIDENTAL_MODE_FLATS = 0;
    static ACCIDENTAL_MODE_SHARPS = 1;

    static ANIM_SPEED = 3.4;

    constructor(y, midiInterface, inputInterface) {
        this.y = y;
        this.showIntervals = true;
        this.animating = false;
        this.inputMode = Digikeys.PLAYING;
        this.noteWidgets = [];

        this.accidentalMode = Digikeys.ACCIDENTAL_MODE_FLATS;

        this.intervalWidgets = [];
        this.intervalMode = Digikeys.INTERVAL_MODE_STEPS;

        this.rangeWidgets = [];

        midiInterface.addNoteEventListener(this);
        inputInterface.addKeyEventListener(this);

        // Initialize two octaves of widgets
        let xPos = 1920 / 2 - NOTE_SPACING * 24 - 24;
        const xInc = NOTE_SPACING;
        const noteSize = NOTE_SIZE;

        this.flatNoteNames = [
            "C", "Db", "D", "Eb", "E", "F",
            "Gb", "G", "Ab", "A", "Bb", "B"
        ];

        this.sharpNoteNames = [
            "C", "C#", "D", "D#", "E", "F",
            "F#", "G", "G#", "A", "A#", "B"
        ];

        this.noteNumberMap = {};

        for (let i = 0; i < 48; i++) {
            const noteWidget = new TextWidget(
                xPos,
                100,
                noteSize,
                noteSize,
                this.flatNoteNames[i % 12]
            );
            noteWidget.index = i;
            noteWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            noteWidget.backgroundColor = Digikeys.COLOR_NOT_HIGHLIGHTED_NOT_PRESSED;
            noteWidget.highlighted = false;
            noteWidget.pressed = false; // Track pressed state
            noteWidget.fontSize = 34;
            this.noteWidgets.push(noteWidget);
            this.noteNumberMap[i + 36] = noteWidget; // Map MIDI note numbers
            xPos += xInc;
        }
    }

    addRangeWidget(startNoteIdx, endNoteIdx, y, label) {
        let nw1 = this.noteWidgets[startNoteIdx];
        let nw2 = this.noteWidgets[endNoteIdx];

        let x1 = nw1.x + NOTE_SIZE / 2;
        let x2 = nw2.x + NOTE_SIZE / 2;
        
        let w = new IntervalWidget(x1, x2, y, label, IntervalWidget.ARC_DOWN);
        this.rangeWidgets.push(w);
    }

    updateNoteWidgetColor(noteWidget) {
        if (noteWidget.highlighted && noteWidget.pressed) {
            noteWidget.backgroundColor = Digikeys.COLOR_HIGHLIGHTED_PRESSED;
        } else if (noteWidget.highlighted && !noteWidget.pressed) {
            noteWidget.backgroundColor = Digikeys.COLOR_HIGHLIGHTED_NOT_PRESSED;
        } else if (!noteWidget.highlighted && noteWidget.pressed) {
            noteWidget.backgroundColor = Digikeys.COLOR_NOT_HIGHLIGHTED_PRESSED;
        } else {
            noteWidget.backgroundColor = Digikeys.COLOR_NOT_HIGHLIGHTED_NOT_PRESSED;
        }
    }

    noteEvent(noteNumber, eventType) {
        const noteWidget = this.noteNumberMap[noteNumber];
        if (!noteWidget) return;

        if (this.inputMode === Digikeys.PLAYING) {
            // Handle PLAYING mode
            if (eventType === MIDIInterface.NOTE_ON) {
                noteWidget.pressed = true;
            } else if (eventType === MIDIInterface.NOTE_OFF) {
                noteWidget.pressed = false;
            }
        } else if (this.inputMode === Digikeys.HIGHLIGHTING) {
            // Handle HIGHLIGHTING mode
            if (eventType === MIDIInterface.NOTE_ON) {
                noteWidget.highlighted = !noteWidget.highlighted;
                this.updateIntervals();
            }
        }
        // Update the widget's color based on its state
        this.updateNoteWidgetColor(noteWidget);
    }

    updateIntervals() {
        this.intervalWidgets = [];
        let prevHighlightedNoteWidget = null;
        this.noteWidgets.forEach((widget) => {
            if(widget.highlighted) {
                if(prevHighlightedNoteWidget != null) {
                    let x1 = prevHighlightedNoteWidget.x;
                    let x2 = widget.x;
                    let str = "";
                    if(this.intervalMode == Digikeys.INTERVAL_MODE_NAMES) {
                        let intervalNames = ['u', 'm2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7'];
                        str = intervalNames[widget.index - prevHighlightedNoteWidget.index];
                    } else {
                        str = widget.index - prevHighlightedNoteWidget.index === 1 ? 'H' : 'W';
                    }
                    let w = new IntervalWidget(x1 + NOTE_SIZE / 2, x2 + NOTE_SIZE / 2, 190, str);
                    this.intervalWidgets.push(w);
                }   
                prevHighlightedNoteWidget = widget;
            }
        });
    }

    toggleAccidentals() {
        console.log("TOGGLING ACCIDENTALS!");
        let noteNames = null;
        if(this.accidentalMode === Digikeys.ACCIDENTAL_MODE_FLATS) {
            this.accidentalMode = Digikeys.ACCIDENTAL_MODE_SHARPS;
            noteNames = this.sharpNoteNames;
        } else {
            this.accidentalMode = Digikeys.ACCIDENTAL_MODE_FLATS;
            noteNames = this.flatNoteNames;
        }
        let i = 0;
        this.noteWidgets.forEach((widget) => {
            widget.text = noteNames[(i++)%12];
        });
    }

    keyEvent(event) {
        if (event.eventType === "keydown") {
            if(event.key === 'f') {
                this.toggleAccidentals();
            }
            if (event.key === "i") {
                console.log("TOGGLING INTERVAL MODE!");
                this.showIntervals = !this.showIntervals;
            } else if (event.key === "h") {
                console.log("TOGGLING INPUT MODE!");
                this.inputMode = this.inputMode === Digikeys.PLAYING
                    ? Digikeys.HIGHLIGHTING
                    : Digikeys.PLAYING;
            } else if (event.key === "c") {
                console.log("CLEARING HIGHLIGHTS!");
                this.noteWidgets.forEach((widget) => {
                    widget.highlighted = false;
                    this.updateNoteWidgetColor(widget);
                });
                this.intervalWidgets = [];
            } else if (event.key === "ArrowLeft") {
                if (this.animating) return;
                this.animating = true;
                console.log("STARTED ANIMATING!");
                this.animDirection = -1;
                this.animOffset = 0;
                this.animFrames = NOTE_SPACING / Digikeys.ANIM_SPEED;
            } else if (event.key === "ArrowRight") {
                if (this.animating) return;
                this.animating = true;
                console.log("STARTED ANIMATING!");
                this.animDirection = +1;
                this.animOffset = 0;
                this.animFrames = NOTE_SPACING / Digikeys.ANIM_SPEED;
            }
        }
    }

    setInputMode(inputMode) {
        this.inputMode = inputMode;
    }

    render(ctx, frame) {
        if (this.animating) {
            this.noteWidgets.forEach((widget) => {
                widget.x += this.animDirection * Digikeys.ANIM_SPEED;
            });
            this.intervalWidgets.forEach((widget) => {
                widget.x1 += this.animDirection * Digikeys.ANIM_SPEED;
                widget.x2 += this.animDirection * Digikeys.ANIM_SPEED;
            });
            this.rangeWidgets.forEach((widget) => {
                widget.x1 += this.animDirection * Digikeys.ANIM_SPEED;
                widget.x2 += this.animDirection * Digikeys.ANIM_SPEED;
            });

            this.animFrames--;
            if (this.animFrames === 0) {
                this.animating = false;
                console.log("STOPPED ANIMATING!");
            }
        }

        ctx.save();

        ctx.translate(0, this.y);

        this.noteWidgets.forEach((widget) => {
            widget.render(ctx, frame);
        });

        ctx.save();
        if(this.showIntervals) {
            this.intervalWidgets.forEach((widget) => {
                widget.render(ctx);
            });
            this.rangeWidgets.forEach((widget) => {
                widget.render(ctx);
            });
        }
        ctx.restore();

        const lg = gImageManager.get("leftGrad.png");
        const rg = gImageManager.get("rightGrad.png");
        ctx.drawImage(lg, 0, 100);
        ctx.drawImage(rg, 1920-rg.width, 100);    

        ctx.restore();
    }
}

async function init() {
    gImageManager = new ImageManager();
    await gImageManager.load(["leftGrad.png", "rightGrad.png"]); // Wait for images to load

    gCanvas = document.getElementById("myCanvas");

    gCanvas.setAttribute("tabindex", "0");
    gCanvas.focus();

    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    gInput = new InputInterface();
    gMidi = new MIDIInterface();
    gDigikeys = new Digikeys(300, gMidi, gInput);

    gDigikeys.addRangeWidget(12, 24, 24, "C major");
    gDigikeys.addRangeWidget(24, 36, 24, "C major");
    gDigikeys.addRangeWidget(12+9, 24+9, 72, "A minor");

    gStartTime = performance.now();
    window.requestAnimationFrame(render);
}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(SPEEDUP * time * 60.0 / 1000.0);
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gCanvas.width, gCanvas.height);
    ctx.restore();

    gDigikeys.render(ctx, frame);

    ctx.fillStyle = "yellow";
    ctx.font = "30px Futura";
    ctx.fillText(
        "Time: " + parseFloat(Math.round((time / 1000.0) * 100) / 100).toFixed(2),
        10,
        1060
    );


    window.requestAnimationFrame(render);
}

//init();
