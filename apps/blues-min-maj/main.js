
var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var QUARTER_PULSE_START = 60*4;

var QUARTERNOTE_WIDTH = 100;

var BAR_MARGIN = 20;

var QUARTERNOTE_XSTART = 1920/2 - ((4 * 4 * QUARTERNOTE_WIDTH + 3 * BAR_MARGIN) / 2);
var YPOS = 240; // 1080/2 - QUARTERNOTE_HEIGHT/2;


var barColors = [
    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],
    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],
    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],
    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],

    ["rgba(255, 255, 0, 1.0)", "rgba(220, 220, 0, 1.0)"],
    ["rgba(255, 255, 0, 1.0)", "rgba(220, 220, 0, 1.0)"],

    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],
    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],

    ["rgba(255, 0, 0, 1.0)", "rgba(220, 0, 0, 1.0)"],

    ["rgba(255, 255, 0, 1.0)", "rgba(220, 220, 0, 1.0)"],

    ["rgba(0, 255, 0, 1.0)", "rgba(0, 220, 0, 1.0)"],

    ["rgba(255, 0, 0, 1.0)", "rgba(220, 0, 0, 1.0)"]

];




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

    var barIdx = 0;

    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 4; j++) {
            for(var k = 0; k < 4; k++) {    
                var beatWidget = new TextWidget(xPos, YPOS, QUARTERNOTE_WIDTH, QUARTERNOTE_WIDTH, "" + (k+1));

                if(k % 2 == 0) {
                    beatWidget.backgroundColor = barColors[barIdx][0];//"rgba(255, 0, 0, 1.0)";
                } else {
                    beatWidget.backgroundColor = barColors[barIdx][1];
                }

                beatWidget.fontOpacity = 1.0;
                beatWidget.fontSize = 40;
                beatWidget.backgroundOpacity = 0.3;

                gContainer.addObject(beatWidget);
                beatWidgets.push(beatWidget);

                xPos += QUARTERNOTE_WIDTH;
            }
            xPos += BAR_MARGIN;
            barIdx++;
        }
        YPOS += 200;
        xPos = QUARTERNOTE_XSTART;
    }

    // Animate quarter-note pulse

    for(var i = 0; i < 256; i++) {
            var t1 = QUARTER_PULSE_START + 40*i - 5;
            var t2 = QUARTER_PULSE_START + 40*i + 0;
            var t3 = QUARTER_PULSE_START + 40*i + 35;
            var t4 = QUARTER_PULSE_START + 40*i + 40;

            var beatWidget = beatWidgets[i%(12*4)];
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
