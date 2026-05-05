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
  const q25E = [-1.2, Math.sqrt(9 - 1.2 * 1.2)];
  const q25TangentGuide = [
    q25E[0] - q25E[1] / 3 * 4,
    q25E[1] + q25E[0] / 3 * 4,
  ];
  const q25D = [
    2,
    q25E[1] / (q25E[0] + 3) * 5,
  ];
  const q25F = [
    2,
    q25E[1] + (-q25E[0] / q25E[1]) * (2 - q25E[0]),
  ];
  const q23C = [18, 0];
  const q23E = [q23C[0] + 16, 0];
  const q23D = [q23C[0], 1.5];
  const q23F = [q23E[0], 1.5];
  const q23DLeft = [q23D[0] - 38, q23D[1]];
  const q23FLeft = [q23F[0] - 38, q23F[1]];
  const q23CGuide = [
    q23D[0] + Math.cos((180 - 42) * Math.PI / 180) * 10,
    q23D[1] + Math.sin(42 * Math.PI / 180) * 10,
  ];
  const q23EGuide = [
    q23F[0] + Math.cos((180 - 30) * Math.PI / 180) * 10,
    q23F[1] + Math.sin((180 - 30) * Math.PI / 180) * 10,
  ];
  const q23Tan42 = Math.tan(42 * Math.PI / 180);
  const q23Tan30 = Math.tan(30 * Math.PI / 180);
  const q23Ax = (q23F[1] - q23D[1] + q23Tan42 * q23D[0] - q23Tan30 * q23F[0]) / (q23Tan42 - q23Tan30);
  const q23Ay = q23D[1] + q23Tan42 * (q23D[0] - q23Ax);
  const q23A = [q23Ax, q23Ay];
  const q27EParameter = 0.62;
  const q27A = [0, 0];
  const q27B = [4, 0];
  const q27C = [4, 4];
  const q27D = [0, 4];
  const q27E = [4, 4 * q27EParameter];
  const q27F = [4 * (1 - q27EParameter), 4];

  const q27RectA = [0, 0];
  const q27RectB = [5, 0];
  const q27RectD = [0, 3];
  const q27RectC = [5, 3];
  const q27RectE = [5, 1.5];
  const q27RectG = [4.587155963302752, 1.3761467889908259];
  const q27RectF = [4.1, 3];
  const q27RectM = [4.237288135593221, 0];

  const q16A = [0, 0];
  const q16C = [8.485281374238571, 0];
  const q16B = [3.181980515339462, -2.80624304008045];
  const q16D = [5.303300858899109, 2.80624304008045];
  const q16E = [4.242640687119279, 0];
  const q16F = [6.363961030678934, 5.612486080160908];
  const q16G = [2.1213203435596535, 5.612486080160908];

  const q24Slope = -2 / 3;
  const q24K = -6;
  const q24TranslatedIntercept = 4;
  const q24Intersection = branch => {
    const discriminant = q24TranslatedIntercept * q24TranslatedIntercept - 4 * q24Slope * -q24K;
    const root = Math.sqrt(discriminant);
    const roots = [
      (-q24TranslatedIntercept + root) / (2 * q24Slope),
      (-q24TranslatedIntercept - root) / (2 * q24Slope),
    ];
    const x = branch === 'positive' ? roots.find(value => value > 0) : roots.find(value => value < 0);
    return [x, q24Slope * x + q24TranslatedIntercept];
  };
  const q24C = q24Intersection('positive');
  const q24D = q24Intersection('negative');
  const q26C1 = { a: -0.5, b: 5, c: 0 };
  const q26C2 = { a: -0.5, b: 0, c: 40 };
  const q26T = 2;
  const q26FixedA = [10 - q26T, 0];
  const q26FixedC = [q26T, q26C1.a * q26T * q26T + q26C1.b * q26T];
  const q26FixedD = [q26FixedA[0], q26FixedC[1]];
  const q26M = [5, q26C1.a * 25 + q26C1.b * 5];
  const q26N = [-5, q26C2.a * 25 + q26C2.b * -5 + q26C2.c];

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
    'q20-medians': {
      id: 'q20-medians',
      title: '第20题 等腰三角形中线图',
      viewport: { xmin: -3.2, xmax: 3.2, ymin: -0.6, ymax: 4.6 },
      objects: [
        { id: 'AxisBottom', type: 'point', fixed: [0, -0.2], visible: false },
        { id: 'AxisTop', type: 'point', fixed: [0, 4.4], visible: false },
        { id: 'Axis', type: 'line', through: ['AxisBottom', 'AxisTop'] },
        { id: 'A', type: 'point', fixed: [0, 3.7], draggable: true, on: 'Axis' },
        { id: 'B', type: 'point', fixed: [-2.25, 0], draggable: true },
        { id: 'C', type: 'point', fixed: [2.25, 0], construct: { type: 'mirrorPoint', point: 'B', axisThrough: ['AxisBottom', 'AxisTop'] } },
        { id: 'D', type: 'point', fixed: [-1.125, 1.85], construct: { type: 'midpoint', between: ['A', 'B'] } },
        { id: 'E', type: 'point', fixed: [1.125, 1.85], construct: { type: 'midpoint', between: ['A', 'C'] } },
      ],
      constraints: [
        { type: 'pointOn', args: ['A', 'Axis'] },
        { type: 'equalLength', args: ['AB', 'AC'] },
        { type: 'midpoint', args: ['D', 'A', 'B'] },
        { type: 'midpoint', args: ['E', 'A', 'C'] },
        { type: 'equalLength', args: ['BE', 'CD'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'E'],
        visibleSegments: ['AB', 'AC', 'BC', 'BE', 'CD'],
        angleMarkers: [],
        circles: [],
      },
    },
    'q7-rhombus': {
      id: 'q7-rhombus',
      title: '第7题 菱形与辅助线',
      viewport: { xmin: -7.1, xmax: 7.1, ymin: -4.4, ymax: 4 },
      objects: [
        { id: 'O', type: 'point', fixed: [0, 0], draggable: true },
        { id: 'ACCircle', type: 'circle', center: 'O', radius: 3, visible: false },
        { id: 'A', type: 'point', fixed: [0, 3], draggable: true, on: 'ACCircle' },
        { id: 'C', type: 'point', fixed: [0, -3], construct: { type: 'pointReflection', point: 'A', center: 'O' } },
        { id: 'B', type: 'point', fixed: [6, 0], construct: { type: 'perpendicularPointAtDistance', from: 'O', reference: 'A', distance: 6, rotate: 'clockwise' } },
        { id: 'D', type: 'point', fixed: [-6, 0], construct: { type: 'pointReflection', point: 'B', center: 'O' } },
        { id: 'F', type: 'point', fixed: [0, -1], construct: { type: 'ratioPoint', from: 'O', to: 'C', ratio: 1 / 3 } },
        { id: 'ParallelGuide', type: 'point', fixed: [-6, -4], visible: false, construct: { type: 'parallelPoint', from: 'F', parallelTo: ['B', 'C'] } },
        { id: 'E', type: 'point', fixed: [4, 1], construct: { type: 'lineIntersection', first: ['A', 'B'], second: ['F', 'ParallelGuide'] } },
      ],
      constraints: [
        { type: 'segmentLength', args: ['AC'], length: 6 },
        { type: 'segmentLength', args: ['BD'], length: 12 },
        { type: 'perpendicular', args: ['AC', 'BD'] },
        { type: 'midpoint', args: ['O', 'A', 'C'] },
        { type: 'midpoint', args: ['O', 'B', 'D'] },
        { type: 'collinear', args: ['O', 'F', 'C'] },
        { type: 'pointBetween', args: ['F', 'O', 'C'] },
        { type: 'lengthRatio', args: ['CF', 'OF'], ratio: 2 },
        { type: 'collinear', args: ['A', 'E', 'B'] },
        { type: 'parallel', args: ['EF', 'BC'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'O', 'F', 'E'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA', 'AC', 'BD', 'EF'],
        angleMarkers: [],
        circles: [],
      },
    },
    'q25-circle': {
      id: 'q25-circle',
      title: '第25题 圆与切线图',
      viewport: { xmin: -5.4, xmax: 4.3, ymin: -1.1, ymax: 8.4 },
      objects: [
        { id: 'O', type: 'point', fixed: [0, 0] },
        { id: 'A', type: 'point', fixed: [-3, 0] },
        { id: 'B', type: 'point', fixed: [3, 0] },
        { id: 'CircleO', type: 'circle', center: 'O', radius: 3, visible: true },
        { id: 'E', type: 'point', fixed: q25E, draggable: true, on: 'CircleO' },
        { id: 'C', type: 'point', fixed: [2, 0], construct: { type: 'ratioPoint', from: 'O', to: 'B', ratio: 2 / 3 } },
        { id: 'VerticalGuide', type: 'point', fixed: [2, 3], visible: false, construct: { type: 'perpendicularPoint', from: 'C', perpendicularTo: ['A', 'B'], length: 3, rotate: 'counterclockwise' } },
        { id: 'TangentGuide', type: 'point', fixed: q25TangentGuide, visible: false, construct: { type: 'perpendicularPoint', from: 'E', perpendicularTo: ['O', 'E'], length: 4, rotate: 'counterclockwise' } },
        { id: 'D', type: 'point', fixed: q25D, construct: { type: 'lineIntersection', first: ['A', 'E'], second: ['C', 'VerticalGuide'] } },
        { id: 'F', type: 'point', fixed: q25F, construct: { type: 'lineIntersection', first: ['E', 'TangentGuide'], second: ['C', 'VerticalGuide'] } },
      ],
      constraints: [
        { type: 'midpoint', args: ['O', 'A', 'B'] },
        { type: 'segmentLength', args: ['OA'], length: 3 },
        { type: 'segmentLength', args: ['OB'], length: 3 },
        { type: 'segmentLength', args: ['OE'], length: 3 },
        { type: 'collinear', args: ['O', 'C', 'B'] },
        { type: 'lengthRatio', args: ['OC', 'CB'], ratio: 2 },
        { type: 'perpendicular', args: ['AB', 'CD'] },
        { type: 'collinear', args: ['A', 'E', 'D'] },
        { type: 'collinear', args: ['C', 'D', 'F'] },
        { type: 'perpendicular', args: ['OE', 'EF'] },
      ],
      view: {
        labels: ['A', 'B', 'O', 'C', 'D', 'E', 'F'],
        visibleSegments: ['AB', 'CD', 'AE', 'DE', 'EF'],
        angleMarkers: [
          { id: 'rightC', at: 'C', from: 'B', to: 'D', right: true, size: 0.18 },
        ],
        circles: [],
      },
    },
    'q23-measurement': {
      id: 'q23-measurement',
      title: '第23题 纪念碑高度测量示意图',
      viewport: { xmin: -13, xmax: 39, ymin: -1.5, ymax: 29.5 },
      objects: [
        { id: 'GroundLeft', type: 'point', fixed: [0, 0], visible: false },
        { id: 'GroundRight', type: 'point', fixed: [38, 0], visible: false },
        { id: 'Ground', type: 'line', through: ['GroundLeft', 'GroundRight'] },
        { id: 'C', type: 'point', fixed: q23C, draggable: true, on: 'Ground' },
        { id: 'E', type: 'point', fixed: q23E, construct: { type: 'pointOnRay', from: 'C', reference: 'GroundRight', angleDegrees: 0, orientation: 'counterclockwise', length: 16 } },
        { id: 'D', type: 'point', fixed: q23D, construct: { type: 'perpendicularPoint', from: 'C', perpendicularTo: ['GroundLeft', 'GroundRight'], length: 1.5, rotate: 'counterclockwise' } },
        { id: 'F', type: 'point', fixed: q23F, construct: { type: 'perpendicularPoint', from: 'E', perpendicularTo: ['GroundLeft', 'GroundRight'], length: 1.5, rotate: 'counterclockwise' } },
        { id: 'DLeft', type: 'point', fixed: q23DLeft, visible: false, construct: { type: 'parallelPoint', from: 'D', parallelTo: ['GroundRight', 'GroundLeft'] } },
        { id: 'FLeft', type: 'point', fixed: q23FLeft, visible: false, construct: { type: 'parallelPoint', from: 'F', parallelTo: ['GroundRight', 'GroundLeft'] } },
        { id: 'CSightGuide', type: 'point', fixed: q23CGuide, visible: false, construct: { type: 'pointOnRay', from: 'D', reference: 'DLeft', angleDegrees: 42, orientation: 'clockwise', length: 10 } },
        { id: 'ESightGuide', type: 'point', fixed: q23EGuide, visible: false, construct: { type: 'pointOnRay', from: 'F', reference: 'FLeft', angleDegrees: 30, orientation: 'clockwise', length: 10 } },
        { id: 'A', type: 'point', fixed: q23A, construct: { type: 'lineIntersection', first: ['D', 'CSightGuide'], second: ['F', 'ESightGuide'] } },
        { id: 'B', type: 'point', fixed: [q23A[0], 0], construct: { type: 'orthogonalProjection', point: 'A', lineThrough: ['GroundLeft', 'GroundRight'] } },
      ],
      constraints: [
        { type: 'pointOn', args: ['C', 'Ground'] },
        { type: 'segmentLength', args: ['CE'], length: 16 },
        { type: 'segmentLength', args: ['DC'], length: 1.5 },
        { type: 'segmentLength', args: ['FE'], length: 1.5 },
        { type: 'perpendicular', args: ['AB', 'BE'] },
        { type: 'perpendicular', args: ['DC', 'BE'] },
        { type: 'perpendicular', args: ['FE', 'BE'] },
        { type: 'angleDegrees', points: ['A', 'D', 'DLeft'], degrees: 42 },
        { type: 'angleDegrees', points: ['A', 'F', 'FLeft'], degrees: 30 },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F'],
        visibleSegments: ['BE', 'AB', 'DC', 'FE', 'DA', 'FA', 'CE'],
        angleMarkers: [
          { id: 'angle42', at: 'D', from: 'A', to: 'DLeft', label: '42°' },
          { id: 'angle30', at: 'F', from: 'A', to: 'FLeft', label: '30°' },
          { id: 'rightB', at: 'B', from: 'A', to: 'E', right: true, size: 0.45 },
          { id: 'rightC', at: 'C', from: 'D', to: 'E', right: true, size: 0.45 },
          { id: 'rightE', at: 'E', from: 'F', to: 'C', right: true, size: 0.45 },
        ],
        circles: [],
      },
    },
    'q27-golden-1': {
      id: 'q27-golden-1',
      title: '第27题 图1 正方形中的黄金分割关系',
      viewport: { xmin: -0.7, xmax: 4.8, ymin: -0.9, ymax: 4.7 },
      objects: [
        { id: 'A', type: 'point', fixed: q27A },
        { id: 'B', type: 'point', fixed: q27B },
        { id: 'C', type: 'point', fixed: q27C },
        { id: 'D', type: 'point', fixed: q27D },
        { id: 'BC', type: 'segment', through: ['B', 'C'], visible: false },
        { id: 'AB', type: 'segment', through: ['A', 'B'], visible: false },
        { id: 'E', type: 'point', fixed: q27E, draggable: true, on: 'BC' },
        { id: 'F', type: 'point', fixed: q27F, construct: { type: 'copyDistanceOnSegment', source: ['B', 'E'], target: ['D', 'C'], fromEnd: true } },
        { id: 'G', type: 'point', fixed: [2.889338341519792, 1.791389771742271], construct: { type: 'lineIntersection', first: ['A', 'E'], second: ['B', 'F'] } },
        { id: 'M', type: 'point', fixed: [1.988487702773417, 0], construct: { type: 'lineIntersection', first: ['C', 'G'], second: ['A', 'B'] } },
      ],
      constraints: [
        { type: 'segmentLength', args: ['AB'], length: 4 },
        { type: 'segmentLength', args: ['BC'], length: 4 },
        { type: 'perpendicular', args: ['AB', 'BC'] },
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'parallel', args: ['BC', 'AD'] },
        { type: 'equalLength', args: ['BE', 'CF'] },
        { type: 'perpendicular', args: ['AE', 'BF'] },
        { type: 'collinear', args: ['A', 'G', 'E'] },
        { type: 'collinear', args: ['B', 'G', 'F'] },
        { type: 'collinear', args: ['C', 'G', 'M'] },
        { type: 'pointBetween', args: ['M', 'A', 'B'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'M'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA', 'AE', 'BF', 'CG', 'GM'],
        angleMarkers: [
          { id: 'rightG', at: 'G', from: 'A', to: 'B', right: true, size: 0.16 },
        ],
        circles: [],
      },
    },
    'q27-golden-2': {
      id: 'q27-golden-2',
      title: '第27题 图2 矩形中的黄金分割关系',
      viewport: { xmin: -0.8, xmax: 5.8, ymin: -0.8, ymax: 3.8 },
      objects: [
        { id: 'B', type: 'point', fixed: q27RectB },
        { id: 'A', type: 'point', fixed: q27RectA, draggable: true },
        { id: 'D', type: 'point', fixed: q27RectD, draggable: true },
        { id: 'C', type: 'point', fixed: q27RectC, construct: { type: 'translatedPoint', from: 'D', vector: ['A', 'B'] } },
        { id: 'AB', type: 'segment', through: ['A', 'B'], visible: false },
        { id: 'CD', type: 'segment', through: ['C', 'D'], visible: false },
        { id: 'E', type: 'point', fixed: q27RectE, construct: { type: 'midpoint', between: ['B', 'C'] } },
        { id: 'G', type: 'point', fixed: q27RectG, construct: { type: 'orthogonalProjection', point: 'B', lineThrough: ['A', 'E'] } },
        { id: 'F', type: 'point', fixed: q27RectF, construct: { type: 'lineIntersection', first: ['B', 'G'], second: ['C', 'D'] } },
        { id: 'M', type: 'point', fixed: q27RectM, construct: { type: 'lineIntersection', first: ['C', 'G'], second: ['A', 'B'] } },
      ],
      constraints: [
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'parallel', args: ['BC', 'AD'] },
        { type: 'perpendicular', args: ['AB', 'BC'] },
        { type: 'midpoint', args: ['E', 'B', 'C'] },
        { type: 'perpendicular', args: ['AE', 'BF'] },
        { type: 'collinear', args: ['A', 'G', 'E'] },
        { type: 'collinear', args: ['B', 'G', 'F'] },
        { type: 'collinear', args: ['C', 'G', 'M'] },
        { type: 'pointBetween', args: ['M', 'A', 'B'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'M'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA', 'AE', 'BF', 'CG', 'GM'],
        angleMarkers: [
          { id: 'rightG', at: 'G', from: 'A', to: 'B', right: true, size: 0.14 },
        ],
        circles: [],
      },
    },
    'q16-rotation': {
      id: 'q16-rotation',
      title: '第16题 平行四边形旋转图',
      viewport: { xmin: -1.2, xmax: 10.2, ymin: -3.8, ymax: 6.8 },
      objects: [
        { id: 'A', type: 'point', fixed: q16A, draggable: true },
        { id: 'ACCircle', type: 'circle', center: 'A', radius: 8.485281374238571, visible: false },
        { id: 'C', type: 'point', fixed: q16C, draggable: true, on: 'ACCircle' },
        { id: 'E', type: 'point', fixed: q16E, construct: { type: 'ratioPoint', from: 'A', to: 'C', ratio: 0.5 } },
        { id: 'B', type: 'point', fixed: q16B, construct: { type: 'pointFromVectorBasis', origin: 'A', axisEnd: 'C', xRatio: 0.375, yRatio: -0.33071891388307384, orientation: 'counterclockwise' } },
        { id: 'D', type: 'point', fixed: q16D, construct: { type: 'pointFromVectorBasis', origin: 'A', axisEnd: 'C', xRatio: 0.625, yRatio: 0.33071891388307384, orientation: 'counterclockwise' } },
        { id: 'F', type: 'point', fixed: q16F, construct: { type: 'pointFromVectorBasis', origin: 'A', axisEnd: 'C', xRatio: 0.75, yRatio: 0.6614378277661477, orientation: 'counterclockwise' } },
        { id: 'G', type: 'point', fixed: q16G, construct: { type: 'pointFromVectorBasis', origin: 'A', axisEnd: 'C', xRatio: 0.25, yRatio: 0.6614378277661477, orientation: 'counterclockwise' } },
      ],
      constraints: [
        { type: 'segmentLength', args: ['AD'], length: 6 },
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'parallel', args: ['AD', 'BC'] },
        { type: 'parallel', args: ['AE', 'FG'] },
        { type: 'parallel', args: ['AG', 'EF'] },
        { type: 'collinear', args: ['A', 'E', 'C'] },
        { type: 'collinear', args: ['B', 'E', 'D'] },
        { type: 'collinear', args: ['E', 'D', 'F'] },
        { type: 'pointBetween', args: ['E', 'A', 'C'] },
        { type: 'equalLength', args: ['AB', 'AE'] },
        { type: 'equalLength', args: ['AD', 'AG'] },
        { type: 'equalLength', args: ['BC', 'EF'] },
        { type: 'equalLength', args: ['CD', 'FG'] },
      ],
      view: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA', 'AE', 'EF', 'FG', 'GA', 'AC', 'BD', 'DF'],
        angleMarkers: [],
        circles: [],
      },
    },
    'q24-functions': {
      id: 'q24-functions',
      title: '第24题 反比例函数与一次函数图像',
      viewport: { xmin: -7.2, xmax: 7.2, ymin: -5.2, ymax: 5.6 },
      objects: [
        { id: 'O', type: 'point', fixed: [0, 0] },
        { id: 'XAxisLeft', type: 'point', fixed: [-7, 0], visible: false },
        { id: 'XAxisRight', type: 'point', fixed: [7, 0], visible: false },
        { id: 'YAxisBottom', type: 'point', fixed: [0, -5], visible: false },
        { id: 'YAxisTop', type: 'point', fixed: [0, 5], visible: false },
        { id: 'XAxis', type: 'line', through: ['XAxisLeft', 'XAxisRight'], visible: true, axis: true },
        { id: 'YAxis', type: 'line', through: ['YAxisBottom', 'YAxisTop'], visible: true, axis: true },
        { id: 'YAxisTrack', type: 'segment', through: ['YAxisBottom', 'YAxisTop'], visible: false },
        { id: 'A', type: 'point', fixed: [-3, 2] },
        { id: 'B', type: 'point', fixed: [3, -2] },
        { id: 'E', type: 'point', fixed: [0, q24TranslatedIntercept], draggable: true, on: 'YAxisTrack' },
        { id: 'C', type: 'point', fixed: q24C, construct: { type: 'inverseLineIntersection', k: q24K, slope: q24Slope, interceptPoint: 'E', branch: 'positive' } },
        { id: 'D', type: 'point', fixed: q24D, construct: { type: 'inverseLineIntersection', k: q24K, slope: q24Slope, interceptPoint: 'E', branch: 'negative' } },
        { id: 'F', type: 'point', fixed: [6, 0], construct: { type: 'lineXIntercept', slope: q24Slope, interceptPoint: 'E' } },
        { id: 'Inverse', type: 'function', equation: 'inverse', k: q24K, range: [-7, -0.25] },
        { id: 'InversePositive', type: 'function', equation: 'inverse', k: q24K, range: [0.25, 7] },
        { id: 'ABLineGraph', type: 'function', equation: 'line', slope: q24Slope, intercept: 0, range: [-7, 7] },
        { id: 'TranslatedLine', type: 'function', equation: 'line', slope: q24Slope, interceptPoint: 'E', range: [-7, 7], strokeDasharray: 'dash' },
      ],
      constraints: [
        { type: 'pointOnInverse', args: ['A'], k: q24K },
        { type: 'pointOnInverse', args: ['B'], k: q24K },
        { type: 'pointOnLineEquation', args: ['A'], slope: q24Slope, intercept: 0 },
        { type: 'pointOnLineEquation', args: ['B'], slope: q24Slope, intercept: 0 },
        { type: 'pointOnInverse', args: ['C'], k: q24K },
        { type: 'pointOnInverse', args: ['D'], k: q24K },
        { type: 'pointOnLineEquation', args: ['C'], slope: q24Slope, interceptPoint: 'E' },
        { type: 'pointOnLineEquation', args: ['D'], slope: q24Slope, interceptPoint: 'E' },
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'pointOn', args: ['E', 'YAxis'] },
        { type: 'pointOn', args: ['F', 'XAxis'] },
      ],
      view: {
        labels: ['O', 'A', 'B', 'C', 'D', 'E', 'F', 'XAxisRight', 'YAxisTop'],
        visibleSegments: ['AB', 'CD'],
        angleMarkers: [],
        circles: [],
      },
    },
    'q26-parabola-1': {
      id: 'q26-parabola-1',
      title: '第26题 图1 抛物线与可变矩形',
      viewport: { xmin: -0.8, xmax: 10.8, ymin: -1.2, ymax: 13.5 },
      objects: [
        { id: 'O', type: 'point', fixed: [0, 0] },
        { id: 'End', type: 'point', fixed: [10, 0] },
        { id: 'BaseTrack', type: 'segment', through: ['O', 'End'], visible: false },
        { id: 'B', type: 'point', fixed: [2, 0], draggable: true, on: 'BaseTrack' },
        { id: 'A', type: 'point', fixed: q26FixedA, construct: { type: 'rectangleTopRightOnParabola', base: 'B', sumX: 10 } },
        { id: 'C', type: 'point', fixed: q26FixedC, construct: { type: 'verticalPointToY', base: 'B', yPoint: 'D' } },
        { id: 'D', type: 'point', fixed: q26FixedD, construct: { type: 'verticalPointToParabola', base: 'A', parabola: q26C1 } },
        { id: 'C1Graph', type: 'function', equation: 'parabola', ...q26C1, range: [0, 10] },
      ],
      constraints: [
        { type: 'pointOn', args: ['B', 'BaseTrack'] },
        { type: 'pointOn', args: ['A', 'BaseTrack'] },
        { type: 'pointOnParabola', args: ['C'], parabola: q26C1, parabolaName: 'C1' },
        { type: 'pointOnParabola', args: ['D'], parabola: q26C1, parabolaName: 'C1' },
        { type: 'parallel', args: ['AB', 'CD'] },
        { type: 'parallel', args: ['BC', 'AD'] },
        { type: 'perpendicular', args: ['AB', 'BC'] },
      ],
      view: {
        labels: ['O', 'End', 'A', 'B', 'C', 'D'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA'],
        angleMarkers: [],
        circles: [],
      },
    },
    'q26-parabola-2': {
      id: 'q26-parabola-2',
      title: '第26题 图2 平移抛物线与过D直线',
      viewport: { xmin: -0.8, xmax: 10.8, ymin: -1.2, ymax: 46 },
      objects: [
        { id: 'O', type: 'point', fixed: [0, 0] },
        { id: 'End', type: 'point', fixed: [10, 0] },
        { id: 'B', type: 'point', fixed: [2, 0] },
        { id: 'A', type: 'point', fixed: q26FixedA },
        { id: 'C', type: 'point', fixed: q26FixedC },
        { id: 'D', type: 'point', fixed: q26FixedD, construct: { type: 'fixedRectanglePointOnParabola', t: 2, sumX: 10, parabola: q26C1 } },
        { id: 'C1Graph', type: 'function', equation: 'parabola', ...q26C1, range: [0, 10] },
        { id: 'C2Graph', type: 'function', equation: 'parabola', ...q26C2, range: [0, 10] },
        { id: 'M', type: 'point', fixed: q26M, draggable: true, on: 'C1Graph' },
        { id: 'N', type: 'point', fixed: q26N, construct: { type: 'sameLineParabolaIntersection', through: 'D', pointOnFirst: 'M', targetParabola: q26C2 } },
      ],
      constraints: [
        { type: 'pointOnParabola', args: ['D'], parabola: q26C1, parabolaName: 'C1' },
        { type: 'pointOnParabola', args: ['D'], parabola: q26C2, parabolaName: 'C2' },
        { type: 'pointOnParabola', args: ['M'], parabola: q26C1, parabolaName: 'C1' },
        { type: 'pointOnParabola', args: ['N'], parabola: q26C2, parabolaName: 'C2' },
        { type: 'collinear', args: ['D', 'M', 'N'] },
      ],
      view: {
        labels: ['O', 'A', 'B', 'C', 'D', 'M', 'N'],
        visibleSegments: ['AB', 'BC', 'CD', 'DA', 'DM', 'DN'],
        angleMarkers: [],
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
