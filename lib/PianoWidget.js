var WHITE_KEY_SPACING = 4;
var BLACK_KEY_WIDTH_SCALE = 0.6;
var BLACK_KEY_HEIGHT_SCALE = 0.6;

var KEY_TYPE_WHITE = 0;
var KEY_TYPE_BLACK = 1;

var KEY_STATE_NORMAL = 0;
var KEY_STATE_HIGHLIGHTED = 1;
var KEY_STATE_SELECTED = 2;

var WHITE_KEY_COLORS = ["#AB9D89", "#E0CEB4", "#E07660"];
var BLACK_KEY_COLORS = ["#000", "#4D463D", "#703B30"];

function PianoWidget(x, y, width, height, numNotes) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.numNotes = numNotes;
    this.widgets = [];

    var whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var blackKeysPerWhite = [1, 1, 0, 1, 1, 1, 0];
    var blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
    var blackSkips = [1, 2, 1, 1, 2];

    // create the white keys

    var whiteKeyWidth = Math.floor((this.width - (WHITE_KEY_SPACING*numNotes-1))/numNotes);
    var blackKeyWidth = Math.floor(BLACK_KEY_WIDTH_SCALE * whiteKeyWidth);
    var blackKeyHeight = Math.floor(BLACK_KEY_HEIGHT_SCALE * this.height);

    var x = this.x;
    var y = this.y;

    var numBlackNotes = 0;

    for(var i = 0; i < this.numNotes; i++) {
        // the key
        var w = new TextWidget(x, y, whiteKeyWidth, this.height, "");
        w.backgroundColor = "#a98";
        w.keyType = KEY_TYPE_WHITE;
        this.widgets.push(w);
        numBlackNotes += blackKeysPerWhite[i % blackKeysPerWhite.length];
        // the note label
        var l = new TextWidget(x, y + this.height, whiteKeyWidth, whiteKeyWidth, whiteNotes[i%whiteNotes.length]);
        l.backgroundColor = 'black';
        this.widgets.push(l);
        // Make sure the key widget knows about its corresponding label
        w.textLabel = l;
        this.setNoteStateForWidget(w, KEY_STATE_NORMAL);
        x += whiteKeyWidth + WHITE_KEY_SPACING;
    }

    // create the black keys

    var x = this.x + whiteKeyWidth - blackKeyWidth/2;

    for(var i = 0; i < numBlackNotes; i++) {
        var w = new TextWidget(x, y, blackKeyWidth, blackKeyHeight, "");
        w.backgroundColor = "black";
        w.keyType = KEY_TYPE_BLACK;
        this.widgets.push(w);
        var l = new TextWidget(x, y - whiteKeyWidth*0.85, blackKeyWidth, blackKeyWidth, blackNotes[i%blackNotes.length]);
        l.backgroundColor = 'black';
        this.widgets.push(l);
        // Make sure the key widget knows about its corresponding label
        w.textLabel = l;
        this.setNoteStateForWidget(w, KEY_STATE_NORMAL);

        x += (whiteKeyWidth+WHITE_KEY_SPACING) * blackSkips[i%blackSkips.length];
    }
}

PianoWidget.prototype.setNoteStateForWidget = function(widget, state) {
    if(widget.keyType == KEY_TYPE_WHITE) {
        widget.backgroundColor = WHITE_KEY_COLORS[state];
    } else {
        widget.backgroundColor = BLACK_KEY_COLORS[state];
    }
    widget.keyState = state;
}

PianoWidget.prototype.contains = function(x, y) {
    return true; // FIXME
}

PianoWidget.prototype.render = function(ctx, frame) {
    ctx.save();
    // draw all the widgets
    for(var i = 0; i < this.widgets.length; i++) {
        this.widgets[i].render(ctx, frame);
    }
    ctx.restore();
}

PianoWidget.prototype.mouseDown = function(x, y) {
    var blackKey = null;
    var whiteKey = null;
    for(var i = 0; i < this.widgets.length; i++) {
        var w = this.widgets[i];
        if(w.contains(x, y)) {
            if(w.keyType == KEY_TYPE_WHITE) {
                whiteKey = w;
            } else if(w.keyType == KEY_TYPE_BLACK) {
                blackKey = w;
            }
        }
    }
    if(blackKey) {
        blackKey.mouseDown(x, y);
        this.setNoteStateForWidget(blackKey, blackKey.keyState+1);
    } else if(whiteKey) {
        whiteKey.mouseDown(x, y);
        this.setNoteStateForWidget(whiteKey, whiteKey.keyState+1);
    }

}
