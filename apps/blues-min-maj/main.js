
var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

var QUARTER_PULSE_START = 60*4;

var NOTE_WIDTH = 60;
var NOTE_HEIGHT = 250;

var NOTE_MARGIN = 10;

var DOT_WIDTH = 40;
var DOT_MARGIN = 30;

var NOTE_XSTART = 1920/2 - ((24 * NOTE_WIDTH + 23 * NOTE_MARGIN) / 2);
var DOT_XSTART = 1920/2 - ((24 * DOT_WIDTH + 23 * DOT_MARGIN) / 2);

//var LINE_HEIGHT = 80;
var YPOS = 240; // 1080/2 - QUARTERNOTE_HEIGHT/2;

var FADE_DURATION = 60.0;

var NOTE_FADE = 3;


var noteFrequencies = [
    130.81,
    138.59,
    146.83,
    155.56,
    164.81,
    174.61,
    185,
    196,
    207.65,
    220,
    233.08,
    246.94,
    261.63,
    277.18,
    293.66,
    311.13,
    329.63,
    349.23,
    369.99,
    392.00,
    415.30,
    440.00,
    466.16,
    493.88
];

depressed_keys = {};
oscOn = false;

var isEmpty = function(obj) {
    return Object.keys(obj).length === 0;
}

function noteOn(index) {
    if(!oscOn) {
        vco.start(0);
        context.resume();

        oscOn = true;
    }
    console.log("NOTE ON!");
    if(index < 0 || index > 23) {
        return;
    }
    var note = gNoteWidgets[index];
    note.backgroundOpacity = 1.0;
    vco.frequency.value = noteFrequencies[index];
    vca.gain.value = 1;
    depressed_keys[index] = true;

}

function noteOff(index) {
    if(index < 0 || index > 23) {
        return;
    }
    var note = gNoteWidgets[index];
    var frame = getCurrentFrame();
    note.addAnimation(makeAnimation(
        {
            "backgroundOpacity" : makeInterpolator(1.0, 0.4),
        }
    )
    , frame, frame + NOTE_FADE);

    delete depressed_keys[index];
    if (isEmpty(depressed_keys)) {
        vco.frequency.value = 0;
        vca.gain.value = 0;
    }
}

function getCurrentFrame() {
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
    return frame;    
}

function killMajorNonPenta() { 
    for(var i = 0; i < gNotes.length; i++) {
        var note = gNotes[i];
        if(note.isMajor && !note.isPenta) {
            var frame = getCurrentFrame();
            note.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(1.0, 0.0),
                }
            )
            , frame, frame + FADE_DURATION);
            console.log("killing note # " + i);
        }
    }
}

function killMinorNonPenta() { 
    console.log("trying to kill minor non-penta");
    for(var i = 0; i < gNotes.length; i++) {
        var note = gNotes[i];
        if(!note.isMajor && !note.isPenta) {
            var frame = getCurrentFrame();
            note.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(1.0, 0.0),
                }
            )
            , frame, frame + FADE_DURATION);
            console.log("killing note # " + i);
        }
    }
}


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
    gNotes = [];

    var xPos = NOTE_XSTART;
    var xPosDot = DOT_XSTART;

    var majorHasNote = [true, false, true, false, true, true, false, true, false, true, false, true];
    var minorHasNote = [true, false, true, true, false, true, false, true, true, false, true, false];
    var majorBlue = [false, false, false, true, false, false, false, false, false, false, false, false];
    var minorBlue = [false, false, false, false, false, false, true, false, false, false, false, false];
    var majorPenta = [true, false, true, false, true, false, false, true, false, true, false, false];
    var minorPenta = [true, false, false, true, false, true, false, true, false, false, true, false];

    gNoteWidgets = [];

    for(var i = 0; i < 24; i++) {
        var noteWidget = new TextWidget(xPos, YPOS, NOTE_WIDTH, NOTE_HEIGHT, "" + ((i%12)+1));
        noteWidget.backgroundColor = "rgba(100, 100, 100, 1.0)";
        noteWidget.backgroundOpacity = 0.4;
        noteWidget.textY = 50;
        gContainer.addObject(noteWidget);
        gNoteWidgets.push(noteWidget);

        if(majorHasNote[i%12]) {
            var majWidget = new TextWidget(xPosDot, YPOS + 100, DOT_WIDTH, DOT_WIDTH, "" );
            majWidget.backgroundColor = "rgba(0, 255, 100, 1.0)";
            majWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            majWidget.isMajor = true;
            majWidget.isPenta = majorPenta[i%12];
            majWidget.isBlue = majorBlue[i%12];
            gContainer.addObject(majWidget);
            gNotes.push(majWidget);
        }

        if(minorHasNote[i%12]) {
            var minWidget = new TextWidget(xPosDot, YPOS + 160, DOT_WIDTH, DOT_WIDTH, "");
            minWidget.backgroundColor = "rgba(255, 0, 100, 1.0)";
            minWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            minWidget.isMajor = false;
            minWidget.isPenta = minorPenta[i%12];
            minWidget.isBlue = minorBlue[i%12];
            gContainer.addObject(minWidget);
            gNotes.push(minWidget);
        }

        xPos += NOTE_WIDTH + NOTE_MARGIN;
        xPosDot += DOT_WIDTH + DOT_MARGIN;
    }

    gNoteKeyCodes = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 187];

    window.addEventListener("keydown", function(evt) {
        var code = evt.keyCode;
        console.log(code);

        if(code == 219) {
            //context.resume();
            //vco.frequency.value = 440;
            //vca.gain.value = 0;
            vca.gain.value = 0;
        }


        if(code == 65) {
            killMajorNonPenta();
        } else if(code == 90) {
            killMinorNonPenta();
        }
        var idx = gNoteKeyCodes.indexOf(code);
        if(idx != -1) {
            noteOn(idx);
        }
    }, false);

    window.addEventListener("keyup", function(evt) {
        var code = evt.keyCode;
        console.log(code);

        var idx = gNoteKeyCodes.indexOf(code);
        if(idx != -1) {
            noteOff(idx);
        }
    }, false);

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

    // setup synth

    context = new AudioContext;
    vco = context.createOscillator();
    vco.type = 'sawtooth';
    vco.frequency.value = 200;

    vco.connect(context.destination);
    //vco.start(0);

    vca = context.createGain();
    vca.gain.value = 0;

    vco.connect(vca);
    vca.connect(context.destination);

    // setup midi

    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);

    function onMIDISuccess(midiAccess) {
        console.log(midiAccess);

        var inputs = midiAccess.inputs;
        var outputs = midiAccess.outputs;

    for (var input of midiAccess.inputs.values())  {
            input.onmidimessage = getMIDIMessage;
        }        
    }

    function getMIDIMessage(midiMessage) {
        //console.log(midiMessage);
        var command = midiMessage.data[0];
        var note = midiMessage.data[1];

        if(command == 144) {
            console.log("note on! " + note);
            noteOn((note - 48));
        } else if(command == 128) {
            console.log("note off! " + note);
            noteOff((note - 48));
        }

    }

    function onMIDIFailure() {
        console.log('Could not access your MIDI devices.');
    }    


    // start visualization

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
        console.log("added frame " + frame);
        if(frame < 60*RECORDING_SECONDS) {
            window.requestAnimationFrame(render);
            gCapturer.capture(gCanvas);
        } else {
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
