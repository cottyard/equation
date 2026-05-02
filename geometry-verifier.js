(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./geometry-dsl.js') : root.GeometryDsl,
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GeometryVerifier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (dsl) {
  const EPSILON = 1e-6;

  function vector(a, b) {
    return { x: b.x - a.x, y: b.y - a.y };
  }

  function cross(u, v) {
    return u.x * v.y - u.y * v.x;
  }

  function dot(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  function length(u) {
    return Math.hypot(u.x, u.y);
  }

  function isZero(value) {
    return Math.abs(value) < EPSILON;
  }

  function pointNotAt(scene, pointId, vertexId) {
    const point = dsl.getPoint(scene, pointId);
    const vertex = dsl.getPoint(scene, vertexId);
    const distance = length(vector(vertex, point));
    if (distance < EPSILON) {
      throw new Error(`Point ${pointId} must be distinct from ${vertexId}`);
    }
    return point;
  }

  function checkRightTriangle30_60(scene, constraint) {
    const rightAt = constraint.rightAt;
    const [shortA, shortB] = dsl.getSegmentPoints(scene, constraint.shortLeg);
    const [longA, longB] = dsl.getSegmentPoints(scene, constraint.longLeg);
    const right = dsl.getPoint(scene, rightAt);
    const shortOther = shortA.id === rightAt ? pointNotAt(scene, shortB.id, rightAt) : pointNotAt(scene, shortA.id, rightAt);
    const longOther = longA.id === rightAt ? pointNotAt(scene, longB.id, rightAt) : pointNotAt(scene, longA.id, rightAt);
    const shortVector = vector(right, shortOther);
    const longVector = vector(right, longOther);
    const shortLength = length(shortVector);
    const longLength = length(longVector);
    const dotResidual = dot(shortVector, longVector);
    const ratioResidual = longLength / shortLength - Math.sqrt(3);
    const rightPointOnShortLeg = shortA.id === rightAt || shortB.id === rightAt;
    const rightPointOnLongLeg = longA.id === rightAt || longB.id === rightAt;

    return {
      ...constraint,
      args: constraint.triangle || [],
      ok: rightPointOnShortLeg && rightPointOnLongLeg && isZero(dotResidual) && isZero(ratioResidual),
      residual: Math.max(Math.abs(dotResidual), Math.abs(ratioResidual)),
      dotResidual,
      ratioResidual,
    };
  }

  function checkIsoscelesRightTriangle(scene, constraint) {
    const rightAt = constraint.rightAt;
    const [legA, legB] = constraint.equalLegs;
    const [a1, a2] = dsl.getSegmentPoints(scene, legA);
    const [b1, b2] = dsl.getSegmentPoints(scene, legB);
    const right = dsl.getPoint(scene, rightAt);
    const firstOther = a1.id === rightAt ? pointNotAt(scene, a2.id, rightAt) : pointNotAt(scene, a1.id, rightAt);
    const secondOther = b1.id === rightAt ? pointNotAt(scene, b2.id, rightAt) : pointNotAt(scene, b1.id, rightAt);
    const firstVector = vector(right, firstOther);
    const secondVector = vector(right, secondOther);
    const dotResidual = dot(firstVector, secondVector);
    const lengthResidual = length(firstVector) - length(secondVector);
    const rightPointOnFirstLeg = a1.id === rightAt || a2.id === rightAt;
    const rightPointOnSecondLeg = b1.id === rightAt || b2.id === rightAt;

    return {
      ...constraint,
      args: constraint.triangle || [],
      ok: rightPointOnFirstLeg && rightPointOnSecondLeg && isZero(dotResidual) && isZero(lengthResidual),
      residual: Math.max(Math.abs(dotResidual), Math.abs(lengthResidual)),
      dotResidual,
      lengthResidual,
    };
  }

  function coordinatesFromPointOnRay(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const reference = dsl.getPoint(scene, construct.reference);
    const baseAngle = Math.atan2(reference.y - from.y, reference.x - from.x);
    const angle = construct.angleDegrees * Math.PI / 180;
    const signedAngle = construct.orientation === 'clockwise' ? -angle : angle;
    return {
      x: from.x + construct.length * Math.cos(baseAngle + signedAngle),
      y: from.y + construct.length * Math.sin(baseAngle + signedAngle),
    };
  }

  function coordinatesFromRightTriangle30_60Vertex(scene, construct) {
    const right = dsl.getPoint(scene, construct.rightAt);
    const longLegTo = dsl.getPoint(scene, construct.longLegTo);
    const longVector = vector(right, longLegTo);
    const shortLength = length(longVector) / Math.sqrt(3);
    const longLength = length(longVector);
    const ux = longVector.x / longLength;
    const uy = longVector.y / longLength;
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return {
      x: right.x + (-sign * uy) * shortLength,
      y: right.y + (sign * ux) * shortLength,
    };
  }

  function coordinatesFromIsoscelesRightTriangleVertex(scene, construct) {
    const right = dsl.getPoint(scene, construct.rightAt);
    const legTo = dsl.getPoint(scene, construct.legTo);
    const legVector = vector(right, legTo);
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return {
      x: right.x + (-sign * legVector.y),
      y: right.y + (sign * legVector.x),
    };
  }

  function coordinatesFromIsoscelesRightTriangleRightVertexOnRay(scene, construct) {
    const legTo = dsl.getPoint(scene, construct.legTo);
    const rayStart = dsl.getPoint(scene, construct.rayStart);
    const [lineA, lineB] = construct.targetLineThrough.map(id => dsl.getPoint(scene, id));
    const rayVector = vector(rayStart, legTo);
    const rayLength = length(rayVector);
    const direction = { x: rayVector.x / rayLength, y: rayVector.y / rayLength };
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    const normal = { x: sign * direction.y, y: -sign * direction.x };
    const targetVector = vector(lineA, lineB);
    const denominator = cross(direction, targetVector) + cross(normal, targetVector);
    const numerator = cross(vector(legTo, lineA), targetVector);
    const legLength = numerator / denominator;
    return {
      x: legTo.x + direction.x * legLength,
      y: legTo.y + direction.y * legLength,
    };
  }

  function coordinatesFromOrthogonalProjection(scene, construct) {
    const point = dsl.getPoint(scene, construct.point);
    const [a, b] = construct.lineThrough.map(id => dsl.getPoint(scene, id));
    const ab = vector(a, b);
    const denominator = dot(ab, ab);
    const t = denominator < EPSILON ? 0 : dot(vector(a, point), ab) / denominator;
    return {
      x: a.x + ab.x * t,
      y: a.y + ab.y * t,
    };
  }

  function coordinatesFromConstruct(scene, construct) {
    if (construct.type === 'pointOnRay') {
      return coordinatesFromPointOnRay(scene, construct);
    }
    if (construct.type === 'rightTriangle30_60Vertex') {
      return coordinatesFromRightTriangle30_60Vertex(scene, construct);
    }
    if (construct.type === 'isoscelesRightTriangleVertex') {
      return coordinatesFromIsoscelesRightTriangleVertex(scene, construct);
    }
    if (construct.type === 'isoscelesRightTriangleRightVertexOnRay') {
      return coordinatesFromIsoscelesRightTriangleRightVertexOnRay(scene, construct);
    }
    if (construct.type === 'orthogonalProjection') {
      return coordinatesFromOrthogonalProjection(scene, construct);
    }
    throw new Error(`Unsupported point construction ${construct.type}`);
  }

  function checkPointConstruction(scene, object) {
    const expected = coordinatesFromConstruct(scene, object.construct);
    const actual = dsl.getPoint(scene, object.id);
    const residual = Math.hypot(actual.x - expected.x, actual.y - expected.y);
    return {
      type: 'construction',
      id: object.id,
      construct: object.construct,
      ok: isZero(residual),
      residual,
    };
  }

  function checkConstraint(scene, constraint) {
    if (constraint.type === 'parallel') {
      const [lineA, lineB] = constraint.args;
      const [a1, a2] = dsl.getLinePoints(scene, lineA);
      const [b1, b2] = dsl.getLinePoints(scene, lineB);
      const residual = cross(vector(a1, a2), vector(b1, b2));
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'pointOn') {
      const [pointId, lineId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const [a, b] = dsl.getLinePoints(scene, lineId);
      const residual = cross(vector(a, b), vector(a, point));
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'angleDegrees') {
      const [fromId, atId, toId] = constraint.points;
      const from = dsl.getPoint(scene, fromId);
      const at = dsl.getPoint(scene, atId);
      const to = dsl.getPoint(scene, toId);
      const first = vector(at, from);
      const second = vector(at, to);
      const actual = ((Math.atan2(cross(first, second), dot(first, second)) * 180 / Math.PI) % 360 + 360) % 360;
      const residual = Math.min(
        Math.abs(actual - constraint.degrees),
        Math.abs(actual - constraint.degrees + 360),
        Math.abs(actual - constraint.degrees - 360),
      );
      return { ...constraint, type: 'angleDegrees', args: constraint.points, ok: isZero(residual), residual, actual };
    }

    if (constraint.type === 'collinear') {
      const [first, second, third] = constraint.args.map(id => dsl.getPoint(scene, id));
      const residual = cross(vector(first, second), vector(first, third));
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'pointBetween') {
      const [pointId, endAId, endBId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const endA = dsl.getPoint(scene, endAId);
      const endB = dsl.getPoint(scene, endBId);
      const collinearResidual = cross(vector(endA, endB), vector(endA, point));
      const dotResidual = dot(vector(point, endA), vector(point, endB));
      return {
        ...constraint,
        ok: isZero(collinearResidual) && dotResidual <= EPSILON,
        residual: Math.max(Math.abs(collinearResidual), Math.max(0, dotResidual)),
        collinearResidual,
        dotResidual,
      };
    }

    if (constraint.type === 'perpendicular') {
      const [segmentA, segmentB] = constraint.args;
      const [a1, a2] = dsl.getSegmentPoints(scene, segmentA);
      const [b1, b2] = dsl.getSegmentPoints(scene, segmentB);
      const residual = dot(vector(a1, a2), vector(b1, b2));
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'rightTriangle30_60') {
      return checkRightTriangle30_60(scene, constraint);
    }

    if (constraint.type === 'isoscelesRightTriangle') {
      return checkIsoscelesRightTriangle(scene, constraint);
    }

    return { ...constraint, ok: false, residual: NaN, error: `Unsupported constraint ${constraint.type}` };
  }

  function verifySceneConstraints(scene) {
    const results = [
      ...scene.objects
        .filter(object => object.type === 'point' && object.construct)
        .map(object => checkPointConstruction(scene, object)),
      ...scene.constraints.map(constraint => checkConstraint(scene, constraint)),
    ];
    return {
      ok: results.every(result => result.ok),
      results,
      failures: results.filter(result => !result.ok),
    };
  }

  return {
    coordinatesFromConstruct,
    verifySceneConstraints,
  };
});
