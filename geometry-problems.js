(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GeometryProblems = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const q5G = [3.25, 0];
  const q5Angle1Radians = 50 * Math.PI / 180;
  const q5RayDirection = [-Math.cos(q5Angle1Radians), -Math.sin(q5Angle1Radians)];
  const q5NormalDirection = [-q5RayDirection[1], q5RayDirection[0]];
  const q5SetSquareLongLeg = 1.65;
  const q5FTrackLength = 3.45;
  const q5TargetY = -4;
  const q5F = [
    q5G[0] + q5SetSquareLongLeg * q5RayDirection[0],
    q5G[1] + q5SetSquareLongLeg * q5RayDirection[1],
  ];
  const q5FTrackEnd = [
    q5G[0] + q5FTrackLength * q5RayDirection[0],
    q5G[1] + q5FTrackLength * q5RayDirection[1],
  ];
  const q5SetSquareShortLeg = q5SetSquareLongLeg / Math.sqrt(3);
  const q5E = [
    q5G[0] + q5SetSquareShortLeg * q5NormalDirection[0],
    q5G[1] + q5SetSquareShortLeg * q5NormalDirection[1],
  ];
  const q5IsoscelesLegLength = (q5TargetY - q5F[1]) / (q5RayDirection[1] + q5NormalDirection[1]);
  const q5M = [
    q5F[0] + q5IsoscelesLegLength * q5RayDirection[0],
    q5F[1] + q5IsoscelesLegLength * q5RayDirection[1],
  ];
  const q5ConstructedN = [
    q5M[0] + q5IsoscelesLegLength * q5NormalDirection[0],
    q5M[1] + q5IsoscelesLegLength * q5NormalDirection[1],
  ];

  const problems = {
    'q5-parallel-board': {
      id: 'q5-parallel-board',
      title: '第5题 平行线间三角板位置图',
      viewport: { xmin: -0.8, xmax: 8.8, ymin: -4.8, ymax: 0.9 },
      objects: [
        { id: 'A', type: 'point', fixed: [0, 0] },
        { id: 'B', type: 'point', fixed: [8, 0] },
        { id: 'C', type: 'point', fixed: [0, -4] },
        { id: 'D', type: 'point', fixed: [8, -4] },
        { id: 'AB', type: 'line', through: ['A', 'B'] },
        { id: 'CD', type: 'line', through: ['C', 'D'] },
        { id: 'G', type: 'point', fixed: q5G, draggable: true, on: 'AB' },
        { id: 'FTrackEnd', type: 'point', fixed: q5FTrackEnd, visible: false, construct: { type: 'pointOnRay', from: 'G', reference: 'A', angleDegrees: 50, orientation: 'counterclockwise', length: q5FTrackLength } },
        { id: 'FTrack', type: 'segment', through: ['G', 'FTrackEnd'], visible: false },
        { id: 'F', type: 'point', fixed: q5F, draggable: true, on: 'FTrack' },
        { id: 'E', type: 'point', fixed: q5E, construct: { type: 'rightTriangle30_60Vertex', rightAt: 'G', longLegTo: 'F', rotate: 'counterclockwise' } },
        { id: 'M', type: 'point', fixed: q5M, construct: { type: 'isoscelesRightTriangleRightVertexOnRay', legTo: 'F', rayStart: 'G', targetLineThrough: ['C', 'D'], rotate: 'clockwise' }, onLine: ['G', 'F'] },
        { id: 'N', type: 'point', fixed: q5ConstructedN, construct: { type: 'isoscelesRightTriangleVertex', rightAt: 'M', legTo: 'F', rotate: 'clockwise' }, on: 'CD' },
      ],
      constraints: [
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'pointOn', args: ['G', 'AB'] },
        { type: 'pointOn', args: ['N', 'CD'] },
        { type: 'angleDegrees', points: ['A', 'G', 'F'], degrees: 50 },
        { type: 'collinear', args: ['G', 'F', 'M'] },
        { type: 'pointBetween', args: ['F', 'G', 'M'] },
        { type: 'perpendicular', args: ['MF', 'MN'] },
        { type: 'rightTriangle30_60', triangle: ['E', 'F', 'G'], rightAt: 'G', shortLeg: 'GE', longLeg: 'GF' },
        { type: 'isoscelesRightTriangle', triangle: ['F', 'M', 'N'], rightAt: 'M', equalLegs: ['MF', 'MN'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'G', 'F', 'E', 'M', 'N'],
        visibleSegments: ['AB', 'CD', 'GF', 'GE', 'FE', 'GM', 'MF', 'MN', 'FN'],
        angleMarkers: [
          { id: 'angle1', at: 'G', from: 'A', to: 'F', label: '1' },
          { id: 'rightG', at: 'G', from: 'F', to: 'E', right: true },
          { id: 'angle2', at: 'N', from: 'M', to: 'C', label: '2' },
          { id: 'rightM', at: 'M', from: 'F', to: 'N', right: true },
        ],
        circles: [],
      },
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getGeometryProblem(id) {
    if (!problems[id]) {
      throw new Error(`Unknown geometry problem: ${id}`);
    }
    return clone(problems[id]);
  }

  return {
    getGeometryProblem,
    problems,
  };
});
