function BracketWidget(x, y, width, height, text) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.text = text;

    this.r = 255;
    this.g = 255;
    this.b = 255;
    // Defaults for other properties
    this.textColor = "white";
    this.backgroundColor = "red";
    this.fontName = "Futura";
    this.fontSize = 24;
    this.fontOpacity = 1.0;

	this.image = new Image();
	this.loaded = false;
	var self = this;
	this.image.onload = function() {
		self.loaded = true;
	}

	this.image.src = "../../lib/res/bracket96.png";
}

BracketWidget.prototype.render = function(ctx, frame) {
	ctx.save();

	if(this.loaded) {		
		ctx.translate(this.x, this.y);


		// draw middle
		ctx.drawImage(this.image, 48-16, 0, 32, 20, this.width/2-16, 0, 32, 20);

		if(this.width > 0) {
			// draw ends
			ctx.drawImage(this.image, 0, 0, 16, 20, 0, 0, 16, 20);
			ctx.drawImage(this.image, 96-16, 0, 16, 20, this.width-16, 0, 16, 20);


			// draw left bar
			ctx.drawImage(this.image, 16, 0, 16, 20, 16, 0, this.width/2 - 16*2, 20);

			// draw right bar
			ctx.drawImage(this.image, 16*4, 0, 16, 20, this.width/2 + 16, 0, this.width/2 - 16*2, 20);
		} else {
			// draw ends
			// void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
			ctx.drawImage(this.image, 0, 0, 16, 20, -24, 0, 16, 20);
			ctx.drawImage(this.image, 96-16, 0, 16, 20, 8, 0, 16, 20);

		}

	    ctx.fillStyle = "rgba(" + this.r + ", " + this.g + ", " + this. b + ", "  + this.fontOpacity + ")";
	    ctx.font = this.fontSize + "px " + this.fontName;
	    ctx.textBaseline = "middle";

	    var textSize = ctx.measureText(this.text);

	    var x = this.width / 2 - textSize.width/2;
	    var y = - 20;

	    if(this.textY != null) {
	        y = this.y + this.textY;
	    }


	    ctx.fillText(this.text, x, y);

	}

	ctx.restore();
}