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

  function formatNumber(value) {
    return Number.parseFloat(value.toFixed(2));
  }

  function pointString(points) {
    return points.map(point => `${formatNumber(point[0])},${formatNumber(point[1])}`).join(' ');
  }

  function boundsOf(points) {
    return points.reduce((box, point) => ({
      minX: Math.min(box.minX, point[0]),
      maxX: Math.max(box.maxX, point[0]),
      minY: Math.min(box.minY, point[1]),
      maxY: Math.max(box.maxY, point[1]),
    }), {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    });
  }

  function createFitTransform(points, target) {
    const box = boundsOf(points);
    const sourceWidth = box.maxX - box.minX || 1;
    const sourceHeight = box.maxY - box.minY || 1;
    const scale = Math.min(target.width / sourceWidth, target.height / sourceHeight);
    const padX = (target.width - sourceWidth * scale) / 2;
    const padY = (target.height - sourceHeight * scale) / 2;
    return point => [
      target.x + padX + (point[0] - box.minX) * scale,
      target.y + padY + (point[1] - box.minY) * scale,
    ];
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

  function getFigureModelApi() {
    return root.FigureModels || (typeof require === 'function' ? require('./figure-models.js') : null);
  }

  function getFigureModel(id) {
    const modelsApi = getFigureModelApi();
    return modelsApi ? modelsApi.getFigureModel(id) : null;
  }

  function scaleTilePoint(point) {
    return [
      20 + point[0] * 38,
      18 + point[1] * 38,
    ];
  }

  const figureRenderers = {
    mortiseViews() {
      const model = getFigureModel('q2-mortise');
      const modelsApi = getFigureModelApi();
      const projection = modelsApi.projectSolid(model);
      const projectedPoints = [
        ...projection.faces.flatMap(face => face.points),
        ...projection.edges.flatMap(edge => [edge.fromPoint, edge.toPoint]),
      ];
      const solidTransform = createFitTransform(projectedPoints, { x: 18, y: 20, width: 160, height: 130 });
      const solidFaceClass = shade => ({
        front: 'geo-shape',
        top: 'geo-shape geo-top-face',
        side: 'geo-shape geo-muted',
      })[shade] || 'geo-shape';
      const solid = [
        ...projection.faces.map(face => polygon(
          pointString(face.points.map(solidTransform)),
          solidFaceClass(face.shade),
          { 'data-solid-face': face.id },
        )),
        ...projection.edges.map(edge => line(
          ...solidTransform(edge.fromPoint),
          ...solidTransform(edge.toPoint),
          'geo-line',
          { 'data-solid-edge-role': edge.role },
        )),
        line(86, 145, 128, 168, 'geo-thin'),
        polygon('81,141 92,143 87,151', 'axis-fill'),
        text(102, 188, '正面', 'geo-option-label'),
      ].join('');

      function profilePolygon(x, y, width, height, extra = {}) {
        const transform = createFitTransform(
          model.frontView.profile.map(point => [point[0], -point[1]]),
          { x, y, width, height },
        );
        const points = model.frontView.profile.map(point => transform([point[0], -point[1]]));
        return polygon(pointString(points), 'geo-shape', extra);
      }

      function optionShape(x, y, label, kind) {
        let body = '';
        if (kind === 'A') {
          body = polygon(`${x},${y + 58} ${x + 28},${y + 58} ${x + 28},${y + 36} ${x + 82},${y + 36} ${x + 82},${y + 58} ${x + 110},${y + 58} ${x + 110},${y + 96} ${x},${y + 96}`, 'geo-shape');
        } else if (kind === 'B') {
          body = rect(x + 25, y + 18, 62, 112, 'geo-shape') + line(x + 25, y + 74, x + 87, y + 74);
        } else if (kind === 'C') {
          body = profilePolygon(x, y + 42, 130, 76, { 'data-front-view-profile': 'dovetail' });
        } else {
          body = [
            rect(x, y + 56, 146, 54, 'geo-shape'),
            line(x + 34, y + 56, x + 34, y + 110, 'geo-line', { 'data-projection-d-visible-divider': 'left' }),
            line(x + 69, y + 56, x + 69, y + 110, 'geo-line geo-dash', { 'data-projection-d-hidden-divider': 'left' }),
            line(x + 104, y + 56, x + 104, y + 110, 'geo-line geo-dash', { 'data-projection-d-hidden-divider': 'right' }),
            line(x + 120, y + 56, x + 120, y + 110, 'geo-line', { 'data-projection-d-visible-divider': 'right' }),
          ].join('');
        }
        return `<g ${attrs({ 'data-projection-option': kind })}>${body}${text(x + 48, y + 143, label, 'geo-option-label')}</g>`;
      }

      return svg(760, 230, [
        solid,
        optionShape(215, 42, model.options[0].label, model.options[0].id),
        optionShape(350, 22, model.options[1].label, model.options[1].id),
        optionShape(470, 25, model.options[2].label, model.options[2].id),
        optionShape(600, 25, model.options[3].label, model.options[3].id),
      ].join(''), {
        'aria-label': '燕尾榫几何示意与四个主视图选项',
        'data-figure-model': model.id,
        'data-solid-kind': model.object.kind,
        'data-front-view-option': model.frontView.optionId,
      });
    },

    parallelBoard() {
      return tag('div', {
        class: 'geometry-board',
        'data-geometry-id': 'q5-parallel-board',
        role: 'img',
        'aria-label': '两条平行线间的三角板角度示意，可拖动点G和点F',
      }, '');
    },

    geometryScene(figure) {
      return tag('div', {
        class: 'geometry-board',
        'data-geometry-id': figure.id,
        role: 'img',
        'aria-label': `${figure.title}，可拖动满足题目约束的控制点`,
      }, '');
    },

    rhombus() {
      return figureRenderers.geometryScene({
        id: 'q7-rhombus',
        title: '第7题 菱形与辅助线',
      });
    },

    tileProbability() {
      const model = getFigureModel('q13-tile');
      const modelsApi = getFigureModelApi();
      const probability = modelsApi.computeTileProbability(model);
      const cells = [];
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          cells.push(rect(20 + c * 38, 18 + r * 38, 38, 38, 'geo-grid'));
        }
      }
      const shade = model.shadedRegions.map(region => {
        const points = region.points.map(scaleTilePoint).map(point => point.join(',')).join(' ');
        return polygon(points, 'geo-hatch', { 'data-shaded-region': region.id });
      }).join('');
      const samples = model.samples.map(sample => {
        const [cx, cy] = scaleTilePoint(sample.point);
        return circle(cx, cy, 2.8, 'geo-model-sample', { 'data-shading-sample': sample.id });
      }).join('');
      return svg(210, 205, `${cells.join('')}${shade}${samples}`, {
        'aria-label': '4乘4地砖阴影区域示意',
        'data-figure-model': model.id,
        'data-shaded-area': probability.shadedArea,
        'data-probability': probability.probability,
      });
    },

    magicSquare() {
      const model = getFigureModel('q15-magic-square');
      const modelsApi = getFigureModelApi();
      const relation = modelsApi.deriveMagicSquareRelation(model);
      const openGroups = [
        { id: 'nine', points: Array.from({ length: 9 }, (_, index) => [33 + index * 9, 58]) },
        { id: 'three', points: [[26, 88], [26, 110], [26, 132]] },
        { id: 'five', points: [[59, 101], [69, 101], [79, 101], [69, 91], [69, 111]] },
        { id: 'seven', points: Array.from({ length: 7 }, (_, index) => [118, 76 + index * 10]) },
        { id: 'one', points: [[69, 148]] },
      ];
      const filledGroups = [
        { id: 'four', points: [[8, 46], [18, 56], [28, 66], [18, 76]] },
        { id: 'two', points: [[112, 47], [126, 33]] },
        { id: 'eight', points: [[18, 138], [28, 148], [38, 158], [48, 168], [11, 154], [21, 164], [31, 174], [41, 184]] },
        { id: 'six', points: [[98, 139], [108, 149], [118, 159], [91, 153], [101, 163], [111, 173]] },
      ];
      const groupLines = [
        poly('8,46 18,56 28,66 18,76 8,46', 'geo-thin', { 'data-luoshu-line': 'four' }),
        line(33, 58, 105, 58, 'geo-thin', { 'data-luoshu-line': 'nine' }),
        line(112, 47, 126, 33, 'geo-thin', { 'data-luoshu-line': 'two' }),
        line(26, 88, 26, 132, 'geo-thin', { 'data-luoshu-line': 'three' }),
        line(59, 101, 79, 101, 'geo-thin', { 'data-luoshu-line': 'five-horizontal' }),
        line(69, 91, 69, 111, 'geo-thin', { 'data-luoshu-line': 'five-vertical' }),
        line(118, 76, 118, 136, 'geo-thin', { 'data-luoshu-line': 'seven' }),
        poly('18,138 28,148 38,158 48,168 41,184 31,174 21,164 11,154 18,138', 'geo-thin', { 'data-luoshu-line': 'eight' }),
        poly('98,139 108,149 118,159 111,173 101,163 91,153 98,139', 'geo-thin', { 'data-luoshu-line': 'six' }),
      ];
      const luoshu = [
        ...groupLines,
        ...openGroups.flatMap(group => group.points.map(([x, y]) => (
          circle(x, y, 4, 'geo-open-dot', { 'data-luoshu-open-dot': group.id, 'data-luoshu-group': group.id })
        ))),
        ...filledGroups.flatMap(group => group.points.map(([x, y]) => (
          circle(x, y, 4, 'geo-fill', { 'data-luoshu-filled-dot': group.id })
        ))),
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
      return svg(350, 205, luoshu + square, {
        'aria-label': '洛书点阵与含abc的三阶幻方',
        'data-figure-model': model.id,
        'data-magic-relation': relation.normalized,
      });
    },

    parallelogramRotation() {
      return figureRenderers.geometryScene({
        id: 'q16-rotation',
        title: '第16题 平行四边形旋转图',
      });
    },

    triangleMedians() {
      return figureRenderers.geometryScene({
        id: 'q20-medians',
        title: '第20题 等腰三角形中线图',
      });
    },

    bmiCharts() {
      const model = getFigureModel('q21-bmi-charts');
      const modelsApi = getFigureModelApi();
      const summary = modelsApi.computeBmiSummary(model);
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
      return svg(500, 220, chart + pie, {
        'aria-label': 'BMI分组的条形统计图和扇形统计图',
        'data-figure-model': model.id,
        'data-total-count': summary.total,
        'data-missing-a': summary.missing.A,
        'data-normal-percent': summary.percentages.B,
      });
    },

    monumentMeasurement(figure) {
      const diagram = figureRenderers.geometryScene({
        id: 'q23-measurement',
        title: '第23题 纪念碑高度测量示意图',
      });
      if (!figure.photo) return diagram;
      const photo = tag('img', {
        src: figure.photo.src,
        alt: figure.photo.alt,
        loading: 'eager',
      });
      return tag('div', { class: 'photo-figure' }, [
        tag('div', { class: 'photo-panel real-photo' }, photo),
        tag('div', { class: 'photo-panel vector-diagram' }, diagram),
      ].join(''));
    },

    inverseProportion() {
      return figureRenderers.geometryScene({
        id: 'q24-functions',
        title: '第24题 反比例函数与一次函数图像',
      });
    },

    circleTangent() {
      return figureRenderers.geometryScene({
        id: 'q25-circle',
        title: '第25题 圆与切线图',
      });
    },

    parabolas() {
      const first = tag('div', { class: 'geometry-panel' }, [
        figureRenderers.geometryScene({ id: 'q26-parabola-1', title: '第26题 图1 抛物线与可变矩形' }),
        tag('div', { class: 'geo-caption' }, '图1'),
      ].join(''));
      const second = tag('div', { class: 'geometry-panel' }, [
        figureRenderers.geometryScene({ id: 'q26-parabola-2', title: '第26题 图2 平移抛物线与过D直线' }),
        tag('div', { class: 'geo-caption' }, '图2'),
      ].join(''));
      return tag('div', { class: 'geometry-pair' }, first + second);
    },

    goldenGeometry() {
      const first = tag('div', { class: 'geometry-panel' }, [
        figureRenderers.geometryScene({ id: 'q27-golden-1', title: '第27题 图1 正方形中的黄金分割关系' }),
        tag('div', { class: 'geo-caption' }, '图1'),
      ].join(''));
      const second = tag('div', { class: 'geometry-panel' }, [
        figureRenderers.geometryScene({ id: 'q27-golden-2', title: '第27题 图2 矩形中的黄金分割关系' }),
        tag('div', { class: 'geo-caption' }, '图2'),
      ].join(''));
      return tag('div', { class: 'geometry-pair' }, first + second);
    },
  };

  function renderFigure(figure) {
    const render = figureRenderers[figure.renderer];
    if (!render) {
      return tag('div', { class: 'figure-missing' }, `缺少图形渲染器：${escapeHtml(figure.renderer)}`);
    }
    return render(figure);
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
    getFigureModel,
    mountPaper,
    mountGeometryBoards,
    renderPaperToHtml,
    typesetWhenMathJaxReady,
  };
});
