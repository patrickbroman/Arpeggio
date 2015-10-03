
var CHROMATIC_NOTE_Y = 50;
var CHROMATIC_NOTE_WIDTH = 80;
var CHROMATIC_NOTE_SPACING = 10;

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

    var key = keys[0];

    // Populate the container

    gContainer = new Container(3);

    var totalWidth = CHROMATIC_NOTE_WIDTH * 12 + CHROMATIC_NOTE_SPACING * 11;
    var chromaticNoteX = gCanvas.width/2 - totalWidth/2;
    var chromaticNoteY = CHROMATIC_NOTE_Y;

    for(var i = 0; i < gAllNotes.length; i++) {
        var noteWidget = new TextWidget(chromaticNoteX, chromaticNoteY, CHROMATIC_NOTE_WIDTH, CHROMATIC_NOTE_WIDTH, gAllNotes[i]);
        gContainer.addObject(noteWidget);
        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
    }

    window.requestAnimationFrame(render);
    gStartTime = performance.now();
}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
    gContainer.render(ctx, frame);
    window.requestAnimationFrame(render);
}
