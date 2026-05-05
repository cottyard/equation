# Equation Project Plan

## Current Product Direction

This repository started as an equation-solving practice page. The next product direction is a digital math exam page that can render formulas, tables, geometry diagrams, statistics charts, and eventually interactive geometry problems.

The exam page must not treat geometry as hand-drawn decoration. A geometry figure should be a structured construction that can be rendered, dragged, checked, and later used to derive solution steps.

## Technology Decisions

### Math Rendering

Use the existing local MathJax bundle for TeX rendering. MathJax stays responsible for inline and display formulas in question text, tables, and labels.

### Geometry Interaction

Use JSXGraph as the browser interaction layer.

Reasons:

- It is built for dynamic geometry in the browser.
- It supports draggable points and dependent constructions.
- It can render into a normal web page without embedding a full external app.
- It keeps us in JavaScript, matching this repository's current static-page architecture.

### Formal Verification

Use GCLC as the first formal-verification target. GeoGebra can remain a reference/authoring aid, but it should not be the core dependency.

Reasons:

- GCLC is closer to a construction language plus prover/export pipeline.
- It fits a source-controlled DSL better than a full applet platform.
- It can be used offline in development and CI once the toolchain is available.
- The project can compile the same DSL to GCLC for proving and to JSXGraph for interaction.

Long term, the project should add an internal exact symbolic verifier for common middle-school geometry constraints and solution derivation. GCLC is the first external prover target, not a permanent architectural lock-in.

## Geometry DSL Goals

The geometry DSL is the source of truth for geometry problems. The same DSL must support:

1. JSXGraph rendering and interaction.
2. Runtime and test-time constraint checks.
3. GCLC script generation for formal verification.
4. Future solution derivation for angles, lengths, ratios, and areas.

The DSL should represent geometry objects and constraints, not SVG coordinates. SVG is only an output format.

## DSL v0 Shape

```js
{
  id: "q5-parallel-board",
  title: "第5题 平行线间三角板位置图",
  viewport: { xmin: -0.8, xmax: 8.8, ymin: -4.8, ymax: 0.9 },
  objects: [
    { id: "A", type: "point", fixed: [0, 0] },
    { id: "B", type: "point", fixed: [8, 0] },
    { id: "C", type: "point", fixed: [0, -4] },
    { id: "D", type: "point", fixed: [8, -4] },
    { id: "AB", type: "line", through: ["A", "B"] },
    { id: "CD", type: "line", through: ["C", "D"] },
    { id: "G", type: "point", fixed: [3.25, 0], draggable: true, on: "AB" },
    {
      id: "FTrackEnd",
      type: "point",
      fixed: [1.032382746581439, -2.642853328760474],
      visible: false,
      construct: {
        type: "pointOnRay",
        from: "G",
        reference: "A",
        angleDegrees: 50,
        orientation: "counterclockwise",
        length: 3.45
      }
    },
    { id: "FTrack", type: "segment", through: ["G", "FTrackEnd"], visible: false },
    { id: "F", type: "point", fixed: [2.18940044401721, -1.2639733311463137], draggable: true, on: "FTrack" },
    {
      id: "E",
      type: "point",
      fixed: [3.979755342985832, -0.6123374391490614],
      construct: {
        type: "rightTriangle30_60Vertex",
        rightAt: "G",
        longLegTo: "F",
        rotate: "counterclockwise"
      }
    },
    {
      id: "M",
      type: "point",
      fixed: [0.9410727679050144, -2.7516723238878043],
      construct: {
        type: "isoscelesRightTriangleRightVertexOnRay",
        legTo: "F",
        rayStart: "G",
        targetLineThrough: ["C", "D"],
        rotate: "clockwise"
      },
      onLine: ["G", "F"]
    },
    {
      id: "N",
      type: "point",
      fixed: [2.428771760646505, -4],
      construct: { type: "isoscelesRightTriangleVertex", rightAt: "M", legTo: "F", rotate: "clockwise" },
      on: "CD"
    }
  ],
  constraints: [
    { type: "parallel", args: ["AB", "CD"] },
    { type: "pointOn", args: ["G", "AB"] },
    { type: "pointOn", args: ["N", "CD"] },
    { type: "angleDegrees", points: ["A", "G", "F"], degrees: 50 },
    { type: "collinear", args: ["G", "F", "M"] },
    { type: "pointBetween", args: ["F", "G", "M"] },
    { type: "perpendicular", args: ["MF", "MN"] },
    { type: "rightTriangle30_60", triangle: ["E", "F", "G"], rightAt: "G", shortLeg: "GE", longLeg: "GF" },
    { type: "isoscelesRightTriangle", triangle: ["F", "M", "N"], rightAt: "M", equalLegs: ["MF", "MN"] }
  ],
  view: {
    visibleSegments: ["AB", "CD", "GF", "GE", "FE", "GM", "MF", "MN", "FN"],
    labels: ["A", "B", "C", "D", "G", "F", "E", "M", "N"],
    angleMarkers: [
      { id: "angle1", at: "G", from: "A", to: "F", label: "1" },
      { id: "rightG", at: "G", from: "F", to: "E", right: true },
      { id: "angle2", at: "N", from: "M", to: "C", label: "2" },
      { id: "rightM", at: "M", from: "F", to: "N", right: true }
    ],
    circles: []
  }
}
```

The fixed coordinates are fallback positions and test fixtures. The construction and constraint fields are the meaning. Question 5 models two physical set squares. `EFG` is a 30-60-90 set square: right angle at `G`, short leg `GE`, long leg `GF`, and `GF / GE = sqrt(3)`. `FMN` is an isosceles right set square: right angle at `M`, equal legs `MF` and `MN`. The given `angle 1 = 50 deg` fixes the direction of the `GM` track. Point `F` is a draggable glider on a hidden segment of that track, so it has only the degree of freedom visible in the paper: sliding along `GM`. Point `E` is derived from `G` and `F` so that `EFG` remains 30-60-90. Point `M` is solved from draggable `F` and the requirement that the rotated 45-45-90 triangle places `N` on `CD`; `N` is then constructed from `M` and `F`. Dragging `G` or `F` must preserve these relationships.

Later versions should replace more fixed points with geometric constructors such as intersection, point-on-line, perpendicular-through, parallel-through, circle intersection, angle copy, and ratio division.

## Module Plan

- `geometry-dsl.js`: validation helpers, object lookup, point extraction, and scene normalization.
- `geometry-verifier.js`: numeric constraint verification for v0 constraints.
- `geometry-compiler-gclc.js`: DSL-to-GCLC text compiler.
- `geometry-jsxgraph.js`: DSL-to-JSXGraph renderer.
- `geometry-problems.js`: reusable geometry problem DSL definitions, starting with question 5.
- `figure-models.js`: structured models and verification helpers for non-geometry figures such as projection choices, area probability, magic-square relations, and statistics charts.
- `geometry.test.js`: regression tests for DSL validation, constraints, GCLC output, and JSXGraph command planning.
- `figure-models.test.js`: regression tests for specialized non-geometry figure models.
- `exam-renderer.js`: consume geometry problems instead of owning hand-drawn geometry for interactive figures.
- `exam.html`: load JSXGraph and geometry runtime before mounting the paper.
- `exam.css`: style JSXGraph containers and preserve static fallback layout.
- `browser-smoke.js`: browser-level regression test that MathJax renders, every exam figure has visible media, JSXGraph mounts, and interactive geometry constraints survive dragging.

## Implementation Strategy

1. Use SVG/vector rendering for diagrams, charts, coordinate plots, and geometric figures.
2. Keep real-world photographs as cropped source assets from the PDF instead of redrawing them.
3. Convert question 5 first because it already exposed the risk of hand-drawn SVG.
4. For each converted geometry figure, require:
   - A DSL scene.
   - Constraint tests.
   - GCLC export tests.
   - JSXGraph renderer tests for command planning.
   - Browser smoke test that the interactive board mounts.
5. Convert remaining geometry figures one by one.
6. For non-geometry figures, keep specialized renderers, but move the mathematical meaning into `figure-models.js` so the renderer consumes verified data instead of owning the result.

## Verification Requirements

Every geometry DSL scene must pass:

- schema validation;
- numeric constraint verification;
- GCLC script generation;
- browser rendering smoke test for JSXGraph-backed figures;
- no regression in MathJax rendering.

Every exam figure must pass browser-level media checks:

- all 13 configured figures render on the page;
- no figure falls back to a missing-renderer placeholder;
- every SVG, image, or JSXGraph board has nonzero visible dimensions;
- the question 23 monument photo loads as a real raster image from `assets/q23-monument-photo.png`;
- multi-part figures such as questions 23, 26, and 27 expose both parts in the rendered DOM.
- specialized non-geometry figures expose their computed model facts in the DOM, including Q2's front-view option, Q13's shaded area/probability, Q15's derived relation, and Q21's inferred sample size.
- long table questions must not visually overlap their figures; browser smoke tests include a Q21 table/figure overlap check.

For interactive scenes, browser smoke tests must also move each draggable control point and assert that the intended constraints remain true after the move. For Q5 this means:

- `G` remains on `AB`;
- `F` remains between `G` and `M` on the hidden 50-degree track;
- `angle A-G-F` remains 50 degrees;
- `N` remains on `CD`;
- `G`, `F`, and `M` remain collinear;
- `MF` remains perpendicular to `MN`;
- `EFG` remains a 30-60-90 triangle with right angle at `G`;
- `FMN` remains an isosceles right triangle with right angle at `M`;
- visible exam markings such as `angle1`, `angle2`, and right-angle markers remain attached to the constructed points.

For future symbolic solving, the internal verifier should store enough object and constraint information to derive:

- angle values;
- length ratios;
- area relationships;
- parallel/perpendicular proofs;
- triangle congruence/similarity claims.

## Near-Term Milestone

Milestone 1 is complete when question 5 is rendered by JSXGraph from DSL, its constraints are tested, its draggable construction preserves the problem semantics in a browser test, and its GCLC script can be generated from the same source data.

Milestone 2 is complete when every image-bearing problem in the PDF is represented on the digital exam page. In this milestone, questions 2, 13, 15, and 21 use SVG/vector renderers, questions 5, 7, 16, 20, 23, 24, 25, 26, and 27 use interactive JSXGraph renderers backed by DSL scenes and numeric constraints, and question 23 also includes the cropped original monument photo from the PDF scan.

## Current Specialized Figure Model Status

Questions 2, 13, 15, and 21 are not dynamic-geometry proof scenes, so they remain specialized SVG/vector renderers. They are no longer renderer-only drawings:

- Question 2 has a `projection-choice` model for the mortise solid, four options, and the model-derived front-view option `C`. The solid is now an `extruded-dovetail-prism` with explicit 3D vertices, visible faces, and depth edges; the page renders it by projecting the 3D model instead of using a hand-drawn flat SVG.
- Question 13 has an `area-probability` model for the 4 by 4 tile. The model computes total area `16`, shaded area `4`, and probability `1/4`; sample points are rendered on shaded regions for browser-level checks.
- Question 15 has a `magic-square` model. The current visible cells are solved from the 3 by 3 magic-square constraints and derive `2a=b+c`.
- Question 21 has a `statistics-chart` model. The D-sector `3` people and `5%` imply total sample size `60`, missing group `A=12`, and group `B=60%`. The bar chart intentionally keeps A blank to match the incomplete paper figure.

These models live in `figure-models.js`, are tested by `figure-models.test.js`, and expose stable `data-*` facts in the rendered SVG so browser smoke tests can verify the visual output is tied to the model.

## Current Interactive Geometry Status

The page now has these formal, draggable geometry scenes:

- Question 5: two constrained set squares between parallel lines. `G` and `F` are draggable controls, while `E`, `M`, and `N` are constructed to preserve the fixed 30-60-90 and 45-45-90 set-square shapes.
- Question 7: rhombus `ABCD` with `AC=6`, `BD=12`, perpendicular bisecting diagonals, `CF=2OF`, and `EF parallel BC`. `O` moves the construction and `A` rotates the rhombus on the fixed `AC` circle.
- Question 16: parallelogram rotation construction. `A` moves the whole construction and `C` rotates the diagonal on a fixed circle; `E` lies on `AC`, `B,E,D,F` stay collinear, `AD=6`, and the rotated lengths `AB=AE`, `AD=AG`, `BC=EF`, and `CD=FG` are verified.
- Question 20: isosceles triangle with `AB=AC`, constructed midpoints `D` and `E`, and verified equal medians `BE=CD`. `A` and `B` are draggable controls.
- Question 23: measurement diagram generated from the two sight rays and measurement constraints. The real monument photo remains a raster crop from the PDF; the measurement diagram is interactive. `C` drags along the ground while `E`, `D`, `F`, `A`, and `B` are constructed to preserve `CE=16`, instrument height `1.5`, and the `42 deg` and `30 deg` elevation angles.
- Question 24: coordinate/function diagram with visible x/y axes, `y=-6/x`, `y=-2x/3`, and a draggable translated line. `E` drags on the y-axis; `C` and `D` are constructed as intersections of the translated line and inverse function, while `F` is the x-intercept.
- Question 25: circle and tangent construction. `E` is a draggable point on the circle; `C`, `D`, and `F` are constructed so `OC=2BC`, `CD perpendicular AB`, and `EF perpendicular OE`.
- Question 26: two formal function scenes. Figure 1 models `C1: y=-1/2x^2+5x` and a draggable rectangle controlled by `B(t,0)`; `C` and `D` stay on `C1`. Figure 2 models the fixed `t=2` rectangle, the translated parabola `C2: y=-1/2x^2+40`, and a draggable `M` on `C1`; `N` is constructed as the corresponding intersection on `C2` along line `DM`.
- Question 27: two separate DSL scenes. Figure 1 models the square construction with draggable `E`, constructed `F` from `BE=CF`, and intersection points `G` and `M`. Figure 2 models the rectangle construction with draggable rectangle controls, midpoint `E`, foot `G`, and intersection points `F` and `M`.

These scenes share the same constructor and verifier library. New constructor support added after Q5 includes `midpoint`, `mirrorPoint`, `pointReflection`, `perpendicularPointAtDistance`, `ratioPoint`, `lineIntersection`, `parallelPoint`, `perpendicularPoint`, `translatedPoint`, `copyDistanceOnSegment`, `pointFromVectorBasis`, `inverseLineIntersection`, `lineXIntercept`, `verticalPointToParabola`, `rectangleTopRightOnParabola`, `fixedRectanglePointOnParabola`, and `sameLineParabolaIntersection`.

## Current Q5 Status

Question 5 has been corrected from hand-shaped triangles to constrained constructions. The important interpretation is that `EFG` and `FMN` are both set squares from a pair of triangular rulers. The DSL records `EFG` as `rightTriangle30_60` with `rightAt: "G"`, `shortLeg: "GE"`, and `longLeg: "GF"`. It records `FMN` as `isoscelesRightTriangle` with `rightAt: "M"` and equal legs `MF` and `MN`.

The current runtime behavior is:

- `G` is a draggable glider on `AB`.
- `F` is a draggable glider on a hidden `FTrack` segment whose direction makes `angle A-G-F = 50 deg`.
- `E` is constructed from `G` and `F` so that `EFG` remains a fixed 30-60-90 set square.
- `M` is constructed from `F` by solving the 45-45-90 set-square position that keeps `N` on `CD`.
- `N` is constructed from `M` and `F` so that `FMN` remains an isosceles right set square and `N` stays on `CD`.
- Segment `GN` is not rendered because it is not part of the PDF figure.
- The 30-60-90 set square has been scaled up from the earlier undersized draft.
- `angle2` marks the smaller angle `M-N-C`, not the reflex complement.
- Right-angle markers are rendered as open line markers, and decorative set-square hole circles are not rendered for Q5.

The next geometry work should continue turning these numeric constructors into exact symbolic counterparts. The current constructor set covers:

- `pointOnRay`;
- `rightTriangle30_60Vertex`;
- `isoscelesRightTriangleVertex`;
- `isoscelesRightTriangleRightVertexOnRay`;
- `orthogonalProjection`;
- `midpoint`;
- `mirrorPoint`;
- `pointReflection`;
- `perpendicularPointAtDistance`;
- `ratioPoint`;
- `lineIntersection`;
- `parallelPoint`;
- `perpendicularPoint`;
- `translatedPoint`;
- `copyDistanceOnSegment`;
- `pointFromVectorBasis`;
- `inverseLineIntersection`;
- `lineXIntercept`;
- `verticalPointToY`;
- `verticalPointToParabola`;
- `rectangleTopRightOnParabola`;
- `fixedRectanglePointOnParabola`;
- `sameLineParabolaIntersection`.

The remaining SVG/vector-only figures are question 2's 3D object/view selection, question 13's probability tile, question 15's Luoshu/magic-square figure, and question 21's statistical charts. They now have formal specialized models in `figure-models.js`. Question 2's specialized model includes a 3D projection pipeline and browser checks for visible solid faces and depth edges. These figures should remain specialized renderers unless a specific teaching interaction is designed for them.
