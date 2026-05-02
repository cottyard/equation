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
    const result = await page.evaluate(() => ({
      mjx: document.querySelectorAll('mjx-container').length,
      geometryBoard: !!document.querySelector('[data-geometry-id="q5-parallel-board"]'),
      jxgSvg: !!document.querySelector('[data-geometry-id="q5-parallel-board"] svg'),
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
    assert(result.errors.length === 0, `Browser errors: ${result.errors.join('; ')}`);
    assert(result.mjx > 0, 'MathJax should render formula containers');
    assert(result.geometryBoard, 'Question 5 geometry board should exist');
    assert(result.jxgSvg, 'Question 5 geometry board should contain JSXGraph SVG');
    assert(result.q5RightAngleMarker, 'Question 5 set square should render the right angle marker at G');
    assert(result.q5RightAngleOpenLine, 'Question 5 right angle markers should be open line markers');
    assert(!result.q5SetSquareHole, 'Question 5 should not render the decorative EFG set-square hole');
    assert(result.q5AbSegment, 'Question 5 should render visible segment AB');
    assert(result.q5CdSegment, 'Question 5 should render visible segment CD');
    assert(!result.q5GnSegment, 'Question 5 should not render unnecessary segment GN');
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
    console.log('browser smoke tests passed');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
