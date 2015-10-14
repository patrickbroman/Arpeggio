var TEXTWIDGET_BACKGROUNDMODE_RECTANGLE = 0;
var TEXTWIDGET_BACKGROUNDMODE_CIRCLE = 1;

function TextWidget(x, y, width, height, text) {
    // Constructor parameters
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    // Defaults for other properties
    this.textColor = "white";
    this.backgroundColor = "red";
    this.fontName = "Futura";
    this.fontSize = 48;
    this.fontOpacity = 1.0;
    this.backgroundOpacity = 1.0;
    this.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_RECTANGLE;

    this.animations = [];
}

TextWidget.prototype.addAnimation = function(func, start, end) {
    this.animations.push({
        func : func,
        startFrame: start,
        endFrame: end
    });
}

TextWidget.prototype.contains = function(x, y) {
    var xIn = x >= this.x && x <= this.x + this.width;
    var yIn = y >= this.y && y <= this.y + this.height;
    var ret = xIn && yIn;
    console.log("Note:" + this.text);
    console.log("x: " + x);
    console.log("y: " + y);
    console.log("this.x: " + this.x);
    console.log("this.y: " + this.y)
    console.log("this.width: " + this.width);
    console.log("this.height: " + this.height);
    console.log("inside: " + ret);
    return  ret;
}

TextWidget.prototype.mouseDown = function(x, y) {
    console.log("mp("+x+", "+y+")");
}


TextWidget.prototype.render = function(ctx, frame) {
    // Run animations
    for(var i = 0; i < this.animations.length; i++) {
        var a = this.animations[i];
        if(frame >= a.startFrame && frame <= a.endFrame) {
            var t = (frame - a.startFrame)/(a.endFrame - a.startFrame);
            a.func.call(this, t);
        }
    }
    ctx.save();
    if(this.backgroundMode == TEXTWIDGET_BACKGROUNDMODE_RECTANGLE) {
        // Render background rectangle
        ctx.save();
        ctx.globalAlpha = this.backgroundOpacity;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    } else {
        if(this.width != this.height) {
            throw "Can't hava non-square circle!";
        }
        var centerX = this.x + this.width/2;
        var centerY = this.y + this.height/2;
        var radius = this.width/2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 255, 255, "  + this.fontOpacity + ")";
    ctx.font = this.fontSize + "px " + this.fontName;
    ctx.textBaseline = "middle";

    var textSize = ctx.measureText(this.text);

    var x = this.x + this.width/2 - textSize.width/2;
    var y = this.y + this.height/2;


    ctx.fillText(this.text, x, y);

    ctx.restore();
}
