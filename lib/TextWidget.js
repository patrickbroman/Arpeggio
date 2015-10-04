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

    this.animations = [];
}

TextWidget.prototype.addAnimation = function(func, start, end) {
    this.animations.push({
        func : func,
        startFrame: start,
        endFrame: end
    });
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
    // Render background rectangle
    ctx.save();
    ctx.globalAlpha = this.backgroundOpacity;
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();

    ctx.fillStyle = "rgba(255, 255, 255, "  + this.fontOpacity + ")";
    ctx.font = this.fontSize + "px " + this.fontName;
    ctx.textBaseline = "middle";

    var textSize = ctx.measureText(this.text);

    var x = this.x + this.width/2 - textSize.width/2;
    var y = this.y + this.height/2;


    ctx.fillText(this.text, x, y);

    ctx.restore();
}
