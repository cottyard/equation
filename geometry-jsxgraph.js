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
    throw new Error(`Unsupported constructed point ${construct.type}`);
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
        });
      } else if (object.type === 'segment') {
        commands.push({
          kind: object.visible === false ? 'supportSegment' : 'segmentObject',
          id: object.id,
          through: object.through.slice(),
          visible: object.visible !== false,
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
          visible: false,
        });
      }
    }

    const pending = plan.commands
      .filter(command => command.kind === 'constructedPoint' || (command.kind === 'point' && command.on) || command.kind === 'supportSegment' || command.kind === 'segmentObject')
      .slice();
    let madeProgress = true;
    while (pending.length > 0 && madeProgress) {
      madeProgress = false;
      for (let index = 0; index < pending.length; index += 1) {
        const command = pending[index];
        if (command.kind === 'constructedPoint') {
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
