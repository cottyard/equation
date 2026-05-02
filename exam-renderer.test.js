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
assert(html.includes('真实纪念碑照片按要求省略'), 'omitted real photo should be documented');
assert(!html.includes('<script'), 'renderer output should not include script tags');

const figures = renderer.getRenderableFigures(paper);
assert(figures.length === paper.figures.length, 'all configured figures should be renderable');
assert(
  figures.every(figure => typeof figure.svg === 'string' && (figure.svg.includes('<svg') || figure.svg.includes('data-geometry-id='))),
  'each figure renderer should return svg or an interactive geometry container',
);
const q5Renderable = figures.find(figure => figure.id === 'q5-parallel-board');
assert(q5Renderable.svg.includes('data-geometry-id="q5-parallel-board"'), 'question 5 should render an interactive geometry container');

const q5Geometry = renderer.getFigureGeometry('q5-parallel-board');
assert(q5Geometry, 'question 5 should expose a verifiable geometry model');

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
