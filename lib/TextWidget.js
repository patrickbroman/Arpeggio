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
    this.fontName = "Arial";
    this.fontSize = 16;
}

TextWidget.prototype.render = function(ctx, frame) {
    ctx.save();
    // Render background rectangle
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "white";//this.textColor;
    ctx.font = "" + this.fontSize + "px " + this.fontName;
    ctx.textBaseline = "middle";

    var textSize = ctx.measureText(this.text);
    console.log(textSize.width);

    var x = this.x + this.width/2 - textSize.width/2;
    var y = this.y + this.heigth/2;

    ctx.fillText(this.text, x, y);

    ctx.restore();
}
