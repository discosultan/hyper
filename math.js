'use strict';

mat4.fromXYRotation = function(out, radians) {
  return mat4.fromZRotation(out, radians);
};
mat4.fromYZRotation = function(out, radians) {
  return mat4.fromXRotation(out, radians);
};
mat4.fromZXRotation = function(out, radians) {
  return mat4.fromYRotation(out, radians);
};
mat4.fromXWRotation = function(out, radians) {
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  mat4.identity(out);
  out[0] = cos;
  out[3] = sin;
  out[12] = -sin;
  out[15] = cos;
  return out;
};
mat4.fromYWRotation = function(out, radians) {
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  mat4.identity(out);
  out[5] = cos;
  out[7] = -sin;
  out[13] = sin;
  out[15] = cos;
  return out;
};
mat4.fromZWRotation = function(out, radians) {
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  mat4.identity(out);
  out[10] = cos;
  out[11] = -sin;
  out[14] = sin;
  out[15] = cos;
  return out;
};

mat4.lookAt4D = function(out, position, target, up, over) {
  // Get the normalized Wd column-vector.
  var wd = vec4.create();
  vec4.subtract(wd, target, position);
  vec4.normalize(wd, wd);

  // Calculate the normalized Wa column-vector.
  var wa = vec4.create();
  vec4.cross4D(wa, up, over, wd);
  vec4.normalize(wa, wa);

  var wb = vec4.create();
  vec4.cross4D(wb, over, wd, wa);
  vec4.normalize(wb, wb);

  // Calculate the Wc column-vector.
  var wc = vec4.create();
  vec4.cross4D(wc, wd, wa, wb);

  out[0] = wa[0];
  out[1] = wa[1];
  out[2] = wa[2];
  out[3] = wa[3];

  out[4] = wb[0];
  out[5] = wb[1];
  out[6] = wb[2];
  out[7] = wb[3];

  out[8] = wc[0];
  out[9] = wc[1];
  out[10] = wc[2];
  out[11] = wc[3];

  out[12] = wd[0];
  out[13] = wd[1];
  out[14] = wd[2];
  out[15] = wd[3];
  return out;
};

vec4.cross4D = function(out, U, V, W) {
  var A, B, C, D, E, F;       // Intermediate Values

  // Calculate intermediate values.

  A = (V[0] * W[1]) - (V[1] * W[0]);
  B = (V[0] * W[2]) - (V[2] * W[0]);
  C = (V[0] * W[3]) - (V[3] * W[0]);
  D = (V[1] * W[2]) - (V[2] * W[1]);
  E = (V[1] * W[3]) - (V[3] * W[1]);
  F = (V[2] * W[3]) - (V[3] * W[2]);

  // Calculate the result-vector components.

  out[0] = (U[1] * F) - (U[2] * E) + (U[3] * D);
  out[1] = -(U[0] * F) + (U[2] * C) - (U[3] * B);
  out[2] = (U[0] * E) - (U[1] * C) + (U[3] * A);
  out[3] = -(U[0] * D) + (U[1] * B) - (U[2] * A);
  return out;
};
