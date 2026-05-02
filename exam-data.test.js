const paper = require('./exam-data.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function flattenItems(sections) {
  return sections.flatMap(section => section.items.map(item => ({ ...item, sectionType: section.type })));
}

const items = flattenItems(paper.sections);
const ids = items.map(item => item.id);

assert(paper.title.includes('数学'), 'paper title should identify the math exam');
assert(items.length === 27, `expected 27 digitized questions, got ${items.length}`);
assert(JSON.stringify(ids) === JSON.stringify(Array.from({ length: 27 }, (_, i) => i + 1)), 'question ids should be 1 through 27');

const sectionCounts = paper.sections.map(section => [section.type, section.items.length]);
assert(JSON.stringify(sectionCounts) === JSON.stringify([
  ['choice', 8],
  ['blank', 8],
  ['solution', 11],
]), `unexpected section counts: ${JSON.stringify(sectionCounts)}`);

for (const item of items) {
  assert(Array.isArray(item.blocks), `question ${item.id} should have blocks`);
  assert(item.blocks.length > 0, `question ${item.id} should not be empty`);
}

const figureIds = new Set(paper.figures.map(figure => figure.id));
for (const item of items) {
  for (const id of item.figureIds || []) {
    assert(figureIds.has(id), `question ${item.id} references missing figure ${id}`);
  }
}

for (const figure of paper.figures) {
  assert(figure.title && figure.title.trim(), `figure ${figure.id} should have a title`);
  assert(figure.kind === 'svg', `figure ${figure.id} should be rendered as svg`);
}

const omitted = paper.omittedAssets || [];
const q23Photo = omitted.find(asset => asset.questionId === 23 && asset.kind === 'real-photo');
assert(q23Photo, 'question 23 real monument photo should be explicitly omitted');
assert(q23Photo.reason.includes('真实照片'), 'question 23 omission should explain it is a real photo');

console.log('exam data tests passed');
