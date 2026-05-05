const http = require('node:http');
const { spawn } = require('node:child_process');
const puppeteer = require('puppeteer-core');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:8080${path}`, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    }).on('error', reject);
  });
}

async function ensureServer() {
  try {
    const status = await request('/exam.html');
    if (status === 200) return;
  } catch (_error) {
    // Start below.
  }
  const child = spawn('python', ['-m', 'http.server', '8080', '--bind', '127.0.0.1'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  await new Promise(resolve => setTimeout(resolve, 800));
}

(async () => {
  await ensureServer();
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--disable-gpu', '--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://127.0.0.1:8080/exam.html?v=browser-smoke', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.waitForFunction(() => document.querySelectorAll('mjx-container').length > 0, { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q5-parallel-board"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q7-rhombus"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q16-rotation"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q20-medians"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q23-measurement"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q24-functions"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q25-circle"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q26-parabola-1"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q26-parabola-2"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q27-golden-1"] svg'), { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('[data-geometry-id="q27-golden-2"] svg'), { timeout: 10000 });
    const result = await page.evaluate(() => ({
      mjx: document.querySelectorAll('mjx-container').length,
      geometryBoard: !!document.querySelector('[data-geometry-id="q5-parallel-board"]'),
      q7GeometryBoard: !!document.querySelector('[data-geometry-id="q7-rhombus"]'),
      q16GeometryBoard: !!document.querySelector('[data-geometry-id="q16-rotation"]'),
      q20GeometryBoard: !!document.querySelector('[data-geometry-id="q20-medians"]'),
      q23GeometryBoard: !!document.querySelector('[data-geometry-id="q23-measurement"]'),
      q24GeometryBoard: !!document.querySelector('[data-geometry-id="q24-functions"]'),
      q25GeometryBoard: !!document.querySelector('[data-geometry-id="q25-circle"]'),
      q26Figure1GeometryBoard: !!document.querySelector('[data-geometry-id="q26-parabola-1"]'),
      q26Figure2GeometryBoard: !!document.querySelector('[data-geometry-id="q26-parabola-2"]'),
      q27Figure1GeometryBoard: !!document.querySelector('[data-geometry-id="q27-golden-1"]'),
      q27Figure2GeometryBoard: !!document.querySelector('[data-geometry-id="q27-golden-2"]'),
      jxgSvg: !!document.querySelector('[data-geometry-id="q5-parallel-board"] svg'),
      q7JxgSvg: !!document.querySelector('[data-geometry-id="q7-rhombus"] svg'),
      q16JxgSvg: !!document.querySelector('[data-geometry-id="q16-rotation"] svg'),
      q20JxgSvg: !!document.querySelector('[data-geometry-id="q20-medians"] svg'),
      q23JxgSvg: !!document.querySelector('[data-geometry-id="q23-measurement"] svg'),
      q24JxgSvg: !!document.querySelector('[data-geometry-id="q24-functions"] svg'),
      q24XAxis: !!document.querySelector('[data-geometry-id="q24-functions"] [data-geometry-axis="XAxis"]'),
      q24YAxis: !!document.querySelector('[data-geometry-id="q24-functions"] [data-geometry-axis="YAxis"]'),
      q25JxgSvg: !!document.querySelector('[data-geometry-id="q25-circle"] svg'),
      q26Figure1JxgSvg: !!document.querySelector('[data-geometry-id="q26-parabola-1"] svg'),
      q26Figure2JxgSvg: !!document.querySelector('[data-geometry-id="q26-parabola-2"] svg'),
      q27Figure1JxgSvg: !!document.querySelector('[data-geometry-id="q27-golden-1"] svg'),
      q27Figure2JxgSvg: !!document.querySelector('[data-geometry-id="q27-golden-2"] svg'),
      q5RightAngleMarker: !!document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-marker="rightG"]'),
      q5RightAngleOpenLine: (() => {
        const marker = document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-marker="rightG"]');
        if (!marker || marker.tagName.toLowerCase() === 'polygon') return false;
        const box = marker.getBBox();
        return marker.getAttribute('display') !== 'none' && (box.width > 0 || box.height > 0);
      })(),
      q5SetSquareHole: !!document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-circle="set-square-hole"]'),
      q5AbSegment: !!document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-segment="AB"]'),
      q5CdSegment: !!document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-segment="CD"]'),
      q5GnSegment: !!document.querySelector('[data-geometry-id="q5-parallel-board"] [data-geometry-segment="GN"]'),
      figures: Array.from(document.querySelectorAll('.exam-figure')).map(figure => {
        const box = figure.getBoundingClientRect();
        const media = Array.from(figure.querySelectorAll('svg, img, [data-geometry-id]')).map(element => {
          const mediaBox = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            width: mediaBox.width,
            height: mediaBox.height,
            complete: element.tagName.toLowerCase() === 'img' ? element.complete && element.naturalWidth > 0 : true,
          };
        });
        return {
          id: figure.dataset.figureId,
          width: box.width,
          height: box.height,
          media,
          missing: !!figure.querySelector('.figure-missing'),
        };
      }),
      q23Photo: (() => {
        const image = document.querySelector('[data-figure-id="q23-measurement"] img');
        if (!image) return null;
        const box = image.getBoundingClientRect();
        return {
          src: image.getAttribute('src'),
          alt: image.getAttribute('alt'),
          width: box.width,
          height: box.height,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        };
      })(),
      q24FunctionGraphs: document.querySelectorAll('[data-geometry-id="q24-functions"] [data-geometry-function]').length,
      q26DiagramLabels: Array.from(document.querySelectorAll('[data-figure-id="q26-parabolas"] .geo-caption')).map(node => node.textContent.trim()),
      q27DiagramLabels: Array.from(document.querySelectorAll('[data-figure-id="q27-golden"] .geo-caption')).map(node => node.textContent.trim()),
      q2Projection: (() => {
        const model = document.querySelector('[data-figure-model="q2-mortise"]');
        const svg = model;
        const solidFaces = svg ? Array.from(svg.querySelectorAll('[data-solid-face]')) : [];
        const faceBoxes = solidFaces.map(element => element.getBBox());
        const solidBox = faceBoxes.reduce((box, item) => ({
          left: Math.min(box.left, item.x),
          top: Math.min(box.top, item.y),
          right: Math.max(box.right, item.x + item.width),
          bottom: Math.max(box.bottom, item.y + item.height),
        }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
        return model ? {
          answer: model.getAttribute('data-front-view-option'),
          options: model.querySelectorAll('[data-projection-option]').length,
          solidKind: model.getAttribute('data-solid-kind'),
          faces: solidFaces.length,
          depthEdges: model.querySelectorAll('[data-solid-edge-role="depth"]').length,
          frontFace: !!model.querySelector('[data-solid-face="front-dovetail"]'),
          topFace: !!model.querySelector('[data-solid-face="top-tenon"]'),
          solidAspect: (solidBox.right - solidBox.left) / (solidBox.bottom - solidBox.top),
        } : null;
      })(),
      q13Probability: (() => {
        const model = document.querySelector('[data-figure-model="q13-tile"]');
        return model ? {
          shadedArea: Number(model.getAttribute('data-shaded-area')),
          probability: Number(model.getAttribute('data-probability')),
          samples: model.querySelectorAll('[data-shading-sample]').length,
        } : null;
      })(),
      q15Relation: (() => {
        const model = document.querySelector('[data-figure-model="q15-magic-square"]');
        return model ? model.getAttribute('data-magic-relation') : null;
      })(),
      q21Summary: (() => {
        const model = document.querySelector('[data-figure-model="q21-bmi-charts"]');
        return model ? {
          total: Number(model.getAttribute('data-total-count')),
          missingA: Number(model.getAttribute('data-missing-a')),
          normalPercent: Number(model.getAttribute('data-normal-percent')),
        } : null;
      })(),
      q21TableFigureOverlap: (() => {
        const question = document.querySelector('[data-question-id="21"]');
        if (!question) return true;
        const table = question.querySelector('.exam-table');
        const figure = question.querySelector('[data-figure-id="q21-bmi-charts"]');
        if (!table || !figure) return true;
        const tableBox = table.getBoundingClientRect();
        const figureBox = figure.getBoundingClientRect();
        return !(tableBox.right <= figureBox.left
          || figureBox.right <= tableBox.left
          || tableBox.bottom <= figureBox.top
          || figureBox.bottom <= tableBox.top);
      })(),
      q20ToQ26GeometryFit: (() => {
        const ids = [
          'q20-medians',
          'q23-measurement',
          'q24-functions',
          'q25-circle',
          'q26-parabola-1',
          'q26-parabola-2',
        ];
        const rectOf = element => {
          const rect = element.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
          };
        };
        return ids.map(id => {
          const boardElement = document.querySelector(`[data-geometry-id="${id}"]`);
          const mounted = window.__geometryBoards && window.__geometryBoards[id];
          if (!boardElement || !mounted) {
            return { id, ok: false, reason: 'missing geometry board' };
          }
          const svgElement = boardElement.querySelector('svg');
          const boardRect = rectOf(boardElement);
          const svgRect = svgElement ? rectOf(svgElement) : { width: 0, height: 0 };
          const visiblePointCommands = mounted.plan.commands.filter(command => (
            (command.kind === 'point' || command.kind === 'constructedPoint')
              && command.visible !== false
              && command.label
          ));
          const clippedPoints = visiblePointCommands
            .map(command => {
              const point = mounted.created[command.id];
              if (!point || !point.coords || !point.coords.scrCoords) return null;
              const [, x, y] = point.coords.scrCoords;
              const margin = 2;
              const inside = x >= margin
                && y >= margin
                && x <= svgRect.width - margin
                && y <= svgRect.height - margin;
              return inside ? null : {
                id: command.id,
                x,
                y,
                svgWidth: svgRect.width,
                svgHeight: svgRect.height,
              };
            })
            .filter(Boolean);
          return {
            id,
            ok: true,
            boardRect,
            svgRect,
            svgFillsBoard: Math.abs(svgRect.width - boardRect.width) < 1
              && Math.abs(svgRect.height - boardRect.height) < 1,
            clippedPoints,
          };
        });
      })(),
      rawFirstQuestionMath: document.body.textContent.includes('$-\\frac{1}{2}$的绝对值是'),
      errors: window.__browserSmokeErrors || [],
    }));
    const dynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q5-parallel-board'];
      if (!mounted) return { ok: false, reason: 'missing geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      const angleDegrees = (a, b, c) => {
        const bax = created[a].X() - created[b].X();
        const bay = created[a].Y() - created[b].Y();
        const bcx = created[c].X() - created[b].X();
        const bcy = created[c].Y() - created[b].Y();
        const degrees = Math.atan2(bax * bcy - bay * bcx, bax * bcx + bay * bcy) * 180 / Math.PI;
        return ((degrees % 360) + 360) % 360;
      };
      created.G.moveTo([4, 0], 0);
      created.F.moveTo([2.35, -1.97], 0);
      board.update();
      const ratio = length('G', 'F') / length('G', 'E');
      return {
        ok: true,
        ratio,
        rightDot: dot('G', 'F', 'G', 'E'),
        isoscelesRightDot: dot('M', 'F', 'M', 'N'),
        isoscelesLegDelta: length('M', 'F') - length('M', 'N'),
        footDot: dot('M', 'F', 'M', 'N'),
        collinearCross: cross('G', 'F', 'G', 'M'),
        fBetweenDot: dot('F', 'G', 'F', 'M'),
        angle1: angleDegrees('A', 'G', 'F'),
        nOnCd: Math.abs(created.N.Y() - created.C.Y()),
      };
    });
    const q20DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q20-medians'];
      if (!mounted) return { ok: false, reason: 'missing q20 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const midpointResidual = (point, a, b) => Math.hypot(
        created[point].X() - (created[a].X() + created[b].X()) / 2,
        created[point].Y() - (created[a].Y() + created[b].Y()) / 2,
      );
      created.A.moveTo([0, 3.1], 0);
      created.B.moveTo([-1.75, 0.45], 0);
      board.update();
      return {
        ok: true,
        abAcDelta: length('A', 'B') - length('A', 'C'),
        dMidResidual: midpointResidual('D', 'A', 'B'),
        eMidResidual: midpointResidual('E', 'A', 'C'),
        medianDelta: length('B', 'E') - length('C', 'D'),
        cMirrorSumX: created.B.X() + created.C.X(),
      };
    });
    const q7DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q7-rhombus'];
      if (!mounted) return { ok: false, reason: 'missing q7 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      const midpointResidual = (point, a, b) => Math.hypot(
        created[point].X() - (created[a].X() + created[b].X()) / 2,
        created[point].Y() - (created[a].Y() + created[b].Y()) / 2,
      );
      created.O.moveTo([0.5, -0.25], 0);
      created.A.moveTo([1.58, 2.55], 0);
      board.update();
      return {
        ok: true,
        acLength: length('A', 'C'),
        bdLength: length('B', 'D'),
        diagonalDot: dot('A', 'C', 'B', 'D'),
        oAcMidResidual: midpointResidual('O', 'A', 'C'),
        oBdMidResidual: midpointResidual('O', 'B', 'D'),
        cfOfRatio: length('C', 'F') / length('O', 'F'),
        efBcCross: cross('E', 'F', 'B', 'C'),
      };
    });
    const q16DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q16-rotation'];
      if (!mounted) return { ok: false, reason: 'missing q16 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      created.A.moveTo([0.4, 0.2], 0);
      created.C.moveTo([8.2, 2.8], 0);
      board.update();
      return {
        ok: true,
        adLength: length('A', 'D'),
        bedCross: cross('B', 'E', 'B', 'D'),
        edfCross: cross('E', 'D', 'E', 'F'),
        aecCross: cross('A', 'E', 'A', 'C'),
        abAeDelta: length('A', 'B') - length('A', 'E'),
        adAgDelta: length('A', 'D') - length('A', 'G'),
      };
    });
    const q25DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q25-circle'];
      if (!mounted) return { ok: false, reason: 'missing q25 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      created.E.moveTo([-2.1, 2.14], 0);
      board.update();
      return {
        ok: true,
        oeLength: length('O', 'E'),
        ocCbRatio: length('O', 'C') / length('C', 'B'),
        abCdDot: dot('A', 'B', 'C', 'D'),
        oeEfDot: dot('O', 'E', 'E', 'F'),
        aedCross: cross('A', 'E', 'A', 'D'),
        cdfCross: cross('C', 'D', 'C', 'F'),
      };
    });
    const q23DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q23-measurement'];
      if (!mounted) return { ok: false, reason: 'missing q23 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const angleDegrees = (a, b, c) => {
        const bax = created[a].X() - created[b].X();
        const bay = created[a].Y() - created[b].Y();
        const bcx = created[c].X() - created[b].X();
        const bcy = created[c].Y() - created[b].Y();
        const degrees = Math.atan2(bax * bcy - bay * bcx, bax * bcx + bay * bcy) * 180 / Math.PI;
        return ((degrees % 360) + 360) % 360;
      };
      created.C.moveTo([16, 0], 0);
      board.update();
      return {
        ok: true,
        ceLength: length('C', 'E'),
        dcLength: length('D', 'C'),
        feLength: length('F', 'E'),
        monumentGroundDot: dot('A', 'B', 'B', 'E'),
        cAngle: angleDegrees('A', 'D', 'DLeft'),
        eAngle: angleDegrees('A', 'F', 'FLeft'),
      };
    });
    const q24DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q24-functions'];
      if (!mounted) return { ok: false, reason: 'missing q24 geometry board registry' };
      const { board, created } = mounted;
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      const lineResidual = (point, intercept) => created[point].Y() - (-2 / 3 * created[point].X() + intercept);
      created.E.moveTo([0, 3.5], 0);
      board.update();
      const intercept = created.E.Y();
      return {
        ok: true,
        cInverseResidual: created.C.X() * created.C.Y() + 6,
        dInverseResidual: created.D.X() * created.D.Y() + 6,
        cLineResidual: lineResidual('C', intercept),
        dLineResidual: lineResidual('D', intercept),
        fY: created.F.Y(),
        eX: created.E.X(),
        parallelCross: cross('A', 'B', 'C', 'D'),
      };
    });
    const q27Figure1DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q27-golden-1'];
      if (!mounted) return { ok: false, reason: 'missing q27 figure 1 geometry board registry' };
      const { board, created } = mounted;
      const length = (a, b) => Math.hypot(created[a].X() - created[b].X(), created[a].Y() - created[b].Y());
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      created.E.moveTo([4, 2.2], 0);
      board.update();
      return {
        ok: true,
        beCfDelta: length('B', 'E') - length('C', 'F'),
        aeBfDot: dot('A', 'E', 'B', 'F'),
        cgmCross: cross('C', 'G', 'C', 'M'),
      };
    });
    const q26Figure1DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q26-parabola-1'];
      if (!mounted) return { ok: false, reason: 'missing q26 figure 1 geometry board registry' };
      const { board, created } = mounted;
      const parabola = x => -0.5 * x * x + 5 * x;
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      created.B.moveTo([3, 0], 0);
      board.update();
      return {
        ok: true,
        cResidual: created.C.Y() - parabola(created.C.X()),
        dResidual: created.D.Y() - parabola(created.D.X()),
        abCdCross: cross('A', 'B', 'C', 'D'),
        bcAdCross: cross('B', 'C', 'A', 'D'),
        abBcDot: dot('A', 'B', 'B', 'C'),
      };
    });
    const q26Figure2DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q26-parabola-2'];
      if (!mounted) return { ok: false, reason: 'missing q26 figure 2 geometry board registry' };
      const { board, created } = mounted;
      const c1 = x => -0.5 * x * x + 5 * x;
      const c2 = x => -0.5 * x * x + 40;
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      created.M.moveTo([4, c1(4)], 0);
      board.update();
      return {
        ok: true,
        dC1Residual: created.D.Y() - c1(created.D.X()),
        dC2Residual: created.D.Y() - c2(created.D.X()),
        mResidual: created.M.Y() - c1(created.M.X()),
        nResidual: created.N.Y() - c2(created.N.X()),
        dmnCross: cross('D', 'M', 'D', 'N'),
      };
    });
    const q27Figure2DynamicResult = await page.evaluate(() => {
      const mounted = window.__geometryBoards && window.__geometryBoards['q27-golden-2'];
      if (!mounted) return { ok: false, reason: 'missing q27 figure 2 geometry board registry' };
      const { board, created } = mounted;
      const dot = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].X() - created[c].X()) +
        (created[b].Y() - created[a].Y()) * (created[d].Y() - created[c].Y())
      );
      const cross = (a, b, c, d) => (
        (created[b].X() - created[a].X()) * (created[d].Y() - created[c].Y()) -
        (created[b].Y() - created[a].Y()) * (created[d].X() - created[c].X())
      );
      const midpointResidual = (point, a, b) => Math.hypot(
        created[point].X() - (created[a].X() + created[b].X()) / 2,
        created[point].Y() - (created[a].Y() + created[b].Y()) / 2,
      );
      created.A.moveTo([0.2, 0], 0);
      created.D.moveTo([0.2, 3.4], 0);
      board.update();
      return {
        ok: true,
        eMidResidual: midpointResidual('E', 'B', 'C'),
        aeBfDot: dot('A', 'E', 'B', 'F'),
        cgmCross: cross('C', 'G', 'C', 'M'),
      };
    });
    assert(result.errors.length === 0, `Browser errors: ${result.errors.join('; ')}`);
    assert(result.mjx > 0, 'MathJax should render formula containers');
    assert(result.geometryBoard, 'Question 5 geometry board should exist');
    assert(result.q7GeometryBoard, 'Question 7 geometry board should exist');
    assert(result.q16GeometryBoard, 'Question 16 geometry board should exist');
    assert(result.q20GeometryBoard, 'Question 20 geometry board should exist');
    assert(result.q23GeometryBoard, 'Question 23 measurement geometry board should exist');
    assert(result.q24GeometryBoard, 'Question 24 function geometry board should exist');
    assert(result.q25GeometryBoard, 'Question 25 geometry board should exist');
    assert(result.q26Figure1GeometryBoard, 'Question 26 figure 1 geometry board should exist');
    assert(result.q26Figure2GeometryBoard, 'Question 26 figure 2 geometry board should exist');
    assert(result.q27Figure1GeometryBoard, 'Question 27 figure 1 geometry board should exist');
    assert(result.q27Figure2GeometryBoard, 'Question 27 figure 2 geometry board should exist');
    assert(result.jxgSvg, 'Question 5 geometry board should contain JSXGraph SVG');
    assert(result.q7JxgSvg, 'Question 7 geometry board should contain JSXGraph SVG');
    assert(result.q16JxgSvg, 'Question 16 geometry board should contain JSXGraph SVG');
    assert(result.q20JxgSvg, 'Question 20 geometry board should contain JSXGraph SVG');
    assert(result.q23JxgSvg, 'Question 23 measurement geometry board should contain JSXGraph SVG');
    assert(result.q24JxgSvg, 'Question 24 function geometry board should contain JSXGraph SVG');
    assert(result.q24XAxis, 'Question 24 should render a visible x-axis');
    assert(result.q24YAxis, 'Question 24 should render a visible y-axis');
    assert(result.q25JxgSvg, 'Question 25 geometry board should contain JSXGraph SVG');
    assert(result.q26Figure1JxgSvg, 'Question 26 figure 1 geometry board should contain JSXGraph SVG');
    assert(result.q26Figure2JxgSvg, 'Question 26 figure 2 geometry board should contain JSXGraph SVG');
    assert(result.q27Figure1JxgSvg, 'Question 27 figure 1 geometry board should contain JSXGraph SVG');
    assert(result.q27Figure2JxgSvg, 'Question 27 figure 2 geometry board should contain JSXGraph SVG');
    assert(result.q5RightAngleMarker, 'Question 5 set square should render the right angle marker at G');
    assert(result.q5RightAngleOpenLine, 'Question 5 right angle markers should be open line markers');
    assert(!result.q5SetSquareHole, 'Question 5 should not render the decorative EFG set-square hole');
    assert(result.q5AbSegment, 'Question 5 should render visible segment AB');
    assert(result.q5CdSegment, 'Question 5 should render visible segment CD');
    assert(!result.q5GnSegment, 'Question 5 should not render unnecessary segment GN');
    assert(result.figures.length === 13, `All 13 exam figures should render, got ${result.figures.length}`);
    for (const figure of result.figures) {
      assert(!figure.missing, `Figure ${figure.id} should not use missing renderer fallback`);
      assert(figure.width > 40 && figure.height > 40, `Figure ${figure.id} should have visible layout dimensions`);
      assert(figure.media.length > 0, `Figure ${figure.id} should contain visible media`);
      for (const media of figure.media) {
        assert(media.width > 20 && media.height > 20, `Figure ${figure.id} media should not be collapsed`);
        assert(media.complete, `Figure ${figure.id} image media should load successfully`);
      }
    }
    assert(result.q23Photo, 'Question 23 should include the original monument photo');
    assert(result.q23Photo.src === 'assets/q23-monument-photo.png', 'Question 23 photo should use the cropped original PDF asset');
    assert(result.q23Photo.alt.includes('苏州烈士陵园纪念碑'), 'Question 23 photo should have specific alt text');
    assert(result.q23Photo.naturalWidth > 100 && result.q23Photo.naturalHeight > 100, 'Question 23 photo should load as a real raster image');
    assert(result.q24FunctionGraphs >= 4, 'Question 24 should render inverse and line function graphs');
    assert(result.q26DiagramLabels.includes('图1') && result.q26DiagramLabels.includes('图2'), 'Question 26 should render both parabola diagrams');
    assert(result.q27DiagramLabels.includes('图1') && result.q27DiagramLabels.includes('图2'), 'Question 27 should render both golden-ratio diagrams');
    assert(result.q2Projection && result.q2Projection.answer === 'C', 'Question 2 should expose formal front-view option C');
    assert(result.q2Projection.options === 4, 'Question 2 should render all four model options');
    assert(result.q2Projection.solidKind === 'extruded-dovetail-prism', 'Question 2 should render a 3D dovetail solid model');
    assert(result.q2Projection.faces >= 5, 'Question 2 3D solid should render multiple projected faces');
    assert(result.q2Projection.depthEdges >= 3, 'Question 2 3D solid should render visible depth edges');
    assert(result.q2Projection.frontFace, 'Question 2 3D solid should render the front dovetail face');
    assert(result.q2Projection.topFace, 'Question 2 3D solid should render the raised tenon top face');
    assert(result.q2Projection.solidAspect > 0.85 && result.q2Projection.solidAspect < 1.35, 'Question 2 3D solid should not look horizontally flattened');
    assert(result.q13Probability && result.q13Probability.shadedArea === 4, 'Question 13 should expose shaded area 4');
    assert(result.q13Probability.probability === 0.25, 'Question 13 should expose probability 1/4');
    assert(result.q13Probability.samples >= 2, 'Question 13 should render sample points for the probability model');
    assert(result.q15Relation === '2a=b+c', 'Question 15 should expose the derived magic-square relation');
    assert(result.q21Summary && result.q21Summary.total === 60, 'Question 21 should expose inferred total count');
    assert(result.q21Summary.missingA === 12, 'Question 21 should expose missing A count');
    assert(result.q21Summary.normalPercent === 60, 'Question 21 should expose B group percentage');
    assert(!result.q21TableFigureOverlap, 'Question 21 tables should not overlap the chart figure');
    for (const fit of result.q20ToQ26GeometryFit) {
      assert(fit.ok, fit.reason || `Question geometry ${fit.id} should mount`);
      assert(fit.svgFillsBoard, `${fit.id} JSXGraph SVG should fill its geometry board instead of being capped at ${fit.svgRect.height}px inside ${fit.boardRect.height}px`);
      assert(fit.clippedPoints.length === 0, `${fit.id} visible points should fit inside the rendered SVG: ${JSON.stringify(fit.clippedPoints)}`);
    }
    assert(!result.rawFirstQuestionMath, 'First question raw TeX should not remain visible');
    assert(dynamicResult.ok, dynamicResult.reason || 'Question 5 dynamic geometry should be available');
    assert(Math.abs(dynamicResult.ratio - Math.sqrt(3)) < 1e-6, 'Dragging F should preserve the 30-60-90 set-square ratio');
    assert(Math.abs(dynamicResult.rightDot) < 1e-6, 'Dragging F should preserve the set-square right angle');
    assert(Math.abs(dynamicResult.isoscelesRightDot) < 1e-6, 'Dragging F should preserve FMN as a right triangle');
    assert(Math.abs(dynamicResult.isoscelesLegDelta) < 1e-6, 'Dragging F should preserve FMN as an isosceles right set square');
    assert(Math.abs(dynamicResult.collinearCross) < 1e-6, 'Dragging F should keep G, F, and M collinear');
    assert(dynamicResult.fBetweenDot < 0, 'Dragging F should keep F between G and M');
    assert(Math.abs(dynamicResult.angle1 - 50) < 1e-6, 'Dragging F should keep angle 1 at 50 degrees');
    assert(Math.abs(dynamicResult.nOnCd) < 1e-6, 'Dragging F should keep constructed point N on CD');
    assert(q20DynamicResult.ok, q20DynamicResult.reason || 'Question 20 dynamic geometry should be available');
    assert(Math.abs(q20DynamicResult.abAcDelta) < 1e-6, 'Dragging Q20 controls should preserve AB = AC');
    assert(Math.abs(q20DynamicResult.dMidResidual) < 1e-6, 'Dragging Q20 controls should keep D as midpoint of AB');
    assert(Math.abs(q20DynamicResult.eMidResidual) < 1e-6, 'Dragging Q20 controls should keep E as midpoint of AC');
    assert(Math.abs(q20DynamicResult.medianDelta) < 1e-6, 'Dragging Q20 controls should preserve BE = CD');
    assert(Math.abs(q20DynamicResult.cMirrorSumX) < 1e-6, 'Dragging Q20 base point should keep B and C mirrored across the axis');
    assert(q7DynamicResult.ok, q7DynamicResult.reason || 'Question 7 dynamic geometry should be available');
    assert(Math.abs(q7DynamicResult.acLength - 6) < 1e-6, 'Dragging Q7 controls should preserve AC = 6');
    assert(Math.abs(q7DynamicResult.bdLength - 12) < 1e-6, 'Dragging Q7 controls should preserve BD = 12');
    assert(Math.abs(q7DynamicResult.diagonalDot) < 1e-6, 'Dragging Q7 controls should preserve perpendicular diagonals');
    assert(Math.abs(q7DynamicResult.oAcMidResidual) < 1e-6, 'Dragging Q7 controls should keep O as midpoint of AC');
    assert(Math.abs(q7DynamicResult.oBdMidResidual) < 1e-6, 'Dragging Q7 controls should keep O as midpoint of BD');
    assert(Math.abs(q7DynamicResult.cfOfRatio - 2) < 1e-6, 'Dragging Q7 controls should preserve CF = 2OF');
    assert(Math.abs(q7DynamicResult.efBcCross) < 1e-6, 'Dragging Q7 controls should preserve EF parallel BC');
    assert(q16DynamicResult.ok, q16DynamicResult.reason || 'Question 16 dynamic geometry should be available');
    assert(Math.abs(q16DynamicResult.adLength - 6) < 1e-6, 'Dragging Q16 controls should preserve AD = 6');
    assert(Math.abs(q16DynamicResult.bedCross) < 1e-6, 'Dragging Q16 controls should keep B, E, D collinear');
    assert(Math.abs(q16DynamicResult.edfCross) < 1e-6, 'Dragging Q16 controls should keep E, D, F collinear');
    assert(Math.abs(q16DynamicResult.aecCross) < 1e-6, 'Dragging Q16 controls should keep E on AC');
    assert(Math.abs(q16DynamicResult.abAeDelta) < 1e-6, 'Dragging Q16 controls should preserve rotation length AB = AE');
    assert(Math.abs(q16DynamicResult.adAgDelta) < 1e-6, 'Dragging Q16 controls should preserve rotation length AD = AG');
    assert(q25DynamicResult.ok, q25DynamicResult.reason || 'Question 25 dynamic geometry should be available');
    assert(Math.abs(q25DynamicResult.oeLength - 3) < 1e-6, 'Dragging Q25 point E should keep E on circle O');
    assert(Math.abs(q25DynamicResult.ocCbRatio - 2) < 1e-6, 'Dragging Q25 point E should preserve OC = 2BC');
    assert(Math.abs(q25DynamicResult.abCdDot) < 1e-6, 'Dragging Q25 point E should preserve CD perpendicular to AB');
    assert(Math.abs(q25DynamicResult.oeEfDot) < 1e-6, 'Dragging Q25 point E should preserve tangent EF perpendicular to OE');
    assert(Math.abs(q25DynamicResult.aedCross) < 1e-6, 'Dragging Q25 point E should keep D on AE');
    assert(Math.abs(q25DynamicResult.cdfCross) < 1e-6, 'Dragging Q25 point E should keep F on CD');
    assert(q23DynamicResult.ok, q23DynamicResult.reason || 'Question 23 dynamic geometry should be available');
    assert(Math.abs(q23DynamicResult.ceLength - 16) < 1e-6, 'Dragging Q23 point C should preserve CE = 16');
    assert(Math.abs(q23DynamicResult.dcLength - 1.5) < 1e-6, 'Dragging Q23 point C should preserve DC = 1.5');
    assert(Math.abs(q23DynamicResult.feLength - 1.5) < 1e-6, 'Dragging Q23 point C should preserve FE = 1.5');
    assert(Math.abs(q23DynamicResult.monumentGroundDot) < 1e-6, 'Dragging Q23 point C should preserve monument perpendicular to ground');
    assert(Math.abs(q23DynamicResult.cAngle - 42) < 1e-6, 'Dragging Q23 point C should preserve the 42 degree sight angle');
    assert(Math.abs(q23DynamicResult.eAngle - 30) < 1e-6, 'Dragging Q23 point C should preserve the 30 degree sight angle');
    assert(q24DynamicResult.ok, q24DynamicResult.reason || 'Question 24 dynamic function geometry should be available');
    assert(Math.abs(q24DynamicResult.cInverseResidual) < 1e-6, 'Dragging Q24 line should keep C on the inverse function');
    assert(Math.abs(q24DynamicResult.dInverseResidual) < 1e-6, 'Dragging Q24 line should keep D on the inverse function');
    assert(Math.abs(q24DynamicResult.cLineResidual) < 1e-6, 'Dragging Q24 line should keep C on the translated line');
    assert(Math.abs(q24DynamicResult.dLineResidual) < 1e-6, 'Dragging Q24 line should keep D on the translated line');
    assert(Math.abs(q24DynamicResult.fY) < 1e-6, 'Dragging Q24 line should keep F on the x-axis');
    assert(Math.abs(q24DynamicResult.eX) < 1e-6, 'Dragging Q24 line should keep E on the y-axis');
    assert(Math.abs(q24DynamicResult.parallelCross) < 1e-6, 'Dragging Q24 line should keep AB parallel CD');
    assert(q27Figure1DynamicResult.ok, q27Figure1DynamicResult.reason || 'Question 27 figure 1 dynamic geometry should be available');
    assert(q26Figure1DynamicResult.ok, q26Figure1DynamicResult.reason || 'Question 26 figure 1 dynamic geometry should be available');
    assert(Math.abs(q26Figure1DynamicResult.cResidual) < 1e-6, 'Dragging Q26 figure 1 B should keep C on C1');
    assert(Math.abs(q26Figure1DynamicResult.dResidual) < 1e-6, 'Dragging Q26 figure 1 B should keep D on C1');
    assert(Math.abs(q26Figure1DynamicResult.abCdCross) < 1e-6, 'Dragging Q26 figure 1 B should keep AB parallel CD');
    assert(Math.abs(q26Figure1DynamicResult.bcAdCross) < 1e-6, 'Dragging Q26 figure 1 B should keep BC parallel AD');
    assert(Math.abs(q26Figure1DynamicResult.abBcDot) < 1e-6, 'Dragging Q26 figure 1 B should keep the rectangle right angle');
    assert(q26Figure2DynamicResult.ok, q26Figure2DynamicResult.reason || 'Question 26 figure 2 dynamic geometry should be available');
    assert(Math.abs(q26Figure2DynamicResult.dC1Residual) < 1e-6, 'Q26 figure 2 should keep D on C1');
    assert(Math.abs(q26Figure2DynamicResult.dC2Residual) < 1e-6, 'Q26 figure 2 should keep D on C2');
    assert(Math.abs(q26Figure2DynamicResult.mResidual) < 1e-6, 'Dragging Q26 figure 2 M should keep M on C1');
    assert(Math.abs(q26Figure2DynamicResult.nResidual) < 1e-6, 'Dragging Q26 figure 2 M should keep N on C2');
    assert(Math.abs(q26Figure2DynamicResult.dmnCross) < 1e-6, 'Dragging Q26 figure 2 M should keep D, M, and N collinear');
    assert(Math.abs(q27Figure1DynamicResult.beCfDelta) < 1e-6, 'Dragging Q27 figure 1 point E should preserve BE = CF');
    assert(Math.abs(q27Figure1DynamicResult.aeBfDot) < 1e-6, 'Dragging Q27 figure 1 point E should preserve AE perpendicular BF');
    assert(Math.abs(q27Figure1DynamicResult.cgmCross) < 1e-6, 'Dragging Q27 figure 1 point E should keep C, G, and M collinear');
    assert(q27Figure2DynamicResult.ok, q27Figure2DynamicResult.reason || 'Question 27 figure 2 dynamic geometry should be available');
    assert(Math.abs(q27Figure2DynamicResult.eMidResidual) < 1e-6, 'Dragging Q27 figure 2 controls should keep E as midpoint of BC');
    assert(Math.abs(q27Figure2DynamicResult.aeBfDot) < 1e-6, 'Dragging Q27 figure 2 controls should preserve BF perpendicular AE');
    assert(Math.abs(q27Figure2DynamicResult.cgmCross) < 1e-6, 'Dragging Q27 figure 2 controls should keep C, G, and M collinear');
    console.log('browser smoke tests passed');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
