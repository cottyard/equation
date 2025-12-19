const { create, all } = require('mathjs');
const math = create(all);

const n1 = math.parse('2x');
const n2 = math.parse('5');

// Construct 5 + 2x
const sum = new math.OperatorNode('+', 'add', [n2, n1]);
console.log('Manual sum:', sum.toString());

const simplified = math.simplify(sum);
console.log('Simplified sum:', simplified.toString());

// Check if order changed
if (sum.toString() !== simplified.toString()) {
    console.log('Simplify CHANGED the order!');
} else {
    console.log('Simplify kept the order.');
}
