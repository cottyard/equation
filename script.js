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

// Custom Equations Elements
const customBtn = document.getElementById('custom-btn');
const customPanel = document.getElementById('custom-panel');
const startCustomBtn = document.getElementById('start-custom-btn');
const closeCustomBtn = document.getElementById('close-custom-btn');
const customInputs = document.querySelectorAll('.custom-eq-input');

// Event Listeners
generateBtn.addEventListener('click', startNewGame);

customBtn.addEventListener('click', () => {
    customPanel.classList.remove('hidden');
    gameArea.classList.remove('hidden'); // Show game area for preview
    equationsList.innerHTML = ''; // Clear previous
    equations = [];
    nextEqId = 1;
    // Clear inputs
    customInputs.forEach(input => input.value = '');
    
    // Reset variables to empty so we don't have old state
    variables = [];
});

closeCustomBtn.addEventListener('click', () => {
    customPanel.classList.add('hidden');
    gameArea.classList.add('hidden');
    // Clear equations if cancelled
    equations = [];
    renderEquations();
});

startCustomBtn.addEventListener('click', startCustomGame);

customInputs.forEach(input => {
    input.addEventListener('input', updateCustomPreview);
});

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
    customPanel.classList.add('hidden'); // Ensure custom panel is closed
    gameArea.classList.add('hidden'); // Hide game area initially until generated
    
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

function updateCustomPreview() {
    equations = [];
    nextEqId = 1;
    const foundVars = new Set();

    customInputs.forEach(input => {
        const text = input.value.trim();
        if (!text) return;

        try {
            const parts = text.split('=');
            if (parts.length !== 2) return; // Incomplete

            const lhsNode = parse(parts[0]);
            const rhsNode = parse(parts[1]);

            // Collect variables
            lhsNode.traverse(n => { if (n.isSymbolNode) foundVars.add(n.name); });
            rhsNode.traverse(n => { if (n.isSymbolNode) foundVars.add(n.name); });

            equations.push({
                id: nextEqId++,
                lhs: cleanEquationNode(simplify(lhsNode)),
                rhs: cleanEquationNode(simplify(rhsNode))
            });
        } catch (e) {
            // Ignore parse errors during typing
        }
    });

    // Update variables list for preview rendering context if needed, 
    // but mainly we just want to show the equations.
    // However, renderEquations doesn't depend on 'variables' array, only 'equations'.
    // But 'variables' is used for validation in handleOperation.
    // We will update 'variables' officially in startCustomGame.
    
    renderEquations();
}

function startCustomGame() {
    if (equations.length === 0) {
        alert("请输入至少一个有效的方程。");
        return;
    }
    
    // Extract variables again to be sure
    const foundVars = new Set();
    equations.forEach(eq => {
        eq.lhs.traverse(n => { if (n.isSymbolNode) foundVars.add(n.name); });
        eq.rhs.traverse(n => { if (n.isSymbolNode) foundVars.add(n.name); });
    });
    variables = Array.from(foundVars);

    // Validate variables count
    if (variables.length > 4) {
        alert("变量太多！最多允许4个。");
        return;
    }

    // We don't know the solution, so we clear it.
    // checkWin will need to handle this.
    solution = {}; 
    
    customPanel.classList.add('hidden');
    gameArea.classList.remove('hidden');
    congratsBanner.classList.add('hidden');
    errorMsg.textContent = '';
    
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
function postProcessNode(node) {
    return node.transform(function (n) {
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
}

function cleanEquationNode(node) {
    // 1. Run standard simplify
    let res = simplify(node);
    
    // 2. Custom transform to handle unary minus on constants and terms
    return postProcessNode(res);
}

// --- Drag and Drop Logic ---

let dragSource = null; // { eqId, side: 'lhs'|'rhs', termId, node }
let potentialDragSource = null; // Temporary storage before drag threshold
let dragStartPos = null; // { x, y }
let dragGhost = null;
let dropTarget = null; // { eqId, side, termId, index, action: 'merge'|'move' }
let previewEl = null;

function flattenTerms(node) {
    // Returns array of { node, sign: 1|-1 }
    // We assume the node is simplified, so it's a tree of adds/subtracts
    // But simplify might produce nested adds.
    
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

        // Check for Negative Numerator in Division: -1 / 2
        if (n.type === 'OperatorNode' && n.op === '/') {
            const numerator = n.args[0];
            const denominator = n.args[1];
            
            if (numerator.isConstantNode) {
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
            
            // Case 2: Numerator is unary minus (e.g. -1/2 parsed as unaryMinus(1)/2)
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

function renderTermTex(termObj) {
    // termObj: { node, sign }
    
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
            // Check for fraction split candidate: (A + B) / C
            if (node.type === 'OperatorNode' && node.op === '/') {
                const numerator = node.args[0];
                if (numerator.type === 'OperatorNode' && (numerator.op === '+' || numerator.op === '-')) {
                    const defaultTex = node.toTex({ ...options, handler: undefined });
                    return `\\class{distributable node-${node._id}}{${defaultTex}}`;
                }
            }
            return undefined;
        }
    };

    // Let's generate the TeX for the node.
    let tex = termObj.node.toTex(options);
    
    // Fix negative fractions in the node tex itself
    tex = tex.replace(/\\frac\{-(\d+)\}/g, '-\\frac{$1}');
    
    return tex;
}

function renderSide(node, eqId, side) {
    let terms = flattenTerms(node);
    
    // Filter out zero terms if there are multiple terms (e.g. 2x + 0 -> 2x)
    if (terms.length > 1) {
        terms = terms.filter(t => {
            if (t.node.isConstantNode) {
                const val = t.node.value;
                if (typeof val === 'number' && val === 0) return false;
                if (typeof val === 'object' && val.n === 0) return false;
            }
            return true;
        });
    }
    
    let html = '';
    
    terms.forEach((term, index) => {
        const termTex = renderTermTex(term);
        const termId = term.node._id;
        
        // Determine separator
        let separator = '';
        if (index > 0) {
            if (term.sign === 1) separator = ' + ';
            else separator = ' - ';
        } else {
            if (term.sign === -1) separator = '-';
        }
        
        html += separator + `\\class{draggable-term term-${termId} eq-${eqId} side-${side}}{${termTex}}`;
    });
    
    if (terms.length === 0) {
        // Should not happen if 0 is preserved, but just in case
        return `\\class{side-container eq-${eqId} side-${side}}{0}`;
    }
    
    // Wrap the whole side in a container class for easier hit testing
    return `\\class{side-container eq-${eqId} side-${side}}{${html}}`;
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
        
        // Check if solved
        const isSolved = (eq.lhs.isSymbolNode && isValue(eq.rhs)) || 
                         (eq.rhs.isSymbolNode && isValue(eq.lhs));
        
        if (isSolved) {
            div.classList.add('solved');
        }
        
        const label = document.createElement('span');
        label.className = 'equation-label';
        label.textContent = `(${eq.id})`;
        
        const mathDiv = document.createElement('div');
        
        // Use custom rendering for top-level terms
        const lhsTex = renderSide(eq.lhs, eq.id, 'lhs');
        const rhsTex = renderSide(eq.rhs, eq.id, 'rhs');

        mathDiv.innerHTML = `\\[ ${lhsTex} = ${rhsTex} \\]`;
        
        div.appendChild(label);
        div.appendChild(mathDiv);
        equationsList.appendChild(div);
    });
    
    if (window.MathJax) {
        MathJax.typesetPromise([equationsList]).then(() => {
            attachDragListeners();
        }).catch((err) => console.log(err));
    }
}

function attachDragListeners() {
    const terms = document.querySelectorAll('.draggable-term');
    terms.forEach(el => {
        el.addEventListener('mousedown', handleDragStart);
    });
}

document.addEventListener('mousemove', handleDragMove);
document.addEventListener('mouseup', handleDragEnd);

function handleDragStart(e) {
    const target = e.target.closest('.draggable-term');
    if (!target) return;
    
    // Don't prevent default yet, to allow clicks to pass through if no drag occurs.
    // e.preventDefault(); 
    
    // Parse IDs from class
    const classes = target.getAttribute('class').split(/\s+/);
    const termId = parseInt(classes.find(c => c.startsWith('term-')).split('-')[1]);
    const eqId = parseInt(classes.find(c => c.startsWith('eq-')).split('-')[1]);
    const side = classes.find(c => c.startsWith('side-')).split('-')[1];
    
    // Find the node
    const eq = equations.find(e => e.id === eqId);
    const rootNode = side === 'lhs' ? eq.lhs : eq.rhs;
    const terms = flattenTerms(rootNode);
    const termObj = terms.find(t => t.node._id === termId);
    
    if (!termObj) return;
    
    // Store potential drag info
    potentialDragSource = {
        eqId,
        side,
        termId,
        node: termObj.node,
        sign: termObj.sign,
        element: target
    };
    dragStartPos = { x: e.clientX, y: e.clientY };
}

function updateGhostPosition(e) {
    if (!dragGhost) return;
    dragGhost.style.left = (e.clientX + 10) + 'px';
    dragGhost.style.top = (e.clientY + 10) + 'px';
}

function handleDragMove(e) {
    // Check if we need to start dragging
    if (potentialDragSource && !dragSource) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 5) {
            // Start Dragging
            dragSource = potentialDragSource;
            potentialDragSource = null;
            
            const target = dragSource.element;
            
            // Create ghost
            dragGhost = target.cloneNode(true);
            dragGhost.style.position = 'fixed';
            dragGhost.style.pointerEvents = 'none';
            dragGhost.style.opacity = '0.9';
            dragGhost.style.zIndex = '1000';
            dragGhost.style.transform = 'scale(1.1)';
            
            // Copy computed styles
            const computed = window.getComputedStyle(target);
            dragGhost.style.fontFamily = computed.fontFamily;
            dragGhost.style.fontSize = computed.fontSize;
            dragGhost.style.color = computed.color;
            
            document.body.appendChild(dragGhost);
            
            updateGhostPosition(e);
            
            // Hide original
            target.classList.add('dragging-original');
        }
    }

    if (!dragSource) return;
    
    e.preventDefault(); // Prevent selection while dragging
    updateGhostPosition(e);
    
    // 1. Find Equation Item
    const eqItem = document.elementFromPoint(e.clientX, e.clientY)?.closest('.equation-item');
    
    // Clear previous preview if we left the equation or changed context
    // But we want to keep preview if we are still in valid zone.
    // If eqItem is null, we clear.
    
    if (!eqItem) {
        clearPreview();
        dropTarget = null;
        return;
    }
    
    const eqId = parseInt(eqItem.dataset.id);
    
    // 2. Find Sides
    const lhs = eqItem.querySelector('.side-lhs');
    const rhs = eqItem.querySelector('.side-rhs');
    
    if (!lhs || !rhs) return;
    
    // 3. Determine closest side
    const lhsRect = lhs.getBoundingClientRect();
    const rhsRect = rhs.getBoundingClientRect();
    
    // Distance to center of rects
    const distLhs = Math.abs(e.clientX - (lhsRect.left + lhsRect.width/2));
    const distRhs = Math.abs(e.clientX - (rhsRect.left + rhsRect.width/2));
    
    const targetSide = (distLhs < distRhs) ? 'lhs' : 'rhs';
    const targetEl = (targetSide === 'lhs') ? lhs : rhs;
    
    // 4. Find position within side
    // Get all terms in this side (excluding dragged one)
    const terms = Array.from(targetEl.querySelectorAll('.draggable-term'))
        .filter(el => !el.classList.contains('dragging-original') && !el.classList.contains('drag-preview'));
    
    // Check for Merge
    // If hovering directly over a term
    const hoverTerm = document.elementFromPoint(e.clientX, e.clientY)?.closest('.draggable-term');
    
    // Clear merge highlight
    document.querySelectorAll('.preview-merge').forEach(el => el.classList.remove('preview-merge'));
    
    if (hoverTerm && terms.includes(hoverTerm)) {
        const classes = hoverTerm.getAttribute('class').split(/\s+/);
        const tId = parseInt(classes.find(c => c.startsWith('term-')).split('-')[1]);
        const eId = parseInt(classes.find(c => c.startsWith('eq-')).split('-')[1]);
        
        if (eId === dragSource.eqId && tId !== dragSource.termId) {
            // Check merge compatibility
            const eq = equations.find(eq => eq.id === eId);
            const root = targetSide === 'lhs' ? eq.lhs : eq.rhs;
            const flatTerms = flattenTerms(root);
            const targetTerm = flatTerms.find(t => t.node._id === tId);
            
            if (targetTerm && canMerge(dragSource.node, targetTerm.node)) {
                hoverTerm.classList.add('preview-merge');
                clearPreview(); // Remove insert preview
                dropTarget = { eqId: eId, side: targetSide, termId: tId, action: 'merge' };
                return;
            }
        }
    }
    
    // If not merging, find insert position
    let insertIndex = terms.length;
    let insertBeforeEl = null;
    
    for (let i = 0; i < terms.length; i++) {
        const rect = terms[i].getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        if (e.clientX < center) {
            insertIndex = i;
            insertBeforeEl = terms[i];
            break;
        }
    }
    
    // Update Preview
    updatePreview(targetEl, insertBeforeEl);
    
    dropTarget = { eqId, side: targetSide, index: insertIndex, action: 'insert' };
}

function updatePreview(container, beforeEl) {
    // If preview is already in correct place, do nothing
    if (previewEl && previewEl.parentNode === container && previewEl.nextSibling === beforeEl) {
        return;
    }

    if (!previewEl) {
        previewEl = dragSource.element.cloneNode(true);
        previewEl.classList.remove('dragging-original');
        previewEl.classList.add('drag-preview');
        // Ensure it's visible
        previewEl.style.opacity = '0.5';
        previewEl.style.display = 'inline-block';
    }
    
    if (beforeEl) {
        container.insertBefore(previewEl, beforeEl);
    } else {
        container.appendChild(previewEl);
    }
}

function clearPreview() {
    if (previewEl && previewEl.parentNode) {
        previewEl.parentNode.removeChild(previewEl);
    }
    previewEl = null;
}

function canMerge(node1, node2) {
    // Constant with Constant
    if (node1.isConstantNode && node2.isConstantNode) return true;
    
    // Symbol with Symbol (same name)
    // Or Coeff*Symbol with Coeff*Symbol
    const getSymbol = (n) => {
        if (n.isSymbolNode) return n.name;
        if (n.type === 'OperatorNode' && n.op === '*') {
            // Assuming coeff * symbol
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

function handleDragEnd(e) {
    potentialDragSource = null;
    dragStartPos = null;

    if (!dragSource) return;
    
    // Cleanup visual
    if (dragGhost) dragGhost.remove();
    dragGhost = null;
    if (dragSource.element) dragSource.element.classList.remove('dragging-original');
    
    clearPreview();
    document.querySelectorAll('.preview-merge').forEach(el => el.classList.remove('preview-merge'));
    
    if (dropTarget) {
        applyDrop(dragSource, dropTarget);
    }
    
    dragSource = null;
    dropTarget = null;
}

function applyDrop(source, target) {
    const eq = equations.find(e => e.id === source.eqId);
    
    // Helper to get terms list for a side
    const getSideTerms = (s) => flattenTerms(s === 'lhs' ? eq.lhs : eq.rhs);
    
    let sourceTerms = getSideTerms(source.side);
    let targetTerms = (source.side === target.side) ? sourceTerms : getSideTerms(target.side);
    
    // Remove source
    const sourceIndex = sourceTerms.findIndex(t => t.node._id === source.termId);
    if (sourceIndex === -1) return;
    const sourceItem = sourceTerms[sourceIndex];
    sourceTerms.splice(sourceIndex, 1);
    
    // If moving to different side, flip sign
    if (source.side !== target.side) {
        sourceItem.sign = -sourceItem.sign;
    }
    
    // Apply to target
    if (target.action === 'merge') {
        const targetIndex = targetTerms.findIndex(t => t.node._id === target.termId);
        if (targetIndex !== -1) {
            const targetItem = targetTerms[targetIndex];
            
            // Create new merged node: (sign1 * node1) + (sign2 * node2)
            const t1 = sourceItem.sign === 1 ? sourceItem.node : new math.OperatorNode('-', 'unaryMinus', [sourceItem.node]);
            const t2 = targetItem.sign === 1 ? targetItem.node : new math.OperatorNode('-', 'unaryMinus', [targetItem.node]);
            
            const sum = new math.OperatorNode('+', 'add', [t1, t2]);
            const simplified = simplify(sum);
            
            // Update target item
            targetItem.node = simplified;
            targetItem.sign = 1; // Simplified node handles its own sign usually
        }
    } else if (target.action === 'insert') {
        targetTerms.splice(target.index, 0, sourceItem);
    }
    
    // Rebuild ASTs
    function rebuildAST(terms) {
        if (terms.length === 0) return new math.ConstantNode(0);
        
        // Accumulate
        let result = null;
        
        terms.forEach(t => {
            let termNode = t.node;
            // Apply sign
            if (t.sign === -1) {
                termNode = new math.OperatorNode('-', 'unaryMinus', [termNode]);
            }
            
            if (result === null) {
                result = termNode;
            } else {
                result = new math.OperatorNode('+', 'add', [result, termNode]);
            }
        });
        
        return postProcessNode(result);
    }
    
    if (source.side === target.side) {
        // Only one side changed (reorder/merge within side)
        if (source.side === 'lhs') eq.lhs = rebuildAST(sourceTerms);
        else eq.rhs = rebuildAST(sourceTerms);
    } else {
        // Both sides changed
        // Use the modified arrays directly!
        if (source.side === 'lhs') {
            eq.lhs = rebuildAST(sourceTerms);
            eq.rhs = rebuildAST(targetTerms);
        } else {
            eq.lhs = rebuildAST(targetTerms);
            eq.rhs = rebuildAST(sourceTerms);
        }
    }
    
    renderEquations();
    checkWin();
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
    // Case 1: Multiplication A * (B + C)
    if (node.type === 'OperatorNode' && node.op === '*') {
        const args = node.args;
        const addIndex = args.findIndex(n => n.type === 'OperatorNode' && (n.op === '+' || n.op === '-'));
        
        if (addIndex !== -1) {
            const addNode = args[addIndex];
            const otherNode = args[1 - addIndex];
            
            const newArgs = addNode.args.map(term => {
                // Simplify individual terms (e.g. 3 * 2 -> 6)
                const prod = new math.OperatorNode('*', 'multiply', [otherNode, term]);
                return simplify(prod);
            });
            
            const newNode = new math.OperatorNode(addNode.op, addNode.fn, newArgs);
            // Use postProcessNode directly to avoid global simplify merging terms back
            return postProcessNode(newNode);
        }
    }

    // Case 2: Division (A + B) / C
    if (node.type === 'OperatorNode' && node.op === '/') {
        const numerator = node.args[0];
        const denominator = node.args[1];
        
        if (numerator.type === 'OperatorNode' && (numerator.op === '+' || numerator.op === '-')) {
            const newArgs = numerator.args.map(term => {
                // Create term/denominator and simplify it individually (e.g. 2/2 -> 1)
                const div = new math.OperatorNode('/', 'divide', [term, denominator]);
                return simplify(div);
            });
            
            const newNode = new math.OperatorNode(numerator.op, numerator.fn, newArgs);
            // Use postProcessNode directly to avoid global simplify merging fractions back
            return postProcessNode(newNode);
        }
    }
    
    return node;
}

function isValue(node) {
    let hasSymbol = false;
    node.traverse(n => {
        if (n.isSymbolNode) hasSymbol = true;
    });
    return !hasSymbol;
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
                // Allow substitution if one side is a single variable (coefficient 1)
                const canSubstitute = eq.lhs.isSymbolNode || eq.rhs.isSymbolNode;
                if (canSubstitute) showSub = true;
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
        errorMsg.textContent = '请选择目标方程。';
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
        } else if (op === 'delete') {
            equations.splice(targetIndex, 1);
            selectedTargetId = null;
        } else if (op === 'substitute') {
            if (selectedSecondId === null) {
                errorMsg.textContent = '请选择用于代入的第二个方程。';
                return;
            }
            const secondIndex = equations.findIndex(e => e.id === selectedSecondId);
            if (secondIndex === -1) return;

            const eq1 = equations[targetIndex]; // The solved equation (x=val)
            const eq2 = equations[secondIndex]; // The target to substitute into

            // Check if eq1 is suitable for substitution (one side is a single variable)
            let variable, value;
            if (eq1.lhs.isSymbolNode) {
                variable = eq1.lhs.name;
                value = eq1.rhs;
            } else if (eq1.rhs.isSymbolNode) {
                variable = eq1.rhs.name;
                value = eq1.lhs;
            } else {
                errorMsg.textContent = '目标方程必须有一侧是单独的变量 (例如 x=...) 才能代入。';
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
                errorMsg.textContent = '请选择第二个方程。';
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
                errorMsg.textContent = '请输入一项。';
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
                // In custom mode, we might have variables not in the initial list if user added them later?
                // But variables list is updated on startCustomGame.
                // So this check is still valid.
                errorMsg.textContent = `无效变量: ${invalidVars.join(', ')}. 仅允许 ${variables.join(', ')}。`;
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
        errorMsg.textContent = '无效的操作或项。 ' + err.message;
    }
}

function checkWin() {
    // Check if we have found values for all variables
    // A variable is "found" if we have an equation "x = val" or "val = x"
    // where val is a constant number.
    
    const foundVars = new Set();

    equations.forEach(eq => {
        // Check LHS = Symbol, RHS = Constant
        if (eq.lhs.isSymbolNode && isValue(eq.rhs)) {
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
                    // If solution is known, verify it. Otherwise just accept isolation.
                    if (solution && solution[eq.lhs.name] !== undefined) {
                        const sol = solution[eq.lhs.name];
                        if (math.abs(math.subtract(val, sol)) < 1e-9) {
                            foundVars.add(eq.lhs.name);
                        }
                    } else {
                        foundVars.add(eq.lhs.name);
                    }
                } catch (e) { console.log(e); }
            }
        }
        // Check RHS = Symbol, LHS = Constant
        else if (eq.rhs.isSymbolNode && isValue(eq.lhs)) {
            if (variables.includes(eq.rhs.name)) {
                try {
                    const val = eq.lhs.compile().evaluate();
                    // If solution is known, verify it. Otherwise just accept isolation.
                    if (solution && solution[eq.rhs.name] !== undefined) {
                        const sol = solution[eq.rhs.name];
                        if (math.abs(math.subtract(val, sol)) < 1e-9) {
                            foundVars.add(eq.rhs.name);
                        }
                    } else {
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
