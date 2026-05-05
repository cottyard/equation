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

const q20Scene = normalizeScene(getGeometryProblem('q20-medians'));
assert(q20Scene.id === 'q20-medians', 'question 20 should have a stable DSL scene id');
assert(q20Scene.objectsById.A.draggable, 'question 20 apex A should be draggable');
assert(q20Scene.objectsById.B.draggable, 'question 20 base point B should be draggable');
assert(q20Scene.objectsById.C.construct && q20Scene.objectsById.C.construct.type === 'mirrorPoint', 'question 20 point C should mirror B across the isosceles axis');
assert(q20Scene.objectsById.D.construct && q20Scene.objectsById.D.construct.type === 'midpoint', 'question 20 point D should be constructed as midpoint of AB');
assert(q20Scene.objectsById.E.construct && q20Scene.objectsById.E.construct.type === 'midpoint', 'question 20 point E should be constructed as midpoint of AC');
assert(q20Scene.view.visibleSegments.includes('BE'), 'question 20 should draw median BE');
assert(q20Scene.view.visibleSegments.includes('CD'), 'question 20 should draw median CD');

const q20Verification = verifySceneConstraints(q20Scene);
assert(q20Verification.ok, `q20 constraints should pass: ${JSON.stringify(q20Verification.failures)}`);
assert(q20Verification.results.some(result => result.type === 'equalLength' && result.args[0] === 'AB' && result.args[1] === 'AC' && result.ok), 'question 20 should verify AB = AC');
assert(q20Verification.results.some(result => result.type === 'midpoint' && result.args[0] === 'D' && result.ok), 'question 20 should verify D is midpoint of AB');
assert(q20Verification.results.some(result => result.type === 'midpoint' && result.args[0] === 'E' && result.ok), 'question 20 should verify E is midpoint of AC');
assert(q20Verification.results.some(result => result.type === 'equalLength' && result.args[0] === 'BE' && result.args[1] === 'CD' && result.ok), 'question 20 should verify BE = CD');

const q20Gclc = compileSceneToGclc(q20Scene);
assert(q20Gclc.includes('prove { equalLength AB AC }'), 'GCLC should emit AB = AC proof target');
assert(q20Gclc.includes('prove { midpoint D A B }'), 'GCLC should emit D midpoint proof target');
assert(q20Gclc.includes('prove { equalLength BE CD }'), 'GCLC should emit median equality proof target');

const q20Plan = compileSceneToJxgPlan(q20Scene);
assert(q20Plan.boardId === 'geometry-board-q20-medians', 'question 20 should compile to a stable JSXGraph board');
assert(q20Plan.commands.some(command => command.kind === 'point' && command.id === 'A' && command.draggable), 'JSXGraph plan should expose draggable point A');
assert(q20Plan.commands.some(command => command.kind === 'point' && command.id === 'B' && command.draggable), 'JSXGraph plan should expose draggable point B');
assert(q20Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'C' && command.construct.type === 'mirrorPoint'), 'JSXGraph plan should construct C dynamically');
assert(q20Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'D' && command.construct.type === 'midpoint'), 'JSXGraph plan should construct D dynamically');
assert(q20Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'E' && command.construct.type === 'midpoint'), 'JSXGraph plan should construct E dynamically');

const q7Scene = normalizeScene(getGeometryProblem('q7-rhombus'));
assert(q7Scene.id === 'q7-rhombus', 'question 7 should have a stable DSL scene id');
assert(q7Scene.objectsById.O.draggable, 'question 7 intersection O should be draggable');
assert(q7Scene.objectsById.A.draggable && q7Scene.objectsById.A.on === 'ACCircle', 'question 7 point A should rotate as a glider on the fixed AC circle');
assert(q7Scene.objectsById.C.construct && q7Scene.objectsById.C.construct.type === 'pointReflection', 'question 7 point C should reflect A through O');
assert(q7Scene.objectsById.B.construct && q7Scene.objectsById.B.construct.type === 'perpendicularPointAtDistance', 'question 7 point B should be constructed on the perpendicular diagonal');
assert(q7Scene.objectsById.D.construct && q7Scene.objectsById.D.construct.type === 'pointReflection', 'question 7 point D should reflect B through O');
assert(q7Scene.objectsById.F.construct && q7Scene.objectsById.F.construct.type === 'ratioPoint', 'question 7 point F should be constructed from CF = 2OF');
assert(q7Scene.objectsById.E.construct && q7Scene.objectsById.E.construct.type === 'lineIntersection', 'question 7 point E should be the intersection of AB and the parallel through F');

const q7Verification = verifySceneConstraints(q7Scene);
assert(q7Verification.ok, `q7 constraints should pass: ${JSON.stringify(q7Verification.failures)}`);
assert(q7Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'AC' && result.ok), 'question 7 should verify AC = 6');
assert(q7Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'BD' && result.ok), 'question 7 should verify BD = 12');
assert(q7Verification.results.some(result => result.type === 'perpendicular' && result.ok), 'question 7 should verify perpendicular rhombus diagonals');
assert(q7Verification.results.some(result => result.type === 'midpoint' && result.args[0] === 'O' && result.args[1] === 'A' && result.args[2] === 'C' && result.ok), 'question 7 should verify O is midpoint of AC');
assert(q7Verification.results.some(result => result.type === 'lengthRatio' && result.args[0] === 'CF' && result.args[1] === 'OF' && result.ok), 'question 7 should verify CF = 2OF');
assert(q7Verification.results.some(result => result.type === 'parallel' && result.args[0] === 'EF' && result.args[1] === 'BC' && result.ok), 'question 7 should verify EF is parallel to BC');

const q7Gclc = compileSceneToGclc(q7Scene);
assert(q7Gclc.includes('prove { segmentLength AC 6 }'), 'GCLC should emit AC length proof target');
assert(q7Gclc.includes('prove { lengthRatio CF OF 2 }'), 'GCLC should emit CF:OF ratio proof target');
assert(q7Gclc.includes('prove { parallel EF BC }'), 'GCLC should emit EF parallel BC proof target');

const q7Plan = compileSceneToJxgPlan(q7Scene);
assert(q7Plan.boardId === 'geometry-board-q7-rhombus', 'question 7 should compile to a stable JSXGraph board');
assert(q7Plan.commands.some(command => command.kind === 'circleObject' && command.id === 'ACCircle' && command.visible === false), 'JSXGraph plan should include an invisible circle for point A');
assert(q7Plan.commands.some(command => command.kind === 'point' && command.id === 'A' && command.draggable && command.on === 'ACCircle'), 'JSXGraph plan should expose A as a draggable circle glider');
assert(q7Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'F' && command.construct.type === 'ratioPoint'), 'JSXGraph plan should construct F dynamically');
assert(q7Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'E' && command.construct.type === 'lineIntersection'), 'JSXGraph plan should construct E dynamically');

const q25Scene = normalizeScene(getGeometryProblem('q25-circle'));
assert(q25Scene.id === 'q25-circle', 'question 25 should have a stable DSL scene id');
assert(q25Scene.objectsById.E.draggable && q25Scene.objectsById.E.on === 'CircleO', 'question 25 point E should be draggable on the circle');
assert(q25Scene.objectsById.C.construct && q25Scene.objectsById.C.construct.type === 'ratioPoint', 'question 25 point C should encode OC = 2BC');
assert(q25Scene.objectsById.D.construct && q25Scene.objectsById.D.construct.type === 'lineIntersection', 'question 25 point D should be the intersection of AE and the perpendicular through C');
assert(q25Scene.objectsById.F.construct && q25Scene.objectsById.F.construct.type === 'lineIntersection', 'question 25 point F should be the intersection of the tangent at E and the perpendicular through C');

const q25Verification = verifySceneConstraints(q25Scene);
assert(q25Verification.ok, `q25 constraints should pass: ${JSON.stringify(q25Verification.failures)}`);
assert(q25Verification.results.some(result => result.type === 'midpoint' && result.args[0] === 'O' && result.ok), 'question 25 should verify O is midpoint of AB');
assert(q25Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'OE' && result.ok), 'question 25 should verify E remains on circle O');
assert(q25Verification.results.some(result => result.type === 'lengthRatio' && result.args[0] === 'OC' && result.args[1] === 'CB' && result.ok), 'question 25 should verify OC = 2BC');
assert(q25Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'OE' && result.args[1] === 'EF' && result.ok), 'question 25 should verify EF is tangent to circle O at E');
assert(q25Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'AB' && result.args[1] === 'CD' && result.ok), 'question 25 should verify CD is perpendicular to AB');

const q25Gclc = compileSceneToGclc(q25Scene);
assert(q25Gclc.includes('prove { segmentLength OE 3 }'), 'GCLC should emit OE radius proof target');
assert(q25Gclc.includes('prove { lengthRatio OC CB 2 }'), 'GCLC should emit OC:CB ratio proof target');
assert(q25Gclc.includes('prove { perpendicular OE EF }'), 'GCLC should emit tangent proof target');

const q25Plan = compileSceneToJxgPlan(q25Scene);
assert(q25Plan.boardId === 'geometry-board-q25-circle', 'question 25 should compile to a stable JSXGraph board');
assert(q25Plan.commands.some(command => command.kind === 'circleObject' && command.id === 'CircleO'), 'JSXGraph plan should include circle O');
assert(q25Plan.commands.some(command => command.kind === 'point' && command.id === 'E' && command.draggable && command.on === 'CircleO'), 'JSXGraph plan should expose E as a draggable circle glider');
assert(q25Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'D' && command.construct.type === 'lineIntersection'), 'JSXGraph plan should construct D dynamically');
assert(q25Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'F' && command.construct.type === 'lineIntersection'), 'JSXGraph plan should construct F dynamically');

const q23Scene = normalizeScene(getGeometryProblem('q23-measurement'));
assert(q23Scene.id === 'q23-measurement', 'question 23 should have a stable DSL scene id');
assert(q23Scene.objectsById.C.draggable && q23Scene.objectsById.C.on === 'Ground', 'question 23 point C should be draggable on ground');
assert(q23Scene.objectsById.A.construct && q23Scene.objectsById.A.construct.type === 'lineIntersection', 'question 23 top point A should be constructed from two sight rays');
assert(q23Scene.objectsById.D.construct && q23Scene.objectsById.D.construct.type === 'perpendicularPoint', 'question 23 D should be the instrument-height point above C');
assert(q23Scene.objectsById.F.construct && q23Scene.objectsById.F.construct.type === 'perpendicularPoint', 'question 23 F should be the instrument-height point above E');

const q23Verification = verifySceneConstraints(q23Scene);
assert(q23Verification.ok, `q23 constraints should pass: ${JSON.stringify(q23Verification.failures)}`);
assert(q23Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'CE' && result.ok), 'question 23 should verify CE = 16');
assert(q23Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'DC' && result.ok), 'question 23 should verify measuring instrument height DC = 1.5');
assert(q23Verification.results.some(result => result.type === 'angleDegrees' && result.points.join('') === 'ADDLeft' && result.ok), 'question 23 should verify the 42 degree sight angle at D');
assert(q23Verification.results.some(result => result.type === 'angleDegrees' && result.points.join('') === 'AFFLeft' && result.ok), 'question 23 should verify the 30 degree sight angle at F');
assert(q23Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'AB' && result.args[1] === 'BE' && result.ok), 'question 23 should verify the monument is perpendicular to ground');

const q23Plan = compileSceneToJxgPlan(q23Scene);
assert(q23Plan.boardId === 'geometry-board-q23-measurement', 'question 23 should compile to a stable JSXGraph board');
assert(q23Plan.commands.some(command => command.kind === 'point' && command.id === 'C' && command.draggable && command.on === 'Ground'), 'JSXGraph plan should expose C as a ground glider');
assert(q23Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'A' && command.construct.type === 'lineIntersection'), 'JSXGraph plan should construct A dynamically');

const q27Figure1 = normalizeScene(getGeometryProblem('q27-golden-1'));
assert(q27Figure1.id === 'q27-golden-1', 'question 27 figure 1 should have a stable DSL scene id');
assert(q27Figure1.objectsById.E.draggable && q27Figure1.objectsById.E.on === 'BC', 'question 27 figure 1 point E should be draggable on BC');
assert(q27Figure1.objectsById.F.construct && q27Figure1.objectsById.F.construct.type === 'copyDistanceOnSegment', 'question 27 figure 1 should construct F so BE = CF');
assert(q27Figure1.objectsById.G.construct && q27Figure1.objectsById.G.construct.type === 'lineIntersection', 'question 27 figure 1 should construct G as AE and BF intersection');
assert(q27Figure1.objectsById.M.construct && q27Figure1.objectsById.M.construct.type === 'lineIntersection', 'question 27 figure 1 should construct M on AB');

const q27Figure1Verification = verifySceneConstraints(q27Figure1);
assert(q27Figure1Verification.ok, `q27 figure 1 constraints should pass: ${JSON.stringify(q27Figure1Verification.failures)}`);
assert(q27Figure1Verification.results.some(result => result.type === 'equalLength' && result.args[0] === 'BE' && result.args[1] === 'CF' && result.ok), 'question 27 figure 1 should verify BE = CF');
assert(q27Figure1Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'AE' && result.args[1] === 'BF' && result.ok), 'question 27 figure 1 should verify AE perpendicular BF');
assert(q27Figure1Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'CGM' && result.ok), 'question 27 figure 1 should verify C, G, M collinear');

const q27Figure2 = normalizeScene(getGeometryProblem('q27-golden-2'));
assert(q27Figure2.id === 'q27-golden-2', 'question 27 figure 2 should have a stable DSL scene id');
assert(q27Figure2.objectsById.A.draggable, 'question 27 figure 2 should expose a draggable rectangle control point');
assert(q27Figure2.objectsById.E.construct && q27Figure2.objectsById.E.construct.type === 'midpoint', 'question 27 figure 2 should construct E as midpoint of BC');
assert(q27Figure2.objectsById.G.construct && q27Figure2.objectsById.G.construct.type === 'orthogonalProjection', 'question 27 figure 2 should construct G as foot from B to AE');
assert(q27Figure2.objectsById.F.construct && q27Figure2.objectsById.F.construct.type === 'lineIntersection', 'question 27 figure 2 should construct F on CD');
assert(q27Figure2.objectsById.M.construct && q27Figure2.objectsById.M.construct.type === 'lineIntersection', 'question 27 figure 2 should construct M on AB');

const q27Figure2Verification = verifySceneConstraints(q27Figure2);
assert(q27Figure2Verification.ok, `q27 figure 2 constraints should pass: ${JSON.stringify(q27Figure2Verification.failures)}`);
assert(q27Figure2Verification.results.some(result => result.type === 'midpoint' && result.args[0] === 'E' && result.ok), 'question 27 figure 2 should verify E is midpoint of BC');
assert(q27Figure2Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'AE' && result.args[1] === 'BF' && result.ok), 'question 27 figure 2 should verify BF perpendicular AE');
assert(q27Figure2Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'CGM' && result.ok), 'question 27 figure 2 should verify C, G, M collinear');

const q27Figure1Plan = compileSceneToJxgPlan(q27Figure1);
const q27Figure2Plan = compileSceneToJxgPlan(q27Figure2);
assert(q27Figure1Plan.boardId === 'geometry-board-q27-golden-1', 'question 27 figure 1 should compile to JSXGraph');
assert(q27Figure2Plan.boardId === 'geometry-board-q27-golden-2', 'question 27 figure 2 should compile to JSXGraph');

const q16Scene = normalizeScene(getGeometryProblem('q16-rotation'));
assert(q16Scene.id === 'q16-rotation', 'question 16 should have a stable DSL scene id');
assert(q16Scene.objectsById.A.draggable, 'question 16 point A should be draggable');
assert(q16Scene.objectsById.C.draggable && q16Scene.objectsById.C.on === 'ACCircle', 'question 16 point C should be draggable on the fixed AC circle');
assert(q16Scene.objectsById.E.construct && q16Scene.objectsById.E.construct.type === 'ratioPoint', 'question 16 E should be constructed on diagonal AC');
assert(q16Scene.objectsById.B.construct && q16Scene.objectsById.B.construct.type === 'pointFromVectorBasis', 'question 16 B should be constructed from AC basis');
assert(q16Scene.objectsById.D.construct && q16Scene.objectsById.D.construct.type === 'pointFromVectorBasis', 'question 16 D should be constructed from AC basis');
assert(q16Scene.objectsById.F.construct && q16Scene.objectsById.F.construct.type === 'pointFromVectorBasis', 'question 16 F should be constructed from AC basis');
assert(q16Scene.objectsById.G.construct && q16Scene.objectsById.G.construct.type === 'pointFromVectorBasis', 'question 16 G should be constructed from AC basis');

const q16Verification = verifySceneConstraints(q16Scene);
assert(q16Verification.ok, `q16 constraints should pass: ${JSON.stringify(q16Verification.failures)}`);
assert(q16Verification.results.some(result => result.type === 'segmentLength' && result.args[0] === 'AD' && result.ok), 'question 16 should verify AD = 6');
assert(q16Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'AEC' && result.ok), 'question 16 should verify E lies on diagonal AC');
assert(q16Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'BED' && result.ok), 'question 16 should verify B, E, D are collinear');
assert(q16Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'EDF' && result.ok), 'question 16 should verify E, D, F are collinear');
assert(q16Verification.results.some(result => result.type === 'equalLength' && result.args[0] === 'AB' && result.args[1] === 'AE' && result.ok), 'question 16 should verify AB rotates to AE');
assert(q16Verification.results.some(result => result.type === 'equalLength' && result.args[0] === 'AD' && result.args[1] === 'AG' && result.ok), 'question 16 should verify AD rotates to AG');

const q16Gclc = compileSceneToGclc(q16Scene);
assert(q16Gclc.includes('prove { segmentLength AD 6 }'), 'GCLC should emit AD length proof target');
assert(q16Gclc.includes('prove { collinear B E D }'), 'GCLC should emit B,E,D collinearity proof target');

const q16Plan = compileSceneToJxgPlan(q16Scene);
assert(q16Plan.boardId === 'geometry-board-q16-rotation', 'question 16 should compile to a stable JSXGraph board');
assert(q16Plan.commands.some(command => command.kind === 'point' && command.id === 'C' && command.draggable && command.on === 'ACCircle'), 'JSXGraph plan should expose C as a circle glider');
assert(q16Plan.commands.some(command => command.kind === 'constructedPoint' && command.id === 'F' && command.construct.type === 'pointFromVectorBasis'), 'JSXGraph plan should construct F dynamically');

const q24Scene = normalizeScene(getGeometryProblem('q24-functions'));
assert(q24Scene.id === 'q24-functions', 'question 24 should have a stable DSL scene id');
assert(q24Scene.objectsById.E.draggable && q24Scene.objectsById.E.on === 'YAxisTrack', 'question 24 point E should drag the translated line along the y-axis');
assert(q24Scene.objectsById.C.construct && q24Scene.objectsById.C.construct.type === 'inverseLineIntersection', 'question 24 point C should be a constructed translated-line/inverse-curve intersection');
assert(q24Scene.objectsById.D.construct && q24Scene.objectsById.D.construct.type === 'inverseLineIntersection', 'question 24 point D should be a constructed translated-line/inverse-curve intersection');
assert(q24Scene.objectsById.F.construct && q24Scene.objectsById.F.construct.type === 'lineXIntercept', 'question 24 point F should be the translated line x-intercept');

const q24Verification = verifySceneConstraints(q24Scene);
assert(q24Verification.ok, `q24 constraints should pass: ${JSON.stringify(q24Verification.failures)}`);
assert(q24Verification.results.some(result => result.type === 'pointOnInverse' && result.args[0] === 'A' && result.ok), 'question 24 should verify A lies on the inverse function');
assert(q24Verification.results.some(result => result.type === 'pointOnLineEquation' && result.args[0] === 'A' && result.ok), 'question 24 should verify A lies on AB');
assert(q24Verification.results.some(result => result.type === 'pointOnInverse' && result.args[0] === 'C' && result.ok), 'question 24 should verify C lies on the inverse function');
assert(q24Verification.results.some(result => result.type === 'pointOnLineEquation' && result.args[0] === 'C' && result.ok), 'question 24 should verify C lies on the translated line');
assert(q24Verification.results.some(result => result.type === 'parallel' && result.args[0] === 'AB' && result.args[1] === 'CD' && result.ok), 'question 24 should verify AB parallel CD');

const q24Plan = compileSceneToJxgPlan(q24Scene);
assert(q24Plan.boardId === 'geometry-board-q24-functions', 'question 24 should compile to a stable JSXGraph board');
assert(q24Plan.commands.some(command => command.kind === 'line' && command.id === 'XAxis' && command.visible && command.axis), 'JSXGraph plan should include a visible x-axis for question 24');
assert(q24Plan.commands.some(command => command.kind === 'line' && command.id === 'YAxis' && command.visible && command.axis), 'JSXGraph plan should include a visible y-axis for question 24');
assert(q24Plan.commands.some(command => command.kind === 'functionGraph' && command.id === 'Inverse'), 'JSXGraph plan should include the inverse function graph');
assert(q24Plan.commands.some(command => command.kind === 'functionGraph' && command.id === 'TranslatedLine'), 'JSXGraph plan should include the draggable translated line');

const q26Figure1 = normalizeScene(getGeometryProblem('q26-parabola-1'));
assert(q26Figure1.id === 'q26-parabola-1', 'question 26 figure 1 should have a stable DSL scene id');
assert(q26Figure1.objectsById.B.draggable && q26Figure1.objectsById.B.on === 'BaseTrack', 'question 26 figure 1 point B should be draggable on OE');
assert(q26Figure1.objectsById.A.construct && q26Figure1.objectsById.A.construct.type === 'rectangleTopRightOnParabola', 'question 26 figure 1 A should be constructed from B on C1');
assert(q26Figure1.objectsById.C.construct && q26Figure1.objectsById.C.construct.type === 'verticalPointToY', 'question 26 figure 1 C should be constructed above B');
assert(q26Figure1.objectsById.D.construct && q26Figure1.objectsById.D.construct.type === 'verticalPointToParabola', 'question 26 figure 1 D should be constructed above A on C1');

const q26Figure1Verification = verifySceneConstraints(q26Figure1);
assert(q26Figure1Verification.ok, `q26 figure 1 constraints should pass: ${JSON.stringify(q26Figure1Verification.failures)}`);
assert(q26Figure1Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'C' && result.ok), 'question 26 figure 1 should verify C lies on C1');
assert(q26Figure1Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'D' && result.ok), 'question 26 figure 1 should verify D lies on C1');
assert(q26Figure1Verification.results.some(result => result.type === 'parallel' && result.args[0] === 'AB' && result.args[1] === 'CD' && result.ok), 'question 26 figure 1 should verify rectangle horizontal sides');
assert(q26Figure1Verification.results.some(result => result.type === 'perpendicular' && result.args[0] === 'AB' && result.args[1] === 'BC' && result.ok), 'question 26 figure 1 should verify rectangle vertical sides');

const q26Figure2 = normalizeScene(getGeometryProblem('q26-parabola-2'));
assert(q26Figure2.id === 'q26-parabola-2', 'question 26 figure 2 should have a stable DSL scene id');
assert(q26Figure2.objectsById.M.draggable && q26Figure2.objectsById.M.on === 'C1Graph', 'question 26 figure 2 point M should be draggable on C1');
assert(q26Figure2.objectsById.N.construct && q26Figure2.objectsById.N.construct.type === 'sameLineParabolaIntersection', 'question 26 figure 2 point N should be constructed on C2 along line DM');
assert(q26Figure2.objectsById.D.construct && q26Figure2.objectsById.D.construct.type === 'fixedRectanglePointOnParabola', 'question 26 figure 2 D should be constructed from the fixed t=2 rectangle');

const q26Figure2Verification = verifySceneConstraints(q26Figure2);
assert(q26Figure2Verification.ok, `q26 figure 2 constraints should pass: ${JSON.stringify(q26Figure2Verification.failures)}`);
assert(q26Figure2Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'D' && result.parabolaName === 'C1' && result.ok), 'question 26 figure 2 should verify D lies on C1');
assert(q26Figure2Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'D' && result.parabolaName === 'C2' && result.ok), 'question 26 figure 2 should verify D lies on C2');
assert(q26Figure2Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'M' && result.parabolaName === 'C1' && result.ok), 'question 26 figure 2 should verify M lies on C1');
assert(q26Figure2Verification.results.some(result => result.type === 'pointOnParabola' && result.args[0] === 'N' && result.parabolaName === 'C2' && result.ok), 'question 26 figure 2 should verify N lies on C2');
assert(q26Figure2Verification.results.some(result => result.type === 'collinear' && result.args.join('') === 'DMN' && result.ok), 'question 26 figure 2 should verify D, M, N are collinear');

const q26Figure1Plan = compileSceneToJxgPlan(q26Figure1);
const q26Figure2Plan = compileSceneToJxgPlan(q26Figure2);
assert(q26Figure1Plan.commands.some(command => command.kind === 'functionGraph' && command.id === 'C1Graph'), 'question 26 figure 1 should include C1 graph');
assert(q26Figure2Plan.commands.some(command => command.kind === 'functionGraph' && command.id === 'C2Graph'), 'question 26 figure 2 should include C2 graph');

console.log('geometry DSL tests passed');
