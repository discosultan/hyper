'use strict';

function App(canvas) {
  if (!canvas)
    throw 'Web GL app requires canvas for rendering!';
  this.canvas = canvas;

  this.gl = this.initializeWebGL(this.canvas);
  if (!this.gl)
    throw 'Web GL not supported!';

  this.initializeShaders();
  this.initializeBuffers();

  this.mvMatrix = mat4.create();
  this.pMatrix = mat4.create();

  // Default viewport size to canvas width and height.
  this.resize(this.canvas.width, this.canvas.height);
  // Set clear color to black, fully opaque
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Enable depth testing
  this.gl.enable(this.gl.DEPTH_TEST);
  // Near things obscure far things
  this.gl.depthFunc(this.gl.LEQUAL);

  window.requestAnimationFrame(this.tick.bind(this));
}

App.prototype.initializeWebGL = function(canvas) {
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch(e) {}
};

App.prototype.resize = function() {
  var width = this.canvas.width;
  var height = this.canvas.height;
  this.gl.viewport(0, 0, width, height);
  mat4.perspective(this.pMatrix, Math.PI*0.25, width / height, 0.1, 100.0);
};

App.prototype.tick = function(timestamp) {
  // console.log(timestamp);

  // Clear the color as well as the depth buffer.
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.drawTriangle();

  window.requestAnimationFrame(this.tick.bind(this));
};

// TEMP STUFF BELOW!

App.prototype.initializeShaders = function() {
  // Build vertex shader.
  this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(this.vertexShader, Shaders.vertex);
  this.gl.compileShader(this.vertexShader);

  // Build fragment shader.
  this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(this.fragmentShader, Shaders.fragment);
  this.gl.compileShader(this.fragmentShader);

  this.shaderProgram = this.gl.createProgram();
  this.gl.attachShader(this.shaderProgram, this.vertexShader);
  this.gl.attachShader(this.shaderProgram, this.fragmentShader);
  this.gl.linkProgram(this.shaderProgram);

  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS))
      return false;

  this.gl.useProgram(this.shaderProgram);
  this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

  this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
  this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uMVMatrix');
};

App.prototype.initializeBuffers = function() {
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  var vertices = [
     0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0
  ];
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 3;
  this.vertexBuffer.numItems = 3;
};

App.prototype.drawTriangle = function() {
  mat4.identity(this.mvMatrix);

  var translation = vec3.create();
  vec3.set(translation, -1.5, 0.0, -7.0);
  mat4.translate(this.mvMatrix, this.mvMatrix, translation);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
  this.setMatrixUniforms();
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBuffer.numItems);
}

App.prototype.setMatrixUniforms = function() {
  this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
  this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}
