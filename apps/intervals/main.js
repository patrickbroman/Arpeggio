
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

var isEmpty = function(obj) {
    return Object.keys(obj).length === 0;
}


var IDS_NONE = 0;
var IDS_OPENED = 1;
var IDS_CLOSED = 2;

var intervalDisplayState = IDS_NONE;

function noteOn(index) {
    console.log("NOTE ON!");
    if(index < 0 || index > 23) {
        return;
    }
    var note = gNoteWidgets[index];
    note.backgroundOpacity = 0.8;
    depressed_keys[index] = true;

    switch(intervalDisplayState) {
        case 0:
            intervalDisplayState = 1;
            break;
        case 1:
            intervalDisplayState = 2;
            break;
        case 2:
            break;
    }

}

function noteOff(index) {
    if(index < 0 || index > 23) {
        return;
    }
    var note = gNoteWidgets[index];
    var frame = getCurrentFrame();
    note.addAnimation(makeAnimation(
        {
            "backgroundOpacity" : makeInterpolator(0.8, 0.38),
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
        if(note.isMajor && !note.isPenta && !note.isBlue) {
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
        if(!note.isMajor && !note.isPenta && !note.isBlue) {
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

function activateMajorBlue() {
    console.log("activate major blue");
    for(var i = 0; i < gNotes.length; i++) {
        var note = gNotes[i];
        if(note.isBlueMajor) {
            console.log("Found blue note 2!");
            var frame = getCurrentFrame();
            note.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , frame, frame + FADE_DURATION);
            console.log("enabling blue note # " + i);
        }
    }
}

function activateMinorBlue() {
    console.log("activate minor blue");
    for(var i = 0; i < gNotes.length; i++) {
        var note = gNotes[i];
        if(note.isBlueMinor) {
            console.log("Found blue note 2!");
            var frame = getCurrentFrame();
            note.addAnimation(makeAnimation(
                {
                    "backgroundOpacity" : makeInterpolator(0.0, 1.0),
                }
            )
            , frame, frame + FADE_DURATION);
            console.log("enabling blue note # " + i);
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


    var majorHasNote = [true, false, true, false, true, true, false, true, false, true, false, true];
    var minorHasNote = [true, false, true, true, false, true, false, true, true, false, true, false];
    var majorBlue = [false, false, false, true, false, false, false, false, false, false, false, false];
    var minorBlue = [false, false, false, false, false, false, true, false, false, false, false, false];
    var majorPenta = [true, false, true, false, true, false, false, true, false, true, false, false];
    var minorPenta = [true, false, false, true, false, true, false, true, false, false, true, false];

    gNoteWidgets = [];


    var intervals = [
        {
            quality: "perfect",
            number: "unison"
        },
        {
            quality: "minor",
            number: "second"
        },
        {
            quality: "major",
            number: "second"
        },
        {
            quality: "minor",
            number: "third"
        },
        {
            quality: "major",
            number: "third"
        },
        {
            quality: "perfect",
            number: "fourth"
        },
        {
            quality: "",
            number: "tritone"
        },
        {
            quality: "perfect",
            number: "fifth"
        },
        {
            quality: "minor",
            number: "sixth"
        },
        {
            quality: "major",
            number: "sixth"
        },
        {
            quality: "minor",
            number: "seventh"
        },
        {
            quality: "major",
            number: "seventh"
        },
        {
            quality: "perfect octave",
            number: "seventh"
        }                
    ];

    var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    var xPos = NOTE_XSTART;
    var xPosDot = DOT_XSTART;
    

    for(var i = 0; i < 13; i++) {
        var topName = intervals[i%12].quality;
        var bottomName = intervals[i%12].number;

        if(i == 12) {
            bottomName = "octave";
        }

        var intervalWidget1 = new TextWidget(xPos, YPOS, NOTE_WIDTH, 0, topName);
        intervalWidget1.backgroundColor = "rgba(0, 0, 0, 0.0)";
        intervalWidget1.fontSize = 16;
        intervalWidget1.textY = -40;

        var intervalWidget2 = new TextWidget(xPos, YPOS, NOTE_WIDTH, 0, bottomName);
        intervalWidget2.backgroundColor = "rgba(0, 0, 0, 0.0)";
        intervalWidget2.fontSize = 16;
        intervalWidget2.textY = -20;

        var noteWidget = new TextWidget(xPos, YPOS, NOTE_WIDTH, NOTE_HEIGHT, noteNames[i%12]);
        noteWidget.backgroundColor = "rgba(100, 100, 100, 1.0)";
        noteWidget.backgroundOpacity = 0.4;
        noteWidget.fontSize = 30;
        noteWidget.textY = 280;        

        gContainer.addObject(intervalWidget1);
        gContainer.addObject(intervalWidget2);
        gContainer.addObject(noteWidget);
        gNoteWidgets.push(noteWidget);
        //gNoteWidgets.push(noteWidget2);


        if(majorHasNote[i%12] || majorBlue[i%12]) {
            var majWidget = new TextWidget(xPosDot, YPOS + 100, DOT_WIDTH, DOT_WIDTH, "" );
            majWidget.backgroundColor = "rgba(0, 255, 80, 1.0)";
            majWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            majWidget.isMajor = true;
            majWidget.isPenta = majorPenta[i%12];
            majWidget.isBlue = majorBlue[i%12];
            majWidget.isBlueMajor = majWidget.isBlue;
            if(majWidget.isBlue) {
                majWidget.backgroundColor = "rgba(60, 160, 255, 1.0)";
                majWidget.backgroundOpacity = 0;
            }
            gContainer.addObject(majWidget);
            gNotes.push(majWidget);
        }

        if(minorHasNote[i%12] || minorBlue[i%12]) {
            var minWidget = new TextWidget(xPosDot, YPOS + 160, DOT_WIDTH, DOT_WIDTH, "");
            minWidget.backgroundColor = "rgba(210, 0, 120, 1.0)";
            minWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            minWidget.isMajor = false;
            minWidget.isPenta = minorPenta[i%12];
            minWidget.isBlue = minorBlue[i%12];
            minWidget.isBlueMinor = minWidget.isBlue;
            if(minWidget.isBlue) {
                minWidget.backgroundColor = "rgba(60, 160, 255, 1.0)";
                minWidget.backgroundOpacity = 0;
            }            
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

        if(code == 73) {
            intervalDisplayState = 0;
        }

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
        } else if(code == 83) {
            activateMajorBlue();
        } else if(code == 88) {
            activateMinorBlue();
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
        var note = midiMessage.data[1] - 60;

        if(command == 144) {
            console.log("note on! " + note);
            noteOn((note));
        } else if(command == 128) {
            console.log("note off! " + note);
            noteOff((note));
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
