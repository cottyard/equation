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
