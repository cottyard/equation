const { create, all } = require('mathjs');
const math = create(all);

// Setup mathjs to use fractions
math.config({
  number: 'Fraction'
});

// --- The New foldConstants Logic ---

function foldConstants(node) {
    // 1. Recurse on children first (Bottom-Up)
    if (node.args) {
        node.args = node.args.map(arg => foldConstants(arg));
    } else if (node.content) {
        node.content = foldConstants(node.content);
    }

    // 2. Helper: Check if node is a pure constant tree
    if (isPureConstant(node)) {
        return evaluateConstantNode(node);
    }

    // 3. Helper: Extract Linear Term { coeff, symbol }
    // Returns null if not a linear term
    const linear = getLinearTerm(node);
    if (linear) {
        const { coeff, symbol } = linear;
        
        // 4. Cleanup and Return Canonical Form
        // If coeff is 0 -> Return 0
        if (isZero(coeff)) {
            return new math.ConstantNode(0);
        }
        // If coeff is 1 -> Return symbol
        if (isOne(coeff)) {
            return symbol;
        }
        // If coeff is -1 -> Return -symbol
        if (isMinusOne(coeff)) {
            return new math.OperatorNode('-', 'unaryMinus', [symbol]);
        }
        // Return coeff * symbol
        return new math.OperatorNode('*', 'multiply', [coeff, symbol]);
    }

    // 5. Handle Binary Addition/Subtraction Identities (x + 0, 0 + x, x - 0)
    // Note: 0 - x is handled by getLinearTerm if x is linear! 
    // Because 0 is constant, x is linear. 0 - x -> -1 * x.
    // But we should keep explicit identity checks for safety or non-linear cases?
    // Actually, getLinearTerm logic for '-' (binary) needs to be careful.
    // If we have 0 - x, getLinearTerm sees c1=0, l2=x.
    // coeff = 0 - 1 = -1.
    // So it returns -x.
    // So we don't need explicit identity for 0-x if getLinearTerm handles it.
    // But what about x + 0?
    // c1=null, l1=x. c2=0.
    // If node is +, and we have l1 and c2.
    // coeff = 1 + 0 = 1.
    // Returns x.
    // So getLinearTerm CAN handle + and - too if we extend it!
    
    // Let's extend getLinearTerm to handle + and - with constants?
    // User said "variable terms, always fold it to coefficient * variable".
    // Usually "term" implies product. But x+0 is effectively a term simplification.
    // Let's add the identity checks explicitly for robustness, as they are cheap.
    
    if (node.op === '+') {
        if (isZeroNode(node.args[0])) return node.args[1];
        if (isZeroNode(node.args[1])) return node.args[0];
    }
    if (node.op === '-') {
        if (node.args.length === 2) {
            if (isZeroNode(node.args[1])) return node.args[0];
            // 0 - x is handled by linear logic below if x is linear, 
            // but if x is not linear (e.g. x^2), we still want 0 - x^2 -> -x^2
            if (isZeroNode(node.args[0])) return new math.OperatorNode('-', 'unaryMinus', [node.args[1]]);
        }
    }
    
    // Handle Parenthesis around constant
    if (node.type === 'ParenthesisNode' && node.content.isConstantNode) {
        return node.content;
    }

    return node;
}

// --- Helpers ---

function isPureConstant(node) {
    if (node.isConstantNode) return true;
    if (node.isSymbolNode) return false;
    if (node.args) {
        return node.args.every(isPureConstant);
    }
    if (node.content) {
        return isPureConstant(node.content);
    }
    return false;
}

function evaluateConstantNode(node) {
    try {
        // Convert numbers to fractions for precision
        const transformToFraction = (n) => {
            if (n.isConstantNode && typeof n.value === 'number') {
                return new math.ConstantNode(math.fraction(n.value));
            }
            if (n.args) n.args = n.args.map(transformToFraction);
            if (n.content) n.content = transformToFraction(n.content);
            return n;
        };
        
        const temp = node.clone();
        transformToFraction(temp);
        const res = temp.compile().evaluate();
        return new math.ConstantNode(res);
    } catch (e) {
        return node;
    }
}

function getLinearTerm(node) {
    // Returns { coeff: ConstantNode, symbol: SymbolNode } or null
    
    // 1. Base Case: Symbol
    if (node.isSymbolNode) {
        return { coeff: new math.ConstantNode(1), symbol: node };
    }
    
    // Handle Parenthesis
    if (node.type === 'ParenthesisNode') {
        return getLinearTerm(node.content);
    }
    
    // 2. Base Case: Constant (Coeff 0) - Treated as linear term 0 * x?
    // No, constant is constant. Not a linear term in the sense of having a variable.
    
    if (node.type !== 'OperatorNode') return null;
    
    // 3. Operations
    const args = node.args;
    
    // Unary Minus
    if (node.op === '-' && args.length === 1) {
        const l = getLinearTerm(args[0]);
        if (l) {
            // - (k * x) -> (-k) * x
            return { coeff: neg(l.coeff), symbol: l.symbol };
        }
    }
    
    // Binary Operations
    if (args.length === 2) {
        const a0 = args[0];
        const a1 = args[1];
        
        const c0 = isPureConstant(a0) ? evaluateConstantNode(a0) : null;
        const c1 = isPureConstant(a1) ? evaluateConstantNode(a1) : null;
        
        const l0 = !c0 ? getLinearTerm(a0) : null;
        const l1 = !c1 ? getLinearTerm(a1) : null;
        
        // Multiplication
        if (node.op === '*') {
            // Const * Linear
            if (c0 && l1) return { coeff: mul(c0, l1.coeff), symbol: l1.symbol };
            // Linear * Const
            if (l0 && c1) return { coeff: mul(l0.coeff, c1), symbol: l0.symbol };
        }
        
        // Division
        if (node.op === '/') {
            // Linear / Const
            if (l0 && c1) return { coeff: div(l0.coeff, c1), symbol: l0.symbol };
            // Const / Linear -> Not linear (1/x)
        }
        
        // Addition (Only if one is 0, effectively)
        // But we handle identities separately. 
        // However, if we have 2x + 3x, that's 5x. 
        // The user didn't explicitly ask for merging terms here, but "fold variable terms".
        // Usually "term" means product. 
        // But if we can merge 2x + 3x here, it simplifies things greatly.
        // Let's see if we should. 
        // "we have only linear equations here so at most 1 variable can appear in 1 term"
        // This suggests we are looking at ISOLATED terms.
        // But if the user drags 2x onto 3x, we get 2x + 3x.
        // If foldConstants handles it, we don't need complex merge logic in drag handler!
        // Let's try to support it.
        
        /* 
           Wait, if I support 2x + 3x -> 5x here, then `flattenTerms` might get confused 
           if it expects a flat list of terms for the renderer.
           The renderer expects `2x + 3x` to be two draggable terms.
           If I merge them into `5x`, they become one term.
           The user wants to drag terms around.
           If I auto-merge `2x + 3x` into `5x` globally, the user can never have `2x + 3x` on screen.
           That might be too aggressive for a teaching tool?
           The user said "terms merging" in the context of drag and drop.
           The drag handler creates `2x + 3x` and then calls `simplify` (or `cleanEquationNode`).
           If `cleanEquationNode` merges them, then the drop results in a merged term.
           That IS what the user wants for "merge".
           BUT, what if the equation is generated as `2x + 3x = 5`?
           Should it auto-merge on load?
           Probably yes, standard form.
           BUT, the user said "don't make the renderer filter out the 0 constant...".
           And "I see this type of term that I cannot compute... this will need auto computing".
           The example was `(4/3 x) * (3/4)`. This is multiplication.
           The user did NOT ask to auto-compute `2x + 3x`.
           So I should restrict folding to Multiplication/Division/Unary.
        */
    }
    
    return null;
}

// Math Helpers
function neg(c) { return evaluateOp('-', [c]); }
function mul(a, b) { return evaluateOp('*', [a, b]); }
function div(a, b) { return evaluateOp('/', [a, b]); }

function evaluateOp(op, args) {
    const node = new math.OperatorNode(op, getFnName(op, args), args);
    return evaluateConstantNode(node);
}

function getFnName(op, args) {
    if (op === '+') return 'add';
    if (op === '-') return (args && args.length === 1) ? 'unaryMinus' : 'subtract';
    if (op === '*') return 'multiply';
    if (op === '/') return 'divide';
    return op;
}

function isZero(node) {
    if (node.value && typeof node.value === 'object') {
        if (node.value.n !== undefined) return node.value.n == 0;
    }
    return node.value === 0;
}
function isOne(node) {
    if (node.value && typeof node.value === 'object') {
        if (node.value.n !== undefined && node.value.d !== undefined) {
            // Check sign if it exists (MathJS Fraction)
            const s = node.value.s !== undefined ? node.value.s : 1;
            return s == 1 && node.value.n == 1 && node.value.d == 1;
        }
    }
    return node.value === 1;
}
function isMinusOne(node) {
    if (node.value && typeof node.value === 'object') {
        if (node.value.n !== undefined && node.value.d !== undefined && node.value.s !== undefined) {
            return node.value.s == -1 && node.value.n == 1 && node.value.d == 1;
        }
    }
    return node.value === -1;
}
function isZeroNode(node) {
    if (!node) return false;
    return isPureConstant(node) && isZero(evaluateConstantNode(node));
}


// --- Test Suite ---

console.log("Running Tests...");

const tests = [
    // 1. Constants
    { in: '1 + 2', out: '3' },
    { in: '1/3 + 1/6', out: '1/2' },
    { in: '2 * 3', out: '6' },
    
    // 2. Identities
    { in: 'x + 0', out: 'x' },
    { in: '0 + x', out: 'x' },
    { in: 'x * 1', out: 'x' },
    { in: '1 * x', out: 'x' },
    { in: 'x - 0', out: 'x' },
    { in: '0 - x', out: '-x' },
    
    // 3. Linear Terms (Multiplication)
    { in: '2 * x', out: '2 * x' },
    { in: 'x * 2', out: '2 * x' },
    { in: '2 * x * 3', out: '6 * x' },
    { in: '3 * (2 * x)', out: '6 * x' },
    { in: '(4/3 * x) * (3/4)', out: 'x' }, // 1 * x -> x
    
    // 4. Linear Terms (Division)
    { in: 'x / 2', out: '1/2 * x' },
    { in: '(2 * x) / 2', out: 'x' },
    { in: '(4 * x) / 2', out: '2 * x' },
    
    // 5. Linear Terms (Unary Minus)
    { in: '-x', out: '-x' },
    { in: '-(-x)', out: 'x' },
    { in: '-(2 * x)', out: '-2 * x' },
    { in: '-(13/-13 * y)', out: 'y' },
    
    // 6. Complex
    { in: '2 * (3 * x) / 6', out: 'x' },
    { in: '-((1/2) * x) * -2', out: 'x' }
];

let passed = 0;
tests.forEach(t => {
    try {
        const node = math.parse(t.in);
        const folded = foldConstants(node);
        let res = folded.toString().replace(/\s+/g, '');
        
        // Normalize Fraction output: 3/1 -> 3
        res = res.replace(/\/1(?!\d)/g, '');
        
        const exp = t.out.replace(/\s+/g, '');
        
        // Allow 0.5 or 1/2 equivalence
        let match = res === exp;
        if (!match) {
             // Try evaluating both to compare values if they are constants
             try {
                 const val1 = math.evaluate(res);
                 const val2 = math.evaluate(exp);
                 if (Math.abs(val1 - val2) < 1e-9) match = true;
             } catch(e) {}
        }
        
        if (match) {
            console.log(`PASS: ${t.in} -> ${folded.toString()}`);
            passed++;
        } else {
            console.error(`FAIL: ${t.in} -> ${folded.toString()} (Expected: ${t.out})`);
        }
    } catch (e) {
        console.error(`ERROR: ${t.in} -> ${e.message}`);
    }
});

if (passed === tests.length) console.log("ALL TESTS PASSED");
else console.log(`FAILED ${tests.length - passed} TESTS`);
