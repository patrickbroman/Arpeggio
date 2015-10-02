function Container(numLayers) {
    this.layers = [];
    for(var i = 0; i < numLayers; i++) {
        layers.push([]);
    }
}

Container.prototype.render = function(time) {
    for(var i = 0; i < layers.length; i++) {
        var layer = this.layers[i];
        for(var j = 0; j < layer.objects; j++) {
            var object = layer.objects[j];
            object.render(time);
        }
    }
}
