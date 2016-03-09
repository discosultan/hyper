var MathHelper = {
  createLookAt4D: function(position, target, up, over) {
    // Get the normalized Wd column-vector.
    var wd = vec4.create();
    vec4.subtract(wd, target, position);
    vec4.normalize(wd, wd);

    // Calculate the normalized Wa column-vector.
    var wa = vec4.create();
    cross4D(wa, up, over, wd);
    vec4.normalize(wa, wa);

    var wb = vec4.create();
    cross4D(wb, over, wd, wa);
    vec4.normalize(wb, wb);

    // Calculate the Wc column-vector.
    var wc = vec4.create();
    cross4D(wc, wd, wa, wb);

    var result = mat4.create();
    // TODO!!
    return new Matrix(wa, wb, wc, wd);
  },

  cross4D: function(out, U, V, W) {
    var A, B, C, D, E, F;       // Intermediate Values

    // Calculate intermediate values.

    A = (V.x * W.y) - (V.y * W.x);
    B = (V.x * W.z) - (V.z * W.x);
    C = (V.x * W.w) - (V.w * W.x);
    D = (V.y * W.z) - (V.z * W.y);
    E = (V.y * W.w) - (V.w * W.y);
    F = (V.z * W.w) - (V.w * W.z);

    // Calculate the result-vector components.

    out.x = (U.y * F) - (U.z * E) + (U.w * D);
    out.y = -(U.x * F) + (U.z * C) - (U.w * B);
    out.z = (U.x * E) - (U.y * C) + (U.w * A);
    out.w = -(U.x * D) + (U.y * B) - (U.z * A);
  }
};
