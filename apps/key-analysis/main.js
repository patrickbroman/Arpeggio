var SPEEDUP = 1.0;

var RECORDING = Config.recording;
var RECORDING_SECONDS = Config.recordingDuration;

// Layout constants

var CHORD_TABLE_X_START = 1060;
var CHORD_TABLE_WIDTH = 620;
var CHORD_WIDGET_WIDTH = 90;
var CHORD_TABLE_Y_START = 50;
var CHORD_TABLE_Y_SPACING = 74;

var CHORD_NUMERAL_FONTSIZE = 50;
var CHORD_FONTSIZE = 30;

// Animation constants
var SCROLL_IN_DISTANCE = 400;
var SCROLL_IN_START = 1*60;
var X_SCROLL_MUL = 0.0006;

var SCROLL_IN_END = 2*60;
var FADE_IN_START = 1.5*60;
var FADE_IN_END = 2*60;

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
    
    console.log("keyIndex: " + Config.srcKeyIndex);
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
        numeralWidget.addAnimation(fadeInAnim, FADE_IN_START, FADE_IN_END);
        numeralWidget.addAnimation(makeAnimation({"x" : makeInterpolator(x*x*X_SCROLL_MUL + SCROLL_IN_DISTANCE, x)}), SCROLL_IN_START, SCROLL_IN_END);
        
        gContainer.addObject(numeralWidget);
    }
    
    var chordSeq = Config.chordSequence;
    
    // for each key
    
    for(var i = 0; i < 12; i++) {
        // for each chord
        for(var j = 0; j < 7; j++) {
            var x = chordTableXStart + chordTableXInc*j;
            var y = CHORD_TABLE_Y_START + CHORD_TABLE_Y_SPACING*(i+1);
            // Widget for chord numeral
            var noteWidget = new TextWidget(x, y, CHORD_WIDGET_WIDTH, CHORD_WIDGET_WIDTH, keys[i].chords[j].triadName);
            //noteWidget.g = 0;
            //noteWidget.b = 0;
            noteWidget.backgroundColor = "rgba(0, 0, 0, 0.0)";
            noteWidget.fontOpacity = 0.0;
            noteWidget.fontSize = CHORD_FONTSIZE;
            noteWidget.addAnimation(fadeInAnim, FADE_IN_START, FADE_IN_END);
            noteWidget.addAnimation(makeAnimation({"x" : makeInterpolator(x*x*X_SCROLL_MUL + SCROLL_IN_DISTANCE, x)}), SCROLL_IN_START, SCROLL_IN_END);
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
