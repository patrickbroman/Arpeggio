
var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var QUARTER_PULSE_START = 60*4;
var EIGHTH_SHOW_START = 60*12;
var EIGHTH_PULSE_START = QUARTER_PULSE_START + 60*16;
var QUARTER_FADEOUT_START = EIGHTH_PULSE_START + 60*16;
var TRIPLET_SHOW_START = QUARTER_FADEOUT_START + 60*8;
var TRIPLET_PULSE_START = TRIPLET_SHOW_START + 60*8;

var QUARTERNOTE_WIDTH = 360;
var QUARTERNOTE_HEIGHT = 120;
var QUARTERNOTE_XSTART = 1920/2 - 2 * QUARTERNOTE_WIDTH;
var YPOS = 600; // 1080/2 - QUARTERNOTE_HEIGHT/2;

var EIGHTH_NOTE_MARGIN =20;
var EIGHT_NOTE_WIDTH = QUARTERNOTE_WIDTH / 2 - 2 * EIGHTH_NOTE_MARGIN;
var EIGHTH_NOTE_HEIGHT = QUARTERNOTE_HEIGHT - 2 * EIGHTH_NOTE_MARGIN;
var TRIPLET_NOTE_WIDTH = QUARTERNOTE_WIDTH / 3 - 2 * EIGHTH_NOTE_MARGIN;

function init() {
    gCanvas = document.getElementById("myCanvas");
    var ctx = gCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1920, 1080);

    gCanvas.addEventListener("keydown", function(evt) {
        console.log("PRESS");
        if(evt.keyCode == 83) {
            console.log("SAVE!");
            var url = gCanvas.toDataURL("image/png");
            window.open(url);

        }
    }, true);    

    gContainer = new Container(3);

    var xPos = QUARTERNOTE_XSTART;

    var quarterNoteWidgets = [];
    var beatWidgets = [];
    var eighthNoteWidgets = [];
    var tripletNoteWidgets = [];

    for(var i = 0; i < 4; i++) {
        /*
        var noteWidget = new TextWidget(xPos, YPOS, QUARTERNOTE_WIDTH, QUARTERNOTE_HEIGHT, "");
        //widgetDict[gAllNotes[i]] = noteWidget;
        if(i % 2 == 0) {
            noteWidget.backgroundColor = "rgba(60, 60, 60, 1.0)";
        } else {
            noteWidget.backgroundColor = "rgba(35, 35, 35, 1.0)";
        }
        noteWidget.fontOpacity = 1.0;
        noteWidget.fontSize = 20;

        //var appearStart = 10;
        //var appearEnd = 240;

        gContainer.addObject(noteWidget);
        quarterNoteWidgets.push(noteWidget);

        */ 

        var beatWidget = new TextWidget(xPos, YPOS - 240, QUARTERNOTE_WIDTH, QUARTERNOTE_WIDTH, "" + (i+1));

        if(i % 2 == 0) {
            beatWidget.backgroundColor = "rgba(255, 0, 0, 1.0)";
        } else {
            beatWidget.backgroundColor = "rgba(220, 0, 0, 1.0)";
        }
        beatWidget.fontOpacity = 1.0;
        beatWidget.fontSize = 70;
        beatWidget.backgroundOpacity = 0.3;

        gContainer.addObject(beatWidget);
        beatWidgets.push(beatWidget);



        var xPos2 = xPos + EIGHTH_NOTE_MARGIN;

        // eight notes
        for(var j = 0; j < 2; j++) {
            var noteWidget = new TextWidget(xPos2, YPOS + EIGHTH_NOTE_MARGIN, EIGHT_NOTE_WIDTH, EIGHTH_NOTE_HEIGHT, "");

            noteWidget.backgroundColor = "rgba(255, 255, 180, 1.0)";

            //noteWidget.backgroundColor = "rgba(255, 255, 180, 1.0)";
            noteWidget.backgroundOpacity = 0.0;

            // initial fade it

            var appearStart = EIGHTH_SHOW_START + i*40 + j*20;
            var appearEnd = appearStart + 30;

            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 0.4),
                }
            )
            , appearStart, appearEnd);

            gContainer.addObject(noteWidget);
            eighthNoteWidgets.push(noteWidget);
            xPos2 += EIGHT_NOTE_WIDTH + EIGHTH_NOTE_MARGIN * 2;
        }

        xPos2 = xPos + EIGHTH_NOTE_MARGIN; 

        // triplets
        for(var j = 0; j < 3; j++) {
            var noteWidget = new TextWidget(xPos2, YPOS + EIGHTH_NOTE_MARGIN, TRIPLET_NOTE_WIDTH, EIGHTH_NOTE_HEIGHT, "");
            noteWidget.backgroundColor = "rgba(255, 255, 180, 1.0)";
            noteWidget.backgroundOpacity = 0.0;

            // initial fade it

            var appearStart = TRIPLET_SHOW_START + i*40 + j*10;
            var appearEnd = appearStart + 10;

            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 0.4),
                }
            )
            , appearStart, appearEnd);

            gContainer.addObject(noteWidget);
            tripletNoteWidgets.push(noteWidget);
            xPos2 += TRIPLET_NOTE_WIDTH + EIGHTH_NOTE_MARGIN * 2;
        }
        xPos += QUARTERNOTE_WIDTH;
    }

    // Animate quarter-note pulse

    for(var i = 0; i < 128; i++) {
            var t1 = QUARTER_PULSE_START + 60*i - 5;
            var t2 = QUARTER_PULSE_START + 60*i + 0;
            var t3 = QUARTER_PULSE_START + 60*i + 55;
            var t4 = QUARTER_PULSE_START + 60*i + 60;

            var beatWidget = beatWidgets[i%4];
            beatWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.4, 0.8),
                }
            )
            , t1, t2);

            beatWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.8, 0.4),
                }
            )
            , t3, t4);
    }



    // Animate eight-note pulse

    for(var i = 0; i < 32; i++) {
            var t1 = EIGHTH_PULSE_START + 30*i - 2;
            var t2 = EIGHTH_PULSE_START + 30*i + 0;
            var t3 = EIGHTH_PULSE_START + 30*i + 28;
            var t4 = EIGHTH_PULSE_START + 30*i + 30;

            var noteWidget = eighthNoteWidgets[i%8];
            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.4, 0.8),
                }
            )
            , t1, t2);

            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.8, 0.4),
                }
            )
            , t3, t4);
    }

    //kill eighth-notes

    for(var i = 0; i < 8; i++) {
            var t1 = QUARTER_FADEOUT_START;
            var t2 = QUARTER_FADEOUT_START + 60;
  
            var noteWidget = eighthNoteWidgets[i%8];
            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.2, 0.0),
                }
            )
            , t1, t2);
    }

    // Animate triplet pulse pulse

    for(var i = 0; i < 24*8; i++) {
            var t1 = TRIPLET_PULSE_START + 20*i - 2;
            var t2 = TRIPLET_PULSE_START + 20*i + 0;
            var t3 = TRIPLET_PULSE_START + 20*i + 18;
            var t4 = TRIPLET_PULSE_START + 20*i + 20;

            var noteWidget = tripletNoteWidgets[i%12];
            if(i < 48 || i%3 != 1) {
                noteWidget.addAnimation(makeAnimation(
                    {
                        "backgroundOpacity" : makeInterpolator(0.2, 1.0),
                    }
                )
                , t1, t2);

                noteWidget.addAnimation(makeAnimation(
                    {
                        "backgroundOpacity" : makeInterpolator(1.0, 0.2),
                    }
                )
                , t3, t4);
            }
    }

    //kill triplets

    for(var i = 0; i < 12; i++) {
            var t1 = 160*60
            var t2 = 160*60;
  
            var noteWidget = tripletNoteWidgets[i%12];
            noteWidget.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.2, 0.0),
                }
            )
            , t1, t2);
    }

    if(RECORDING) {
        //gEncoder = new Whammy.Video(60);
        gCapturer = new CCapture({ 
            format: 'webm',
            framerate: 60,
            verbose: true,
            name: "snopp"
        });

        gFrame = 0;
        gCaptureStarted = false;
    }

    window.requestAnimationFrame(render);
    gStartTime = performance.now();
}

function render() {
    var ctx = gCanvas.getContext("2d");
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
    if(RECORDING) {
        if(gCaptureStarted == false) {
            gCaptureStarted = true;
            gCapturer.start();
        }
        frame = gFrame;
        gFrame++;
    }
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gCanvas.width, gCanvas.height);
    ctx.restore();
    gContainer.render(ctx, frame);
    if(RECORDING) {
        //gEncoder.add(ctx);
        
        console.log("added frame " + frame);
        if(frame < 60*RECORDING_SECONDS) {
            window.requestAnimationFrame(render);
            gCapturer.capture(gCanvas);
        } else {
                /*
                gEncoder.compile(false, function(output) {
                var url = (window.webkitURL || window.URL).createObjectURL(output);
                console.log("DONE RECORDING!!!");
                console.log(url);
                window.open("www.google.com"); */
                gCapturer.stop();
                gCapturer.save();

        }
    } else {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Futura";
        ctx.fillText("Time: " + parseFloat(Math.round((time/1000.0) * 100) / 100).toFixed(2), 10, 1060);
        window.requestAnimationFrame(render);
    }
}
