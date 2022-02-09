
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

var TABLE_YPOS = 200;
var TABLE_ROW_HEIGHT = 60;

var YPOS = 380;
var BRACKET_POS = YPOS - 40;
var BRACKET_HIDDEN_POS = 800;


var CTL_RANDOM = 0;
var CTL_RELATIVE = 1;
var CTL_CHORD = 2;

var FADE_DURATION = 60.0;

var NOTE_FADE = 5;

var DOT_FADE = 80;

intervals = [
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
        number: ""
    }                
];

var isEmpty = function(obj) {
    return Object.keys(obj).length === 0;
}

var IDS_NONE = 0;
var IDS_OPENED = 1;
var IDS_CLOSED = 2;

var RDS_NONE = 0;
var RDS_REFERENCE_CHOSEN = 1;

var firstIntervalNote = null;
var firstIntervalIndex = -1;

var intervalDisplayState = IDS_NONE;

class ChordIntervalController {
    constructor(bw0, bw1, bw2) {
        this.firstThirdBracket = bw0;
        this.secondThirdBracket = bw1;
        this.fifthBracket = bw2;
    }
}

class RelativeIntervalController {
    constructor(bracketWidget) {
        this.bracketWidget = bracketWidget;
        this.firstIntervalNote = null;
        this.firstIntervalIndex = -1;
        this.intervalDisplayState = RDS_NONE;
    }
    noteOn(note, index) {
        switch(this.intervalDisplayState) {
            case RDS_NONE:
                console.log("case RDS_NONE");
                this.intervalDisplayState = RDS_REFERENCE_CHOSEN;
                this.firstIntervalNote = note;
                this.firstIntervalIndex = index;
                break;
            case RDS_REFERENCE_CHOSEN:
                console.log("case RDS_REFERENCE_CHOSEN");
                //this.intervalDisplayState = IDS_CLOSED;
                var intv = intervals[index - this.firstIntervalIndex];
                this.bracketWidget.text = intv.quality + " " + intv.number;
                this.bracketWidget.x = this.firstIntervalNote.x + NOTE_WIDTH / 2;
                this.bracketWidget.width = note.x - this.firstIntervalNote.x;
                this.bracketWidget.y = BRACKET_POS;

                //this.firstIntervalNote = null;
                //this.firstIntervalIndex = -1;
                break;
        }
    }

    resetIntervalState(note, index) {
        this.firstIntervalNote = note;
        this.firstIntervalIndex = index;
        this.intervalDisplayState = IDS_OPENED;
    //bracketWidget.y = BRACKET_HIDDEN_POS;   
    }
}


class RandomIntervalController {
    constructor(bracketWidget) {
        this.bracketWidget = bracketWidget;
        this.firstIntervalNote = null;
        this.firstIntervalIndex = -1;
        this.intervalDisplayState = IDS_NONE;
    }
    noteOn(note, index) {

        console.log("IC note on");

        switch(this.intervalDisplayState) {
            case IDS_NONE:
                console.log("case IDS_NONE");
                this.intervalDisplayState = IDS_OPENED;
                this.firstIntervalNote = note;
                this.firstIntervalIndex = index;
                break;
            case IDS_OPENED:
                console.log("case IDS_OPENED");
                this.intervalDisplayState = IDS_CLOSED;
                var intv = intervals[index - this.firstIntervalIndex];
                this.bracketWidget.text = intv.quality + " " + intv.number;
                this.bracketWidget.x = this.firstIntervalNote.x + NOTE_WIDTH / 2;
                this.bracketWidget.width = note.x - this.firstIntervalNote.x;
                this.bracketWidget.y = BRACKET_POS;

                this.firstIntervalNote = null;
                this.firstIntervalIndex = -1;
                break;
            case IDS_CLOSED:
                console.log("case IDS_CLOSED");
                this.resetIntervalState(note, index);
                break; 
        }
    }

    resetIntervalState(note, index) {
        this.firstIntervalNote = note;
        this.firstIntervalIndex = index;
        this.intervalDisplayState = IDS_OPENED;
    //bracketWidget.y = BRACKET_HIDDEN_POS;   
    }
}



function noteOn(index) {
    console.log("NOTE ON!");
    if(index < 0 || index > 23) {
        return;
    }
    var note = gNoteWidgets[index];
    note.backgroundOpacity = 0.9;

    if(!controllerBypass) {
        intervalController.noteOn(note, index);
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
            "backgroundOpacity" : makeInterpolator(0.9, 0.4),
        }
    )
    , frame, frame + NOTE_FADE);
    //note.backgroundOpacity = 0.4;
}

function getCurrentFrame() {
    var time = performance.now() - gStartTime;
    var frame = Math.floor(time*60.0/1000.0);
    return frame;    
}

var MAJOR_WIDGETS_VISIBLE = false;
var MINOR_WIDGETS_VISIBLE = false;

function showMajorWidgets() {
    MAJOR_WIDGETS_VISIBLE = true;

    for(var i = 0; i < gMajorWidgets.length; i++) {
        var mw = gMajorWidgets[i];
        var frame = getCurrentFrame();

        mw.clearAnimations();
        
        mw.addAnimation(makeAnimation(
            {
                "backgroundOpacity" : makeInterpolator(0.0, 1.0),
            }
        )
        , frame, frame + DOT_FADE);
    }
}

function hideMajorWidgets() {
    MAJOR_WIDGETS_VISIBLE = false;

    for(var i = 0; i < gMajorWidgets.length; i++) {
        var mw = gMajorWidgets[i];
        var frame = getCurrentFrame();

        mw.clearAnimations();
        
        mw.addAnimation(makeAnimation(
            {
                "backgroundOpacity" : makeInterpolator(1.0, 0.0),
            }
        )
        , frame, frame + DOT_FADE);
    }
}

function showMinorWidgets() {
    MINOR_WIDGETS_VISIBLE = true;

    for(var i = 0; i < gMinorWidgets.length; i++) {
        var mw = gMinorWidgets[i];
        var frame = getCurrentFrame();
        
        mw.clearAnimations();

        mw.addAnimation(makeAnimation(
            {
                "backgroundOpacity" : makeInterpolator(0.0, 1.0),
            }
        )
        , frame, frame + DOT_FADE);
    }
}

function hideMinorWidgets() {
    MINOR_WIDGETS_VISIBLE = false;

    for(var i = 0; i < gMinorWidgets.length; i++) {
        var mw = gMinorWidgets[i];
        var frame = getCurrentFrame();
        
        mw.clearAnimations();

        mw.addAnimation(makeAnimation(
            {
                "backgroundOpacity" : makeInterpolator(1.0, 0.0),
            }
        )
        , frame, frame + DOT_FADE);
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

    gNoteWidgets = [];
    gMajorWidgets = [];
    gMinorWidgets = [];

    var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    var xPos = NOTE_XSTART;
    var xPosDot = DOT_XSTART;

    // initialize bracket widgets

    bracketWidget = new BracketWidget(40, BRACKET_HIDDEN_POS, 850, 0, "boop");
    bracketWidget1 = new BracketWidget(40, BRACKET_HIDDEN_POS, 850, 0, "coop");
    bracketWidget2 = new BracketWidget(40, BRACKET_HIDDEN_POS, 850, 0, "doop");

    gContainer.addObject(bracketWidget);
    gContainer.addObject(bracketWidget1);
    gContainer.addObject(bracketWidget2);

    controllerMode = CTL_RANDOM;
    controllerBypass = false;
    intervalController = new RandomIntervalController(bracketWidget);

    // create table

    var tx = 1300;

    for(var i = 0; i < 13; i++) {
        var text = intervals[i].quality + " " + intervals[i].number;
        var ivWidget = new TextWidget(tx, TABLE_YPOS + i * TABLE_ROW_HEIGHT, NOTE_WIDTH, NOTE_WIDTH, text);
        ivWidget.backgroundOpacity = 0.0;
        ivWidget.fontSize = 32;
        gContainer.addObject(ivWidget);
    }

    // create virtual "keyboard"

    var degreeShortNames = ["P1", "m2", "M2", "m3", "M3", "P4", "tt", "P5", "m6", "M6", "m7", "M7", "PO"];

    for(var i = 0; i < 13; i++) {
        var topName = intervals[i%12].quality;
        var bottomName = intervals[i%12].number;

        if(i == 12) {
            bottomName = "octave";
        }

        var noteWidget = new TextWidget(xPos, YPOS, NOTE_WIDTH, NOTE_HEIGHT, noteNames[i%12]);
        noteWidget.backgroundColor = "rgba(100, 100, 100, 1.0)";
        noteWidget.backgroundOpacity = 0.4;
        noteWidget.fontSize = 30;
        noteWidget.textY = 280;        

        gContainer.addObject(noteWidget);
        gNoteWidgets.push(noteWidget);

        if(majorHasNote[i%12]) {
            var majWidget = new TextWidget(xPosDot, YPOS + 100, DOT_WIDTH, DOT_WIDTH, degreeShortNames[i] );
            majWidget.fontSize = 20;
            majWidget.r = 0;
            majWidget.g = 102;
            majWidget.b = 32;
            majWidget.backgroundColor = "rgba(0, 255, 80, 1.0)";
            majWidget.backgroundOpacity = 0.0;
            majWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            majWidget.isMajor = true;
            gContainer.addObject(majWidget);
            gNotes.push(majWidget);
            gMajorWidgets.push(majWidget);
        }
        deg = 0;
        if(minorHasNote[i%12]) {
            var minWidget = new TextWidget(xPosDot, YPOS + 160, DOT_WIDTH, DOT_WIDTH, degreeShortNames[i]);
            minWidget.fontSize = 20;
            minWidget.r = 102;
            minWidget.g = 0;
            minWidget.b = 58;
            minWidget.backgroundColor = "rgba(210, 0, 120, 1.0)";
            minWidget.backgroundOpacity = 0.0;
            minWidget.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_CIRCLE;
            minWidget.isMajor = false;
            gContainer.addObject(minWidget);
            gNotes.push(minWidget);
            gMinorWidgets.push(minWidget);
        } 

        xPos += NOTE_WIDTH + NOTE_MARGIN;
        xPosDot += DOT_WIDTH + DOT_MARGIN;
    }

    window.addEventListener("keydown", function(evt) {
        var code = evt.keyCode;
        console.log(code);

        if(code == 66) { // "b"
            controllerBypass = !controllerBypass;
        }
        else if(code == 49) { // "1"
            if(!MAJOR_WIDGETS_VISIBLE) {
                showMajorWidgets();
            } else {
                hideMajorWidgets();
            }
        }
        else if(code == 50) { // "2"
            if(!MINOR_WIDGETS_VISIBLE) {
                showMinorWidgets();
            } else {
                hideMinorWidgets();
            }
        } 
        else if(code === 51) {
            bracketWidget.text = "boo";
            bracketWidget.x = 0;//this.firstIntervalNote.x + NOTE_WIDTH / 2;
            bracketWidget.width = 0;//note.x - this.firstIntervalNote.x;
            bracketWidget.y = 2000;
        } 
        else if(code == 73) { // "i"
            //intervalDisplayState = 0;
            //resetIntervalState();
            console.log("SHOULD FLIP!!!");
            if(controllerMode == CTL_RANDOM) {
                console.log("FLIP TO RELATIVE");
                controllerMode = CTL_RELATIVE;
                intervalController = new RelativeIntervalController(bracketWidget);
            } else {
                console.log("FLIP TO RANDOM");
                controllerMode = CTL_RANDOM;
                intervalController = new RandomIntervalController(bracketWidget);
            }
        } else if(code === 67) { // "c"
            controllerMode = CTL_CHORD;
            intervalController = new ChordIntervalController(bracketWidget, bracketWidget1, bracketWidget2);
        } 
    }, false);

    window.addEventListener("keyup", function(evt) {
        var code = evt.keyCode;
        console.log(code);
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

        ctx.fillStyle = "red";
        ctx.font = "30px Futura";
        var text = "foo";
        var text = "";
        if(controllerMode == CTL_RANDOM) {
            text = "random";
        } else {
            text = "relative";
        }
        ctx.fillText(text, 10, 30);
        ctx.fillStyle = "yellow";
        ctx.fillText("controllerBypass: " + controllerBypass, 10, 60);

        window.requestAnimationFrame(render);
    }
}
