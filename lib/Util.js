class ImageManager {
    constructor() {
        this.images = new Map(); // To store loaded images
    }

    // Asynchronously loads an array of image paths
    async load(imagePaths) {
        const loadPromises = imagePaths.map((path) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    this.images.set(path, img); // Store the loaded image in the map
                    resolve();
                };
                img.onerror = () => {
                    reject(new Error(`Failed to load image: ${path}`));
                };
            });
        });

        // Wait for all images to load
        await Promise.all(loadPromises);
    }

    // Retrieve a loaded image by its path
    get(imagePath) {
        if (!this.images.has(imagePath)) {
            throw new Error(`Image not found: ${imagePath}`);
        }
        return this.images.get(imagePath);
    }
}

function brightenColor(hexColor, percentage) {
    // Ensure percentage is between 0 and 1
    percentage = Math.max(0, Math.min(percentage, 1));

    // Convert hex color to RGB
    const rgb = hexToRgb(hexColor);

    // Blend the RGB with white
    const brightenedRgb = {
        r: Math.round(rgb.r + (255 - rgb.r) * percentage),
        g: Math.round(rgb.g + (255 - rgb.g) * percentage),
        b: Math.round(rgb.b + (255 - rgb.b) * percentage),
    };

    // Convert back to hex
    return rgbToHex(brightenedRgb.r, brightenedRgb.g, brightenedRgb.b);
}

function hexToRgb(hex) {
    const normalizedHex = hex.startsWith("#") ? hex.slice(1) : hex;

    if (normalizedHex.length === 3) {
        // Expand shorthand format (#RGB) to full format (#RRGGBB)
        const r = parseInt(normalizedHex[0] + normalizedHex[0], 16);
        const g = parseInt(normalizedHex[1] + normalizedHex[1], 16);
        const b = parseInt(normalizedHex[2] + normalizedHex[2], 16);
        return { r, g, b };
    }

    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    const toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Example usage:
let brightColor = brightenColor("#f00", 0.5);
console.log(brightColor); // Output: "#ff8080"


EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

function makeInterpolator(b, c) {
    return function(t) {
        t = EasingFunctions.easeInOutQuad(t);
        return b*(1-t)+c*(t);
    }
}

function makeAnimation(dictionary) {
    return function(t) {
        for(var key in dictionary) {
            this[key] = dictionary[key](t);
        }
    }
}
