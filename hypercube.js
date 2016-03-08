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
  this.rotation4D = mat4.create();
}

Cube.prototype.update = function(deltaSeconds) {
  this.rotationX += deltaSeconds*Math.PI; // 1 turn per second.
  this.rotationY += deltaSeconds*Math.PI*0.5; // 1 turn per second.
};

Cube.prototype.render = function(camera) {
  camera.position4D = new Float32Array([1,1,1,1]);
  camera.projection4D = mat4.create();

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
  this.gl.uniform4fv(this.shaderProgram.cameraPosition, camera.position4D);
  this.gl.uniformMatrix4fv(this.shaderProgram.rotation, false, this.rotation4D);
  this.gl.uniformMatrix4fv(this.shaderProgram.projection4D, false, camera.projection4D);
  this.gl.uniformMatrix4fv(this.shaderProgram.projection, false, camera.projection);
  mat4.identity(this.modelView);
  mat4.rotateX(this.modelView, this.modelView, this.rotationX);
  mat4.rotateY(this.modelView, this.modelView, this.rotationY);
  mat4.multiply(this.modelView, camera.view, this.modelView);
  this.gl.uniformMatrix4fv(this.shaderProgram.modelView, false, this.modelView);

  // Render.
  this.gl.drawElements(this.gl.LINES, this.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
};

Cube.prototype._initializeBuffers = function() {
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

    +1, -1, -1, +1,
    +1, +1, -1, +1,
    -1, +1, -1, +1,
    -1, -1, +1, +1,
    +1, -1, +1, +1,
    +1, +1, +1, +1,
    -1, +1, +1, +1
  ];
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 4;

  var colors = [
    1, 0, 0, 1,
    0, 1, 0, 1,

    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,

    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1
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

  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
    console.log(this.gl.getShaderInfoLog(this.vertexShader));
    return false;
  }

  this.gl.useProgram(this.shaderProgram);

  this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aPosition');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

  this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aColor');
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

  this.shaderProgram.angle = this.gl.getUniformLocation(this.shaderProgram, 'uAngle');
  this.shaderProgram.cameraPosition = this.gl.getUniformLocation(this.shaderProgram, 'uCameraPosition');
  this.shaderProgram.rotation = this.gl.getUniformLocation(this.shaderProgram, 'uRotation');
  this.shaderProgram.projection4D = this.gl.getUniformLocation(this.shaderProgram, 'uProjection4D');
  this.shaderProgram.projection = this.gl.getUniformLocation(this.shaderProgram, 'uProjection');
  this.shaderProgram.modelView = this.gl.getUniformLocation(this.shaderProgram, 'uModelView');

  return true;
};

Cube._shaders = {
  vertex: '\
    attribute vec4 aPosition;\
    attribute vec4 aColor;\
    \
    uniform float uAngle;\
    uniform vec4 uCameraPosition;\
    uniform mat4 uRotation;\
    uniform mat4 uProjection4D;\
    uniform mat4 uProjection;\
    uniform mat4 uModelView;\
    \
    varying lowp vec4 vColor;\
    \
    void main(void) {\
      vec4 pos = uRotation * aPosition;\
      float t = 1.0 / tan(uAngle / 2.0);\
      vec4 v = pos - uCameraPosition;\
      float s = t / dot(v, vec4(uProjection4D[0][3],uProjection4D[1][3],uProjection4D[2][3],uProjection4D[3][3]));\
      vec3 position3D = vec3(\
        s * dot(v, vec4(uProjection4D[0][0],uProjection4D[1][0],uProjection4D[2][0],uProjection4D[3][0])),\
        s * dot(v, vec4(uProjection4D[0][1],uProjection4D[1][1],uProjection4D[2][1],uProjection4D[3][1])),\
        s * dot(v, vec4(uProjection4D[0][2],uProjection4D[1][2],uProjection4D[2][2],uProjection4D[3][2]))\
      );\
      \
      gl_Position = uProjection * uModelView * vec4(position3D, 1.0);\
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
