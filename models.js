
function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1
  ]);

  const faceNormals = [
    [0, 0, 1], [0, 0, -1],
    [0, 1, 0], [0, -1, 0],
    [1, 0, 0], [-1, 0, 0]
  ];

  const normals = new Float32Array(
    faceNormals.flatMap(n => [...n, ...n, ...n, ...n])
  );

  const faceTangents = [
    [1, 0, 0], [-1, 0, 0],
    [1, 0, 0], [1, 0, 0],
    [0, 0, -1], [0, 0, 1]
  ];

  const tangents = new Float32Array(
    faceTangents.flatMap(t => [...t, ...t, ...t, ...t])
  );

  const texCoords = new Float32Array(
    faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1])
  );

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,
     4,  5,  6,   4,  6,  7,
     8,  9, 10,   8, 10, 11,
    12, 13, 14,  12, 14, 15,
    16, 17, 18,  16, 18, 19,
    20, 21, 22,  20, 22, 23
  ]);

  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);

    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }

  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  for (const y of [1, -1]) {
    const center = positions.length / 3;

    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);

    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);

      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);
    }

    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i;
      const b = a + 1;

      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


// ======================================================
// NEW 1: SPHERE
// ======================================================

function createSphere(segments = 48, rings = 32) {
  const positions = [];
  const normals = [];
  const tangents = [];
  const texCoords = [];
  const indices = [];

  for (let i = 0; i <= rings; i++) {
    const v = i / rings;
    const phi = v * Math.PI;

    for (let j = 0; j <= segments; j++) {
      const u = j / segments;
      const theta = u * 2 * Math.PI;

      const x = Math.sin(phi) * Math.sin(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.cos(theta);

      positions.push(x, y, z);
      normals.push(x, y, z);

      // Tangent along longitude
      tangents.push(
        Math.cos(theta),
        0,
        -Math.sin(theta)
      );

      texCoords.push(u, v);
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;

      indices.push(
        a, b, a + 1,
        b, b + 1, a + 1
      );
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


// ======================================================
// NEW 2: CONE
// ======================================================

function createCone(segments = 64) {
  const positions = [];
  const normals = [];
  const tangents = [];
  const texCoords = [];
  const indices = [];

  // Cone side
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const theta = u * 2 * Math.PI;

    const s = Math.sin(theta);
    const c = Math.cos(theta);

    // Base vertex
    positions.push(c, -1, s);

    // Side normal (slope-adjusted)
    const normal = [c, 0.5, s];
    const length = Math.hypot(...normal);

    normals.push(
      normal[0] / length,
      normal[1] / length,
      normal[2] / length
    );

    tangents.push(-s, 0, c);
    texCoords.push(u, 1);

    // Tip vertex
    positions.push(0, 1, 0);
    normals.push(
      normal[0] / length,
      normal[1] / length,
      normal[2] / length
    );

    tangents.push(-s, 0, c);
    texCoords.push(u, 0);
  }

  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 1, k + 2);
  }

  // Circular bottom cap
  const center = positions.length / 3;

  positions.push(0, -1, 0);
  normals.push(0, -1, 0);
  tangents.push(1, 0, 0);
  texCoords.push(0.5, 0.5);

  for (let i = 0; i <= segments; i++) {
    const theta = 2 * Math.PI * i / segments;
    const x = Math.cos(theta);
    const z = Math.sin(theta);

    positions.push(x, -1, z);
    normals.push(0, -1, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5 + 0.5 * x, 0.5 + 0.5 * z);
  }

  for (let i = 0; i < segments; i++) {
    indices.push(center, center + i + 2, center + i + 1);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


// ======================================================
// NEW 3: TORUS
// ======================================================

function createTorus(majorSegments = 64, minorSegments = 32,
                     majorRadius = 1, minorRadius = 0.35) {
  const positions = [];
  const normals = [];
  const tangents = [];
  const texCoords = [];
  const indices = [];

  for (let i = 0; i <= majorSegments; i++) {
    const u = i / majorSegments;
    const theta = u * 2 * Math.PI;

    for (let j = 0; j <= minorSegments; j++) {
      const v = j / minorSegments;
      const phi = v * 2 * Math.PI;

      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const ring = majorRadius + minorRadius * cosPhi;

      const x = ring * cosTheta;
      const y = minorRadius * sinPhi;
      const z = ring * sinTheta;

      positions.push(x, y, z);

      // Surface normal
      normals.push(
        cosPhi * cosTheta,
        sinPhi,
        cosPhi * sinTheta
      );

      // Tangent along the major circle
      tangents.push(-sinTheta, 0, cosTheta);

      texCoords.push(u, v);
    }
  }

  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const a = i * (minorSegments + 1) + j;
      const b = a + minorSegments + 1;

      indices.push(
        a, a + 1, b,
        a + 1, b + 1, b
      );
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}
