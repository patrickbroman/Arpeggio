function Container(numLayers) {
    this.layers = [];
    for(var i = 0; i < numLayers; i++) {
        this.layers.push([]);
    }
}

Container.prototype.addObject = function(object, layerIndex) {
    layerIndex = layerIndex || 0;
    this.layers[layerIndex].push(object);
}

Container.prototype.render = function(ctx, frame) {
    for(var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        for(var j = 0; j < layer.length; j++) {
            var object = layer[j];
            object.render(ctx, frame);
        }
    }
}
