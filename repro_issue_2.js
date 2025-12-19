const { create, all } = require('mathjs');
const math = create(all);
const assert = require('assert');

// Mock flattenTerms from script.js (updated version)
function flattenTerms(node) {
    let terms = [];
    
    function recurse(n, currentSign) {
        if (n.type === 'OperatorNode') {
            // Unary minus
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
        
        // Check for Negative Coefficient in Multiplication: -2 * x
        if (n.type === 'OperatorNode' && n.op === '*' && n.args[0].isConstantNode) {
            const val = n.args[0].value;
            let isNeg = false;
            let posVal = null;
            
            if (typeof val === 'number' && val < 0) {
                isNeg = true;
                posVal = -val;
            } else if (val && typeof val.s === 'number' && val.s === -1) {
                isNeg = true;
                posVal = val.mul(-1);
            }
            
            if (isNeg) {
                // Create new node with positive coefficient
                const newArgs = [...n.args];
                newArgs[0] = new math.ConstantNode(posVal);
                const newNode = new math.OperatorNode(n.op, n.fn, newArgs);
                newNode._id = n._id;
                terms.push({ node: newNode, sign: -currentSign });
                return;
            }
        }

        // Base case: a term
        // Check if it's a negative constant
        if (n.isConstantNode && typeof n.value === 'number' && n.value < 0) {
            const newNode = new math.ConstantNode(-n.value);
            newNode._id = n._id; // Preserve ID for drag/drop
            terms.push({ node: newNode, sign: -currentSign });
        } else if (n.isConstantNode && n.value && typeof n.value.s === 'number' && n.value.s === -1) {
             // Negative Fraction
             const posFrac = n.value.mul(-1);
             const newNode = new math.ConstantNode(posFrac);
             newNode._id = n._id; // Preserve ID for drag/drop
             terms.push({ node: newNode, sign: -currentSign });
        } else {
            terms.push({ node: n, sign: currentSign });
        }
    }
    
    recurse(node, 1);
    return terms;
}

console.log("--- Test: Negative Coefficient Flattening ---");
// Construct -2x
const x = new math.SymbolNode('x');
const neg2 = new math.ConstantNode(-2);
const expr = new math.OperatorNode('*', 'multiply', [neg2, x]);

const terms = flattenTerms(expr);
console.log("Terms:", terms.map(t => ({ val: t.node.toString(), sign: t.sign })));

// Expectation: sign: -1, val: 2x
// Current Reality: sign: 1, val: -2x (or similar)

if (terms[0].sign === 1 && terms[0].node.toString().includes('-')) {
    console.log("FAIL: Negative coefficient not extracted to sign.");
} else {
    console.log("PASS: Negative coefficient handled.");
}
