const { simplify, parse, fraction, add, subtract, multiply, divide, equal } = math;

math.config({
  number: 'Fraction'
});

let equations = [];
let variables = [];
let nextEqId = 1;
let solution = {};

const varNames = ['x', 'y', 'z', 'w'];

// DOM Elements
const numVarsInput = document.getElementById('num-vars');
const generateBtn = document.getElementById('generate-btn');
const gameArea = document.getElementById('game-area');
const equationsList = document.getElementById('equations-list');
const targetEqSelect = document.getElementById('target-eq');
const secondEqSelect = document.getElementById('second-eq');
const termInput = document.getElementById('term-input');
const errorMsg = document.getElementById('error-msg');
const congratsBanner = document.getElementById('congrats-banner');

// Event Listeners
generateBtn.addEventListener('click', startNewGame);

// Toolbar buttons
document.querySelectorAll('.op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleOperation(btn.dataset.op);
    });
});

document.addEventListener('click', function(e) {
    const target = e.target.closest('.distributable');
    if (target) {
        const classes = target.className.split(/\s+/);
        const idClass = classes.find(c => c.startsWith('node-'));
        if (idClass) {
            const nodeId = parseInt(idClass.split('-')[1]);
            const eqItem = target.closest('.equation-item');
            if (eqItem) {
                const eqLabel = eqItem.querySelector('.equation-label').textContent;
                const eqId = parseInt(eqLabel.replace(/[()]/g, ''));
                handleDistribute(eqId, nodeId);
            }
        }
    }
});

function startNewGame() {
    const n = parseInt(numVarsInput.value);
    if (n < 1 || n > 4) return;

    variables = varNames.slice(0, n);
    equations = [];
    nextEqId = 1;
    solution = {};
    congratsBanner.classList.add('hidden');
    errorMsg.textContent = '';

    // Generate random integer solution
    variables.forEach(v => {
        // Random integer between -10 and 10, non-zero preferred
        let val = Math.floor(Math.random() * 21) - 10;
        if (val === 0) val = 1; 
        solution[v] = val;
    });

    // Generate equations
    for (let i = 0; i < n; i++) {
        generateEquation();
    }

    gameArea.classList.remove('hidden');
    renderEquations();
    updateSelects();
}

function getRandomRational() {
    // 50% chance of integer, 50% chance of fraction
    if (Math.random() > 0.5) {
        let val = Math.floor(Math.random() * 11) - 5;
        return val === 0 ? 1 : val;
    } else {
        let num = Math.floor(Math.random() * 11) - 5;
        let den = Math.floor(Math.random() * 5) + 2; // 2 to 6
        if (num === 0) num = 1;
        return fraction(num, den);
    }
}

function generateEquation() {
    // Create a linear equation: a1*x + a2*y + ... = C
    // Then randomly move terms to make it look like a generic equation
    
    let terms = [];
    let currentVal = 0; // This will be a number or Fraction
    
    variables.forEach(v => {
        let coeff = getRandomRational();
        
        terms.push({ coeff: coeff, var: v });
        // currentVal += coeff * solution[v]
        currentVal = add(currentVal, multiply(coeff, solution[v]));
    });

    let lhsStrParts = [];
    let rhsStrParts = [];
    
    function formatVal(c) {
        if (typeof c === 'object' && c.n !== undefined) {
            if (c.d === 1) return (c.s * c.n).toString();
            return `${c.s < 0 ? '-' : ''}${c.n}/${c.d}`;
        }
        return c.toString();
    }

    function formatTerm(coeff, variable) {
        // Handle 1 and -1
        if (typeof coeff === 'number') {
            if (coeff === 1) return variable;
            if (coeff === -1) return `-${variable}`;
            return `${coeff}${variable}`;
        }
        // Fraction
        if (typeof coeff === 'object' && coeff.n !== undefined) {
            if (coeff.d === 1) {
                const val = coeff.s * coeff.n;
                if (val === 1) return variable;
                if (val === -1) return `-${variable}`;
                return `${val}${variable}`;
            }
            // Fraction string
            const str = formatVal(coeff);
            return `${str}${variable}`;
        }
        return `${coeff}${variable}`;
    }
    
    // Distribute variable terms
    terms.forEach(t => {
        if (Math.random() > 0.3) {
            lhsStrParts.push(formatTerm(t.coeff, t.var));
        } else {
            // Move to RHS -> negate
            let negCoeff = typeof t.coeff === 'object' ? 
                fraction(-t.coeff.s * t.coeff.n, t.coeff.d) : -t.coeff;
            rhsStrParts.push(formatTerm(negCoeff, t.var));
        }
    });

    // Distribute constant
    // currentVal is the required constant on RHS if all terms were on LHS.
    // RHS_const - LHS_const = currentVal.
    
    // Let's pick a random LHS_const
    let lhsConst = getRandomRational();
    // rhsConst = lhsConst + currentVal
    let rhsConst = add(lhsConst, currentVal);

    // Check if zero
    const isZero = (c) => {
        if (typeof c === 'object') return c.n === 0;
        return c === 0;
    };

    if (!isZero(lhsConst)) lhsStrParts.push(formatVal(lhsConst));
    if (!isZero(rhsConst)) rhsStrParts.push(formatVal(rhsConst));

    if (lhsStrParts.length === 0) lhsStrParts.push("0");
    if (rhsStrParts.length === 0) rhsStrParts.push("0");

    let lhsExpr = lhsStrParts.join("+").replace(/\+\-/g, "-");
    let rhsExpr = rhsStrParts.join("+").replace(/\+\-/g, "-");

    equations.push({
        id: nextEqId++,
        lhs: parse(lhsExpr),
        rhs: parse(rhsExpr)
    });
}

function renderEquations() {
    equationsList.innerHTML = '';
    equations.forEach(eq => {
        // Assign IDs for interactivity
        assignIds(eq.lhs);
        assignIds(eq.rhs);

        const div = document.createElement('div');
        div.className = 'equation-item';
        
        // Check if solved (Variable = Constant or Constant = Variable)
        const isSolved = (eq.lhs.isSymbolNode && eq.rhs.isConstantNode) || 
                         (eq.rhs.isSymbolNode && eq.lhs.isConstantNode);
        
        if (isSolved) {
            div.classList.add('solved');
        }
        
        const label = document.createElement('span');
        label.className = 'equation-label';
        label.textContent = `(${eq.id})`;
        
        const mathDiv = document.createElement('div');
        
        const options = {
            handler: function(node, options) {
                // Check for distribution candidate: A * (B + C)
                if (node.type === 'OperatorNode' && node.op === '*') {
                    const hasAdd = node.args.some(n => n.type === 'OperatorNode' && (n.op === '+' || n.op === '-'));
                    if (hasAdd) {
                        // Generate default tex without handler
                        const defaultTex = node.toTex({ ...options, handler: undefined });
                        return `\\class{distributable node-${node._id}}{${defaultTex}}`;
                    }
                }
                return undefined;
            }
        };

        let lhsTex = eq.lhs.toTex(options);
        let rhsTex = eq.rhs.toTex(options);

        // Fix negative fractions: \frac{-n}{d} -> -\frac{n}{d}
        const fixNegFrac = (tex) => tex.replace(/\\frac\{-(\d+)\}/g, '-\\frac{$1}');
        lhsTex = fixNegFrac(lhsTex);
        rhsTex = fixNegFrac(rhsTex);

        mathDiv.innerHTML = `\\[ ${lhsTex} = ${rhsTex} \\]`;
        
        div.appendChild(label);
        div.appendChild(mathDiv);
        equationsList.appendChild(div);
    });
    
    if (window.MathJax) {
        MathJax.typesetPromise([equationsList]).catch((err) => console.log(err));
    }
}

function assignIds(node) {
    node._id = Math.floor(Math.random() * 1000000000);
    node.forEach(child => assignIds(child));
}

function handleDistribute(eqId, nodeId) {
    const eq = equations.find(e => e.id === eqId);
    if (!eq) return;

    let found = false;
    
    const replaceCallback = function (node, path, parent) {
        if (node._id === nodeId) {
            found = true;
            return distributeNode(node);
        }
        return node;
    };

    eq.lhs = eq.lhs.transform(replaceCallback);
    if (!found) {
        eq.rhs = eq.rhs.transform(replaceCallback);
    }
    
    renderEquations();
    updateSelects();
    checkWin();
}

function distributeNode(node) {
    // node is A * (B + C)
    if (node.type !== 'OperatorNode' || node.op !== '*') return node;
    
    const args = node.args;
    const addIndex = args.findIndex(n => n.type === 'OperatorNode' && (n.op === '+' || n.op === '-'));
    
    if (addIndex === -1) return node;
    
    const addNode = args[addIndex];
    const otherNode = args[1 - addIndex];
    
    const newArgs = addNode.args.map(term => {
        return new math.OperatorNode('*', 'multiply', [otherNode, term]);
    });
    
    const newNode = new math.OperatorNode(addNode.op, addNode.fn, newArgs);
    return simplify(newNode);
}

function updateSelects() {
    // Save current selections
    const targetVal = targetEqSelect.value;
    const secondVal = secondEqSelect.value;

    targetEqSelect.innerHTML = '';
    secondEqSelect.innerHTML = '';

    equations.forEach(eq => {
        const opt1 = document.createElement('option');
        opt1.value = eq.id;
        opt1.textContent = `Equation (${eq.id})`;
        targetEqSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = eq.id;
        opt2.textContent = `Equation (${eq.id})`;
        secondEqSelect.appendChild(opt2);
    });

    // Restore selections if possible
    if (targetVal) targetEqSelect.value = targetVal;
    if (secondVal) secondEqSelect.value = secondVal;
}

function handleOperation(op) {
    errorMsg.textContent = '';
    const targetId = parseInt(targetEqSelect.value);
    const targetIndex = equations.findIndex(e => e.id === targetId);
    
    if (targetIndex === -1) return;

    try {
        if (op === 'flip') {
            const eq = equations[targetIndex];
            const temp = eq.lhs;
            eq.lhs = eq.rhs;
            eq.rhs = temp;
        } else if (op === 'add-eq' || op === 'sub-eq') {
            const secondId = parseInt(secondEqSelect.value);
            const secondIndex = equations.findIndex(e => e.id === secondId);
            if (secondIndex === -1) return;

            const eq1 = equations[targetIndex];
            const eq2 = equations[secondIndex];

            let newLhs, newRhs;
            if (op === 'add-eq') {
                newLhs = new math.OperatorNode('+', 'add', [eq1.lhs, eq2.lhs]);
                newRhs = new math.OperatorNode('+', 'add', [eq1.rhs, eq2.rhs]);
            } else {
                newLhs = new math.OperatorNode('-', 'subtract', [eq1.lhs, eq2.lhs]);
                newRhs = new math.OperatorNode('-', 'subtract', [eq1.rhs, eq2.rhs]);
            }

            equations.push({
                id: nextEqId++,
                lhs: simplify(newLhs),
                rhs: simplify(newRhs)
            });
        } else {
            // Term operations
            const termStr = termInput.value.trim();
            if (!termStr) {
                errorMsg.textContent = 'Please enter a term.';
                return;
            }

            // Validate term: rational number or variable with rational coeff
            // We can try to parse it and check nodes
            const termNode = parse(termStr);
            // Basic validation: check if it contains unknown variables
            const symbols = [];
            termNode.traverse(node => {
                if (node.isSymbolNode) symbols.push(node.name);
            });
            
            const invalidVars = symbols.filter(s => !variables.includes(s));
            if (invalidVars.length > 0) {
                errorMsg.textContent = `Invalid variables: ${invalidVars.join(', ')}. Only ${variables.join(', ')} allowed.`;
                return;
            }

            const eq = equations[targetIndex];
            let newLhs, newRhs;

            if (op === 'add') {
                newLhs = new math.OperatorNode('+', 'add', [eq.lhs, termNode]);
                newRhs = new math.OperatorNode('+', 'add', [eq.rhs, termNode]);
            } else if (op === 'subtract') {
                newLhs = new math.OperatorNode('-', 'subtract', [eq.lhs, termNode]);
                newRhs = new math.OperatorNode('-', 'subtract', [eq.rhs, termNode]);
            } else if (op === 'multiply') {
                // Wrap in parenthesis implicitly by structure
                newLhs = new math.OperatorNode('*', 'multiply', [eq.lhs, termNode]);
                newRhs = new math.OperatorNode('*', 'multiply', [eq.rhs, termNode]);
            } else if (op === 'divide') {
                newLhs = new math.OperatorNode('/', 'divide', [eq.lhs, termNode]);
                newRhs = new math.OperatorNode('/', 'divide', [eq.rhs, termNode]);
            }

            eq.lhs = simplify(newLhs);
            eq.rhs = simplify(newRhs);
        }

        renderEquations();
        updateSelects();
        checkWin();

    } catch (err) {
        console.error(err);
        errorMsg.textContent = 'Invalid operation or term. ' + err.message;
    }
}

function checkWin() {
    // Check if we have found values for all variables
    // A variable is "found" if we have an equation "x = val" or "val = x"
    // where val is a constant number.
    
    const foundVars = new Set();

    equations.forEach(eq => {
        // Check LHS = Symbol, RHS = Constant
        if (eq.lhs.isSymbolNode && eq.rhs.isConstantNode) {
            // Check if value matches solution (optional, but good for verification)
            // But the game is just to isolate variables.
            // Let's just check if it's isolated.
            if (variables.includes(eq.lhs.name)) {
                // Verify correctness?
                // The user might isolate x = 5, but correct is x = 3.
                // The prompt says "revealed", implying correctness is inherent if math is correct.
                // But let's check against our solution to be sure they didn't make a mistake?
                // Actually, since we perform valid operations, if they started correct, they stay correct.
                // Unless we allow them to do something invalid (like divide by zero, which mathjs might handle).
                
                // Let's just check if it matches the solution value roughly
                // Use math.evaluate to handle Fractions
                try {
                    const val = eq.rhs.compile().evaluate();
                    const sol = solution[eq.lhs.name];
                    if (math.abs(math.subtract(val, sol)) < 1e-9) {
                        foundVars.add(eq.lhs.name);
                    }
                } catch (e) { console.log(e); }
            }
        }
        // Check RHS = Symbol, LHS = Constant
        else if (eq.rhs.isSymbolNode && eq.lhs.isConstantNode) {
            if (variables.includes(eq.rhs.name)) {
                try {
                    const val = eq.lhs.compile().evaluate();
                    const sol = solution[eq.rhs.name];
                    if (math.abs(math.subtract(val, sol)) < 1e-9) {
                        foundVars.add(eq.rhs.name);
                    }
                } catch (e) { console.log(e); }
            }
        }
    });

    if (foundVars.size === variables.length) {
        congratsBanner.classList.remove('hidden');
    }
}
