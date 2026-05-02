const { getGeometryProblem } = require('./geometry-problems.js');
const { normalizeScene } = require('./geometry-dsl.js');
const { verifySceneConstraints } = require('./geometry-verifier.js');
const { compileSceneToGclc } = require('./geometry-compiler-gclc.js');
const { compileSceneToJxgPlan } = require('./geometry-jsxgraph.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const scene = normalizeScene(getGeometryProblem('q5-parallel-board'));

assert(scene.id === 'q5-parallel-board', 'scene id should be stable');
assert(scene.objectsById.G.type === 'point', 'point G should exist');
assert(scene.objectsById.AB.type === 'line', 'line AB should exist');
assert(scene.view.visibleSegments.includes('GF'), 'GF should be visible');
assert(!scene.view.visibleSegments.includes('GN'), 'GN should not be drawn because it is not part of the PDF figure');
assert(scene.objectsById.F.draggable && scene.objectsById.F.on === 'FTrack' && !scene.objectsById.F.construct, 'F should be a draggable point constrained to the GM track');
assert(scene.objectsById.FTrackEnd.visible === false, 'FTrackEnd should remain an invisible auxiliary point');
assert(scene.objectsById.FTrack.type === 'segment' && scene.objectsById.FTrack.visible === false, 'F should slide on a hidden segment aligned with GM');
assert(scene.objectsById.E.construct && scene.objectsById.E.construct.type === 'rightTriangle30_60Vertex', 'E should be constructed from the fixed set-square shape');
assert(scene.objectsById.M.construct && scene.objectsById.M.construct.type === 'isoscelesRightTriangleRightVertexOnRay', 'M should be constructed from draggable F and CD');
assert(scene.objectsById.N.construct && scene.objectsById.N.construct.type === 'isoscelesRightTriangleVertex', 'N should be constructed from the fixed 45-45-90 set-square shape');
assert(!scene.objectsById.N.draggable, 'N should not be independently draggable once FMN is a fixed set square constrained by CD');
const angle1 = scene.view.angleMarkers.find(marker => marker.id === 'angle1');
assert(angle1 && angle1.at === 'G' && angle1.from === 'A' && angle1.to === 'F', 'angle 1 should mark angle A-G-F from the PDF');
const angle2 = scene.view.angleMarkers.find(marker => marker.id === 'angle2');
assert(angle2 && angle2.at === 'N' && angle2.from === 'M' && angle2.to === 'C', 'angle 2 should mark the smaller angle M-N-C from the PDF');
assert(scene.view.angleMarkers.some(marker => marker.id === 'rightG' && marker.at === 'G' && marker.right), 'set square should show the right angle at G');
assert(scene.view.angleMarkers.some(marker => marker.id === 'rightM' && marker.at === 'M' && marker.right), 'FMN set square should show the right angle at M');
assert(scene.view.circles.length === 0, 'EFG should not include a decorative set-square hole');

const verification = verifySceneConstraints(scene);
assert(verification.ok, `q5 constraints should pass: ${JSON.stringify(verification.failures)}`);
assert(verification.results.some(result => result.type === 'parallel' && result.ok), 'parallel constraint should be checked');
assert(verification.results.some(result => result.type === 'collinear' && result.ok), 'collinear constraint should be checked');
assert(verification.results.some(result => result.type === 'perpendicular' && result.ok), 'perpendicular constraint should be checked');
assert(verification.results.some(result => result.type === 'rightTriangle30_60' && result.ok), 'EFG should be verified as a 30-60-90 set square');
assert(verification.results.some(result => result.type === 'isoscelesRightTriangle' && result.ok), 'FMN should be verified as an isosceles right set square');
assert(verification.results.some(result => result.type === 'angleDegrees' && result.ok), 'angle 1 should stay numerically constrained to 50 degrees');
assert(verification.results.some(result => result.type === 'pointBetween' && result.ok), 'F should be verified between G and M');
assert(verification.results.some(result => result.type === 'construction' && result.id === 'E' && result.ok), 'constructed set-square vertex E should match its fallback coordinate');
assert(verification.results.some(result => result.type === 'construction' && result.id === 'M' && result.ok), 'constructed right-angle vertex M should match its fallback coordinate');
assert(verification.results.some(result => result.type === 'construction' && result.id === 'N' && result.ok), 'constructed set-square vertex N should match its fallback coordinate');

const gfLength = Math.hypot(scene.objectsById.F.fixed[0] - scene.objectsById.G.fixed[0], scene.objectsById.F.fixed[1] - scene.objectsById.G.fixed[1]);
assert(gfLength > 1.45, 'The 30-60-90 set square should be larger than the earlier undersized version');

const gclc = compileSceneToGclc(scene);
assert(gclc.includes('point A 0 0'), 'GCLC should emit fixed point A');
assert(gclc.includes('line AB A B'), 'GCLC should emit line AB');
assert(gclc.includes('online G AB'), 'GCLC should emit G on AB constraint');
assert(gclc.includes('prove { parallel AB CD }'), 'GCLC should emit proof target for AB parallel CD');
assert(gclc.includes('prove { angleDegrees A G F 50 }'), 'GCLC should emit proof target for angle 1');
assert(gclc.includes('prove { pointBetween F G M }'), 'GCLC should emit proof target for F on segment GM');
assert(gclc.includes('prove { collinear G F M }'), 'GCLC should emit proof target for G F M collinear');
assert(gclc.includes('prove { rightTriangle30_60 E F G rightAt G short GE long GF }'), 'GCLC should emit proof target for the fixed 30-60-90 set square');
assert(gclc.includes('prove { isoscelesRightTriangle F M N rightAt M equal MF MN }'), 'GCLC should emit proof target for the fixed 45-45-90 set square');

const plan = compileSceneToJxgPlan(scene);
assert(plan.boardId === 'geometry-board-q5-parallel-board', 'JSXGraph plan should have stable board id');
assert(plan.commands.some(command => command.kind === 'point' && command.id === 'G' && command.draggable && command.on === 'AB'), 'JSXGraph plan should include draggable glider point G on AB');
assert(plan.commands.some(command => command.kind === 'line' && command.id === 'AB'), 'JSXGraph plan should include line AB');
assert(plan.commands.some(command => command.kind === 'supportSegment' && command.id === 'FTrack' && command.visible === false), 'JSXGraph plan should include the hidden F drag track');
assert(plan.commands.some(command => command.kind === 'point' && command.id === 'F' && command.draggable && command.on === 'FTrack'), 'JSXGraph plan should expose F as a draggable glider');
assert(plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'E' && command.construct.type === 'rightTriangle30_60Vertex'), 'JSXGraph plan should construct E dynamically');
assert(plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'M' && command.construct.type === 'isoscelesRightTriangleRightVertexOnRay'), 'JSXGraph plan should construct M dynamically from F');
assert(plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'N' && command.construct.type === 'isoscelesRightTriangleVertex'), 'JSXGraph plan should construct N dynamically');
assert(plan.commands.some(command => command.kind === 'segment' && command.id === 'GF'), 'JSXGraph plan should include visible segment GF');
assert(!plan.commands.some(command => command.kind === 'segment' && command.id === 'GN'), 'JSXGraph plan should not include visible segment GN');
assert(plan.commands.some(command => command.kind === 'angleMarker' && command.id === 'rightG' && command.right), 'JSXGraph plan should include a right-angle marker for the set square');
assert(plan.commands.some(command => command.kind === 'constraint' && command.type === 'rightTriangle30_60' && command.rightAt === 'G'), 'JSXGraph plan should preserve the set-square constraint');
assert(plan.commands.some(command => command.kind === 'constraint' && command.type === 'isoscelesRightTriangle' && command.rightAt === 'M'), 'JSXGraph plan should preserve the 45-45-90 set-square constraint');

console.log('geometry DSL tests passed');
