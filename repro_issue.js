const { create, all } = require('mathjs');
const math = create(all);
const assert = require('assert');

// Mock flattenTerms from script.js (updated version)
function flattenTerms(node) {
    let terms = [];
    
    function recurse(n, currentSign) {
        if (n.type === 'OperatorNode') {
            if (n.fn === 'unaryMinus') {
                recurse(n.args[0], -currentSign);
                return;
            }
            if (n.op === '+') {
                n.args.forEach(arg => recurse(arg, currentSign));
                return;
            }
            if (n.op === '-') {
                recurse(n.args[0], currentSign);
                recurse(n.args[1], -currentSign);
                return;
            }
        }
        // Base case: a term
        // Check if it's a negative constant
        if (n.isConstantNode && typeof n.value === 'number' && n.value < 0) {
            terms.push({ node: new math.ConstantNode(-n.value), sign: -currentSign });
        } else if (n.isConstantNode && n.value && typeof n.value.s === 'number' && n.value.s === -1) {
             // Negative Fraction
             const posFrac = n.value.mul(-1);
             terms.push({ node: new math.ConstantNode(posFrac), sign: -currentSign });
        } else {
            terms.push({ node: n, sign: currentSign });
        }
    }
    
    recurse(node, 1);
    return terms;
}

// Test Case 1: Cross-side move logic simulation
console.log("--- Test 1: Cross-side logic ---");
let lhsTerms = [{id: 1, val: 'x'}];
let rhsTerms = [{id: 2, val: '5'}];

// Move 'x' from LHS to RHS
let sourceTerms = lhsTerms; // Reference
let targetTerms = rhsTerms; // Reference

// Remove from source
let item = sourceTerms.shift(); // x
// Add to target
targetTerms.push(item);

// Rebuild
// BUG: The original code called getSideTerms('lhs') which re-read from eq.lhs
// effectively ignoring the changes to sourceTerms/targetTerms if they were different arrays.
// We can't easily mock the whole eq structure here, but the fix is obvious: use the modified arrays.


// Test Case 2: Double signs with negative constant
console.log("--- Test 2: Negative Constant Flattening ---");
// Construct x + (-5)
const x = new math.SymbolNode('x');
const neg5 = new math.ConstantNode(-5);
const expr = new math.OperatorNode('+', 'add', [x, neg5]);

const terms = flattenTerms(expr);
console.log("Terms:", terms.map(t => ({ val: t.node.toString(), sign: t.sign })));

// Expectation: We want to see sign: -1 and val: 5
// Current Reality: sign: 1 and val: -5
// This leads to render: " + -5"

if (terms[1].sign === 1 && terms[1].node.value < 0) {
    console.log("FAIL: Negative constant not extracted to sign.");
} else {
    console.log("PASS: Negative constant handled.");
}
