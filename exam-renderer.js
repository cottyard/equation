(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ExamRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function attrs(values) {
    return Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== null && value !== false)
      .map(([key, value]) => value === true ? key : `${key}="${escapeHtml(value)}"`)
      .join(' ');
  }

  function tag(name, values, content = '') {
    const attrText = values ? attrs(values) : '';
    return `<${name}${attrText ? ` ${attrText}` : ''}>${content}</${name}>`;
  }

  function svg(width, height, content, extra = {}) {
    return `<svg ${attrs({
      xmlns: SVG_NS,
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      ...extra,
    })}>${content}</svg>`;
  }

  function line(x1, y1, x2, y2, className = 'geo-line', extra = {}) {
    return `<line ${attrs({ x1, y1, x2, y2, class: className, ...extra })}/>`;
  }

  function poly(points, className = 'geo-line', extra = {}) {
    return `<polyline ${attrs({ points, class: className, fill: 'none', ...extra })}/>`;
  }

  function polygon(points, className = 'geo-line', extra = {}) {
    return `<polygon ${attrs({ points, class: className, ...extra })}/>`;
  }

  function path(d, className = 'geo-line', extra = {}) {
    return `<path ${attrs({ d, class: className, fill: 'none', ...extra })}/>`;
  }

  function circle(cx, cy, r, className = 'geo-point', extra = {}) {
    return `<circle ${attrs({ cx, cy, r, class: className, ...extra })}/>`;
  }

  function text(x, y, value, className = 'geo-label', extra = {}) {
    return `<text ${attrs({ x, y, class: className, ...extra })}>${escapeHtml(value)}</text>`;
  }

  function rect(x, y, width, height, className = 'geo-line', extra = {}) {
    return `<rect ${attrs({ x, y, width, height, class: className, ...extra })}/>`;
  }

  function mathText(x, y, value, className = 'geo-label', extra = {}) {
    return `<text ${attrs({ x, y, class: className, ...extra })}>${value}</text>`;
  }

  function getFigureGeometry(id) {
    const problemsApi = root.GeometryProblems || (typeof require === 'function' ? require('./geometry-problems.js') : null);
    const dslApi = root.GeometryDsl || (typeof require === 'function' ? require('./geometry-dsl.js') : null);
    if (!problemsApi || !dslApi) return null;
    const scene = dslApi.normalizeScene(problemsApi.getGeometryProblem(id));
    const points = {};
    for (const object of scene.objects) {
      if (object.type === 'point') {
        points[object.id] = { x: object.fixed[0], y: object.fixed[1] };
      }
    }
    return { points, segments: scene.view.visibleSegments.slice() };
  }

  const figureRenderers = {
    mortiseViews() {
      const base = [
        polygon('34,87 112,65 153,88 153,139 54,166 34,145', 'geo-shape'),
        polygon('34,87 54,101 54,166 34,145', 'geo-shape geo-muted'),
        polygon('54,101 153,88 153,139 54,166', 'geo-shape'),
        polygon('64,57 120,40 139,58 83,76', 'geo-shape'),
        polygon('64,57 83,76 91,102 73,93', 'geo-shape geo-muted'),
        polygon('83,76 139,58 132,82 91,102', 'geo-shape'),
        line(91, 137, 107, 125),
        text(104, 153, '正面', 'geo-label'),
        line(100, 132, 115, 148, 'geo-thin'),
      ].join('');

      function optionShape(x, y, label, kind) {
        let body = '';
        if (kind === 'A') {
          body = polygon(`${x},${y + 58} ${x + 28},${y + 58} ${x + 28},${y + 36} ${x + 82},${y + 36} ${x + 82},${y + 58} ${x + 110},${y + 58} ${x + 110},${y + 96} ${x},${y + 96}`, 'geo-shape');
        } else if (kind === 'B') {
          body = rect(x + 25, y + 18, 62, 112, 'geo-shape') + line(x + 25, y + 74, x + 87, y + 74);
        } else if (kind === 'C') {
          body = polygon(`${x},${y + 78} ${x + 23},${y + 78} ${x + 13},${y + 52} ${x + 115},${y + 52} ${x + 105},${y + 78} ${x + 130},${y + 78} ${x + 130},${y + 122} ${x},${y + 122}`, 'geo-shape');
        } else {
          body = rect(x, y + 56, 146, 54, 'geo-shape') + line(x + 34, y + 56, x + 34, y + 110) + line(x + 88, y + 56, x + 88, y + 110, 'geo-dash') + line(x + 120, y + 56, x + 120, y + 110, 'geo-dash');
        }
        return `<g>${body}${text(x + 48, y + 143, label, 'geo-option-label')}</g>`;
      }

      return svg(760, 230, [
        `<g transform="translate(15 18)">${base}</g>`,
        optionShape(215, 42, 'A', 'A'),
        optionShape(350, 22, 'B', 'B'),
        optionShape(470, 25, 'C', 'C'),
        optionShape(615, 25, 'D', 'D'),
      ].join(''), { 'aria-label': '燕尾榫几何示意与四个主视图选项' });
    },

    parallelBoard() {
      return tag('div', {
        class: 'geometry-board',
        'data-geometry-id': 'q5-parallel-board',
        role: 'img',
        'aria-label': '两条平行线间的三角板角度示意，可拖动点G和点F',
      }, '');
    },

    rhombus() {
      return svg(360, 220, [
        polygon('65,168 144,42 302,42 223,168', 'geo-shape'),
        line(144, 42, 223, 168),
        line(65, 168, 302, 42),
        line(118, 107, 184, 107),
        line(184, 107, 223, 168),
        circle(184, 107, 4), circle(166, 83, 4),
        text(139, 33, 'A'), text(50, 178, 'B'), text(227, 180, 'C'), text(307, 39, 'D'),
        text(175, 100, 'F'), text(103, 112, 'E'), text(181, 90, 'O'),
      ].join(''), { 'aria-label': '菱形对角线和EF平行BC的示意图' });
    },

    tileProbability() {
      const cells = [];
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          cells.push(rect(20 + c * 38, 18 + r * 38, 38, 38, 'geo-grid'));
        }
      }
      const shade = [
        polygon('20,18 58,18 20,56', 'geo-hatch'),
        polygon('134,18 172,18 172,56', 'geo-hatch'),
        polygon('20,132 58,170 20,170', 'geo-hatch'),
        polygon('134,170 172,132 172,170', 'geo-hatch'),
        polygon('77,76 96,57 115,76 96,95', 'geo-hatch'),
        polygon('77,114 96,95 115,114 96,133', 'geo-hatch'),
        polygon('58,95 77,76 96,95 77,114', 'geo-hatch'),
        polygon('96,95 115,76 134,95 115,114', 'geo-hatch'),
      ].join('');
      return svg(210, 205, `${cells.join('')}${shade}`, { 'aria-label': '4乘4地砖阴影区域示意' });
    },

    magicSquare() {
      const beads = [
        [65, 22], [53, 34], [77, 34],
        [35, 60], [35, 84], [35, 108],
        [98, 60], [98, 84], [98, 108],
        [50, 138], [42, 148], [34, 158], [58, 148], [66, 158],
        [112, 138], [104, 148], [96, 158], [120, 148], [128, 158],
        [63, 89], [75, 89], [69, 79], [69, 99],
      ];
      const luoshu = [
        ...beads.map(([x, y]) => circle(x, y, 4, 'geo-fill')),
        text(71, 18, '洛 书', 'geo-label'),
        text(65, 190, '图1', 'geo-caption'),
      ].join('');
      const squareLines = [];
      for (let i = 0; i < 4; i += 1) {
        squareLines.push(line(190 + i * 42, 42, 190 + i * 42, 168, 'geo-grid'));
        squareLines.push(line(190, 42 + i * 42, 316, 42 + i * 42, 'geo-grid'));
      }
      const square = [
        squareLines.join(''),
        text(205, 68, 'a'),
        text(283, 110, 'b'),
        text(245, 153, 'c'),
        text(245, 190, '图2', 'geo-caption'),
      ].join('');
      return svg(350, 205, luoshu + square, { 'aria-label': '洛书点阵与含abc的三阶幻方' });
    },

    parallelogramRotation() {
      return svg(360, 245, [
        polygon('60,145 142,196 278,150 196,99', 'geo-shape'),
        polygon('60,145 170,52 315,105 196,99', 'geo-shape'),
        line(60, 145, 278, 150),
        line(142, 196, 196, 99),
        line(60, 145, 196, 99),
        line(170, 52, 196, 99),
        line(315, 105, 196, 99),
        circle(154, 160, 4),
        text(46, 150, 'A'), text(134, 213, 'B'), text(285, 160, 'C'), text(198, 92, 'D'),
        text(149, 156, 'E'), text(319, 105, 'F'), text(168, 43, 'G'),
      ].join(''), { 'aria-label': '平行四边形绕A点旋转后的几何关系图' });
    },

    triangleMedians() {
      return svg(260, 240, [
        polygon('130,22 38,208 222,208', 'geo-shape'),
        line(38, 208, 178, 116),
        line(222, 208, 82, 116),
        circle(82, 116, 4), circle(178, 116, 4),
        text(124, 16, 'A'), text(25, 218, 'B'), text(225, 218, 'C'),
        text(70, 116, 'D'), text(184, 116, 'E'),
      ].join(''), { 'aria-label': '等腰三角形中线BE和CD示意图' });
    },

    bmiCharts() {
      const bars = [
        rect(80, 90, 30, 90, 'chart-bar'),
        rect(140, 157, 30, 23, 'chart-bar'),
        rect(200, 172, 30, 8, 'chart-bar'),
      ].join('');
      const chart = [
        line(38, 180, 258, 180, 'axis'),
        line(38, 180, 38, 30, 'axis'),
        text(31, 29, '人数', 'geo-small'),
        text(250, 195, '类别', 'geo-small'),
        ...[0, 6, 12, 18, 24, 30, 36, 42].map(v => line(34, 180 - v * 2.5, 38, 180 - v * 2.5, 'axis') + text(14, 184 - v * 2.5, String(v), 'geo-small')),
        bars,
        text(90, 195, 'B', 'geo-small'), text(150, 195, 'C', 'geo-small'), text(210, 195, 'D', 'geo-small'), text(38, 195, 'A', 'geo-small'),
        text(89, 84, '36', 'geo-small'), text(150, 151, '9', 'geo-small'), text(210, 166, '3', 'geo-small'),
      ].join('');
      const pie = [
        circle(375, 108, 65, 'geo-shape', { fill: 'none' }),
        line(375, 108, 440, 108),
        line(375, 108, 322, 72),
        line(375, 108, 363, 44),
        path('M375 108 L363 44 A65 65 0 0 1 397 48 Z', 'geo-shape', { fill: 'none' }),
        text(403, 103, 'A', 'geo-small'),
        text(375, 160, 'B', 'geo-small'),
        text(338, 96, 'C', 'geo-small'),
        text(350, 38, 'D 5%', 'geo-small'),
      ].join('');
      return svg(500, 220, chart + pie, { 'aria-label': 'BMI分组的条形统计图和扇形统计图' });
    },

    monumentMeasurement() {
      return svg(340, 220, [
        line(40, 182, 300, 182),
        line(55, 182, 55, 42),
        line(175, 182, 175, 112),
        line(270, 182, 270, 128),
        line(55, 42, 175, 112),
        line(55, 42, 270, 128),
        line(55, 42, 270, 182),
        text(47, 35, 'A'), text(43, 197, 'B'), text(169, 197, 'C'), text(168, 108, 'D'),
        text(264, 197, 'E'), text(264, 124, 'F'),
        path('M160 182 A32 32 0 0 0 149 158', 'geo-thin'),
        text(139, 163, '42°', 'geo-small'),
        path('M248 182 A35 35 0 0 0 238 164', 'geo-thin'),
        text(230, 164, '30°', 'geo-small'),
        text(208, 200, '16 m', 'geo-small'),
      ].join(''), { 'aria-label': '纪念碑高度测量平面示意图' });
    },

    inverseProportion() {
      return svg(390, 260, [
        line(190, 225, 190, 24, 'axis'),
        line(40, 150, 350, 150, 'axis'),
        polygon('190,24 185,35 195,35', 'axis-fill'),
        polygon('350,150 338,145 338,155', 'axis-fill'),
        text(198, 35, 'y'), text(352, 147, 'x'), text(176, 166, 'O'),
        path('M52 136 C80 130 104 119 122 94 C136 74 143 52 150 30', 'geo-curve'),
        path('M212 229 C220 199 238 176 268 166 C292 158 323 157 350 154', 'geo-curve'),
        line(78, 44, 336, 214),
        line(58, 100, 320, 205),
        line(115, 118, 265, 172),
        line(158, 83, 315, 190),
        text(106, 134, 'A'), text(248, 202, 'B'), text(265, 183, 'C'), text(145, 92, 'D'),
        text(194, 96, 'E'), text(307, 147, 'F'),
      ].join(''), { 'aria-label': '反比例函数和两条平行直线的交点示意' });
    },

    circleTangent() {
      return svg(320, 300, [
        circle(145, 190, 76, 'geo-shape', { fill: 'none' }),
        line(55, 190, 245, 190),
        line(182, 190, 182, 47),
        line(55, 190, 182, 47),
        line(95, 123, 182, 47),
        line(95, 123, 225, 102),
        line(225, 102, 182, 47),
        text(48, 196, 'A'), text(249, 196, 'B'), text(139, 207, 'O'), text(176, 204, 'C'),
        text(187, 43, 'D'), text(83, 122, 'E'), text(229, 105, 'F'),
      ].join(''), { 'aria-label': '圆、直径、垂线和切线示意图' });
    },

    parabolas() {
      function one(x, label, second) {
        const content = [
          line(x + 20, 78, x + 260, 78, 'axis'),
          line(x + 62, 20, x + 62, 210, 'axis'),
          polygon(`${x + 260},78 ${x + 248},73 ${x + 248},83`, 'axis-fill'),
          polygon(`${x + 62},20 ${x + 57},32 ${x + 67},32`, 'axis-fill'),
          path(`M${x + 45} 20 C${x + 70} 122 ${x + 105} 218 ${x + 165} 218 C${x + 215} 218 ${x + 235} 90 ${x + 245} 20`, 'geo-curve'),
          line(x + 92, 78, x + 92, 178),
          line(x + 210, 78, x + 210, 178),
          line(x + 92, 178, x + 210, 178),
          text(x + 43, 95, 'O'), text(x + 96, 72, 'B'), text(x + 205, 72, 'A'), text(x + 254, 72, 'x'), text(x + 70, 28, 'y'),
          text(x + 82, 188, 'C'), text(x + 211, 188, 'D'),
          text(x + 135, 238, label, 'geo-caption'),
        ];
        if (second) {
          content.push(path(`M${x + 135} 20 C${x + 150} 112 ${x + 180} 190 ${x + 230} 180 C${x + 258} 175 ${x + 270} 80 ${x + 283} 20`, 'geo-curve geo-alt'));
          content.push(line(x + 45, 28, x + 230, 178, 'geo-dash'));
        }
        return content.join('');
      }
      return svg(620, 255, one(10, '图1', false) + one(320, '图2', true), { 'aria-label': '两幅抛物线与矩形位置示意图' });
    },

    goldenGeometry() {
      function square(x, label, rectMode) {
        const w = rectMode ? 210 : 190;
        const h = 190;
        const A = [x, 210], B = [x + w, 210], C = [x + w, 20], D = [x, 20];
        const E = rectMode ? [x + w, 116] : [x + w, 112];
        const F = rectMode ? [x + 83, 20] : [x + 88, 20];
        const G = rectMode ? [x + 112, 117] : [x + 118, 120];
        const M = rectMode ? [x + 86, 210] : [x + 95, 210];
        return [
          polygon(`${A} ${B} ${C} ${D}`, 'geo-shape'),
          line(...A, ...E),
          line(...B, ...F),
          line(...C, ...M),
          circle(...G, 4),
          text(A[0] - 12, A[1] + 15, 'A'), text(B[0] + 5, B[1] + 14, 'B'), text(C[0] + 5, C[1] + 5, 'C'), text(D[0] - 12, D[1] + 5, 'D'),
          text(E[0] + 6, E[1] + 5, 'E'), text(F[0] - 4, F[1] - 8, 'F'), text(G[0] - 14, G[1], 'G'), text(M[0] - 8, M[1] + 16, 'M'),
          text(x + w / 2 - 10, 242, label, 'geo-caption'),
        ].join('');
      }
      return svg(560, 260, square(35, '图1', false) + square(320, '图2', true), { 'aria-label': '正方形和矩形中的黄金分割几何图' });
    },
  };

  function renderFigure(figure) {
    const render = figureRenderers[figure.renderer];
    if (!render) {
      return tag('div', { class: 'figure-missing' }, `缺少图形渲染器：${escapeHtml(figure.renderer)}`);
    }
    return render();
  }

  function renderBlock(block) {
    if (block.type === 'p') {
      return tag('p', {}, renderText(block.text));
    }
    if (block.type === 'display') {
      return tag('div', { class: 'math-display' }, `\\[${block.text}\\]`);
    }
    if (block.type === 'table') {
      const rows = block.rows.map(row => tag('tr', {}, row.map(cell => tag('td', {}, renderText(cell))).join(''))).join('');
      return tag('table', { class: 'exam-table' }, tag('tbody', {}, rows));
    }
    if (block.type === 'list') {
      return tag('ol', { class: 'subquestion-list' }, block.items.map(item => tag('li', {}, renderText(item))).join(''));
    }
    return '';
  }

  function renderText(value) {
    return escapeHtml(value).replace(/____/g, '<span class="answer-blank" aria-label="填空"></span>');
  }

  function renderOptions(options) {
    if (!options || options.length === 0) return '';
    return tag('ol', { class: 'question-options' }, options.map(option => (
      tag('li', { value: option.label.charCodeAt(0) - 64 }, `<span class="option-label">${escapeHtml(option.label)}.</span> ${renderText(option.text)}`)
    )).join(''));
  }

  function renderQuestion(item, figureById) {
    const blocks = item.blocks.map(renderBlock).join('');
    const figures = (item.figureIds || []).map(id => {
      const figure = figureById.get(id);
      return tag('figure', { class: 'exam-figure', 'data-figure-id': id }, [
        renderFigure(figure),
        tag('figcaption', {}, escapeHtml(figure.title)),
      ].join(''));
    }).join('');

    const body = [
      tag('div', { class: 'question-main' }, blocks + renderOptions(item.options)),
      figures ? tag('div', { class: 'question-figures' }, figures) : '',
    ].join('');

    const className = figures ? 'question has-figures' : 'question no-figures';
    return tag('article', { class: className, 'data-question-id': item.id }, [
      tag('header', { class: 'question-header' }, [
        tag('span', { class: 'question-number' }, `${item.id}.`),
        tag('span', { class: 'question-score' }, `本题满分${item.score}分`),
      ].join('')),
      tag('div', { class: 'question-layout' }, body),
    ].join(''));
  }

  function renderSection(section, figureById) {
    return tag('section', { class: 'paper-section', 'data-section-type': section.type }, [
      tag('h2', {}, escapeHtml(section.title)),
      tag('p', { class: 'section-description' }, escapeHtml(section.description)),
      section.items.map(item => renderQuestion(item, figureById)).join(''),
    ].join(''));
  }

  function renderOmittedAssets(paper) {
    const assets = paper.omittedAssets || [];
    if (assets.length === 0) return '';
    return tag('aside', { class: 'omitted-assets' }, [
      tag('h2', {}, '未数字化的真实图片'),
      tag('ul', {}, assets.map(asset => tag('li', {}, [
        tag('strong', {}, `第${asset.questionId}题：${escapeHtml(asset.label)}`),
        ` ${escapeHtml(asset.reason)}`,
      ].join(''))).join('')),
    ].join(''));
  }

  function renderPaperToHtml(paper) {
    const figureById = new Map(paper.figures.map(figure => [figure.id, figure]));
    return [
      tag('header', { class: 'paper-header' }, [
        tag('p', { class: 'paper-date' }, escapeHtml(paper.date)),
        tag('h1', {}, escapeHtml(paper.title)),
        tag('p', { class: 'paper-summary' }, escapeHtml(paper.summary)),
        tag('ol', { class: 'paper-notes' }, paper.notes.map(note => tag('li', {}, escapeHtml(note))).join('')),
      ].join('')),
      renderOmittedAssets(paper),
      paper.sections.map(section => renderSection(section, figureById)).join(''),
    ].join('');
  }

  function getRenderableFigures(paper) {
    return paper.figures.map(figure => ({ ...figure, svg: renderFigure(figure) }));
  }

  function typesetWhenMathJaxReady(container, attempts = 80) {
    if (!window.MathJax) return;
    if (typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([container]);
      return;
    }
    if (attempts > 0) {
      setTimeout(() => typesetWhenMathJaxReady(container, attempts - 1), 50);
    }
  }

  function mountPaper(container, paper) {
    container.innerHTML = renderPaperToHtml(paper);
    if (typeof window !== 'undefined') {
      mountGeometryBoards(container);
      typesetWhenMathJaxReady(container);
    }
  }

  function mountGeometryBoards(container) {
    if (!root.GeometryProblems || !root.GeometryDsl || !root.GeometryJxg) return;
    const boards = container.querySelectorAll('[data-geometry-id]');
    boards.forEach(board => {
      const scene = root.GeometryDsl.normalizeScene(root.GeometryProblems.getGeometryProblem(board.dataset.geometryId));
      const fallback = tag('div', { class: 'geometry-fallback' }, renderStaticQ5Fallback(scene));
      root.GeometryJxg.mountJxgScene(board, scene, { fallbackHtml: fallback });
    });
  }

  function renderStaticQ5Fallback(scene) {
    const scale = 38;
    const ox = 40;
    const oy = 50;
    const pointMap = {};
    scene.objects.forEach(object => {
      if (object.type === 'point') {
        pointMap[object.id] = { x: ox + object.fixed[0] * scale, y: oy - object.fixed[1] * scale };
      }
    });
    const seg = id => line(pointMap[id[0]].x, pointMap[id[0]].y, pointMap[id[1]].x, pointMap[id[1]].y);
    return svg(380, 240, [
      ...scene.view.visibleSegments.map(seg),
      ...scene.view.labels.map(label => text(pointMap[label].x + 4, pointMap[label].y - 4, label)),
    ].join(''), { 'aria-label': scene.title });
  }

  return {
    escapeHtml,
    figureRenderers,
    getRenderableFigures,
    getFigureGeometry,
    mountPaper,
    mountGeometryBoards,
    renderPaperToHtml,
    typesetWhenMathJaxReady,
  };
});
