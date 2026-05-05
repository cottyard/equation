(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GeometryCompilerGclc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function compileSceneToGclc(scene) {
    const lines = [
      `// ${scene.id}: ${scene.title}`,
      'dim 800 520',
    ];

    for (const object of scene.objects) {
      if (object.type === 'point') {
        lines.push(`point ${object.id} ${object.fixed[0]} ${object.fixed[1]}`);
      } else if (object.type === 'line') {
        lines.push(`line ${object.id} ${object.through[0]} ${object.through[1]}`);
      } else if (object.type === 'segment') {
        lines.push(`segment ${object.id} ${object.through[0]} ${object.through[1]}`);
      } else if (object.type === 'circle') {
        lines.push(`circle ${object.id} ${object.center} ${object.radius || object.through}`);
      } else if (object.type === 'function') {
        lines.push(`function ${object.id} ${object.equation}`);
      }
    }

    for (const object of scene.objects) {
      if (object.type === 'point' && object.on) {
        lines.push(`online ${object.id} ${object.on}`);
      }
      if (object.type === 'point' && object.onLine) {
        lines.push(`collinear ${object.onLine[0]} ${object.id} ${object.onLine[1]}`);
      }
    }

    for (const segment of scene.view.visibleSegments) {
      if (segment.length === 2) {
        lines.push(`drawsegment ${segment[0]} ${segment[1]}`);
      }
    }

    for (const label of scene.view.labels) {
      lines.push(`cmark_lt ${label}`);
    }

    for (const constraint of scene.constraints) {
      lines.push(`prove { ${formatConstraint(constraint)} }`);
    }

    return `${lines.join('\n')}\n`;
  }

  function formatConstraint(constraint) {
    if (constraint.type === 'midpoint') {
      return [
        constraint.type,
        ...(constraint.args || []),
      ].join(' ');
    }
    if (constraint.type === 'equalLength') {
      return [
        constraint.type,
        ...(constraint.args || []),
      ].join(' ');
    }
    if (constraint.type === 'segmentLength') {
      return [
        constraint.type,
        ...(constraint.args || []),
        constraint.length,
      ].join(' ');
    }
    if (constraint.type === 'lengthRatio') {
      return [
        constraint.type,
        ...(constraint.args || []),
        constraint.ratio,
      ].join(' ');
    }
    if (constraint.type === 'pointOnInverse') {
      return [
        constraint.type,
        ...(constraint.args || []),
        constraint.k,
      ].join(' ');
    }
    if (constraint.type === 'pointOnLineEquation') {
      return [
        constraint.type,
        ...(constraint.args || []),
        'slope',
        constraint.slope,
        'intercept',
        constraint.interceptPoint || constraint.intercept || 0,
      ].join(' ');
    }
    if (constraint.type === 'pointOnParabola') {
      return [
        constraint.type,
        ...(constraint.args || []),
        constraint.parabola.a,
        constraint.parabola.b,
        constraint.parabola.c || 0,
      ].join(' ');
    }
    if (constraint.type === 'rightTriangle30_60') {
      return [
        constraint.type,
        ...(constraint.triangle || []),
        'rightAt',
        constraint.rightAt,
        'short',
        constraint.shortLeg,
        'long',
        constraint.longLeg,
      ].join(' ');
    }
    if (constraint.type === 'isoscelesRightTriangle') {
      return [
        constraint.type,
        ...(constraint.triangle || []),
        'rightAt',
        constraint.rightAt,
        'equal',
        ...(constraint.equalLegs || []),
      ].join(' ');
    }
    if (constraint.type === 'angleDegrees') {
      return [
        constraint.type,
        ...(constraint.points || []),
        constraint.degrees,
      ].join(' ');
    }
    return `${constraint.type} ${constraint.args.join(' ')}`;
  }

  return {
    compileSceneToGclc,
  };
});
