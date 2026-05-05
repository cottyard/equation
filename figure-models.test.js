const {
  computeBmiSummary,
  computeTileProbability,
  deriveMagicSquareRelation,
  getFigureModel,
  pointInTileShading,
  projectSolid,
  verifyFigureModel,
} = require('./figure-models.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const q2 = getFigureModel('q2-mortise');
assert(q2.type === 'projection-choice', 'question 2 should be represented as a projection-choice model');
assert(q2.options.length === 4, 'question 2 should keep four front-view options');
assert(q2.frontView.optionId === 'C', 'question 2 should encode the model-derived front-view option');
assert(q2.object.kind === 'extruded-dovetail-prism', 'question 2 should model the mortise as an extruded dovetail prism');
assert(Object.keys(q2.object.vertices).length >= 16, 'question 2 should describe real 3D vertices');
assert(q2.object.faces.some(face => face.id === 'front-dovetail'), 'question 2 should include the front dovetail face');
assert(q2.object.faces.some(face => face.id === 'top-tenon'), 'question 2 should include the raised top face');
assert(q2.object.edges.some(edge => edge.role === 'depth'), 'question 2 should include visible depth edges');

const q2Projection = projectSolid(q2);
assert(q2Projection.faces.length >= 5, 'question 2 3D projection should expose multiple visible faces');
assert(q2Projection.faces.some(face => face.id === 'front-dovetail' && face.points.length === q2.frontView.profile.length), 'question 2 projected front face should match the front-view profile');
assert(q2Projection.edges.filter(edge => edge.role === 'depth').length >= 3, 'question 2 projection should keep depth edges visible');

const q13 = getFigureModel('q13-tile');
const tileProbability = computeTileProbability(q13);
assert(tileProbability.totalArea === 16, 'question 13 tile should have total area 16');
assert(tileProbability.shadedArea === 4, 'question 13 shaded area should be 4 square units');
assert(tileProbability.probability === 0.25, 'question 13 shaded probability should be 1/4');
assert(pointInTileShading(q13, [0.2, 0.2]), 'question 13 corner sample should fall in the shaded region');
assert(pointInTileShading(q13, [2, 1.5]), 'question 13 center sample should fall in the shaded region');
assert(!pointInTileShading(q13, [0.9, 0.9]), 'question 13 off-triangle sample should fall outside the shaded region');

const q15 = getFigureModel('q15-magic-square');
const relation = deriveMagicSquareRelation(q15);
assert(relation.normalized === '2a=b+c', 'question 15 visible cells should imply 2a=b+c');
assert(relation.sourceLines.includes('row1') && relation.sourceLines.includes('column3'), 'question 15 derivation should name the equations used');

const q21 = getFigureModel('q21-bmi-charts');
const bmi = computeBmiSummary(q21);
assert(bmi.total === 60, 'question 21 D=3 and 5% should imply total 60');
assert(bmi.missing.A === 12, 'question 21 missing A count should be 12');
assert(bmi.percentages.B === 60, 'question 21 B group should be 60%');
assert(bmi.renderedBars.A === null, 'question 21 A bar should stay initially blank for the incomplete chart');

for (const id of ['q2-mortise', 'q13-tile', 'q15-magic-square', 'q21-bmi-charts']) {
  const result = verifyFigureModel(getFigureModel(id));
  assert(result.ok, `${id} model should verify: ${JSON.stringify(result.failures)}`);
}

console.log('figure model tests passed');
