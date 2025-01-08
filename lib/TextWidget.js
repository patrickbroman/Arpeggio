// Keep the constants as they are
var TEXTWIDGET_BACKGROUNDMODE_RECTANGLE = 0;
var TEXTWIDGET_BACKGROUNDMODE_CIRCLE = 1;

// Define the TextWidget class
class TextWidget {
    constructor(x, y, width, height, text) {
        // Constructor parameters
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
        this.fontSize = 48;
        this.fontOpacity = 1.0;
        this.backgroundOpacity = 1.0;
        this.backgroundMode = TEXTWIDGET_BACKGROUNDMODE_RECTANGLE;
        this.textY = null;

        this.animations = [];
    }

    addAnimation(func, start, end) {
        this.animations.push({
            func: func,
            startFrame: start,
            endFrame: end,
            completed: false
        });
    }

    clearAnimations() {
        this.animations = [];
    }

    contains(x, y) {
        const xIn = x >= this.x && x <= this.x + this.width;
        const yIn = y >= this.y && y <= this.y + this.height;
        const ret = xIn && yIn;
        console.log("Note:" + this.text);
        console.log("x: " + x);
        console.log("y: " + y);
        console.log("this.x: " + this.x);
        console.log("this.y: " + this.y);
        console.log("this.width: " + this.width);
        console.log("this.height: " + this.height);
        console.log("inside: " + ret);
        return ret;
    }

    mouseDown(x, y) {
        console.log("mp(" + x + ", " + y + ")");
    }

    render(ctx, frame) {
        // Run animations
        for (let i = 0; i < this.animations.length; i++) {
            const a = this.animations[i];
            if (frame >= a.startFrame && frame <= a.endFrame) {
                let t = (frame - a.startFrame) / (a.endFrame - a.startFrame);
                if (frame === a.endFrame) {
                    t = 1.0;
                }
                a.func.call(this, t);
            }
            if (frame > a.endFrame && !a.completed) {
                a.func.call(this, 1.0);
                a.completed = true;
            }
        }
        ctx.save();
        if (this.backgroundMode === TEXTWIDGET_BACKGROUNDMODE_RECTANGLE) {
            // Render background rectangle
            ctx.save();
            ctx.globalAlpha = this.backgroundOpacity;
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        } else {
            if (this.width !== this.height) {
                throw "Can't have a non-square circle!";
            }
            ctx.save();
            ctx.globalAlpha = this.backgroundOpacity;
            ctx.fillStyle = this.backgroundColor;

            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const radius = this.width / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.globalAlpha = this.backgroundOpacity;
            ctx.fillStyle = this.backgroundColor;
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.fontOpacity})`;
        ctx.font = `${this.fontSize}px ${this.fontName}`;
        ctx.textBaseline = "middle";

        const textSize = ctx.measureText(this.text);

        const x = this.x + this.width / 2 - textSize.width / 2;
        let y = this.y + this.height / 2 + 4;

        if (this.textY !== null) {
            y = this.y + this.textY;
        }

        ctx.fillText(this.text, x, y);

        ctx.restore();
    }
}
