
var SPEEDUP = 3.0;

var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var CHROMATIC_NOTE_Y = 150;
var CHROMATIC_NOTE_WIDTH = 80;
var CHROMATIC_NOTE_SPACING = 20;
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

    let chromaticNoteX = 280;
    let chromaticNoteY = 200;

    var highLightIndices = [
        1,0,1,0,1,1,0,1,0,1,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0
    ]

    let redCircs = [];
    let texts = [];
    let blackCircs = [];

    for(var i = 0; i < 24; i++) {

        let highlight = false;
        
        if(highLightIndices[i] === 1) {
            var circleWidget = new TextWidget(
                chromaticNoteX, 
                chromaticNoteY, 
                CHROMATIC_NOTE_WIDTH, 
                CHROMATIC_NOTE_WIDTH, 
                ""
            );

            circleWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            circleWidget.backgroundOpacity = 1.0;


            //gContainer.addObject(circleWidget);
            redCircs.push(circleWidget);
            highlight = true;
        }

        var noteWidget = new TextWidget(
            chromaticNoteX, 
            chromaticNoteY, 
            CHROMATIC_NOTE_WIDTH, 
            CHROMATIC_NOTE_WIDTH, 
            gAllNotes[i%12]
        );

        noteWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
        
        noteWidget.backgroundOpacity = 0.0;
        noteWidget.fontOpacity = 1.0;
        noteWidget.fontSize = 40;
        //gContainer.addObject(noteWidget);
        texts.push(noteWidget);

        let dx = CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;

        noteWidget.addAnimation(makeAnimation(
            {
                "x" : makeInterpolator(chromaticNoteX, chromaticNoteX-dx),
            }
        )
        , 500, 600);

        noteWidget.addAnimation(makeAnimation(
            {
                "x" : makeInterpolator(chromaticNoteX-dx, chromaticNoteX-dx*2),
            }
        )
        , 800, 900);

        for(var j = 2; j < 7; j++) {
            noteWidget.addAnimation(makeAnimation(
                {
                    "x" : makeInterpolator(chromaticNoteX-dx*j, chromaticNoteX-dx*(j+1)),
                }
            )
            , 1100 + (j-1)*100, 1160 + (j-1)*100);
        }


        if(highLightIndices[i] === 0) {
            var circleWidget = new TextWidget(
                chromaticNoteX-16, 
                chromaticNoteY, 
                CHROMATIC_NOTE_WIDTH+32, 
                CHROMATIC_NOTE_WIDTH, 
                ""
            );

            circleWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_RECTANGLE;
            circleWidget.backgroundOpacity = 0.5;
            circleWidget.backgroundColor = 'black';

            blackCircs.push(circleWidget);
            //highlight = true;
        }

        chromaticNoteX += CHROMATIC_NOTE_WIDTH + CHROMATIC_NOTE_SPACING;
    }

    for(var i = 0; i < redCircs.length; i++) {
        gContainer.addObject(redCircs[i]);
    }
    for(var i = 0; i < texts.length; i++) {
        gContainer.addObject(texts[i]);
    }
    for(var i = 0; i < blackCircs.length; i++) {
        gContainer.addObject(blackCircs[i]);
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
