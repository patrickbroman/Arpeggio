
var SPEEDUP = 3.0;

var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var CHROMATIC_NOTE_Y = 150;
var CHROMATIC_NOTE_WIDTH = 60;
var CHROMATIC_NOTE_SPACING = 10;
var CHROMATIC_NOTE_FONTSIZE = 30;

var KEY_NOTE_Y = 200;
var KEY_NOTE_WIDTH = 146;
var KEY_NOTE_SPACING = 108;
var KEY_NOTE_FONTSIZE = 50;

var DELAY_PER_NOTE = 80;
var MOVING_NOTES_START_TIME = 340;
var MOVING_NOTES_DURATION = 40;
var MOVING_NOTES_END_TIME = MOVING_NOTES_START_TIME + MOVING_NOTES_DURATION;

var KILL_CHROMATIC_START_TIME = 900;
var KILL_CHROMATIC_END_TIME = 950;

var CHORD_ANIM_START = 950;
var CHORD_ANIM_END = 1000;
var DELAY_PER_CHORD = 340;
var DELAY_PER_CHORD_NOTE = 40;
var CHORD_NOTE_SPACING = 90;

var CHORD_NAME_FONTSIZE = 70;
var CHORD_NAME_SPACING = 60;
var CHORD_NAME_START_TIME = 1200;
var CHORD_NAME_END_TIME = CHORD_NAME_START_TIME + 30;
var CHORD_NAME_DELAY = DELAY_PER_CHORD;// + DELAY_PER_NOTE*3;

var HIHGLIGHT_SIZE = 90;

var HORIZONTAL_LINE_MARGIN = 120;

var SEVENTHS_ENABLED = false;

function makeWidgets(key, yOff, tOff) {
    var keyTotalWidth = KEY_NOTE_WIDTH * 7 + KEY_NOTE_SPACING * 6;
    var keyNoteX = gCanvas.width/2 - keyTotalWidth/2;
    var keyNoteY = KEY_NOTE_Y;

    var keyNotePositions = [];

    // first calculate the positions of the widgets representing scale
    // notes

    for(var i = 0; i < key.notes.length; i++) {
        keyNotePositions.push({x: keyNoteX, y: keyNoteY});
        keyNoteX += KEY_NOTE_WIDTH + KEY_NOTE_SPACING;
    }

    var chromaticTotalWidth = CHROMATIC_NOTE_WIDTH * 24 + CHROMATIC_NOTE_SPACING * 23;
    var chromaticNoteX = gCanvas.width/2 - chromaticTotalWidth/2;
    var chromaticNoteY = CHROMATIC_NOTE_Y + yOff;

    var widgetDict = {};

    // now calculate the positions of the chormatic notes, adding animations

    let scaleDegree = 0;

    let startIdx = key.index;

    let noteMarked = {};
    
    for(var i = 0; i < gAllNotes.length; i++) {
        noteMarked[gAllNotes[i]] = false;
    }

    for(var i = 0; i < gAllNotes.length; i++) {
        var noteWidget = new TextWidget(
            chromaticNoteX, 
            chromaticNoteY, 
            CHROMATIC_NOTE_WIDTH, 
            CHROMATIC_NOTE_WIDTH, 
            gAllNotes[i%12]
        );
        widgetDict[gAllNotes[i]] = noteWidget;
        //noteWidget.backgroundColor = "rgba(1.0, 0, 0, 1.0)";
        noteWidget.backgroundOpacity = 0.0;
        noteWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
        noteWidget.fontSize = CHROMATIC_NOTE_FONTSIZE;
        noteWidget.fontOpacity = 0.5;
        
        if(key.isKeyNote(gAllNotes[i]) && i >= startIdx) {
            if(scaleDegree != 0) {
                noteMarked[gAllNotes[i]] = true;
            }
            let st = 400 + scaleDegree * 120 + tOff;
            let et = 520 + scaleDegree * 120 + tOff;

            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , st, et);

            noteWidget.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(0.35, 1.0),
                }
            )
            , st, et);

            scaleDegree++;

        } else {
        }
        gContainer.addObject(noteWidget);
        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
    }

    for(var i = 12; i < 24; i++) {
        var noteWidget = new TextWidget(
            chromaticNoteX, 
            chromaticNoteY, 
            CHROMATIC_NOTE_WIDTH, 
            CHROMATIC_NOTE_WIDTH, 
            gAllNotes[i%12]
        );
        widgetDict[gAllNotes[i]] = noteWidget;
        //noteWidget.backgroundColor = "rgba(1.0, 0, 0, 1.0)";
        noteWidget.backgroundOpacity = 0.0;
        noteWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
        noteWidget.fontSize = CHROMATIC_NOTE_FONTSIZE;
        noteWidget.fontOpacity = 0.5;
        
        if(key.isKeyNote(gAllNotes[i%12]) && !noteMarked[gAllNotes[i%12]]) {
            noteMarked[gAllNotes[i]] = true;
            let st = 400 + scaleDegree * 120 + tOff;
            let et = 520 + scaleDegree * 120 + tOff;

            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , st, et);

            noteWidget.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(0.35, 1.0),
                }
            )
            , st, et);


            scaleDegree++;

        } else {
        }
        gContainer.addObject(noteWidget);
        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
    }    
}

function init() {
    gCanvas = document.getElementById("myCanvas");

    gCanvas.setAttribute('tabindex','0');
    gCanvas.focus();

    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    // Initialize all keys

    var keys = [];

    for(var i = 0; i < gAllNotes.length; i++) {
      var key = new Key(i);
      keys.push(key);
    }

    gCanvas.addEventListener("keydown", function(evt) {
        console.log("PRESS");
        if(evt.keyCode == 83) {
            console.log("SAVE!");
            var url = gCanvas.toDataURL("image/png");
            window.open(url);

        }
    }, true);


    console.log("keyIndex: " + Config.keyIndex);
    var key = keys[Config.keyIndex];

    // Populate the container

    gContainer = new Container(3);

    makeWidgets(new Key(0), 0, 200);

    makeWidgets(new Key(2), 300, 1400);

    makeWidgets(new Key(7), 600, 2600);


    if(RECORDING) {
        gEncoder = new Whammy.Video(60);
        gFrame = 0;
    }

    window.requestAnimationFrame(render);
    gStartTime = performance.now();
}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(SPEEDUP*time*60.0/1000.0);
    if(RECORDING) {
        frame = gFrame;
        gFrame++;
    }
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gCanvas.width, gCanvas.height);
    ctx.restore();
    gContainer.render(ctx, frame);
    if(RECORDING) {
        gEncoder.add(ctx);
        console.log("added frame " + frame);
        if(frame < 60*RECORDING_SECONDS) {
            window.requestAnimationFrame(render);
        } else {
            var output = gEncoder.compile();
            var url = window.URL.createObjectURL(output);
            window.open(url);
        }
    } else {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Futura";
        ctx.fillText("Time: " + parseFloat(Math.round((time/1000.0) * 100) / 100).toFixed(2), 10, 1060);
        window.requestAnimationFrame(render);
    }
}
