(function (root, factory) {
  const api = factory(
    root,
    typeof require === 'function' ? require('./geometry-dsl.js') : root.GeometryDsl,
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GeometryJxg = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root, dsl) {
  function pointX(point) {
    return typeof point.X === 'function' ? point.X() : point[0];
  }

  function pointY(point) {
    return typeof point.Y === 'function' ? point.Y() : point[1];
  }

  function unitVector(from, to) {
    const dx = pointX(to) - pointX(from);
    const dy = pointY(to) - pointY(from);
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length };
  }

  function rightAngleCorner(vertex, first, second, size) {
    const u = unitVector(vertex, first);
    const v = unitVector(vertex, second);
    return {
      first: [
        pointX(vertex) + u.x * size,
        pointY(vertex) + u.y * size,
      ],
      corner: [
        pointX(vertex) + (u.x + v.x) * size,
        pointY(vertex) + (u.y + v.y) * size,
      ],
      second: [
        pointX(vertex) + v.x * size,
        pointY(vertex) + v.y * size,
      ],
    };
  }

  function pointOnRayCoordinates(created, construct) {
    const from = created[construct.from];
    const reference = created[construct.reference];
    const baseAngle = Math.atan2(pointY(reference) - pointY(from), pointX(reference) - pointX(from));
    const angle = construct.angleDegrees * Math.PI / 180;
    const signedAngle = construct.orientation === 'clockwise' ? -angle : angle;
    return [
      pointX(from) + construct.length * Math.cos(baseAngle + signedAngle),
      pointY(from) + construct.length * Math.sin(baseAngle + signedAngle),
    ];
  }

  function rightTriangle30_60VertexCoordinates(created, construct) {
    const right = created[construct.rightAt];
    const longLegTo = created[construct.longLegTo];
    const dx = pointX(longLegTo) - pointX(right);
    const dy = pointY(longLegTo) - pointY(right);
    const longLength = Math.hypot(dx, dy) || 1;
    const shortLength = longLength / Math.sqrt(3);
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return [
      pointX(right) + (-sign * dy / longLength) * shortLength,
      pointY(right) + (sign * dx / longLength) * shortLength,
    ];
  }

  function isoscelesRightTriangleVertexCoordinates(created, construct) {
    const right = created[construct.rightAt];
    const legTo = created[construct.legTo];
    const dx = pointX(legTo) - pointX(right);
    const dy = pointY(legTo) - pointY(right);
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return [
      pointX(right) + (-sign * dy),
      pointY(right) + (sign * dx),
    ];
  }

  function isoscelesRightTriangleRightVertexOnRayCoordinates(created, construct) {
    const legTo = created[construct.legTo];
    const rayStart = created[construct.rayStart];
    const lineA = created[construct.targetLineThrough[0]];
    const lineB = created[construct.targetLineThrough[1]];
    const ux = pointX(legTo) - pointX(rayStart);
    const uy = pointY(legTo) - pointY(rayStart);
    const rayLength = Math.hypot(ux, uy) || 1;
    const direction = { x: ux / rayLength, y: uy / rayLength };
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    const normal = { x: sign * direction.y, y: -sign * direction.x };
    const targetDx = pointX(lineB) - pointX(lineA);
    const targetDy = pointY(lineB) - pointY(lineA);
    const denominator = direction.x * targetDy - direction.y * targetDx
      + normal.x * targetDy - normal.y * targetDx;
    const numerator = (pointX(lineA) - pointX(legTo)) * targetDy
      - (pointY(lineA) - pointY(legTo)) * targetDx;
    const length = Math.abs(denominator) < 1e-9 ? 0 : numerator / denominator;
    return [
      pointX(legTo) + direction.x * length,
      pointY(legTo) + direction.y * length,
    ];
  }

  function orthogonalProjectionCoordinates(created, construct) {
    const point = created[construct.point];
    const a = created[construct.lineThrough[0]];
    const b = created[construct.lineThrough[1]];
    const ax = pointX(a);
    const ay = pointY(a);
    const dx = pointX(b) - ax;
    const dy = pointY(b) - ay;
    const denominator = dx * dx + dy * dy;
    const t = denominator === 0 ? 0 : ((pointX(point) - ax) * dx + (pointY(point) - ay) * dy) / denominator;
    return [ax + dx * t, ay + dy * t];
  }

  function midpointCoordinates(created, construct) {
    const first = created[construct.between[0]];
    const second = created[construct.between[1]];
    return [
      (pointX(first) + pointX(second)) / 2,
      (pointY(first) + pointY(second)) / 2,
    ];
  }

  function mirrorPointCoordinates(created, construct) {
    const point = created[construct.point];
    const a = created[construct.axisThrough[0]];
    const b = created[construct.axisThrough[1]];
    const ax = pointX(a);
    const ay = pointY(a);
    const dx = pointX(b) - ax;
    const dy = pointY(b) - ay;
    const denominator = dx * dx + dy * dy;
    const t = denominator === 0 ? 0 : ((pointX(point) - ax) * dx + (pointY(point) - ay) * dy) / denominator;
    const footX = ax + dx * t;
    const footY = ay + dy * t;
    return [
      2 * footX - pointX(point),
      2 * footY - pointY(point),
    ];
  }

  function pointReflectionCoordinates(created, construct) {
    const point = created[construct.point];
    const center = created[construct.center];
    return [
      2 * pointX(center) - pointX(point),
      2 * pointY(center) - pointY(point),
    ];
  }

  function perpendicularPointAtDistanceCoordinates(created, construct) {
    const from = created[construct.from];
    const reference = created[construct.reference];
    const dx = pointX(reference) - pointX(from);
    const dy = pointY(reference) - pointY(from);
    const baseLength = Math.hypot(dx, dy) || 1;
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    return [
      pointX(from) + (-sign * dy / baseLength) * construct.distance,
      pointY(from) + (sign * dx / baseLength) * construct.distance,
    ];
  }

  function ratioPointCoordinates(created, construct) {
    const from = created[construct.from];
    const to = created[construct.to];
    return [
      pointX(from) + (pointX(to) - pointX(from)) * construct.ratio,
      pointY(from) + (pointY(to) - pointY(from)) * construct.ratio,
    ];
  }

  function lineIntersectionCoordinates(created, construct) {
    const a1 = created[construct.first[0]];
    const a2 = created[construct.first[1]];
    const b1 = created[construct.second[0]];
    const b2 = created[construct.second[1]];
    const rx = pointX(a2) - pointX(a1);
    const ry = pointY(a2) - pointY(a1);
    const sx = pointX(b2) - pointX(b1);
    const sy = pointY(b2) - pointY(b1);
    const denominator = rx * sy - ry * sx;
    const t = Math.abs(denominator) < 1e-9 ? 0 : ((pointX(b1) - pointX(a1)) * sy - (pointY(b1) - pointY(a1)) * sx) / denominator;
    return [
      pointX(a1) + rx * t,
      pointY(a1) + ry * t,
    ];
  }

  function parallelPointCoordinates(created, construct) {
    const from = created[construct.from];
    const a = created[construct.parallelTo[0]];
    const b = created[construct.parallelTo[1]];
    return [
      pointX(from) + pointX(b) - pointX(a),
      pointY(from) + pointY(b) - pointY(a),
    ];
  }

  function perpendicularPointCoordinates(created, construct) {
    const from = created[construct.from];
    const a = created[construct.perpendicularTo[0]];
    const b = created[construct.perpendicularTo[1]];
    const dx = pointX(b) - pointX(a);
    const dy = pointY(b) - pointY(a);
    const baseLength = Math.hypot(dx, dy) || 1;
    const sign = construct.rotate === 'clockwise' ? -1 : 1;
    const scale = construct.length || baseLength;
    return [
      pointX(from) + (-sign * dy / baseLength) * scale,
      pointY(from) + (sign * dx / baseLength) * scale,
    ];
  }

  function translatedPointCoordinates(created, construct) {
    const from = created[construct.from];
    const start = created[construct.vector[0]];
    const end = created[construct.vector[1]];
    return [
      pointX(from) + pointX(end) - pointX(start),
      pointY(from) + pointY(end) - pointY(start),
    ];
  }

  function copyDistanceOnSegmentCoordinates(created, construct) {
    const sourceStart = created[construct.source[0]];
    const sourceEnd = created[construct.source[1]];
    const targetStart = created[construct.target[0]];
    const targetEnd = created[construct.target[1]];
    const sourceLength = Math.hypot(pointX(sourceEnd) - pointX(sourceStart), pointY(sourceEnd) - pointY(sourceStart));
    const start = construct.fromEnd ? targetEnd : targetStart;
    const end = construct.fromEnd ? targetStart : targetEnd;
    const dx = pointX(end) - pointX(start);
    const dy = pointY(end) - pointY(start);
    const targetLength = Math.hypot(dx, dy) || 1;
    return [
      pointX(start) + dx / targetLength * sourceLength,
      pointY(start) + dy / targetLength * sourceLength,
    ];
  }

  function pointFromVectorBasisCoordinates(created, construct) {
    const origin = created[construct.origin];
    const axisEnd = created[construct.axisEnd];
    const dx = pointX(axisEnd) - pointX(origin);
    const dy = pointY(axisEnd) - pointY(origin);
    const sign = construct.orientation === 'clockwise' ? -1 : 1;
    const normalX = -sign * dy;
    const normalY = sign * dx;
    return [
      pointX(origin) + dx * construct.xRatio + normalX * construct.yRatio,
      pointY(origin) + dy * construct.xRatio + normalY * construct.yRatio,
    ];
  }

  function interceptFromConstruct(created, construct) {
    if (typeof construct.intercept === 'number') {
      return construct.intercept;
    }
    if (construct.interceptPoint) {
      return pointY(created[construct.interceptPoint]);
    }
    return 0;
  }

  function parabolaValue(source, x) {
    return source.a * x * x + source.b * x + (source.c || 0);
  }

  function inverseLineIntersectionCoordinates(created, construct) {
    const slope = construct.slope;
    const intercept = interceptFromConstruct(created, construct);
    const discriminant = intercept * intercept - 4 * slope * -construct.k;
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [
      (-intercept + root) / (2 * slope),
      (-intercept - root) / (2 * slope),
    ];
    const x = construct.branch === 'positive'
      ? roots.find(value => value > 0) || Math.max(...roots)
      : roots.find(value => value < 0) || Math.min(...roots);
    return [x, slope * x + intercept];
  }

  function lineXInterceptCoordinates(created, construct) {
    const intercept = interceptFromConstruct(created, construct);
    return [-intercept / construct.slope, 0];
  }

  function verticalPointToYCoordinates(created, construct) {
    const base = created[construct.base];
    const y = typeof construct.y === 'number' ? construct.y : pointY(created[construct.yPoint]);
    return [pointX(base), y];
  }

  function verticalPointToParabolaCoordinates(created, construct) {
    const base = created[construct.base];
    const x = pointX(base);
    return [x, parabolaValue(construct.parabola, x)];
  }

  function rectangleTopRightOnParabolaCoordinates(created, construct) {
    const base = created[construct.base];
    return [construct.sumX - pointX(base), 0];
  }

  function fixedRectanglePointOnParabolaCoordinates(_created, construct) {
    const x = construct.sumX - construct.t;
    return [x, parabolaValue(construct.parabola, x)];
  }

  function sameLineParabolaIntersectionCoordinates(created, construct) {
    const through = created[construct.through];
    const pointOnFirst = created[construct.pointOnFirst];
    const dx = pointX(pointOnFirst) - pointX(through);
    const dy = pointY(pointOnFirst) - pointY(through);
    if (Math.abs(dx) < 1e-9) {
      const x = pointX(through);
      return [x, parabolaValue(construct.targetParabola, x)];
    }
    const slope = dy / dx;
    const intercept = pointY(through) - slope * pointX(through);
    const a = construct.targetParabola.a;
    const b = construct.targetParabola.b - slope;
    const c = (construct.targetParabola.c || 0) - intercept;
    const discriminant = b * b - 4 * a * c;
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [
      (-b + root) / (2 * a),
      (-b - root) / (2 * a),
    ];
    const x = Math.abs(roots[0] - pointX(through)) > Math.abs(roots[1] - pointX(through)) ? roots[0] : roots[1];
    return [x, slope * x + intercept];
  }

  function constructedPointCoordinates(created, construct) {
    if (construct.type === 'pointOnRay') {
      return pointOnRayCoordinates(created, construct);
    }
    if (construct.type === 'rightTriangle30_60Vertex') {
      return rightTriangle30_60VertexCoordinates(created, construct);
    }
    if (construct.type === 'isoscelesRightTriangleVertex') {
      return isoscelesRightTriangleVertexCoordinates(created, construct);
    }
    if (construct.type === 'isoscelesRightTriangleRightVertexOnRay') {
      return isoscelesRightTriangleRightVertexOnRayCoordinates(created, construct);
    }
    if (construct.type === 'orthogonalProjection') {
      return orthogonalProjectionCoordinates(created, construct);
    }
    if (construct.type === 'midpoint') {
      return midpointCoordinates(created, construct);
    }
    if (construct.type === 'mirrorPoint') {
      return mirrorPointCoordinates(created, construct);
    }
    if (construct.type === 'pointReflection') {
      return pointReflectionCoordinates(created, construct);
    }
    if (construct.type === 'perpendicularPointAtDistance') {
      return perpendicularPointAtDistanceCoordinates(created, construct);
    }
    if (construct.type === 'ratioPoint') {
      return ratioPointCoordinates(created, construct);
    }
    if (construct.type === 'lineIntersection') {
      return lineIntersectionCoordinates(created, construct);
    }
    if (construct.type === 'parallelPoint') {
      return parallelPointCoordinates(created, construct);
    }
    if (construct.type === 'perpendicularPoint') {
      return perpendicularPointCoordinates(created, construct);
    }
    if (construct.type === 'translatedPoint') {
      return translatedPointCoordinates(created, construct);
    }
    if (construct.type === 'copyDistanceOnSegment') {
      return copyDistanceOnSegmentCoordinates(created, construct);
    }
    if (construct.type === 'pointFromVectorBasis') {
      return pointFromVectorBasisCoordinates(created, construct);
    }
    if (construct.type === 'inverseLineIntersection') {
      return inverseLineIntersectionCoordinates(created, construct);
    }
    if (construct.type === 'lineXIntercept') {
      return lineXInterceptCoordinates(created, construct);
    }
    if (construct.type === 'verticalPointToY') {
      return verticalPointToYCoordinates(created, construct);
    }
    if (construct.type === 'verticalPointToParabola') {
      return verticalPointToParabolaCoordinates(created, construct);
    }
    if (construct.type === 'rectangleTopRightOnParabola') {
      return rectangleTopRightOnParabolaCoordinates(created, construct);
    }
    if (construct.type === 'fixedRectanglePointOnParabola') {
      return fixedRectanglePointOnParabolaCoordinates(created, construct);
    }
    if (construct.type === 'sameLineParabolaIntersection') {
      return sameLineParabolaIntersectionCoordinates(created, construct);
    }
    throw new Error(`Unsupported constructed point ${construct.type}`);
  }

  function pointDependenciesFromConstruct(construct) {
    if (construct.type === 'pointOnRay') return [construct.from, construct.reference];
    if (construct.type === 'rightTriangle30_60Vertex') return [construct.rightAt, construct.longLegTo];
    if (construct.type === 'isoscelesRightTriangleVertex') return [construct.rightAt, construct.legTo];
    if (construct.type === 'isoscelesRightTriangleRightVertexOnRay') return [construct.legTo, construct.rayStart, ...construct.targetLineThrough];
    if (construct.type === 'orthogonalProjection') return [construct.point, ...construct.lineThrough];
    if (construct.type === 'midpoint') return construct.between.slice();
    if (construct.type === 'mirrorPoint') return [construct.point, ...construct.axisThrough];
    if (construct.type === 'pointReflection') return [construct.point, construct.center];
    if (construct.type === 'perpendicularPointAtDistance') return [construct.from, construct.reference];
    if (construct.type === 'ratioPoint') return [construct.from, construct.to];
    if (construct.type === 'lineIntersection') return [...construct.first, ...construct.second];
    if (construct.type === 'parallelPoint') return [construct.from, ...construct.parallelTo];
    if (construct.type === 'perpendicularPoint') return [construct.from, ...construct.perpendicularTo];
    if (construct.type === 'translatedPoint') return [construct.from, ...construct.vector];
    if (construct.type === 'copyDistanceOnSegment') return [...construct.source, ...construct.target];
    if (construct.type === 'pointFromVectorBasis') return [construct.origin, construct.axisEnd];
    if (construct.type === 'inverseLineIntersection') return construct.interceptPoint ? [construct.interceptPoint] : [];
    if (construct.type === 'lineXIntercept') return construct.interceptPoint ? [construct.interceptPoint] : [];
    if (construct.type === 'verticalPointToY') return [construct.base, ...(construct.yPoint ? [construct.yPoint] : [])];
    if (construct.type === 'verticalPointToParabola') return [construct.base];
    if (construct.type === 'rectangleTopRightOnParabola') return [construct.base];
    if (construct.type === 'fixedRectanglePointOnParabola') return [];
    if (construct.type === 'sameLineParabolaIntersection') return [construct.through, construct.pointOnFirst];
    return [];
  }

  function compileSceneToJxgPlan(scene) {
    const commands = [];

    for (const object of scene.objects) {
      if (object.type === 'point') {
        commands.push({
          kind: object.construct ? 'constructedPoint' : 'point',
          id: object.id,
          x: object.fixed[0],
          y: object.fixed[1],
          draggable: !!object.draggable,
          on: object.on || null,
          construct: object.construct || null,
          label: object.visible === false ? false : scene.view.labels.includes(object.id),
          visible: object.visible !== false,
        });
      } else if (object.type === 'line') {
        commands.push({
          kind: 'line',
          id: object.id,
          through: object.through.slice(),
          visible: object.visible === true,
          axis: object.axis === true,
        });
      } else if (object.type === 'segment') {
        commands.push({
          kind: object.visible === false ? 'supportSegment' : 'segmentObject',
          id: object.id,
          through: object.through.slice(),
          visible: object.visible !== false,
        });
      } else if (object.type === 'circle') {
        commands.push({
          kind: 'circleObject',
          id: object.id,
          center: object.center,
          through: object.through || null,
          radius: object.radius || null,
          visible: object.visible !== false,
        });
      } else if (object.type === 'function') {
        commands.push({
          kind: 'functionGraph',
          id: object.id,
          equation: object.equation,
          k: object.k,
          slope: object.slope,
          intercept: object.intercept,
          a: object.a,
          b: object.b,
          c: object.c,
          interceptPoint: object.interceptPoint,
          range: object.range || null,
          strokeDasharray: object.strokeDasharray || null,
        });
      }
    }

    for (const segment of scene.view.visibleSegments) {
      if (segment.length === 2) {
        commands.push({
          kind: 'segment',
          id: segment,
          from: segment[0],
          to: segment[1],
        });
      }
    }

    for (const marker of scene.view.angleMarkers) {
      commands.push({ kind: 'angleMarker', ...marker });
    }

    for (const marker of scene.view.circles) {
      commands.push({ kind: 'circle', ...marker });
    }

    for (const constraint of scene.constraints) {
      commands.push({ kind: 'constraint', ...constraint });
    }

    return {
      boardId: `geometry-board-${scene.id}`,
      boundingBox: [
        scene.viewport.xmin,
        scene.viewport.ymax,
        scene.viewport.xmax,
        scene.viewport.ymin,
      ],
      commands,
    };
  }

  function mountJxgScene(container, scene, options = {}) {
    if (!root.JXG) {
      container.innerHTML = options.fallbackHtml || '';
      container.dataset.geometryFallback = 'jsxgraph-missing';
      return null;
    }

    const plan = compileSceneToJxgPlan(scene);
    container.id = plan.boardId;
    container.innerHTML = '';
    const board = root.JXG.JSXGraph.initBoard(container.id, {
      boundingbox: plan.boundingBox,
      axis: false,
      showNavigation: false,
      showCopyright: false,
      keepAspectRatio: true,
    });

    const created = {};
    const canCreate = command => {
      if (command.kind === 'supportSegment' || command.kind === 'segmentObject') {
        return command.through.every(id => created[id]);
      }
      if (command.kind === 'circleObject') {
        return created[command.center] && (!command.through || created[command.through]);
      }
      if (command.kind === 'functionGraph') {
        return !command.interceptPoint || !!created[command.interceptPoint];
      }
      if (command.kind === 'constructedPoint') {
        return pointDependenciesFromConstruct(command.construct).every(id => created[id]);
      }
      if (command.kind === 'point' && command.on) {
        return !!created[command.on];
      }
      return false;
    };

    for (const command of plan.commands) {
      if (command.kind === 'point') {
        if (command.on) continue;
        created[command.id] = board.create('point', [command.x, command.y], {
          name: command.label ? command.id : '',
          fixed: !command.draggable,
          size: command.draggable ? 3 : 2,
          showInfobox: false,
          visible: command.visible,
        });
      }
    }

    for (const command of plan.commands) {
      if (command.kind === 'line') {
        created[command.id] = board.create('line', [created[command.through[0]], created[command.through[1]]], {
          straightFirst: true,
          straightLast: true,
          strokeWidth: 1.6,
          strokeColor: command.axis ? '#111827' : '#9ca3af',
          highlightStrokeColor: command.axis ? '#111827' : '#9ca3af',
          visible: command.visible,
        });
        if (created[command.id].rendNode && command.axis) {
          created[command.id].rendNode.dataset.geometryAxis = command.id;
        }
      }
    }

    const pending = plan.commands
      .filter(command => command.kind === 'constructedPoint' || (command.kind === 'point' && command.on) || command.kind === 'supportSegment' || command.kind === 'segmentObject' || command.kind === 'circleObject' || command.kind === 'functionGraph')
      .slice();
    let madeProgress = true;
    while (pending.length > 0 && madeProgress) {
      madeProgress = false;
      for (let index = 0; index < pending.length; index += 1) {
        const command = pending[index];
        if (canCreate(command) && command.kind === 'constructedPoint') {
          created[command.id] = board.create('point', [
            () => constructedPointCoordinates(created, command.construct)[0],
            () => constructedPointCoordinates(created, command.construct)[1],
          ], {
            name: command.label ? command.id : '',
            fixed: true,
            size: 2,
            showInfobox: false,
            visible: command.visible,
          });
        } else if (canCreate(command) && command.kind === 'point') {
          created[command.id] = board.create('glider', [command.x, command.y, created[command.on]], {
            name: command.label ? command.id : '',
            fixed: !command.draggable,
            size: command.draggable ? 3 : 2,
            showInfobox: false,
            visible: command.visible,
          });
        } else if (canCreate(command) && command.kind === 'circleObject') {
          const circleArgs = command.through ? [created[command.center], created[command.through]] : [created[command.center], command.radius];
          created[command.id] = board.create('circle', circleArgs, {
            strokeWidth: 1,
            visible: command.visible,
            fixed: true,
          });
        } else if (canCreate(command) && command.kind === 'functionGraph') {
          const range = command.range || [scene.viewport.xmin, scene.viewport.xmax];
          const graph = board.create('functiongraph', [
            x => {
              if (command.equation === 'inverse') return command.k / x;
              if (command.equation === 'parabola') return command.a * x * x + command.b * x + (command.c || 0);
              if (command.equation === 'line') {
                const intercept = command.interceptPoint ? pointY(created[command.interceptPoint]) : (command.intercept || 0);
                return command.slope * x + intercept;
              }
              return NaN;
            },
            range[0],
            range[1],
          ], {
            strokeWidth: 2,
            dash: command.strokeDasharray ? 2 : 0,
          });
          if (graph.rendNode) {
            graph.rendNode.dataset.geometryFunction = command.id;
          }
          created[command.id] = graph;
        } else if (canCreate(command)) {
          created[command.id] = board.create('segment', [created[command.through[0]], created[command.through[1]]], {
            strokeWidth: 1,
            visible: command.visible,
            fixed: true,
          });
        } else {
          continue;
        }
        pending.splice(index, 1);
        index -= 1;
        madeProgress = true;
      }
    }

    if (pending.length > 0) {
      throw new Error(`Unresolved JSXGraph dependencies: ${pending.map(command => command.id).join(', ')}`);
    }

    for (const command of plan.commands) {
      if (command.kind === 'segment') {
        const segment = board.create('segment', [created[command.from], created[command.to]], {
          strokeWidth: 2,
        });
        if (segment.rendNode) {
          segment.rendNode.dataset.geometrySegment = command.id;
        }
        created[`segment:${command.id}`] = segment;
      }
    }

    for (const command of plan.commands) {
      if (command.kind === 'circle') {
        const circle = board.create('circle', [command.center, command.radius], {
          fixed: true,
          strokeWidth: 1.5,
        });
        if (circle.rendNode) {
          circle.rendNode.dataset.geometryCircle = command.id;
        }
      }
      if (command.kind === 'angleMarker' && !command.right) {
        board.create('angle', [created[command.from], created[command.at], created[command.to]], {
          name: command.label || '',
          radius: 0.45,
          type: 'sector',
        });
      }
      if (command.kind === 'angleMarker' && command.right) {
        const size = command.size || 0.23;
        const cornerPoint = name => board.create('point', [
          () => rightAngleCorner(created[command.at], created[command.from], created[command.to], size)[name][0],
          () => rightAngleCorner(created[command.at], created[command.from], created[command.to], size)[name][1],
        ], {
          fixed: true,
          visible: false,
          withLabel: false,
        });
        const first = cornerPoint('first');
        const corner = cornerPoint('corner');
        const second = cornerPoint('second');
        const markerA = board.create('segment', [first, corner], {
          strokeWidth: 1.4,
          strokeColor: '#111827',
          highlightStrokeColor: '#111827',
          fixed: true,
        });
        const markerB = board.create('segment', [corner, second], {
          strokeWidth: 1.4,
          strokeColor: '#111827',
          highlightStrokeColor: '#111827',
          fixed: true,
        });
        if (markerA.rendNode) {
          markerA.rendNode.dataset.geometryMarker = command.id;
        }
        if (markerB.rendNode) {
          markerB.rendNode.dataset.geometryMarkerPart = command.id;
        }
        created[command.id] = markerA;
      }
    }

    root.__geometryBoards = root.__geometryBoards || {};
    root.__geometryBoards[scene.id] = { board, created, plan };

    return { board, created, plan };
  }

  return {
    compileSceneToJxgPlan,
    constructedPointCoordinates,
    mountJxgScene,
  };
});
