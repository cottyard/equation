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

  function coordinatesFromMidpoint(scene, construct) {
    const first = dsl.getPoint(scene, construct.between[0]);
    const second = dsl.getPoint(scene, construct.between[1]);
    return {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    };
  }

  function coordinatesFromMirrorPoint(scene, construct) {
    const point = dsl.getPoint(scene, construct.point);
    const [a, b] = construct.axisThrough.map(id => dsl.getPoint(scene, id));
    const axis = vector(a, b);
    const denominator = dot(axis, axis);
    const t = denominator < EPSILON ? 0 : dot(vector(a, point), axis) / denominator;
    const foot = {
      x: a.x + axis.x * t,
      y: a.y + axis.y * t,
    };
    return {
      x: 2 * foot.x - point.x,
      y: 2 * foot.y - point.y,
    };
  }

  function coordinatesFromPointReflection(scene, construct) {
    const point = dsl.getPoint(scene, construct.point);
    const center = dsl.getPoint(scene, construct.center);
    return {
      x: 2 * center.x - point.x,
      y: 2 * center.y - point.y,
    };
  }

  function coordinatesFromPerpendicularPointAtDistance(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const reference = dsl.getPoint(scene, construct.reference);
    const base = vector(from, reference);
    const baseLength = length(base);
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return {
      x: from.x + (-sign * base.y / baseLength) * construct.distance,
      y: from.y + (sign * base.x / baseLength) * construct.distance,
    };
  }

  function coordinatesFromRatioPoint(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const to = dsl.getPoint(scene, construct.to);
    const ratio = construct.ratio;
    return {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
  }

  function coordinatesFromLineIntersection(scene, construct) {
    const [a1, a2] = construct.first.map(id => dsl.getPoint(scene, id));
    const [b1, b2] = construct.second.map(id => dsl.getPoint(scene, id));
    const r = vector(a1, a2);
    const s = vector(b1, b2);
    const denominator = cross(r, s);
    const t = Math.abs(denominator) < EPSILON ? 0 : cross(vector(a1, b1), s) / denominator;
    return {
      x: a1.x + r.x * t,
      y: a1.y + r.y * t,
    };
  }

  function coordinatesFromParallelPoint(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const [a, b] = construct.parallelTo.map(id => dsl.getPoint(scene, id));
    return {
      x: from.x + (b.x - a.x),
      y: from.y + (b.y - a.y),
    };
  }

  function coordinatesFromPerpendicularPoint(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const [a, b] = construct.perpendicularTo.map(id => dsl.getPoint(scene, id));
    const base = vector(a, b);
    const baseLength = length(base);
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    const scale = construct.length || baseLength || 1;
    return {
      x: from.x + (-sign * base.y / baseLength) * scale,
      y: from.y + (sign * base.x / baseLength) * scale,
    };
  }

  function coordinatesFromTranslatedPoint(scene, construct) {
    const from = dsl.getPoint(scene, construct.from);
    const start = dsl.getPoint(scene, construct.vector[0]);
    const end = dsl.getPoint(scene, construct.vector[1]);
    return {
      x: from.x + end.x - start.x,
      y: from.y + end.y - start.y,
    };
  }

  function coordinatesFromCopyDistanceOnSegment(scene, construct) {
    const sourceStart = dsl.getPoint(scene, construct.source[0]);
    const sourceEnd = dsl.getPoint(scene, construct.source[1]);
    const targetStart = dsl.getPoint(scene, construct.target[0]);
    const targetEnd = dsl.getPoint(scene, construct.target[1]);
    const sourceLength = length(vector(sourceStart, sourceEnd));
    const targetVector = vector(targetStart, targetEnd);
    const targetLength = length(targetVector);
    const direction = construct.fromEnd ? vector(targetEnd, targetStart) : targetVector;
    const directionLength = length(direction);
    const start = construct.fromEnd ? targetEnd : targetStart;
    return {
      x: start.x + direction.x / directionLength * sourceLength,
      y: start.y + direction.y / directionLength * sourceLength,
      ratio: sourceLength / targetLength,
    };
  }

  function coordinatesFromPointFromVectorBasis(scene, construct) {
    const origin = dsl.getPoint(scene, construct.origin);
    const axisEnd = dsl.getPoint(scene, construct.axisEnd);
    const axis = vector(origin, axisEnd);
    const sign = construct.orientation === 'clockwise' ? -1 : 1;
    const normal = { x: -sign * axis.y, y: sign * axis.x };
    return {
      x: origin.x + axis.x * construct.xRatio + normal.x * construct.yRatio,
      y: origin.y + axis.y * construct.xRatio + normal.y * construct.yRatio,
    };
  }

  function lineIntercept(scene, source) {
    if (typeof source.intercept === 'number') {
      return source.intercept;
    }
    if (source.interceptPoint) {
      return dsl.getPoint(scene, source.interceptPoint).y;
    }
    return 0;
  }

  function parabolaValue(source, x) {
    return source.a * x * x + source.b * x + (source.c || 0);
  }

  function coordinatesFromInverseLineIntersection(scene, construct) {
    const slope = construct.slope;
    const intercept = lineIntercept(scene, construct);
    const k = construct.k;
    const discriminant = intercept * intercept - 4 * slope * -k;
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [
      (-intercept + root) / (2 * slope),
      (-intercept - root) / (2 * slope),
    ];
    const x = construct.branch === 'positive'
      ? roots.find(value => value > 0) || Math.max(...roots)
      : roots.find(value => value < 0) || Math.min(...roots);
    return {
      x,
      y: slope * x + intercept,
    };
  }

  function coordinatesFromLineXIntercept(scene, construct) {
    const intercept = lineIntercept(scene, construct);
    return {
      x: -intercept / construct.slope,
      y: 0,
    };
  }

  function coordinatesFromVerticalPointToY(scene, construct) {
    const base = dsl.getPoint(scene, construct.base);
    const y = typeof construct.y === 'number' ? construct.y : dsl.getPoint(scene, construct.yPoint).y;
    return { x: base.x, y };
  }

  function coordinatesFromVerticalPointToParabola(scene, construct) {
    const base = dsl.getPoint(scene, construct.base);
    return { x: base.x, y: parabolaValue(construct.parabola, base.x) };
  }

  function coordinatesFromRectangleTopRightOnParabola(scene, construct) {
    const base = dsl.getPoint(scene, construct.base);
    return {
      x: construct.sumX - base.x,
      y: 0,
    };
  }

  function coordinatesFromFixedRectanglePointOnParabola(_scene, construct) {
    const x = construct.sumX - construct.t;
    return {
      x,
      y: parabolaValue(construct.parabola, x),
    };
  }

  function coordinatesFromSameLineParabolaIntersection(scene, construct) {
    const through = dsl.getPoint(scene, construct.through);
    const pointOnFirst = dsl.getPoint(scene, construct.pointOnFirst);
    const dx = pointOnFirst.x - through.x;
    const dy = pointOnFirst.y - through.y;
    if (Math.abs(dx) < EPSILON) {
      return { x: through.x, y: parabolaValue(construct.targetParabola, through.x) };
    }
    const slope = dy / dx;
    const intercept = through.y - slope * through.x;
    const a = construct.targetParabola.a;
    const b = construct.targetParabola.b - slope;
    const c = (construct.targetParabola.c || 0) - intercept;
    const discriminant = b * b - 4 * a * c;
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [
      (-b + root) / (2 * a),
      (-b - root) / (2 * a),
    ];
    const x = Math.abs(roots[0] - through.x) > Math.abs(roots[1] - through.x) ? roots[0] : roots[1];
    return { x, y: slope * x + intercept };
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
    if (construct.type === 'midpoint') {
      return coordinatesFromMidpoint(scene, construct);
    }
    if (construct.type === 'mirrorPoint') {
      return coordinatesFromMirrorPoint(scene, construct);
    }
    if (construct.type === 'pointReflection') {
      return coordinatesFromPointReflection(scene, construct);
    }
    if (construct.type === 'perpendicularPointAtDistance') {
      return coordinatesFromPerpendicularPointAtDistance(scene, construct);
    }
    if (construct.type === 'ratioPoint') {
      return coordinatesFromRatioPoint(scene, construct);
    }
    if (construct.type === 'lineIntersection') {
      return coordinatesFromLineIntersection(scene, construct);
    }
    if (construct.type === 'parallelPoint') {
      return coordinatesFromParallelPoint(scene, construct);
    }
    if (construct.type === 'perpendicularPoint') {
      return coordinatesFromPerpendicularPoint(scene, construct);
    }
    if (construct.type === 'translatedPoint') {
      return coordinatesFromTranslatedPoint(scene, construct);
    }
    if (construct.type === 'copyDistanceOnSegment') {
      return coordinatesFromCopyDistanceOnSegment(scene, construct);
    }
    if (construct.type === 'pointFromVectorBasis') {
      return coordinatesFromPointFromVectorBasis(scene, construct);
    }
    if (construct.type === 'inverseLineIntersection') {
      return coordinatesFromInverseLineIntersection(scene, construct);
    }
    if (construct.type === 'lineXIntercept') {
      return coordinatesFromLineXIntercept(scene, construct);
    }
    if (construct.type === 'verticalPointToY') {
      return coordinatesFromVerticalPointToY(scene, construct);
    }
    if (construct.type === 'verticalPointToParabola') {
      return coordinatesFromVerticalPointToParabola(scene, construct);
    }
    if (construct.type === 'rectangleTopRightOnParabola') {
      return coordinatesFromRectangleTopRightOnParabola(scene, construct);
    }
    if (construct.type === 'fixedRectanglePointOnParabola') {
      return coordinatesFromFixedRectanglePointOnParabola(scene, construct);
    }
    if (construct.type === 'sameLineParabolaIntersection') {
      return coordinatesFromSameLineParabolaIntersection(scene, construct);
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

    if (constraint.type === 'equalLength') {
      const [segmentA, segmentB] = constraint.args;
      const [a1, a2] = dsl.getSegmentPoints(scene, segmentA);
      const [b1, b2] = dsl.getSegmentPoints(scene, segmentB);
      const residual = length(vector(a1, a2)) - length(vector(b1, b2));
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'midpoint') {
      const [pointId, endAId, endBId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const endA = dsl.getPoint(scene, endAId);
      const endB = dsl.getPoint(scene, endBId);
      const expected = {
        x: (endA.x + endB.x) / 2,
        y: (endA.y + endB.y) / 2,
      };
      const residual = Math.hypot(point.x - expected.x, point.y - expected.y);
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'segmentLength') {
      const [segmentId] = constraint.args;
      const [a, b] = dsl.getSegmentPoints(scene, segmentId);
      const residual = length(vector(a, b)) - constraint.length;
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'lengthRatio') {
      const [segmentA, segmentB] = constraint.args;
      const [a1, a2] = dsl.getSegmentPoints(scene, segmentA);
      const [b1, b2] = dsl.getSegmentPoints(scene, segmentB);
      const segmentBLength = length(vector(b1, b2));
      const residual = length(vector(a1, a2)) / segmentBLength - constraint.ratio;
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'pointOnInverse') {
      const [pointId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const residual = point.x * point.y - constraint.k;
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'pointOnLineEquation') {
      const [pointId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const intercept = lineIntercept(scene, constraint);
      const residual = point.y - (constraint.slope * point.x + intercept);
      return { ...constraint, ok: isZero(residual), residual };
    }

    if (constraint.type === 'pointOnParabola') {
      const [pointId] = constraint.args;
      const point = dsl.getPoint(scene, pointId);
      const residual = point.y - parabolaValue(constraint.parabola, point.x);
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
