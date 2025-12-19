const { create, all } = require('mathjs');
const math = create(all);
math.config({ number: 'Fraction' });
const assert = require('assert');

// --- Mocks and Helpers from script.js ---

function postProcessNode(node) {
    return node.transform(function (n) {
        if (n.type === 'OperatorNode' && n.fn === 'unaryMinus') {
            const arg = n.args[0];
            if (arg.isConstantNode) {
                const val = arg.value;
                if (typeof val === 'number') {
                    return new math.ConstantNode(-val);
                }
                if (val && typeof val.mul === 'function') { // Fraction
                    return new math.ConstantNode(val.mul(-1));
                }
            }
            if (arg.type === 'OperatorNode' && arg.op === '*') {
                if (arg.args[0].isConstantNode) {
                    const val = arg.args[0].value;
                    let newVal;
                    if (typeof val === 'number') newVal = -val;
                    else if (val && typeof val.mul === 'function') newVal = val.mul(-1);
                    
                    if (newVal !== undefined) {
                        return new math.OperatorNode('*', 'multiply', [
                            new math.ConstantNode(newVal),
                            arg.args[1]
                        ]);
                    }
                }
            }
            if (arg.type === 'OperatorNode' && arg.op === '/') {
                if (arg.args[0].isConstantNode) {
                    const val = arg.args[0].value;
                    let newVal;
                    if (typeof val === 'number') newVal = -val;
                    else if (val && typeof val.mul === 'function') newVal = val.mul(-1);
                    
                    if (newVal !== undefined) {
                        return new math.OperatorNode('/', 'divide', [
                            new math.ConstantNode(newVal),
                            arg.args[1]
                        ]);
                    }
                }
            }
        }
        return n;
    });
}

function cleanEquationNode(node) {
    let res = math.simplify(node);
    return postProcessNode(res);
}

function distributeNode(node) {
    // Case 1: Multiplication A * (B + C)
    if (node.type === 'OperatorNode' && node.op === '*') {
        const args = node.args;
        const addIndex = args.findIndex(n => n.type === 'OperatorNode' && (n.op === '+' || n.op === '-'));
        
        if (addIndex !== -1) {
            const addNode = args[addIndex];
            const otherNode = args[1 - addIndex];
            
            const newArgs = addNode.args.map(term => {
                const prod = new math.OperatorNode('*', 'multiply', [otherNode, term]);
                return math.simplify(prod);
            });
            
            const newNode = new math.OperatorNode(addNode.op, addNode.fn, newArgs);
            return postProcessNode(newNode);
        }
    }

    // Case 2: Division (A + B) / C
    if (node.type === 'OperatorNode' && node.op === '/') {
        const numerator = node.args[0];
        const denominator = node.args[1];
        
        if (numerator.type === 'OperatorNode' && (numerator.op === '+' || numerator.op === '-')) {
            const newArgs = numerator.args.map(term => {
                const div = new math.OperatorNode('/', 'divide', [term, denominator]);
                return math.simplify(div);
            });
            
            const newNode = new math.OperatorNode(numerator.op, numerator.fn, newArgs);
            return postProcessNode(newNode);
        }
    }
    
    return node;
}

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
        terms.push({ node: n, sign: currentSign });
    }
    recurse(node, 1);
    return terms;
}

function canMerge(node1, node2) {
    if (node1.isConstantNode && node2.isConstantNode) return true;
    const getSymbol = (n) => {
        if (n.isSymbolNode) return n.name;
        if (n.type === 'OperatorNode' && n.op === '*') {
            const sym = n.args.find(a => a.isSymbolNode);
            return sym ? sym.name : null;
        }
        return null;
    };
    const s1 = getSymbol(node1);
    const s2 = getSymbol(node2);
    if (s1 && s2 && s1 === s2) return true;
    return false;
}

function rebuildAST(terms) {
    if (terms.length === 0) return new math.ConstantNode(0);
    let result = null;
    terms.forEach(t => {
        let termNode = t.node;
        if (t.sign === -1) {
            termNode = new math.OperatorNode('-', 'unaryMinus', [termNode]);
        }
        if (result === null) {
            result = termNode;
        } else {
            result = new math.OperatorNode('+', 'add', [result, termNode]);
        }
    });
    return cleanEquationNode(math.simplify(result));
}

// --- Tests ---

function testDistribution() {
    console.log('Testing Distribution...');
    const expr = '3 * (x + 2)';
    const node = math.simplify(math.parse(expr)); // Simplify to remove ParenthesisNode
    const distributed = distributeNode(node);
    const expected = '3 * x + 6';
    // Normalize strings by removing spaces and handling fraction representation if needed
    // With Fraction config, 3 might be 3/1. 6 might be 6/1.
    // Let's compare simplified strings or just check structure.
    // Or just use math.simplify on the result to normalize.
    const resStr = math.simplify(distributed).toString().replace(/\s/g, '');
    const expStr = math.simplify(math.parse(expected)).toString().replace(/\s/g, '');
    
    assert.strictEqual(resStr, expStr);
    console.log('PASS: 3 * (x + 2) -> 3x + 6');
}

function testFractionSplit() {
    console.log('Testing Fraction Split...');
    const expr = '(x + 4) / 2';
    const node = math.simplify(math.parse(expr)); // Simplify input
    const split = distributeNode(node);
    // x/2 + 4/2 -> x/2 + 2
    const str = split.toString().replace(/\s/g, '');
    console.log('Actual split string:', str);
    
    // Allow for various formats: 0.5*x+2, x/2+2, 1/2*x+2
    // With Fraction config, 1/2 is likely 1/2.
    assert.ok(str === 'x/2+2' || str === '1/2*x+2' || str === '0.5*x+2' || str === 'x/2+2/1');
    console.log('PASS: (x + 4) / 2 -> x/2 + 2');
}

function testFlattenTerms() {
    console.log('Testing Flatten Terms...');
    const expr = '2*x - 3*y + 5';
    const node = math.simplify(math.parse(expr)); // Simplify input
    const terms = flattenTerms(node);
    
    console.log('Terms found:', terms.map(t => ({ str: t.node.toString(), sign: t.sign })));
    
    assert.strictEqual(terms.length, 3);
    
    // We can't guarantee order after simplify, so let's find by content
    const findTerm = (substr) => terms.find(t => t.node.toString().replace(/\s/g, '').includes(substr));
    
    const tX = findTerm('x');
    assert.ok(tX);
    assert.ok(tX.node.toString().includes('2'));
    assert.strictEqual(tX.sign, 1);
    
    const tY = findTerm('y');
    assert.ok(tY);
    assert.ok(tY.node.toString().includes('3'));
    // If simplify made it + (-3)*y, then sign is 1, but node has -3.
    // If simplify made it - (3*y), then sign is -1, node has 3.
    // Let's check the combination.
    // If sign is 1, node should be negative. If sign is -1, node should be positive.
    // Actually, flattenTerms handles unaryMinus.
    // If simplify produces 2*x - 3*y, it's OperatorNode(-).
    // If simplify produces 2*x + (-3)*y, it's OperatorNode(+).
    // (-3)*y is OperatorNode(*). flattenTerms treats it as a term.
    // So we get node=(-3)*y, sign=1.
    // OR we get node=3*y, sign=-1.
    // Let's accept either.
    const isNegY = (tY.sign === -1 && !tY.node.toString().includes('-')) || 
                   (tY.sign === 1 && tY.node.toString().includes('-'));
    assert.ok(isNegY, 'y term should be negative');

    const tC = terms.find(t => !t.node.toString().includes('x') && !t.node.toString().includes('y'));
    assert.ok(tC);
    assert.ok(tC.node.toString().includes('5'));
    assert.strictEqual(tC.sign, 1);
    
    console.log('PASS: Flatten 2x - 3y + 5');

    console.log("Testing Flatten Unary Minus...");
    const exprUnary = math.parse("-x + 5");
    const termsUnary = flattenTerms(exprUnary);
    console.log("Terms found:", termsUnary.map(t => ({ str: t.node.toString(), sign: t.sign })));
    assert.strictEqual(termsUnary.length, 2);
    // x should have sign -1
    const tXU = termsUnary.find(t => t.node.toString().includes('x'));
    assert.strictEqual(tXU.sign, -1);
    console.log("PASS: Flatten -x + 5");
}

function testCanMerge() {
    console.log('Testing Can Merge...');
    const n1 = math.parse('2*x');
    const n2 = math.parse('3*x');
    const n3 = math.parse('5');
    const n4 = math.parse('2*y');
    
    assert.strictEqual(canMerge(n1, n2), true, '2x and 3x should merge');
    assert.strictEqual(canMerge(n1, n3), false, '2x and 5 should not merge');
    assert.strictEqual(canMerge(n1, n4), false, '2x and 2y should not merge');
    console.log('PASS: Merge logic');
}

function testRebuildAST() {
    console.log('Testing Rebuild AST...');
    const terms = [
        { node: math.parse('2*x'), sign: 1 },
        { node: math.parse('3*y'), sign: -1 }
    ];
    const node = rebuildAST(terms);
    const str = node.toString().replace(/\s/g, '');
    assert.ok(str === '2*x-3*y');
    console.log('PASS: Rebuild 2x - 3y');
}

// Run
try {
    testDistribution();
    testFractionSplit();
    testFlattenTerms();
    testCanMerge();
    testRebuildAST();
    console.log('ALL TESTS PASSED');
} catch (e) {
    console.error('TEST FAILED:', e);
    process.exit(1);
}