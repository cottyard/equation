(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.FigureModels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const EPSILON = 1e-9;
  const q2Profile = [
    [0, 0],
    [5.2, 0],
    [5.2, 2.0],
    [4.15, 2.0],
    [4.55, 3.25],
    [0.65, 3.25],
    [1.05, 2.0],
    [0, 2.0],
  ];
  const q2Depth = 1.18;
  const q2Vertices = Object.fromEntries(q2Profile.flatMap((point, index) => ([
    [`F${index}`, [point[0], point[1], 0]],
    [`B${index}`, [point[0], point[1], q2Depth]],
  ])));

  const models = {
    'q2-mortise': {
      id: 'q2-mortise',
      type: 'projection-choice',
      object: {
        kind: 'extruded-dovetail-prism',
        depth: q2Depth,
        vertices: q2Vertices,
        faces: [
          { id: 'left-wall', vertices: ['B0', 'F0', 'F7', 'B7'], shade: 'side' },
          { id: 'left-shoulder', vertices: ['B7', 'F7', 'F6', 'B6'], shade: 'top' },
          { id: 'left-dovetail-slope', vertices: ['B6', 'F6', 'F5', 'B5'], shade: 'side' },
          { id: 'top-tenon', vertices: ['B5', 'F5', 'F4', 'B4'], shade: 'top' },
          { id: 'right-dovetail-slope', vertices: ['B4', 'F4', 'F3', 'B3'], shade: 'side' },
          { id: 'right-shoulder', vertices: ['B3', 'F3', 'F2', 'B2'], shade: 'top' },
          { id: 'front-dovetail', vertices: ['F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'], shade: 'front' },
        ],
        edges: [
          { from: 'F0', to: 'B0', role: 'depth' },
          { from: 'F7', to: 'B7', role: 'depth' },
          { from: 'F6', to: 'B6', role: 'depth' },
          { from: 'F5', to: 'B5', role: 'depth' },
          { from: 'F4', to: 'B4', role: 'depth' },
          { from: 'F3', to: 'B3', role: 'depth' },
          { from: 'F2', to: 'B2', role: 'depth' },
        ],
        projection: { depthVector: [-0.72, -0.45], displayScale: [0.55, 1] },
      },
      frontView: {
        optionId: 'C',
        profile: q2Profile,
      },
      options: [
        { id: 'A', label: 'A', kind: 'stepped-notch' },
        { id: 'B', label: 'B', kind: 'side-rectangle' },
        { id: 'C', label: 'C', kind: 'dovetail-front' },
        { id: 'D', label: 'D', kind: 'hidden-side' },
      ],
    },

    'q13-tile': {
      id: 'q13-tile',
      type: 'area-probability',
      gridSize: 4,
      shadedRegions: [
        { id: 'corner-nw', points: [[0, 0], [1, 0], [0, 1]] },
        { id: 'corner-ne', points: [[3, 0], [4, 0], [4, 1]] },
        { id: 'corner-sw', points: [[0, 3], [1, 4], [0, 4]] },
        { id: 'corner-se', points: [[3, 4], [4, 3], [4, 4]] },
        { id: 'center-n', points: [[1.5, 1.5], [2, 1], [2.5, 1.5], [2, 2]] },
        { id: 'center-s', points: [[1.5, 2.5], [2, 2], [2.5, 2.5], [2, 3]] },
        { id: 'center-w', points: [[1, 2], [1.5, 1.5], [2, 2], [1.5, 2.5]] },
        { id: 'center-e', points: [[2, 2], [2.5, 1.5], [3, 2], [2.5, 2.5]] },
      ],
      samples: [
        { id: 'corner', point: [0.2, 0.2] },
        { id: 'center', point: [2, 1.5] },
      ],
    },

    'q15-magic-square': {
      id: 'q15-magic-square',
      type: 'magic-square',
      size: 3,
      visibleCells: [
        { symbol: 'a', row: 0, col: 0 },
        { symbol: 'b', row: 1, col: 2 },
        { symbol: 'c', row: 2, col: 1 },
      ],
    },

    'q21-bmi-charts': {
      id: 'q21-bmi-charts',
      type: 'statistics-chart',
      groups: [
        { id: 'A', label: 'A', bmiRange: 'BMI<=18.5', count: null, renderedBar: null },
        { id: 'B', label: 'B', bmiRange: '18.5<BMI<=24.0', count: 36, renderedBar: 36 },
        { id: 'C', label: 'C', bmiRange: '24.0<BMI<=28.0', count: 9, renderedBar: 9 },
        { id: 'D', label: 'D', bmiRange: 'BMI>28.0', count: 3, renderedBar: 3, piePercent: 5 },
      ],
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getFigureModel(id) {
    if (!models[id]) {
      throw new Error(`Unknown figure model: ${id}`);
    }
    return clone(models[id]);
  }

  function projectPoint(point, projection) {
    const vector = projection.depthVector || [-0.72, -0.45];
    const scale = projection.displayScale || [1, 1];
    return [
      point[0] * scale[0] + vector[0] * point[2],
      -point[1] * scale[1] + vector[1] * point[2],
    ];
  }

  function projectSolid(model) {
    if (!model || !model.object || !model.object.vertices) {
      throw new Error('projectSolid requires a 3D figure model');
    }
    const vertices = Object.fromEntries(Object.entries(model.object.vertices).map(([id, point]) => (
      [id, projectPoint(point, model.object.projection || {})]
    )));
    return {
      id: model.id,
      kind: model.object.kind,
      vertices,
      faces: model.object.faces.map(face => ({
        ...face,
        points: face.vertices.map(vertex => vertices[vertex]),
      })),
      edges: model.object.edges.map(edge => ({
        ...edge,
        fromPoint: vertices[edge.from],
        toPoint: vertices[edge.to],
      })),
    };
  }

  function polygonArea(points) {
    let area = 0;
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      area += current[0] * next[1] - current[1] * next[0];
    }
    return Math.abs(area) / 2;
  }

  function pointOnSegment(point, a, b) {
    const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
    if (Math.abs(cross) > EPSILON) return false;
    const dot = (point[0] - a[0]) * (point[0] - b[0]) + (point[1] - a[1]) * (point[1] - b[1]);
    return dot <= EPSILON;
  }

  function pointInPolygon(point, polygon) {
    for (let index = 0; index < polygon.length; index += 1) {
      if (pointOnSegment(point, polygon[index], polygon[(index + 1) % polygon.length])) {
        return false;
      }
    }

    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
      const xi = polygon[index][0];
      const yi = polygon[index][1];
      const xj = polygon[previous][0];
      const yj = polygon[previous][1];
      const intersects = ((yi > point[1]) !== (yj > point[1]))
        && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function pointInTileShading(model, point) {
    return model.shadedRegions.some(region => pointInPolygon(point, region.points));
  }

  function computeTileProbability(model) {
    const totalArea = model.gridSize * model.gridSize;
    const shadedArea = model.shadedRegions.reduce((sum, region) => sum + polygonArea(region.points), 0);
    return {
      totalArea,
      shadedArea,
      probability: shadedArea / totalArea,
    };
  }

  function buildMagicConstraints(size) {
    const sumIndex = size * size;
    const constraints = [];
    const addLine = (id, cells) => {
      const row = Array(sumIndex + 1).fill(0);
      cells.forEach(([r, c]) => {
        row[r * size + c] = 1;
      });
      row[sumIndex] = -1;
      constraints.push({ id, row });
    };

    for (let r = 0; r < size; r += 1) {
      addLine(`row${r + 1}`, Array.from({ length: size }, (_, c) => [r, c]));
    }
    for (let c = 0; c < size; c += 1) {
      addLine(`column${c + 1}`, Array.from({ length: size }, (_, r) => [r, c]));
    }
    addLine('diagonal1', Array.from({ length: size }, (_, index) => [index, index]));
    addLine('diagonal2', Array.from({ length: size }, (_, index) => [index, size - 1 - index]));
    return constraints;
  }

  function rref(matrix) {
    const result = matrix.map(row => row.slice());
    const pivots = [];
    let pivotRow = 0;
    const rowCount = result.length;
    const colCount = result[0] ? result[0].length : 0;

    for (let col = 0; col < colCount && pivotRow < rowCount; col += 1) {
      let selected = pivotRow;
      for (let row = pivotRow + 1; row < rowCount; row += 1) {
        if (Math.abs(result[row][col]) > Math.abs(result[selected][col])) selected = row;
      }
      if (Math.abs(result[selected][col]) < EPSILON) continue;

      [result[pivotRow], result[selected]] = [result[selected], result[pivotRow]];
      const divisor = result[pivotRow][col];
      for (let c = col; c < colCount; c += 1) {
        result[pivotRow][c] /= divisor;
      }
      for (let row = 0; row < rowCount; row += 1) {
        if (row === pivotRow) continue;
        const factor = result[row][col];
        if (Math.abs(factor) < EPSILON) continue;
        for (let c = col; c < colCount; c += 1) {
          result[row][c] -= factor * result[pivotRow][c];
        }
      }
      pivots.push(col);
      pivotRow += 1;
    }

    return { matrix: result, pivots };
  }

  function nullspace(matrix) {
    const colCount = matrix[0] ? matrix[0].length : 0;
    const reduced = rref(matrix);
    const pivotSet = new Set(reduced.pivots);
    const freeCols = Array.from({ length: colCount }, (_, index) => index).filter(index => !pivotSet.has(index));
    return freeCols.map(freeCol => {
      const vector = Array(colCount).fill(0);
      vector[freeCol] = 1;
      reduced.pivots.forEach((pivotCol, row) => {
        vector[pivotCol] = -reduced.matrix[row][freeCol];
      });
      return vector;
    });
  }

  function greatestCommonDivisor(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return x || 1;
  }

  function normalizeIntegerCoefficients(coefficients) {
    const rounded = coefficients.map(value => Math.round(value));
    const divisor = rounded.reduce((gcd, value) => greatestCommonDivisor(gcd, value), 0) || 1;
    let normalized = rounded.map(value => value / divisor);
    const first = normalized.find(value => value !== 0);
    if (first < 0) {
      normalized = normalized.map(value => -value);
    }
    return normalized;
  }

  function formatTerm(coefficient, symbol) {
    if (coefficient === 1) return symbol;
    return `${coefficient}${symbol}`;
  }

  function formatRelation(symbols, coefficients) {
    const left = [];
    const right = [];
    coefficients.forEach((coefficient, index) => {
      if (coefficient > 0) left.push(formatTerm(coefficient, symbols[index]));
      if (coefficient < 0) right.push(formatTerm(-coefficient, symbols[index]));
    });
    return `${left.join('+')}=${right.join('+')}`;
  }

  function deriveMagicSquareRelation(model) {
    const size = model.size;
    const constraints = buildMagicConstraints(size);
    const visible = model.visibleCells.map(cell => ({
      ...cell,
      columnIndex: cell.row * size + cell.col,
    }));
    const visibleColumns = new Set(visible.map(cell => cell.columnIndex));
    const hiddenColumns = Array.from({ length: size * size + 1 }, (_, index) => index)
      .filter(index => !visibleColumns.has(index));
    const hiddenMatrix = hiddenColumns.map(col => constraints.map(constraint => constraint.row[col]));
    const combinations = nullspace(hiddenMatrix);

    for (const combination of combinations) {
      const coefficients = visible.map(cell => constraints.reduce((sum, constraint, index) => (
        sum + combination[index] * constraint.row[cell.columnIndex]
      ), 0));
      if (coefficients.some(value => Math.abs(value) > EPSILON)) {
        const integerCoefficients = normalizeIntegerCoefficients(coefficients);
        return {
          coefficients: Object.fromEntries(visible.map((cell, index) => [cell.symbol, integerCoefficients[index]])),
          normalized: formatRelation(visible.map(cell => cell.symbol), integerCoefficients),
          sourceLines: constraints.map(constraint => constraint.id),
        };
      }
    }

    return {
      coefficients: {},
      normalized: '',
      sourceLines: [],
    };
  }

  function computeBmiSummary(model) {
    const knownTotalGroup = model.groups.find(group => typeof group.count === 'number' && typeof group.piePercent === 'number');
    const total = knownTotalGroup ? Math.round(knownTotalGroup.count / (knownTotalGroup.piePercent / 100)) : null;
    const knownCount = model.groups.reduce((sum, group) => sum + (typeof group.count === 'number' ? group.count : 0), 0);
    const missingGroups = model.groups.filter(group => group.count === null);
    const missing = {};
    if (total !== null && missingGroups.length === 1) {
      missing[missingGroups[0].id] = total - knownCount;
    }

    const counts = {};
    model.groups.forEach(group => {
      counts[group.id] = typeof group.count === 'number' ? group.count : missing[group.id];
    });

    const percentages = {};
    if (total) {
      Object.entries(counts).forEach(([id, count]) => {
        percentages[id] = count / total * 100;
      });
    }

    return {
      total,
      counts,
      missing,
      percentages,
      renderedBars: Object.fromEntries(model.groups.map(group => [group.id, group.renderedBar])),
    };
  }

  function verifyFigureModel(model) {
    const failures = [];
    if (model.type === 'projection-choice') {
      if (!model.options.some(option => option.id === model.frontView.optionId)) {
        failures.push({ type: 'frontViewOption' });
      }
      if (model.object.kind !== 'extruded-dovetail-prism') {
        failures.push({ type: 'solidKind' });
      }
      if (!model.object.vertices || Object.keys(model.object.vertices).length < 16) {
        failures.push({ type: 'solidVertices' });
      }
      if (!model.object.faces.some(face => face.id === 'front-dovetail')) {
        failures.push({ type: 'frontDovetailFace' });
      }
      if (!model.object.edges.some(edge => edge.role === 'depth')) {
        failures.push({ type: 'depthEdges' });
      }
    } else if (model.type === 'area-probability') {
      const probability = computeTileProbability(model);
      if (Math.abs(probability.totalArea - 16) > EPSILON) failures.push({ type: 'tileTotalArea' });
      if (Math.abs(probability.shadedArea - 4) > EPSILON) failures.push({ type: 'tileShadedArea' });
      for (const sample of model.samples) {
        if (!pointInTileShading(model, sample.point)) {
          failures.push({ type: 'tileSample', sample: sample.id });
        }
      }
    } else if (model.type === 'magic-square') {
      const relation = deriveMagicSquareRelation(model);
      if (relation.normalized !== '2a=b+c') failures.push({ type: 'magicRelation', relation: relation.normalized });
    } else if (model.type === 'statistics-chart') {
      const summary = computeBmiSummary(model);
      if (summary.total !== 60) failures.push({ type: 'bmiTotal', total: summary.total });
      if (summary.missing.A !== 12) failures.push({ type: 'bmiMissingA', value: summary.missing.A });
      if (Math.abs(summary.percentages.B - 60) > EPSILON) failures.push({ type: 'bmiPercentB', value: summary.percentages.B });
    } else {
      failures.push({ type: 'unknownModelType', modelType: model.type });
    }

    return {
      ok: failures.length === 0,
      failures,
    };
  }

  return {
    computeBmiSummary,
    computeTileProbability,
    deriveMagicSquareRelation,
    getFigureModel,
    pointInTileShading,
    polygonArea,
    projectSolid,
    verifyFigureModel,
  };
});
