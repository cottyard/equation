(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GeometryDsl = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizeScene(scene) {
    if (!scene || typeof scene !== 'object') {
      throw new Error('Geometry scene must be an object');
    }
    if (!scene.id) {
      throw new Error('Geometry scene requires an id');
    }
    if (!Array.isArray(scene.objects)) {
      throw new Error(`Geometry scene ${scene.id} requires objects`);
    }

    const objectsById = {};
    for (const object of scene.objects) {
      if (!object.id) {
        throw new Error(`Geometry scene ${scene.id} has an object without id`);
      }
      if (objectsById[object.id]) {
        throw new Error(`Geometry scene ${scene.id} has duplicate object id ${object.id}`);
      }
      objectsById[object.id] = object;
    }

    return {
      ...scene,
      constraints: scene.constraints || [],
      view: {
        labels: [],
        visibleSegments: [],
        angleMarkers: [],
        circles: [],
        ...(scene.view || {}),
      },
      objectsById,
    };
  }

  function getPoint(scene, id) {
    const object = scene.objectsById[id];
    if (!object || object.type !== 'point') {
      throw new Error(`Expected point ${id}`);
    }
    if (!Array.isArray(object.fixed) || object.fixed.length !== 2) {
      throw new Error(`Point ${id} needs fixed coordinates for v0 verification`);
    }
    return { id, x: object.fixed[0], y: object.fixed[1] };
  }

  function getLinePoints(scene, id) {
    const object = scene.objectsById[id];
    if (!object && id.length === 2) {
      return [getPoint(scene, id[0]), getPoint(scene, id[1])];
    }
    if (!object || (object.type !== 'line' && object.type !== 'segment')) {
      throw new Error(`Expected line or segment ${id}`);
    }
    const [a, b] = object.through;
    return [getPoint(scene, a), getPoint(scene, b)];
  }

  function getSegmentPoints(scene, id) {
    if (id.length !== 2) {
      throw new Error(`Segment id ${id} must be two point ids in v0`);
    }
    return [getPoint(scene, id[0]), getPoint(scene, id[1])];
  }

  return {
    getLinePoints,
    getPoint,
    getSegmentPoints,
    normalizeScene,
  };
});
