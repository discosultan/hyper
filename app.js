'use strict';

function App(canvas) {
  if (!canvas)
    throw 'Web GL app requires canvas for rendering!';
  this.canvas = canvas;

  this.gl = this._initializeWebGL(this.canvas);
  if (!this.gl)
    throw 'Web GL not supported!';

  this.previousTimestamp = 0;
  this.camera = {
    view: mat4.create(),
    projection: mat4.create()
  };

  var translation = vec3.create();
  vec3.set(translation, -1.0, 0.0, -7.0);
  mat4.translate(this.camera.view, this.camera.view, translation);

  // Default viewport size to canvas width and height
  this.resize(this.canvas.width, this.canvas.height);
  // Set clear color to dark gray, fully opaque
  this.gl.clearColor(0.125, 0.125, 0.125, 1.0);

  this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
  this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
  this.gl.disable(this.gl.CULL_FACE); // Disable culling
  // this.gl.cullFace(this.gl.BACK);

  this.cube = new Cube(this.gl);

  window.requestAnimationFrame(this._tick.bind(this));
}

App.prototype.resize = function() {
  var width = this.canvas.width;
  var height = this.canvas.height;
  this.gl.viewport(0, 0, width, height);
  mat4.perspective(this.camera.projection, Math.PI*0.25, width / height, 0.1, 100.0);
};

App.prototype._initializeWebGL = function(canvas) {
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch(e) {}
};

App.prototype._tick = function(timestamp) {
  var deltaSeconds = (timestamp - this.previousTimestamp) * 0.001;
  this.previousTimestamp = timestamp;

  // Clear the color as well as the depth buffer.
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  this.cube.update(deltaSeconds);
  this.cube.render(this.camera);

  window.requestAnimationFrame(this._tick.bind(this));
};
