const paper = require('./exam-data.js');
const renderer = require('./exam-renderer.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const html = renderer.renderPaperToHtml(paper);

assert(html.includes('2026届初中毕业暨升学考试模拟试卷 数学'), 'html should include title');
assert(html.includes('class="paper-section"'), 'html should include sections');
assert(html.includes('data-question-id="27"'), 'html should render question 27');
assert(html.includes('class="math-display"'), 'display math blocks should be marked for MathJax');
assert(html.includes('class="question-options"'), 'choice options should render');
assert(html.includes('class="exam-table"'), 'tables should render');
assert(html.includes('data-figure-id="q24-functions"'), 'figure references should render');
assert(!html.includes('真实纪念碑照片按要求省略'), 'question 23 monument photo should no longer be omitted');
assert(html.includes('assets/q23-monument-photo.png'), 'question 23 should render the original monument photo asset');
assert(html.includes('class="photo-figure"'), 'question 23 should render photo and vector diagram side by side');
assert(html.includes('data-figure-model="q2-mortise"'), 'question 2 should render from a formal projection model');
assert(html.includes('data-front-view-option="C"'), 'question 2 should expose the model-derived front-view answer');
assert(html.includes('data-solid-kind="extruded-dovetail-prism"'), 'question 2 should render a 3D solid model');
assert(html.includes('data-solid-face="front-dovetail"'), 'question 2 should render the projected dovetail front face');
assert(html.includes('data-solid-edge-role="depth"'), 'question 2 should render visible depth edges from the 3D model');
assert(html.includes('data-shaded-area="4"'), 'question 13 should expose computed shaded area');
assert(html.includes('data-probability="0.25"'), 'question 13 should expose computed probability');
assert(html.includes('data-magic-relation="2a=b+c"'), 'question 15 should expose the derived magic-square relation');
assert(html.includes('data-total-count="60"'), 'question 21 should expose the inferred sample size');
assert(!html.includes('<script'), 'renderer output should not include script tags');

const figures = renderer.getRenderableFigures(paper);
assert(figures.length === paper.figures.length, 'all configured figures should be renderable');
assert(
  figures.every(figure => typeof figure.svg === 'string' && (figure.svg.includes('<svg') || figure.svg.includes('data-geometry-id=') || figure.svg.includes('<img'))),
  'each figure renderer should return svg, image, or an interactive geometry container',
);
const q23Renderable = figures.find(figure => figure.id === 'q23-measurement');
assert(q23Renderable.svg.includes('<img') && q23Renderable.svg.includes('data-geometry-id="q23-measurement"'), 'question 23 should include the photo and an interactive measurement geometry container');
const q24Renderable = figures.find(figure => figure.id === 'q24-functions');
assert(q24Renderable.svg.includes('data-geometry-id="q24-functions"'), 'question 24 should render an interactive function geometry container');
const q5Renderable = figures.find(figure => figure.id === 'q5-parallel-board');
assert(q5Renderable.svg.includes('data-geometry-id="q5-parallel-board"'), 'question 5 should render an interactive geometry container');
const q2Renderable = figures.find(figure => figure.id === 'q2-mortise');
assert(q2Renderable.svg.includes('data-solid-face="top-tenon"'), 'question 2 should render the raised tenon top face');
assert(!q2Renderable.svg.includes('34,87 112,65 153,88'), 'question 2 should not use the old hand-drawn solid polygon');
const q20Renderable = figures.find(figure => figure.id === 'q20-medians');
assert(q20Renderable.svg.includes('data-geometry-id="q20-medians"'), 'question 20 should render an interactive geometry container');
const q7Renderable = figures.find(figure => figure.id === 'q7-rhombus');
assert(q7Renderable.svg.includes('data-geometry-id="q7-rhombus"'), 'question 7 should render an interactive geometry container');
const q16Renderable = figures.find(figure => figure.id === 'q16-rotation');
assert(q16Renderable.svg.includes('data-geometry-id="q16-rotation"'), 'question 16 should render an interactive geometry container');
const q25Renderable = figures.find(figure => figure.id === 'q25-circle');
assert(q25Renderable.svg.includes('data-geometry-id="q25-circle"'), 'question 25 should render an interactive geometry container');
const q27Renderable = figures.find(figure => figure.id === 'q27-golden');
assert(q27Renderable.svg.includes('data-geometry-id="q27-golden-1"') && q27Renderable.svg.includes('data-geometry-id="q27-golden-2"'), 'question 27 should render both golden-ratio figures as interactive geometry containers');
const q26Renderable = figures.find(figure => figure.id === 'q26-parabolas');
assert(q26Renderable.svg.includes('data-geometry-id="q26-parabola-1"') && q26Renderable.svg.includes('data-geometry-id="q26-parabola-2"'), 'question 26 should render both parabola figures as interactive geometry containers');

const q5Geometry = renderer.getFigureGeometry('q5-parallel-board');
assert(q5Geometry, 'question 5 should expose a verifiable geometry model');
const q20Geometry = renderer.getFigureGeometry('q20-medians');
assert(q20Geometry, 'question 20 should expose a verifiable geometry model');
const q7Geometry = renderer.getFigureGeometry('q7-rhombus');
assert(q7Geometry, 'question 7 should expose a verifiable geometry model');
const q16Geometry = renderer.getFigureGeometry('q16-rotation');
assert(q16Geometry, 'question 16 should expose a verifiable geometry model');
const q25Geometry = renderer.getFigureGeometry('q25-circle');
assert(q25Geometry, 'question 25 should expose a verifiable geometry model');
const q23Geometry = renderer.getFigureGeometry('q23-measurement');
assert(q23Geometry, 'question 23 should expose a verifiable geometry model');
const q24Geometry = renderer.getFigureGeometry('q24-functions');
assert(q24Geometry, 'question 24 should expose a verifiable geometry model');
const q27Figure1Geometry = renderer.getFigureGeometry('q27-golden-1');
assert(q27Figure1Geometry, 'question 27 figure 1 should expose a verifiable geometry model');
const q27Figure2Geometry = renderer.getFigureGeometry('q27-golden-2');
assert(q27Figure2Geometry, 'question 27 figure 2 should expose a verifiable geometry model');
const q26Figure1Geometry = renderer.getFigureGeometry('q26-parabola-1');
assert(q26Figure1Geometry, 'question 26 figure 1 should expose a verifiable geometry model');
const q26Figure2Geometry = renderer.getFigureGeometry('q26-parabola-2');
assert(q26Figure2Geometry, 'question 26 figure 2 should expose a verifiable geometry model');

function point(name) {
  return q5Geometry.points[name];
}

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function between(value, end1, end2) {
  return value >= Math.min(end1, end2) && value <= Math.max(end1, end2);
}

assert(point('A').y === point('B').y, 'question 5 AB should be horizontal');
assert(point('C').y === point('D').y, 'question 5 CD should be horizontal');
assert(Math.abs(cross(point('G'), point('F'), point('M'))) < 1e-9, 'question 5 G, F, M should be collinear');
assert(between(point('F').x, point('G').x, point('M').x), 'question 5 F should lie between G and M by x-coordinate');
assert(between(point('F').y, point('G').y, point('M').y), 'question 5 F should lie between G and M by y-coordinate');

const q20Point = name => q20Geometry.points[name];
const length = (a, b) => Math.hypot(q20Point(a).x - q20Point(b).x, q20Point(a).y - q20Point(b).y);
assert(Math.abs(length('A', 'B') - length('A', 'C')) < 1e-9, 'question 20 should expose AB = AC in its geometry model');
assert(Math.abs(q20Point('D').x - (q20Point('A').x + q20Point('B').x) / 2) < 1e-9, 'question 20 should expose D as midpoint of AB');
assert(Math.abs(q20Point('E').x - (q20Point('A').x + q20Point('C').x) / 2) < 1e-9, 'question 20 should expose E as midpoint of AC');
assert(Math.abs(length('B', 'E') - length('C', 'D')) < 1e-9, 'question 20 should expose equal medians BE and CD');

const q7Point = name => q7Geometry.points[name];
const q7Length = (a, b) => Math.hypot(q7Point(a).x - q7Point(b).x, q7Point(a).y - q7Point(b).y);
const q7Cross = (a, b, c, d) => (
  (q7Point(b).x - q7Point(a).x) * (q7Point(d).y - q7Point(c).y) -
  (q7Point(b).y - q7Point(a).y) * (q7Point(d).x - q7Point(c).x)
);
assert(Math.abs(q7Length('A', 'C') - 6) < 1e-9, 'question 7 should expose AC = 6');
assert(Math.abs(q7Length('B', 'D') - 12) < 1e-9, 'question 7 should expose BD = 12');
assert(Math.abs(q7Length('C', 'F') / q7Length('O', 'F') - 2) < 1e-9, 'question 7 should expose CF = 2OF');
assert(Math.abs(q7Cross('E', 'F', 'B', 'C')) < 1e-9, 'question 7 should expose EF parallel BC');

const q16Point = name => q16Geometry.points[name];
const q16Length = (a, b) => Math.hypot(q16Point(a).x - q16Point(b).x, q16Point(a).y - q16Point(b).y);
const q16Cross = (a, b, c, d) => (
  (q16Point(b).x - q16Point(a).x) * (q16Point(d).y - q16Point(c).y) -
  (q16Point(b).y - q16Point(a).y) * (q16Point(d).x - q16Point(c).x)
);
assert(Math.abs(q16Length('A', 'D') - 6) < 1e-9, 'question 16 should expose AD = 6');
assert(Math.abs(q16Cross('B', 'E', 'B', 'D')) < 1e-9, 'question 16 should expose B, E, D collinear');
assert(Math.abs(q16Length('A', 'B') - q16Length('A', 'E')) < 1e-9, 'question 16 should expose rotation length AB = AE');

const q25Point = name => q25Geometry.points[name];
const q25Length = (a, b) => Math.hypot(q25Point(a).x - q25Point(b).x, q25Point(a).y - q25Point(b).y);
const q25Dot = (a, b, c, d) => (
  (q25Point(b).x - q25Point(a).x) * (q25Point(d).x - q25Point(c).x) +
  (q25Point(b).y - q25Point(a).y) * (q25Point(d).y - q25Point(c).y)
);
assert(Math.abs(q25Length('O', 'E') - 3) < 1e-9, 'question 25 should expose E on circle O');
assert(Math.abs(q25Length('O', 'C') / q25Length('C', 'B') - 2) < 1e-9, 'question 25 should expose OC = 2BC');
assert(Math.abs(q25Dot('O', 'E', 'E', 'F')) < 1e-9, 'question 25 should expose EF tangent at E');

const q23Point = name => q23Geometry.points[name];
const q23Length = (a, b) => Math.hypot(q23Point(a).x - q23Point(b).x, q23Point(a).y - q23Point(b).y);
assert(Math.abs(q23Length('C', 'E') - 16) < 1e-9, 'question 23 should expose CE = 16');
assert(Math.abs(q23Length('D', 'C') - 1.5) < 1e-9, 'question 23 should expose measuring instrument height at C');

for (const segment of ['AB', 'CD', 'GF', 'GM', 'FE', 'GE', 'MF', 'FN', 'MN']) {
  assert(q5Geometry.segments.includes(segment), `question 5 should include segment ${segment}`);
}

(async function testMathJaxLateLoad() {
  const previousWindow = global.window;
  const container = { innerHTML: '' };
  let typesetCalled = false;

  global.window = {
    MathJax: {}
  };

  renderer.mountPaper(container, paper);

  setTimeout(() => {
    global.window.MathJax.typesetPromise = nodes => {
      typesetCalled = nodes[0] === container;
      return Promise.resolve();
    };
  }, 10);

  await new Promise(resolve => setTimeout(resolve, 80));
  global.window = previousWindow;

  assert(typesetCalled, 'mountPaper should typeset after async MathJax finishes loading');
  console.log('exam renderer tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
