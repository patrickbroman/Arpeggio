
var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var CHROMATIC_NOTE_Y = 350;
var CHROMATIC_NOTE_WIDTH = 120;
var CHROMATIC_NOTE_SPACING = 20;
var CHROMATIC_NOTE_FONTSIZE = 60;

var NOTE_APPEAR_START = 60;
var NOTE_APPEAR_DELAY = 50;
var NOTE_APPEAR_DURATION = NOTE_APPEAR_DELAY / 2;

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

    var key = keys[Config.keyIndex];

    // Populate the container

    gContainer = new Container(3);

    var chromaticTotalWidth = CHROMATIC_NOTE_WIDTH * 12 + CHROMATIC_NOTE_SPACING * 11;
    var chromaticNoteX = gCanvas.width/2 - chromaticTotalWidth/2;
    var chromaticNoteY = CHROMATIC_NOTE_Y;

    var widgetDict = {};

    // now calculate the positions of the chormatic notes, adding animations

    var f = String.fromCharCode(9837);

    var flats = ["D"+f, "E"+f, "G"+f, "A"+f, "B"+f];

    var flatIndex = 0;

    for(var i = 0; i < gAllNotes.length; i++) {
        var noteWidget = new TextWidget(chromaticNoteX, chromaticNoteY, CHROMATIC_NOTE_WIDTH, CHROMATIC_NOTE_WIDTH, gAllNotes[i]);
        widgetDict[gAllNotes[i]] = noteWidget;
        noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        noteWidget.fontOpacity = 1.0;
        noteWidget.fontSize = CHROMATIC_NOTE_FONTSIZE;

        var appearStart = 60
        var appearEnd = 240;

        if(gAllNotes[i].indexOf("#") != -1) {
            noteWidget.addAnimation(makeAnimation(
                {
                    "y" : makeInterpolator(CHROMATIC_NOTE_Y, CHROMATIC_NOTE_Y - 40),
                }
            )
            , appearStart, appearEnd);

            var noteWidget2 = new TextWidget(chromaticNoteX, chromaticNoteY + 40, CHROMATIC_NOTE_WIDTH, CHROMATIC_NOTE_WIDTH, flats[flatIndex++]);
            widgetDict[gAllNotes[i]] = noteWidget2;
            noteWidget2.backgroundColor = "rgba(0, 0, 0, 0.0)";
            noteWidget2.fontOpacity = 0.0;
            noteWidget2.fontSize = CHROMATIC_NOTE_FONTSIZE;

            noteWidget2.addAnimation(makeAnimation(
                {
                    "fontOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , appearStart, appearEnd);


            gContainer.addObject(noteWidget2);

            var appearStart = 60
            var appearEnd = 240;

        } else {
            noteWidget.fontOpacity = 0.3;
        }

        /*
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
            , KILL_CHROMATIC_START_TIME, KILL_CHROMATIC_END_TIME);

        }*/
        gContainer.addObject(noteWidget);
        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
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
            console.log()
            window.open(url);
        }
    } else {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Futura";
        ctx.fillText("Time: " + parseFloat(Math.round((time/1000.0) * 100) / 100).toFixed(2), 10, 1060);
        window.requestAnimationFrame(render);
    }
}
