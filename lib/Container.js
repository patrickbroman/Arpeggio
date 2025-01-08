class Container {
    constructor(numLayers) {
        this.layers = [];
        for (let i = 0; i < numLayers; i++) {
            this.layers.push([]);
        }
    }

    addObject(object, layerIndex = 0) {
        this.layers[layerIndex].push(object);
    }

    render(ctx, frame) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                const object = layer[j];
                object.render(ctx, frame);
            }
        }
    }

    mouseDown(x, y) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            for (let j = 0; j < layer.length; j++) {
                const object = layer[j];
                if (object.contains(x, y)) {
                    object.mouseDown(x, y);
                }
            }
        }
    }
}
