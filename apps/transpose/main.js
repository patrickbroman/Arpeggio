
var SPEEDUP = 1.0;

var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var CHROMATIC_NOTE_Y = 50;
var CHROMATIC_NOTE_WIDTH = 120;
var CHROMATIC_NOTE_SPACING = 20;
var CHROMATIC_NOTE_FONTSIZE = 60;

var KEY_NOTE_Y = 500;
var KEY_NOTE_WIDTH = 146;
var KEY_NOTE_SPACING = 108;
var KEY_NOTE_FONTSIZE = 80;

var CHORD_SEQ_FONTSIZE = 140;
var CHORD_SEQ_NUMERAL_FONTSIZE = 100;
var CHORD_SEQ_Y = 150;

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


    console.log("keyIndex: " + Config.srcKeyIndex);
    var srcKey = keys[Config.srcKeyIndex];
    var destKey = keys[Config.destKeyIndex];

    // Populate the container

    gContainer = new Container(3);

    var keyTotalWidth = KEY_NOTE_WIDTH * 7 + KEY_NOTE_SPACING * 6;
    var keyNoteX = gCanvas.width/2 - keyTotalWidth/2;
    var keyNoteY = KEY_NOTE_Y;

    var keyNotePositions = [];

    // Make widgets for all the chords
    
    var chordNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii"];
    
    var movingNumbers = [];
    var movingChords = [];
    
    var srcChordFadeInStartTime = 2 * 60;
    var numeralFadeInStartTime = 3 * 60;
    var destChordFadeInStartTime = 22 * 60;
    var chordFadeInTime = 1 * 60;

    for(var i = 0; i < srcKey.chords.length; i++) {
        var srcChordNotes = srcKey.chords[i].notes;
        var destChordNotes = destKey.chords[i].notes;
        var notesPerChord = SEVENTHS_ENABLED ? 4 : 3;

        var chordNoteX = keyNoteX;
        keyNoteX += KEY_NOTE_WIDTH + KEY_NOTE_SPACING;
        var chordNoteY = KEY_NOTE_Y;//pos.y;
        var chord2NoteY = KEY_NOTE_Y + 100;//pos.y;
        var chordNumeralY = KEY_NOTE_Y - 100;//pos.y;

        // Widget for src key
        var chordName = SEVENTHS_ENABLED ? srcKey.chords[i].seventhName : srcKey.chords[i].triadName;
        var noteWidget = new TextWidget(chordNoteX, chordNoteY + CHORD_NAME_SPACING, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 0.0;
        noteWidget.fontSize = CHORD_NAME_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "fontOpacity" : makeInterpolator(0, 1)
            }
        )
        , srcChordFadeInStartTime, srcChordFadeInStartTime + chordFadeInTime);
        gContainer.addObject(noteWidget);
        
        // Widget for dest key
        chordName = SEVENTHS_ENABLED ? destKey.chords[i].seventhName : destKey.chords[i].triadName;
        noteWidget = new TextWidget(chordNoteX, chord2NoteY + CHORD_NAME_SPACING, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 0.0;
        noteWidget.fontSize = CHORD_NAME_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "fontOpacity" : makeInterpolator(0, 1)
            }
        )
        , destChordFadeInStartTime, destChordFadeInStartTime + chordFadeInTime);
        gContainer.addObject(noteWidget);
        movingChords.push(noteWidget);
        
        // Widget for chord numeral
        chordName = chordNumerals[i];
        noteWidget = new TextWidget(chordNoteX, chordNumeralY + CHORD_NAME_SPACING, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.g = 0;
        noteWidget.b = 0;
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 0.0;
        noteWidget.fontSize = CHORD_NAME_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "fontOpacity" : makeInterpolator(0, 1)
            }
        )
        , numeralFadeInStartTime, numeralFadeInStartTime + chordFadeInTime);
        gContainer.addObject(noteWidget);       
        movingNumbers.push(noteWidget);

    }
    
    var chordSeq = Config.chordSequence;
    var chordTotalWidth = KEY_NOTE_WIDTH * 4 + KEY_NOTE_SPACING * 3;
    var chordSeqX = gCanvas.width/2 - chordTotalWidth/2;
    var chordSeqY = CHORD_SEQ_Y;
    var chordNumeralSeqY = CHORD_SEQ_Y -100;
    
    
    /*noteWidget.addAnimation(makeAnimation(
                {
                    "x" : makeInterpolator(chromaticNoteX, pos.x),
                    "y" : makeInterpolator(chromaticNoteY, pos.y),
                    "fontSize" : makeInterpolator(CHROMATIC_NOTE_FONTSIZE, KEY_NOTE_FONTSIZE),
                    "width" : makeInterpolator(CHROMATIC_NOTE_WIDTH, KEY_NOTE_WIDTH),
                    "height" : makeInterpolator(CHROMATIC_NOTE_WIDTH, KEY_NOTE_WIDTH)
                }
            )
            , st, et);*/
    
    var startFadeOutSrc = 26*60;
    var fadeOutTime = 1 * 60;
    var chordTransportTime = 2 * 60;
    var startMoveNumerals = 6 * 60; 
    
    for(var i = 0; i < chordSeq.length; i++) {
        // Widget for src key
        var currentChordSeqX = chordSeqX;
        chordSeqX += KEY_NOTE_WIDTH + KEY_NOTE_SPACING;
        
        var chordName = SEVENTHS_ENABLED ? srcKey.chords[chordSeq[i]].seventhName : srcKey.chords[chordSeq[i]].triadName;
        var noteWidget = new TextWidget(currentChordSeqX, chordSeqY + CHORD_NAME_SPACING, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 1.0;
        noteWidget.fontSize = CHORD_SEQ_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "fontOpacity" : makeInterpolator(1, 0)
            }
        )
        , startFadeOutSrc, startFadeOutSrc + fadeOutTime);
        gContainer.addObject(noteWidget);
        
        
        chordName = SEVENTHS_ENABLED ? destKey.chords[chordSeq[i]].seventhName : destKey.chords[chordSeq[i]].triadName;
        var originalChord = movingChords[chordSeq[i]];
        noteWidget = new TextWidget(originalChord.x, originalChord.y, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 0.0;
        noteWidget.fontSize = CHORD_NAME_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "x" : makeInterpolator(originalChord.x, currentChordSeqX),
                "y" : makeInterpolator(originalChord.y, chordSeqY + CHORD_NAME_SPACING),
                "fontSize" : makeInterpolator(CHORD_NAME_FONTSIZE, CHORD_SEQ_FONTSIZE),
                "fontOpacity" : makeInterpolator(0, 1)
            }
        )
        , startFadeOutSrc + i * chordTransportTime * 2, (startFadeOutSrc + i * chordTransportTime * 2) + chordTransportTime);
        gContainer.addObject(noteWidget);
        
        chordName = chordNumerals[chordSeq[i]];
        originalChord = movingNumbers[chordSeq[i]];
        noteWidget = new TextWidget(originalChord.x, originalChord.y, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 0.0;
        noteWidget.g = 0;
        noteWidget.b = 0;
        noteWidget.fontSize = CHORD_SEQ_NUMERAL_FONTSIZE;
        noteWidget.addAnimation(makeAnimation(
            {
                "x" : makeInterpolator(originalChord.x, currentChordSeqX),
                "y" : makeInterpolator(originalChord.y, chordNumeralSeqY),
                "fontSize" : makeInterpolator(CHORD_NAME_FONTSIZE, CHORD_SEQ_NUMERAL_FONTSIZE),
                "fontOpacity": makeInterpolator(1, 1)
            }
        )
        , startMoveNumerals + i * chordTransportTime * 2, (startMoveNumerals + i * chordTransportTime * 2) +chordTransportTime);
        
        gContainer.addObject(noteWidget);   
    }

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
