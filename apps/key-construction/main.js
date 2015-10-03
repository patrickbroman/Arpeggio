
var CHROMATIC_NOTE_Y = 50;
var CHROMATIC_NOTE_WIDTH = 120;
var CHROMATIC_NOTE_SPACING = 20;
var CHROMATIC_NOTE_FONTSIZE = 60;

var KEY_NOTE_Y = 200;
var KEY_NOTE_WIDTH = 196;
var KEY_NOTE_SPACING = 58;
var KEY_NOTE_FONTSIZE = 80;

var DELAY_PER_NOTE = 90;
var MOVING_NOTES_START_TIME = 240;
var MOVING_NOTES_DURATION = 40;
var MOVING_NOTES_END_TIME = MOVING_NOTES_START_TIME + MOVING_NOTES_DURATION;

var CHORD_ANIM_START = 920;
var CHORD_ANIM_END = 1000;
var DELAY_PER_CHORD = 240;
var DELAY_PER_CHORD_NOTE = 40;
var CHORD_NOTE_SPACING = 90;

var CHORD_NAME_FONTSIZE = 70;
var CHORD_NAME_SPACING = 60;

var HORIZONTAL_LINE_MARGIN = 170;

var SEVENTHS_ENABLED = false;

function init() {
    gCanvas = document.getElementById("myCanvas");
    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    // Initialize all keys

    var keys = [];

    for(var i = 0; i < gAllNotes.length; i++) {
      var key = new Key(i);
      keys.push(key);
    }

    var key = keys[3];

    // Populate the container

    gContainer = new Container(3);

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

    var chromaticTotalWidth = CHROMATIC_NOTE_WIDTH * 12 + CHROMATIC_NOTE_SPACING * 11;
    var chromaticNoteX = gCanvas.width/2 - chromaticTotalWidth/2;
    var chromaticNoteY = CHROMATIC_NOTE_Y;

    var widgetDict = {};

    // now calculate the positions of the chormatic notes, adding animations

    for(var i = 0; i < gAllNotes.length; i++) {
        var noteWidget = new TextWidget(chromaticNoteX, chromaticNoteY, CHROMATIC_NOTE_WIDTH, CHROMATIC_NOTE_WIDTH, gAllNotes[i]);
        widgetDict[gAllNotes[i]] = noteWidget;
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontSize = CHROMATIC_NOTE_FONTSIZE;
        if(key.isKeyNote(gAllNotes[i])) {
            var noteIndex = key.indexOfNote(gAllNotes[i]);
            var pos = keyNotePositions[noteIndex];
            var st = DELAY_PER_NOTE*noteIndex + MOVING_NOTES_START_TIME;
            var et = DELAY_PER_NOTE*noteIndex + MOVING_NOTES_END_TIME;
            noteWidget.addAnimation(makeAnimation(
                {
                    "x" : makeInterpolator(chromaticNoteX, pos.x),
                    "y" : makeInterpolator(chromaticNoteY, pos.y),
                    "fontSize" : makeInterpolator(CHROMATIC_NOTE_FONTSIZE, KEY_NOTE_FONTSIZE),
                    "width" : makeInterpolator(CHROMATIC_NOTE_WIDTH, KEY_NOTE_WIDTH),
                    "height" : makeInterpolator(CHROMATIC_NOTE_WIDTH, KEY_NOTE_WIDTH)
                }
            )
            , st, et);
        } else {
            // dimming animation
            noteWidget.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(1.0, 0.35),
                }
            )
            , 60, 120);
            // disappearing animation
            noteWidget.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(0.35, 0.0),
                }
            )
            , 860, 900);

        }
        gContainer.addObject(noteWidget);
        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
    }

    // Make widgets for all the chords


    for(var i = 0; i < key.chords.length; i++) {
        var chordNotes = key.chords[i].notes;
        var notesPerChord = SEVENTHS_ENABLED ? 4 : 3;

        var note = chordNotes[0];
        var noteIndex = key.indexOfNote(note);
        var pos = keyNotePositions[noteIndex];
        var chordNoteX = pos.x;
        var chordNoteY = pos.y;
        for(var j = 0; j < notesPerChord; j++) {
            var note = chordNotes[j];
            var noteIndex = key.indexOfNote(note);
            var pos = keyNotePositions[noteIndex];
            console.log("note index:" + noteIndex);
            var noteWidget = new TextWidget(pos.x, pos.y, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, note);
            noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
            noteWidget.fontOpacity = 0.0;
            noteWidget.fontSize = KEY_NOTE_FONTSIZE;
            var startTime = CHORD_ANIM_START + i * DELAY_PER_CHORD + j * DELAY_PER_NOTE;
            var endTime = CHORD_ANIM_END + i * DELAY_PER_CHORD + j * DELAY_PER_NOTE;
            // position animation
            noteWidget.addAnimation(makeAnimation(
                {
                    "x" : makeInterpolator(pos.x, chordNoteX),
                    "y" : makeInterpolator(pos.y, chordNoteY),
                }
            ), startTime, endTime);
            noteWidget.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , startTime, startTime + 50);

            gContainer.addObject(noteWidget);
            chordNoteY += CHORD_NOTE_SPACING;
        }
        var chordName = SEVENTHS_ENABLED ? key.chords[i].seventhName : key.chords[i].triadName;
        var noteWidget = new TextWidget(chordNoteX, chordNoteY + CHORD_NAME_SPACING, KEY_NOTE_WIDTH, KEY_NOTE_WIDTH, chordName);
        noteWidget.textColor = "red";
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 1.0;
        noteWidget.fontSize = CHORD_NAME_FONTSIZE;
        gContainer.addObject(noteWidget);
    }


    // widget for horizontal line
    var lineWidget = new TextWidget(HORIZONTAL_LINE_MARGIN, 550, gCanvas.width-2*HORIZONTAL_LINE_MARGIN, 16, "");
    lineWidget.textColor = "red";
    lineWidget.backgroundColor = "red";
    lineWidget.fontOpacity = 1.0;
    gContainer.addObject(lineWidget);


    window.requestAnimationFrame(render);
    gStartTime = performance.now();
}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gCanvas.width, gCanvas.height);
    ctx.restore();
    gContainer.render(ctx, frame);
    window.requestAnimationFrame(render);
}
