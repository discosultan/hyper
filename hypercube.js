'use strict';

function Hypercube(gl) {
  var self = this;
  if (!gl)
    throw 'Missing WebGL handle.';
  this.gl = gl;

  this._initializeBuffers();
  if (!this._initializeShaders())
    throw 'Shader initialization failed.';

  this.rotation = 0;
  this.model = mat4.create();
  this.model4D = mat4.create();

  this.rotationFn = mat4.fromXWRotation;
  this.rotationSpeed = 2*Math.PI / 8; // 1 full rotation every 8 seconds.

  // Add GUI controller.
  var controls = new function() {
    this.rotateXY = function() { self.rotationFn = mat4.fromXYRotation; };
    this.rotateYZ = function() { self.rotationFn = mat4.fromYZRotation; };
    this.rotateZX = function() { self.rotationFn = mat4.fromZXRotation; };
    this.rotateXW = function() { self.rotationFn = mat4.fromXWRotation; };
    this.rotateYW = function() { self.rotationFn = mat4.fromYWRotation; };
    this.rotateZW = function() { self.rotationFn = mat4.fromZWRotation; };
  };
  var gui = new dat.GUI();
  gui.add(controls, 'rotateXY').name('Rotate XY');
  gui.add(controls, 'rotateYZ').name('Rotate YZ');
  gui.add(controls, 'rotateZX').name('Rotate ZX');
  gui.add(controls, 'rotateXW').name('Rotate XW');
  gui.add(controls, 'rotateYW').name('Rotate YW');
  gui.add(controls, 'rotateZW').name('Rotate ZW');
  gui.add(this, 'rotationSpeed', 0, 2*Math.PI).name('Rotation Speed');
}

Hypercube.prototype.update = function(deltaSeconds) {
  this.rotation += deltaSeconds*this.rotationSpeed;
  this.rotationFn(this.model4D, this.rotation);
};

Hypercube.prototype.render = function(camera) {
  // Set vertex buffer.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

  // Set color buffer.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

  // Set index buffer.
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  // Set shader resources.
  this.gl.uniform1f(this.shaderProgram.angle, Math.PI/4);
  this.gl.uniform4fv(this.shaderProgram.cameraPosition4D, camera.position4D);

  this.gl.uniformMatrix4fv(this.shaderProgram.model4D, false, this.model4D);
  this.gl.uniformMatrix4fv(this.shaderProgram.view4D, false, camera.view4D);
  this.gl.uniformMatrix4fv(this.shaderProgram.model, false, this.model);
  this.gl.uniformMatrix4fv(this.shaderProgram.view, false, camera.view);
  this.gl.uniformMatrix4fv(this.shaderProgram.projection, false, camera.projection);

  // Render.
  this.gl.drawElements(this.gl.LINES, this.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
};

Hypercube.prototype._initializeBuffers = function() {
  var vertices = [
    -1, -1, -1, -1,
    +1, +1, +1, +1,

    +1, -1, -1, -1,
    +1, +1, -1, -1,
    -1, +1, -1, -1,
    -1, -1, +1, -1,
    +1, -1, +1, -1,
    +1, +1, +1, -1,
    -1, +1, +1, -1,

    -1, -1, -1, +1,
    +1, -1, -1, +1,
    +1, +1, -1, +1,
    -1, +1, -1, +1,
    -1, -1, +1, +1,
    +1, -1, +1, +1,
    -1, +1, +1, +1
  ];
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 4;

  var colors = [
    0.396, 0.6, 1, 1,
    1, 0.6, 0, 1,

    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,
    0.396, 0.6, 1, 1,

    1, 0.6, 0, 1,
    1, 0.6, 0, 1,
    1, 0.6, 0, 1,
    1, 0.6, 0, 1,
    1, 0.6, 0, 1,
    1, 0.6, 0, 1,
    1, 0.6, 0, 1
  ];
  this.colorBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
  this.colorBuffer.itemSize = 4;

  var edges = [
    [0, 2],
    [0, 9],
    [2, 3],
    [2, 10],
    [3, 4],
    [3, 11],
    [4, 0],
    [4, 12],

    [0, 5],
    [2, 6],
    [4, 8],
    [3, 7],

    [5, 6],
    [5, 13],
    [6, 7],
    [6, 14],
    [7, 8],
    [7, 1],
    [8, 5],
    [8, 15],

    [9, 10],
    [10, 11],
    [11, 12],
    [12, 9],

    [10, 14],
    [11, 1],
    [12, 15],
    [9, 13],

    [13, 14],
    [14, 1],
    [1, 15],
    [15, 13]
  ];
  var indices = new Array(edges.length*2);
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    indices[i*2] = edge[0];
    indices[i*2 + 1] = edge[1];
  }
  this.indexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
  this.indexBuffer.numItems = indices.length;
};

Hypercube.prototype._initializeShaders = function() {
  // Build vertex shader.
  this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(this.vertexShader, Hypercube._shaders.vertex);
  this.gl.compileShader(this.vertexShader);

  // Build fragment shader.
  this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(this.fragmentShader, Hypercube._shaders.fragment);
  this.gl.compileShader(this.fragmentShader);

  this.shaderProgram = this.gl.createProgram();
  this.gl.attachShader(this.shaderProgram, this.vertexShader);
  this.gl.attachShader(this.shaderProgram, this.fragmentShader);
  this.gl.linkProgram(this.shaderProgram);

  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
    console.log(this.gl.getShaderInfoLog(this.vertexShader));
    return false;
  }

  this.gl.useProgram(this.shaderProgram);

  this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aPosition4D');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

  this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aColor');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

  this.shaderProgram.angle = this.gl.getUniformLocation(this.shaderProgram, 'uAngle');
  this.shaderProgram.cameraPosition4D = this.gl.getUniformLocation(this.shaderProgram, 'uCameraPosition4D');
  this.shaderProgram.model4D = this.gl.getUniformLocation(this.shaderProgram, 'uModel4D');
  this.shaderProgram.view4D = this.gl.getUniformLocation(this.shaderProgram, 'uView4D');
  this.shaderProgram.model = this.gl.getUniformLocation(this.shaderProgram, 'uModel');
  this.shaderProgram.view = this.gl.getUniformLocation(this.shaderProgram, 'uView');
  this.shaderProgram.projection = this.gl.getUniformLocation(this.shaderProgram, 'uProjection');

  return true;
};

Hypercube._shaders = {
  vertex:
    'attribute vec4 aPosition4D; ' +
    'attribute vec4 aColor; ' +

    'uniform float uAngle; ' +
    'uniform vec4 uCameraPosition4D; ' +
    'uniform mat4 uModel4D; ' +
    'uniform mat4 uView4D; ' +
    'uniform mat4 uProjection; ' +
    'uniform mat4 uModel; ' +
    'uniform mat4 uView; ' +

    'varying lowp vec4 vColor; ' +

    'void main(void) { ' +
      'vec4 position4D = uModel4D * aPosition4D; ' +
      'float t = 1.0 / tan(uAngle * 0.5); ' +
      'vec4 v = position4D - uCameraPosition4D; ' +
      'float s = t / dot(v, vec4(uView4D[0][3],uView4D[1][3],uView4D[2][3],uView4D[3][3])); ' +
      'vec3 position3D = vec3( ' +
        's * dot(v, vec4(uView4D[0][0],uView4D[1][0],uView4D[2][0],uView4D[3][0])), ' +
        's * dot(v, vec4(uView4D[0][1],uView4D[1][1],uView4D[2][1],uView4D[3][1])), ' +
        's * dot(v, vec4(uView4D[0][2],uView4D[1][2],uView4D[2][2],uView4D[3][2])) ' +
      '); ' +

      'gl_Position = uProjection * uView * uModel * vec4(position3D, 1.0); ' +
      'vColor = aColor; ' +
    '}',

  fragment:
    'varying lowp vec4 vColor; ' +

    'void main(void) { ' +
        'gl_FragColor = vColor; ' +
    '}'
};
