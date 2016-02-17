var SPEEDUP = 1.0;

var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

// Layout constants, chord table

var CHORD_TABLE_X_START = 1060;
var CHORD_TABLE_WIDTH = 620;
var CHORD_WIDGET_WIDTH = 70;
var CHORD_TABLE_Y_START = 50;
var CHORD_TABLE_Y_SPACING = 74;

var NUMERAL_Y_SPACING = 86;

var CHORD_NUMERAL_FONTSIZE = 50;
var CHORD_FONTSIZE = 30;

// Layout constants, chord sequence

// ---- start values
var CHORD_SEQUENCE_1_Y_START = 400;
var CHORD_SEQUENCE_1_CENTER_X = 1920/2;
var CHORD_SEQUENCE_1_WIDTH = 1200;
var CHORD_SEQUENCE_1_WIDGET_WIDTH = 100;
var CHORD_SEQUENCE_1_FONTSIZE = 120;

// ---- end values
var CHORD_SEQUENCE_2_Y_START = 400;
var CHORD_SEQUENCE_2_CENTER_X = 550;
var CHORD_SEQUENCE_2_WIDTH = 600;
var CHORD_SEQUENCE_2_WIDGET_WIDTH = 100;
var CHORD_SEQUENCE_2_FONTSIZE = 60;
 
// Animation constants, sequence

var SEQ_APPEAR_TIME = 0.0;

var SEQ_FADE_IN_START = (SEQ_APPEAR_TIME+1.5)*60;
var SEQ_FADE_IN_END = (SEQ_APPEAR_TIME+2)*60;

var SEQ_ANIM_START = (SEQ_APPEAR_TIME + 3)*60;
var SEQ_ANIM_END = (SEQ_APPEAR_TIME + 4 )*60;

// Animation constants, chord table
var DIMMED_OPACITY = 0.3;

var SCROLL_IN_DISTANCE = 400;
var SCROLL_IN_START = 1*60;
var X_SCROLL_MUL = 0.0006;

var TABLE_APPEAR_TIME = 2;

var SCROLL_IN_END = (TABLE_APPEAR_TIME+2)*60;
var FADE_IN_START = (TABLE_APPEAR_TIME+1.5)*60;
var FADE_IN_END = (TABLE_APPEAR_TIME+2)*60;

var DIM_START = (TABLE_APPEAR_TIME+3)*60;
var DIM_END = (TABLE_APPEAR_TIME+4)*60;
var HIGHLIGHT_START = (TABLE_APPEAR_TIME+5)*60;
var HIGHLIGHT_END = (TABLE_APPEAR_TIME+6)*60;


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
    
    var srcKey = keys[Config.srcKeyIndex];
    var destKey = keys[Config.destKeyIndex];

    // Populate the container

    gContainer = new Container(3);

    // Make widgets for the numerals
    
    var chordNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii"];
    
    var chordWidgetSpacing = (CHORD_TABLE_WIDTH - CHORD_WIDGET_WIDTH*7)/6;
    var chordTableXStart = CHORD_TABLE_X_START + CHORD_WIDGET_WIDTH/2;
    var chordTableXInc   = CHORD_WIDGET_WIDTH + chordWidgetSpacing; 

    var fadeInAnim = makeAnimation(
        {
            "fontOpacity" : makeInterpolator(0, 1)
        }
    );
    
    for(var i = 0; i < 7; i++) {
        var x = chordTableXStart + chordTableXInc*i;
        // Widget for chord numeral
        var numeralWidget = new TextWidget(x, CHORD_TABLE_Y_START, CHORD_WIDGET_WIDTH, CHORD_WIDGET_WIDTH, chordNumerals[i]);
        numeralWidget.g = 0;
        numeralWidget.b = 0;
        numeralWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        numeralWidget.fontOpacity = 0.0;
        numeralWidget.fontSize = CHORD_NUMERAL_FONTSIZE;
        // Animate initial fade in
        numeralWidget.addAnimation(fadeInAnim, FADE_IN_START, FADE_IN_END);
        // Animate initial scroll in
        numeralWidget.addAnimation(makeAnimation({"x" : makeInterpolator(x*x*X_SCROLL_MUL + SCROLL_IN_DISTANCE, x)}), SCROLL_IN_START, SCROLL_IN_END);
        
        
        gContainer.addObject(numeralWidget);
    }
        
    // Chord sequence
    
    var chordSeq = Config.chordSequence;
        
    var chordSequence1Spacing = (CHORD_SEQUENCE_1_WIDTH - CHORD_SEQUENCE_1_WIDGET_WIDTH*chordSeq.length)/(chordSeq.length-1);
    var chordSequence1XStart = CHORD_SEQUENCE_1_CENTER_X - CHORD_SEQUENCE_1_WIDTH/2;
    var chordSequence1XInc   = CHORD_SEQUENCE_1_WIDGET_WIDTH + chordSequence1Spacing; 

    var chordSequence2Spacing = (CHORD_SEQUENCE_2_WIDTH - CHORD_SEQUENCE_2_WIDGET_WIDTH*chordSeq.length)/(chordSeq.length-1);
    var chordSequence2XStart = CHORD_SEQUENCE_2_CENTER_X - CHORD_SEQUENCE_2_WIDTH/2;
    var chordSequence2XInc   = CHORD_SEQUENCE_2_WIDGET_WIDTH + chordSequence2Spacing; 
    
    for(var i = 0; i < chordSeq.length; i++) {
        var x1 = chordSequence1XStart + chordSequence1XInc*i;
        var x2 = chordSequence2XStart + chordSequence2XInc*i;
        // Widget for chord numeral
        var sequenceWidget = new TextWidget(x1, CHORD_SEQUENCE_1_Y_START, CHORD_SEQUENCE_1_WIDGET_WIDTH, CHORD_SEQUENCE_1_WIDGET_WIDTH, chordSeq[i]);
        sequenceWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
        sequenceWidget.fontOpacity = 0.0;
        sequenceWidget.fontSize = CHORD_SEQUENCE_1_FONTSIZE;
        
        sequenceWidget.addAnimation(fadeInAnim, SEQ_FADE_IN_START, SEQ_FADE_IN_END);
        sequenceWidget.addAnimation(
            makeAnimation({
                "x" : makeInterpolator(x1, x2),
                "fontSize" : makeInterpolator(CHORD_SEQUENCE_1_FONTSIZE, CHORD_SEQUENCE_2_FONTSIZE),
            }), 
            SEQ_ANIM_START, 
            SEQ_ANIM_END
        );
        
        gContainer.addObject(sequenceWidget);
        
    }
      
    // for each key
    
    for(var i = 0; i < 12; i++) {
        // Check if this key contains all the chords in thye sequence
        var hasAllSequenceChords = true;
        for(var j = 0; j < chordSeq.length; j++) {
            if(!keys[i].hasTriad(chordSeq[j])) {
                hasAllSequenceChords = false;
                break;
            }
        }
        
        // for each chord
        for(var j = 0; j < 7; j++) {
            var x = chordTableXStart + chordTableXInc*j;
            var y = CHORD_TABLE_Y_START + CHORD_TABLE_Y_SPACING*(i)+NUMERAL_Y_SPACING;
            // Widget for chord numeral
            var chordName = keys[i].chords[j].triadName;
            var noteWidget = new TextWidget(x, y, CHORD_WIDGET_WIDTH, CHORD_WIDGET_WIDTH, chordName);
            //noteWidget.g = 0;
            //noteWidget.b = 0;
            noteWidget.backgroundColor = "red";
            noteWidget.fontOpacity = 0.0;
            noteWidget.backgroundOpacity = 0.0;
            noteWidget.fontSize = CHORD_FONTSIZE;
            // Animate initial fade in
            noteWidget.addAnimation(fadeInAnim, FADE_IN_START, FADE_IN_END);
            // Animate initial scroll in
            noteWidget.addAnimation(makeAnimation({"x" : makeInterpolator(x*x*X_SCROLL_MUL + SCROLL_IN_DISTANCE, x)}), SCROLL_IN_START, SCROLL_IN_END);
            // Animate dimming of chords not in the sequence
            if(chordSeq.indexOf(chordName) == -1) {
                noteWidget.addAnimation(
                    makeAnimation({
                        "fontOpacity" : makeInterpolator(1.0, DIMMED_OPACITY)
                    }), 
                    DIM_START, 
                    DIM_END
                );
            } else {
                if(hasAllSequenceChords) {
                    noteWidget.addAnimation(
                        makeAnimation({
                            "backgroundOpacity" : makeInterpolator(0.0, 1.0)
                        }), 
                        HIGHLIGHT_START, 
                        HIGHLIGHT_END
                    );
                }
            }
            
            gContainer.addObject(noteWidget);
            
        }
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
