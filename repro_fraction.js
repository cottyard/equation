const { create, all } = require('mathjs');
const math = create(all);
math.config({ number: 'Fraction' });

// Mock flattenTerms
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
                const newArgs = [...n.args];
                newArgs[0] = new math.ConstantNode(posVal);
                const newNode = new math.OperatorNode(n.op, n.fn, newArgs);
                newNode._id = n._id;
                terms.push({ node: newNode, sign: -currentSign });
                return;
            }
        }

        // Check for Negative Numerator in Division: -1 / 2
        if (n.type === 'OperatorNode' && n.op === '/') {
            const numerator = n.args[0];
            console.log("Numerator type:", numerator.type);
            const denominator = n.args[1];
            
            if (numerator.isConstantNode) {
                console.log("Numerator value:", numerator.value);
                let isNeg = false;
                let posVal = null;
                
                if (typeof numerator.value === 'number' && numerator.value < 0) {
                    isNeg = true;
                    posVal = -numerator.value;
                } else if (numerator.value && typeof numerator.value.s === 'number' && numerator.value.s === -1) {
                    isNeg = true;
                    posVal = numerator.value.mul(-1);
                }
                
                if (isNeg) {
                    const newArgs = [new math.ConstantNode(posVal), denominator];
                    const newNode = new math.OperatorNode('/', 'divide', newArgs);
                    newNode._id = n._id;
                    terms.push({ node: newNode, sign: -currentSign });
                    return;
                }
            }
            
            // Case 2: Numerator is unary minus
            if (numerator.type === 'OperatorNode' && numerator.fn === 'unaryMinus') {
                const newArgs = [numerator.args[0], denominator];
                const newNode = new math.OperatorNode('/', 'divide', newArgs);
                newNode._id = n._id;
                terms.push({ node: newNode, sign: -currentSign });
                return;
            }
        }

        // Base case: a term
        // Check if it's a negative constant
        if (n.isConstantNode && typeof n.value === 'number' && n.value < 0) {
            const newNode = new math.ConstantNode(-n.value);
            newNode._id = n._id; 
            terms.push({ node: newNode, sign: -currentSign });
        } else if (n.isConstantNode && n.value && typeof n.value.s === 'number' && n.value.s === -1) {
             // Negative Fraction
             const posFrac = n.value.mul(-1);
             const newNode = new math.ConstantNode(posFrac);
             newNode._id = n._id; 
             terms.push({ node: newNode, sign: -currentSign });
        } else {
            terms.push({ node: n, sign: currentSign });
        }
    }
    
    recurse(node, 1);
    return terms;
}

console.log("--- Test: Negative Fraction Constant ---");
const negHalf = math.parse("-1/2");
const simplified = math.simplify(negHalf);
console.log("Node type:", simplified.type);
if (simplified.type === 'OperatorNode') {
    console.log("Op:", simplified.op);
    console.log("Fn:", simplified.fn);
    console.log("Args:", simplified.args.map(a => a.toString()));
}
console.log("Value:", simplified.value);

const terms = flattenTerms(simplified);
console.log("Terms:", terms.map(t => ({ val: t.node.toString(), sign: t.sign })));

if (terms[0].sign === 1) {
    console.log("FAIL: Negative fraction not extracted to sign.");
} else {
    console.log("PASS: Negative fraction handled.");
}
