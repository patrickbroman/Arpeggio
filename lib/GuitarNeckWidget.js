var STRING_WIDTH = 3;
var FRET_WIDTH = 3;

var NOTE_STATE_HIDDEN = 0;
var NOTE_STATE_VISIBLE = 1;
var NOTE_STATE_HIGHLIGHTED = 2;
var NOTE_STATE_SELECTED = 3;

var NOTE_STATE_COLORS = ["rgba(0, 0, 0, 0.0)", "#333", "#7f1f00", "#ff9f00"];
var NOTE_STATE_FONTOPACITY = [0.0, 1.0, 1.0, 1.0];

function GuitarNeckWidget(x, y, width, height, numFrets) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.numFrets = numFrets;
    this.noteWidgets = [];

    var NOTE_WIDGET_SIZE = this.height/12;

    var x = this.x - NOTE_WIDGET_SIZE/2;
    var xAdd = (this.width-STRING_WIDTH) / 5;

    var openStringNoteIndices = [4, 9, 2, 7, 11, 4];

    for(var i = 0; i < 6; i++) {
        var y = this.y - NOTE_WIDGET_SIZE/2;
        var yAdd = (this.height - FRET_WIDTH) / this.numFrets;
        y -= yAdd/2;
        for(var j = 0; j < this.numFrets+1; j++) {
            var note = gAllNotes[(openStringNoteIndices[i]+j)%gAllNotes.length];
            var noteWidget = new TextWidget(x, y, NOTE_WIDGET_SIZE, NOTE_WIDGET_SIZE, note);
            noteWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            noteWidget.fontSize = 32;
            noteWidget.backgroundColor = "#555";
            this.noteWidgets.push(noteWidget);
            y += yAdd;
        }
        x += xAdd;
    }
}

GuitarNeckWidget.prototype.setNoteStateForAll = function(state) {
    for(var i = 0; i < this.noteWidgets.length; i++) {
            this.noteWidgets[i].backgroundColor = NOTE_STATE_COLORS[state];
            this.noteWidgets[i].fontOpacity = NOTE_STATE_FONTOPACITY[state];
    }
}


GuitarNeckWidget.prototype.setNoteStateForNotes = function(notes, state) {
    for(var i = 0; i < this.noteWidgets.length; i++) {
        var note = this.noteWidgets[i].text;
        if(notes.indexOf(note) != -1) {
            this.noteWidgets[i].backgroundColor = NOTE_STATE_COLORS[state];
            this.noteWidgets[i].fontOpacity = NOTE_STATE_FONTOPACITY[state];
        }
    }
}

GuitarNeckWidget.prototype.setNoteStateForStringAndFret = function(string, fret, state) {
    var idx = string * (this.numFrets+1) + fret;
    this.noteWidgets[idx].backgroundColor = NOTE_STATE_COLORS[state];
    this.noteWidgets[idx].fontOpacity = NOTE_STATE_FONTOPACITY[state];
}

GuitarNeckWidget.prototype.render = function(ctx, frame) {
    ctx.save();
    // draw the strings
    ctx.fillStyle = "white";
    var x = this.x;
    var xAdd = (this.width-STRING_WIDTH) / 5;

    for(var i = 0; i < 6; i++) {
        ctx.fillRect(x, this.y, STRING_WIDTH, this.height);
        x += xAdd;
    }
    // draw the frets
    var y = this.y;
    var yAdd = (this.height - FRET_WIDTH) / this.numFrets;

    for(var i = 0; i < this.numFrets+1; i++) {
        ctx.fillRect(this.x, y, this.width, FRET_WIDTH);
        y += yAdd;
    }
    // draw the note widgets
    for(var i = 0; i < this.noteWidgets.length; i++) {
        this.noteWidgets[i].render(ctx, frame);
    }
    ctx.restore();
}
