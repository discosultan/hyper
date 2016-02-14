'use strict';

function Cube(gl) {
  if (!gl)
    throw 'Missing WebGL handle.';
  this.gl = gl;

  this._initializeBuffers();
  if (!this._initializeShaders())
    throw 'Shader initialization failed.';

  this.rotationX = 0;
  this.rotationY = 0;
  this.modelView = mat4.create();
}

Cube.prototype.update = function(deltaSeconds) {
  this.rotationX += deltaSeconds * Math.PI; // 1 turn per second.
  this.rotationY += deltaSeconds * Math.PI * 0.5; // 1 turn per second.
};

Cube.prototype.render = function(camera) {
  // Set vertex buffer.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

  // Set color buffer.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

  // Set index buffer.
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  // Set shader resources.
  this.gl.uniformMatrix4fv(this.shaderProgram.projection, false, camera.projection);
  mat4.identity(this.modelView);
  mat4.rotateX(this.modelView, this.modelView, this.rotationX);
  mat4.rotateY(this.modelView, this.modelView, this.rotationY);
  mat4.multiply(this.modelView, camera.view, this.modelView);
  this.gl.uniformMatrix4fv(this.shaderProgram.modelView, false, this.modelView);

  // Render.
  // this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBuffer.numItems);
  this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
};

Cube.prototype._initializeBuffers = function() {
  var vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 3;

  var colors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
  ];
  var generatedColors = [];
  for (var j=0; j<6; j++) {
    var c = colors[j];
    for (var i=0; i<4; i++) {
      generatedColors = generatedColors.concat(c);
    }
  }
  this.colorBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(generatedColors), this.gl.STATIC_DRAW);
  this.colorBuffer.itemSize = 4;

  var indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ];
  this.indexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
  this.indexBuffer.numItems = indices.length;
};

Cube.prototype._initializeShaders = function() {
  // Build vertex shader.
  this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(this.vertexShader, Cube._shaders.vertex);
  this.gl.compileShader(this.vertexShader);

  // Build fragment shader.
  this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(this.fragmentShader, Cube._shaders.fragment);
  this.gl.compileShader(this.fragmentShader);

  this.shaderProgram = this.gl.createProgram();
  this.gl.attachShader(this.shaderProgram, this.vertexShader);
  this.gl.attachShader(this.shaderProgram, this.fragmentShader);
  this.gl.linkProgram(this.shaderProgram);

  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS))
      return false;

  this.gl.useProgram(this.shaderProgram);

  this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aPosition');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

  this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aColor');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

  this.shaderProgram.projection = this.gl.getUniformLocation(this.shaderProgram, 'uProjection');
  this.shaderProgram.modelView = this.gl.getUniformLocation(this.shaderProgram, 'uModelView');

  return true;
};

Cube._shaders = {
  vertex: '\
    attribute vec3 aPosition;\
    attribute vec4 aColor;\
    \
    uniform mat4 uProjection;\
    uniform mat4 uModelView;\
    \
    varying lowp vec4 vColor;\
    \
    void main(void) {\
      gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);\
      vColor = aColor;\
    }',

  fragment: '\
    varying lowp vec4 vColor;\
    \
    void main(void) {\
        gl_FragColor = vColor;\
    }\
  '
};
