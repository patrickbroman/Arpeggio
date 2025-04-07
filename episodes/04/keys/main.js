const SPEEDUP = 3.0;
const NOTE_SIZE = 50;
const NOTE_SPACING = 68;

const TIME_START_SCALE_DEPLOY = 500;

const TIME_FADE_NONDIATONIC = 100;
const DURATION_FADE_NONDIATONIC = 200;

const TIME_HIDE_CHROMATIC = 2000;
const DURATION_HIDE_CHROMATIC = 200;

// ), 6000 + i * 400, 6200 + i * 400);

const TIME_MINOR_FADEIN_START = 8600;
const DURATION_MINOR_FADEIN = 200;
const OFFSET_MINOR_FADEIN = 800; 

const TIME_GHOST_OCTAVE_APPEAR = 2200;
const TIME_GHOST_OCTAVE_HIDE = 7300;
const DURATION_GHOST_OCTAVE_FADE = 100;

const TIME_START_CHROMATIC_ANIMATE = 500;
const DURATION_CHROMATIC_ANIMATE = 100;
const OFFSET_CHROMATIC_ANIMATE = 240;

const CHORD_NOTE_START = 2200;
const STRIDE_CHORD_NOTE = 100;
const DURATION_CHORD_FADEIN = 100;
const OFFSET_CHORD_ANIMATION = 300;
const DURATION_CHORD_ANIMATION = 200;

function cloneWidget(original) {
    const w = new TextWidget(original.x, original.y, original.width, original.height, original.text);

    w.extraText = original.extraText;
    w.fontSize = original.fontSize;
    w.backgroundMode = original.backgroundMode;
    w.backgroundColor = original.backgroundColor;
    w.highlightedColor = original.highlightedColor;
    w.backgroundOpacity = original.backgroundOpacity;
    w.fontOpacity = original.fontOpacity;
    w.index = original.index;
    w.pressed = original.pressed;
    w.highlighted = original.highlighted;

    // Om du har andra custom properties, lägg till dem här också

    return w;
}

TextWidget.prototype.render = function(ctx, frame) {
    // Run animations
    for (let i = 0; i < this.animations.length; i++) {
        const a = this.animations[i];
        if (frame >= a.startFrame && frame <= a.endFrame) {
            let t = (frame - a.startFrame) / (a.endFrame - a.startFrame);
            if (frame === a.endFrame) {
                t = 1.0;
            }
            a.func.call(this, t);
        }
        if (frame > a.endFrame && !a.completed) {
            a.func.call(this, 1.0);
            a.completed = true;
        }
    }
    ctx.save();
    if (this.backgroundMode === TEXTWIDGET_BACKGROUNDMODE_RECTANGLE) {
        // Render background rectangle
        ctx.save();
        ctx.globalAlpha = this.backgroundOpacity;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    } else {
        if (this.width !== this.height) {
            throw "Can't have a non-square circle!";
        }
        ctx.save();
        ctx.globalAlpha = this.backgroundOpacity;
        
        let fillColor = this.highlighted ? this.highlightedColor : this.backgroundColor;
        fillColor = this.pressed ? brightenColor(fillColor, 0.5) : fillColor;
        ctx.fillStyle = fillColor;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = this.width / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.globalAlpha = this.backgroundOpacity;
        //ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        ctx.restore();
    }

    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.fontOpacity})`;
    ctx.font = `${this.fontSize}px ${this.fontName}`;
    ctx.textBaseline = "middle";

    if(this.extraText === undefined) {
        const textSize = ctx.measureText(this.text);

        const x = this.x + this.width / 2 - textSize.width / 2;
        let y = this.y + this.height / 2 + 4;

        if (this.textY !== null) {
            y = this.y + this.textY;
        }

        ctx.fillText(this.text, x, y);
    } else {
        const textSize = ctx.measureText(this.text);

        const x = this.x + this.width / 2 - textSize.width / 2;
        let y = this.y + this.height / 2 + 4;

        if (this.textY !== null) {
            y = this.y + this.textY;
        }

        ctx.fillText(this.text, x-0, y-11);
        ctx.fillText(this.extraText, x+0, y+11);
    }

    ctx.restore();
}

class Keys {
    static ANIM_SPEED = 3.4;

    constructor(y) {
        this.y = y;
        this.keyIndex = 7; // G-dur

        this.flatNoteNames = [
            "C", "Db", "D", "Eb", "E", "F",
            "Gb", "G", "Ab", "A", "Bb", "B"
        ];

        this.sharpNoteNames = [
            "C", "C#", "D", "D#", "E", "F",
            "F#", "G", "G#", "A", "A#", "B"
        ];

        const keysUsingSharps = [2, 4, 7, 9, 11];
        const noteNames = keysUsingSharps.includes(this.keyIndex % 12)
            ? this.sharpNoteNames
            : this.flatNoteNames;

        const noteSize = 54;
        let xInc = noteSize + 10;
        const yStart = this.y;

        this.chromaticWidgets = [];
        this.scaleWidgets = [];
        this.noteWidgets = []; // union av alla widgets
        this.scaleNotePositions = [];
        this.chordNotePositions = [];

        this.mWidgetPositions = [];

        const scaleSteps = [2, 2, 1, 2, 2, 2, 1];

        // === 1. Bygg skala (två oktaver, 14 toner)
        const scaleIndices = [];
        let idx = this.keyIndex;
        for (let i = 0; i < 14; i++) {
            scaleIndices.push(idx % 24);
            idx += scaleSteps[i % 7];
        }

        const scaleIndicesFirst = scaleIndices.slice(0, 7);
        const scaleIndicesSecond = scaleIndices.slice(7, 14);
        const scaleIndexSet = new Set(scaleIndices);

        // === 2. Skapa 24 kromatiska widgets (statiska, står kvar)
        let chromX = 1920 / 2 - 12 * xInc;
        for (let i = 0; i < 24; i++) {
            let noteName = noteNames[i % 12];
            let extraName;

            if (noteName.includes('|')) {
                const parts = noteName.split('|');
                noteName = parts[0];
                extraName = parts[1];
            }

            const widget = new TextWidget(chromX, yStart, noteSize, noteSize, noteName);
            widget.index = i;
            widget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            widget.backgroundColor = "#f00";
            widget.backgroundOpacity = 0.0;
            widget.highlightedColor = "#f00";
            widget.highlighted = false;
            widget.pressed = false;
            widget.fontSize = extraName ? 18 : 28;
            if (extraName) widget.extraText = extraName;
            widget.fontOpacity = 1.0;

            this.chromaticWidgets.push(widget);
            chromX += xInc;
        }

                // === 2.5. Fade ner fontOpacity för kromatiska toner som inte ingår i skalan
        for (let i = 0; i < this.chromaticWidgets.length; i++) {
            const widget = this.chromaticWidgets[i];
            if (i < this.keyIndex || i >= this.keyIndex + 12 || !scaleIndexSet.has(widget.index)) {
                // non-scale fadeout
                widget.addAnimation(makeAnimation(
                    { fontOpacity: makeInterpolator(1.0, 0.4) }
                ), TIME_FADE_NONDIATONIC, TIME_FADE_NONDIATONIC + DURATION_FADE_NONDIATONIC);

                widget.addAnimation(makeAnimation(
                    { fontOpacity: makeInterpolator(0.4, 0.0) }
                ), TIME_HIDE_CHROMATIC, TIME_HIDE_CHROMATIC + DURATION_HIDE_CHROMATIC);
            } else {
                widget.addAnimation(makeAnimation(
                    { fontOpacity: makeInterpolator(1.0, 0.0) }
                ), TIME_HIDE_CHROMATIC, TIME_HIDE_CHROMATIC + DURATION_HIDE_CHROMATIC);

            }
        }

        xInc += 70;
        // === 3. Förberedd skalaposition
        let xPos = 1920 / 2 - 3.5 * xInc;
        for (let i = 0; i < 14; i++) {
            this.scaleNotePositions[i] = xPos;
            if(i === 1 || i === 2 || i === 5) {
                this.mWidgetPositions.push(xPos + 13);
            }
            xPos += xInc;
        }

        xPos = 1920 / 2 - 7 * xInc;
        for (let i = 0; i < 3; i++) {
            this.chordNotePositions[i] = xPos;
            xPos += xInc;
        }

        // 3.5 m Widget positions

        let mWidgets = [];

        let minor_offsets = [800, 800, 1600];

        for(let i = 0; i < this.mWidgetPositions.length; i++) {
            const widget = new TextWidget(this.mWidgetPositions[i], yStart + 100, noteSize, noteSize, 'm');
            console.log(widget);
            widget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            widget.backgroundColor = "#f00";
            widget.backgroundOpacity = 0.0;
            widget.highlightedColor = "#f00";
            widget.fontOpacity = 0.0;
            widget.highlighted = false;
            widget.pressed = false;
            widget.fontSize = 28;

            widget.addAnimation(makeAnimation(
                {
                    fontOpacity: makeInterpolator(0.0, 1.0)
                }
            //), 6000 + i * 400, 6200 + i * 400);
            ), TIME_MINOR_FADEIN_START + i * minor_offsets[i], 
               TIME_MINOR_FADEIN_START + DURATION_MINOR_FADEIN + i * minor_offsets[i]);

            mWidgets.push(widget);

        }

        let minorIdx = 0;

        // === 4. Första oktavens skaltoner (flytt från kromatisk)
        for (let i = 0; i < scaleIndicesFirst.length; i++) {
            const srcIdx = scaleIndicesFirst[i];
            const orig = this.chromaticWidgets[srcIdx];

            const widget = new TextWidget(orig.x, orig.y, noteSize, noteSize, orig.text);
            widget.extraText = orig.extraText;
            widget.fontSize = orig.fontSize;
            widget.backgroundMode = orig.backgroundMode;
            widget.backgroundColor = orig.backgroundColor;
            widget.backgroundOpacity = 0.0;
            widget.highlightedColor = orig.highlightedColor;
            widget.fontOpacity = 1.0;

            // Animeras från sin kromatiska plats
            widget.addAnimation(makeAnimation(
                {
                    x: makeInterpolator(widget.x, this.scaleNotePositions[i]),
                    y: makeInterpolator(widget.y, widget.y + 100)
                }
            ), TIME_START_CHROMATIC_ANIMATE + i * OFFSET_CHROMATIC_ANIMATE, 
               TIME_START_CHROMATIC_ANIMATE + DURATION_CHROMATIC_ANIMATE + i * OFFSET_CHROMATIC_ANIMATE);

            // Shift minor chord letters

            if(i === 1 || i === 2 || i === 5) {
                widget.addAnimation(makeAnimation(
                    {
                        x: makeInterpolator(this.scaleNotePositions[i], this.scaleNotePositions[i] - 10),
                    }
                ), TIME_MINOR_FADEIN_START + minorIdx * minor_offsets[minorIdx], 
                   TIME_MINOR_FADEIN_START + DURATION_MINOR_FADEIN + minorIdx * minor_offsets[minorIdx]);
                minorIdx++;    
            }

            this.scaleWidgets.push(widget);
        }

        // === 5. Andra oktavens skaltoner (fade-in)
        for (let i = 0; i < scaleIndicesSecond.length; i++) {
            const srcIdx = scaleIndicesSecond[i];
            const orig = this.chromaticWidgets[srcIdx];

            const widget = new TextWidget(
                this.scaleNotePositions[i + 7],
                yStart + 100,
                noteSize,
                noteSize,
                orig.text
            );

            widget.extraText = orig.extraText;
            widget.fontSize = orig.fontSize;
            widget.backgroundMode = orig.backgroundMode;
            widget.backgroundColor = orig.backgroundColor;
            widget.backgroundOpacity = 0.0;
            widget.highlightedColor = orig.highlightedColor;
            widget.fontOpacity = 0.0;

            let st = TIME_GHOST_OCTAVE_APPEAR;
            let et = TIME_GHOST_OCTAVE_HIDE;

            widget.addAnimation(makeAnimation(
                { fontOpacity: makeInterpolator(0.0, 0.4) }
            ), st, st + DURATION_GHOST_OCTAVE_FADE);

            widget.addAnimation(makeAnimation(
                { fontOpacity: makeInterpolator(0.4, 0.0) }
            ), et, et + DURATION_GHOST_OCTAVE_FADE);

            this.scaleWidgets.push(widget);
        }

        // === 6. Lägg till allt i renderlistan
        this.noteWidgets = [
            ...this.chromaticWidgets, // alltid synliga först
            ...this.scaleWidgets,     // skalan animeras ovanpå
            ...mWidgets
        ];

       // === 7. Ackord-animationer (grundläge, ingen inversion)

        let cSt = CHORD_NOTE_START;
        for (let i = 0; i < 7; i++) {
            
            const root  = cloneWidget(this.scaleWidgets[i]);
            const third = cloneWidget(this.scaleWidgets[i + 2]);
            const fifth = cloneWidget(this.scaleWidgets[i + 4]);

            root.fontOpacity = third.fontOpacity = fifth.fontOpacity = 0.0;

            root.y += 100;
            
            if((i + 2) < 7) {
                third.y += 100;
            }

            if((i + 4) < 7) {
                fifth.y += 100;
            }

            root.x = this.scaleNotePositions[i];
            third.x = this.scaleNotePositions[i + 2];
            fifth.x = this.scaleNotePositions[i + 4]; 

            const chord = [root, third, fifth];
            this.noteWidgets.push(...[root, third, fifth]);

            //const STRIDE_CHORD_NOTE = 100
            // const DURATION_CHORD_FADEIN = 100;
            // const OFFSET_CHORD_ANIMATION = 300;
            // const DURATION_CHORD_ANIMATION = 200;

            for (let j = 0; j < 3; j++) {
                const w = chord[j];
                const t = j * STRIDE_CHORD_NOTE;

                w.addAnimation(makeAnimation(
                    { 
                        backgroundOpacity: makeInterpolator(0.0, 0.3),
                        fontOpacity: makeInterpolator(0.0, 1.0),
                    }
                ), t + cSt, t + cSt + DURATION_CHORD_FADEIN);

                w.addAnimation(makeAnimation(
                    { 
                        backgroundOpacity: makeInterpolator(0.3, 1.0),
                    }
                ), 5400 + t + cSt, 5400 + t + cSt + 100);

                w.addAnimation(makeAnimation(
                    { 
                        backgroundOpacity: makeInterpolator(1.0, 0.3),
                    }
                ), 5600 + t + cSt, 5600 + t + cSt + 100);


                w.addAnimation(makeAnimation(
                    { 
                        x: makeInterpolator(w.x, chord[0].x),
                        y: makeInterpolator(w.y, w.y + 100 + 70 * (j) )
                    }
                ), cSt + OFFSET_CHORD_ANIMATION, cSt + OFFSET_CHORD_ANIMATION + DURATION_CHORD_ANIMATION);
            }

            cSt += 800;
        }

    }

    render(ctx, frame) {
        ctx.save();
        ctx.translate(0, this.y);
        this.noteWidgets.forEach(w => w.render(ctx, frame));
        ctx.restore();
    }
}


async function init() {
    //gImageManager = new ImageManager();
    //await gImageManager.load(["leftGrad.png", "rightGrad.png"]); // Wait for images to load

    gCanvas = document.getElementById("myCanvas");

    gCanvas.setAttribute("tabindex", "0");
    gCanvas.focus();

    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    gKeys = new Keys(100);

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

    gKeys.render(ctx, frame);

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
