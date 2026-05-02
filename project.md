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
- `geometry.test.js`: regression tests for DSL validation, constraints, GCLC output, and JSXGraph command planning.
- `exam-renderer.js`: consume geometry problems instead of owning hand-drawn geometry for interactive figures.
- `exam.html`: load JSXGraph and geometry runtime before mounting the paper.
- `exam.css`: style JSXGraph containers and preserve static fallback layout.
- `browser-smoke.js`: browser-level regression test that MathJax renders, JSXGraph mounts, and Q5 constraints survive dragging.

## Implementation Strategy

1. Keep the existing SVG renderer as a fallback for figures not yet converted.
2. Convert question 5 first because it already exposed the risk of hand-drawn SVG.
3. For each converted geometry figure, require:
   - A DSL scene.
   - Constraint tests.
   - GCLC export tests.
   - JSXGraph renderer tests for command planning.
   - Browser smoke test that the interactive board mounts.
4. Convert remaining geometry figures one by one.

## Verification Requirements

Every geometry DSL scene must pass:

- schema validation;
- numeric constraint verification;
- GCLC script generation;
- browser rendering smoke test for JSXGraph-backed figures;
- no regression in MathJax rendering.

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

The next geometry work should generalize these Q5-specific constructors into a small constructor library with exact symbolic counterparts. The first constructor set should cover:

- `pointOnRay`;
- `rightTriangle30_60Vertex`;
- `isoscelesRightTriangleVertex`;
- `isoscelesRightTriangleRightVertexOnRay`;
- `orthogonalProjection`;
- `intersection`;
- `parallelThrough`;
- `perpendicularThrough`;
- `angleCopy`;
- `ratioPoint`.

After that, each remaining exam geometry figure should be converted only when its constraints can be represented in the DSL and tested in the same render, numeric verification, GCLC export, and browser-drag loop.
