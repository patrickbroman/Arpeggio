var RECORDING = Config.recording;

var GUITAR_HEIGHT = 640;
var GUITAR_WIDTH = 0.6180*GUITAR_HEIGHT;

function init() {
    gCanvas = document.getElementById("myCanvas");
    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    if(RECORDING) {
        gEncoder = new Whammy.Video(60);
        gFrame = 0;
    }

    // Initialize all keys

    var keys = [];

    for(var i = 0; i < gAllNotes.length; i++) {
      var key = new Key(i);
      keys.push(key);
    }

    var key = keys[Config.keyIndex];

    // Populate the container

    gContainer = new Container(3);

    var guitarX = gCanvas.width / 2 - GUITAR_WIDTH / 2;
    var guitarY = gCanvas.height / 2 - GUITAR_HEIGHT / 2;

    var guitar = new GuitarNeckWidget(guitarX, guitarY, GUITAR_WIDTH, GUITAR_HEIGHT, 4);

    guitar.setNoteStateForAll(NOTE_STATE_VISIBLE);
    guitar.setNoteStateForNotes(["G", "B", "D"], NOTE_STATE_HIGHLIGHTED);

    guitar.setNoteStateForStringAndFret(2, 0, NOTE_STATE_SELECTED);
    guitar.setNoteStateForStringAndFret(3, 0, NOTE_STATE_SELECTED);
    guitar.setNoteStateForStringAndFret(1, 2, NOTE_STATE_SELECTED);
    guitar.setNoteStateForStringAndFret(0, 3, NOTE_STATE_SELECTED);
    guitar.setNoteStateForStringAndFret(5, 3, NOTE_STATE_SELECTED);

    gContainer.addObject(guitar);



    window.requestAnimationFrame(render);
    gStartTime = performance.now();

}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
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
