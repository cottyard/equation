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
const targetEqList = document.getElementById('target-eq-list');
const secondEqList = document.getElementById('second-eq-list');
const termInput = document.getElementById('term-input');
const errorMsg = document.getElementById('error-msg');
const congratsBanner = document.getElementById('congrats-banner');

let selectedTargetId = null;
let selectedSecondId = null;

const subBtn = document.querySelector('button[data-op="substitute"]');

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
    updateEquationSelectors();
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

function cleanEquationNode(node) {
    // 1. Run standard simplify
    let res = simplify(node);
    
    // 2. Custom transform to handle unary minus on constants and terms
    res = res.transform(function (n) {
        if (n.type === 'OperatorNode' && n.fn === 'unaryMinus') {
            const arg = n.args[0];
            
            // Case: -Constant
            if (arg.isConstantNode) {
                const val = arg.value;
                if (typeof val === 'number') {
                    return new math.ConstantNode(-val);
                }
                if (val && typeof val.mul === 'function') { // Fraction
                    return new math.ConstantNode(val.mul(-1));
                }
            }
            
            // Case: -(A * B) -> (-A) * B if A is constant
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

            // Case: -(A / B) -> (-A) / B if A is constant
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
    
    return res;
}

function renderEquations() {
    equationsList.innerHTML = '';
    equations.forEach(eq => {
        // Assign IDs for interactivity
        assignIds(eq.lhs);
        assignIds(eq.rhs);

        const div = document.createElement('div');
        div.className = 'equation-item';
        div.dataset.id = eq.id;
        if (eq.id === selectedTargetId) {
            div.classList.add('selected-target');
        }
        
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
        // Fix dot: 2 \cdot x -> 2x
        const fixDot = (tex) => tex.replace(/(\d|\})\s*\\cdot\s*([a-z])/g, '$1$2');
        // Fix plus minus: + - -> -
        const fixPlusMinus = (tex) => tex.replace(/\+\s*-/g, '-');
        
        const processTex = (tex) => {
            let t = tex;
            t = fixNegFrac(t);
            t = fixDot(t);
            t = fixPlusMinus(t);
            return t;
        };

        lhsTex = processTex(lhsTex);
        rhsTex = processTex(rhsTex);

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
    updateEquationSelectors();
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
    return cleanEquationNode(simplify(newNode));
}

function isValue(node) {
    return node.isConstantNode;
}

function updateEquationSelectors() {
    // Helper to create button list
    const createButtons = (container, selectedId, onSelect) => {
        container.innerHTML = '';
        equations.forEach(eq => {
            const btn = document.createElement('button');
            btn.className = 'eq-select-btn';
            if (eq.id === selectedId) btn.classList.add('selected');
            btn.textContent = `(${eq.id})`;
            btn.onclick = () => onSelect(eq.id);
            container.appendChild(btn);
        });
    };

    createButtons(targetEqList, selectedTargetId, (id) => {
        selectedTargetId = id;
        updateEquationSelectors();
        updateEquationHighlights();
    });

    createButtons(secondEqList, selectedSecondId, (id) => {
        selectedSecondId = id;
        updateEquationSelectors();
    });

    // Update substitute button visibility
    if (subBtn) {
        let showSub = false;
        if (selectedTargetId !== null) {
            const eq = equations.find(e => e.id === selectedTargetId);
            if (eq) {
                const isSolved = (eq.lhs.isSymbolNode && isValue(eq.rhs)) || 
                                 (eq.rhs.isSymbolNode && isValue(eq.lhs));
                if (isSolved) showSub = true;
            }
        }
        
        if (showSub) {
            subBtn.style.display = 'inline-block';
        } else {
            subBtn.style.display = 'none';
        }
    }
}

function updateEquationHighlights() {
    const items = equationsList.querySelectorAll('.equation-item');
    items.forEach(item => {
        const id = parseInt(item.dataset.id);
        if (id === selectedTargetId) {
            item.classList.add('selected-target');
        } else {
            item.classList.remove('selected-target');
        }
    });
}

function handleOperation(op) {
    errorMsg.textContent = '';
    
    if (selectedTargetId === null) {
        errorMsg.textContent = 'Please select a target equation.';
        return;
    }

    const targetIndex = equations.findIndex(e => e.id === selectedTargetId);
    if (targetIndex === -1) return;

    try {
        if (op === 'flip') {
            const eq = equations[targetIndex];
            const temp = eq.lhs;
            eq.lhs = eq.rhs;
            eq.rhs = temp;
        } else if (op === 'substitute') {
            if (selectedSecondId === null) {
                errorMsg.textContent = 'Please select a second equation for substitution.';
                return;
            }
            const secondIndex = equations.findIndex(e => e.id === selectedSecondId);
            if (secondIndex === -1) return;

            const eq1 = equations[targetIndex]; // The solved equation (x=val)
            const eq2 = equations[secondIndex]; // The target to substitute into

            // Check if eq1 is solved
            let variable, value;
            if (eq1.lhs.isSymbolNode && isValue(eq1.rhs)) {
                variable = eq1.lhs.name;
                value = eq1.rhs;
            } else if (eq1.rhs.isSymbolNode && isValue(eq1.lhs)) {
                variable = eq1.rhs.name;
                value = eq1.lhs;
            } else {
                errorMsg.textContent = 'Target equation must be solved (e.g. x=5) to substitute.';
                return;
            }

            // Perform substitution on eq2
            const subCallback = function (node, path, parent) {
                if (node.isSymbolNode && node.name === variable) {
                    return value.clone();
                }
                return node;
            };

            const newLhs = eq2.lhs.transform(subCallback);
            const newRhs = eq2.rhs.transform(subCallback);

            equations.push({
                id: nextEqId++,
                lhs: cleanEquationNode(simplify(newLhs)),
                rhs: cleanEquationNode(simplify(newRhs))
            });

        } else if (op === 'add-eq' || op === 'sub-eq') {
            if (selectedSecondId === null) {
                errorMsg.textContent = 'Please select a second equation.';
                return;
            }
            const secondIndex = equations.findIndex(e => e.id === selectedSecondId);
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
                lhs: cleanEquationNode(simplify(newLhs)),
                rhs: cleanEquationNode(simplify(newRhs))
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

            eq.lhs = cleanEquationNode(simplify(newLhs));
            eq.rhs = cleanEquationNode(simplify(newRhs));
        }

        renderEquations();
        updateEquationSelectors();
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
