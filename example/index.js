const fs = require('fs');
const parser = require('../parser');
const reader = require('../reader');
const printer = require('../printer');

reader(rootNode => {
  console.log(printer(rootNode));
})(fs.readFileSync(__dirname + '/demo.xml', 'utf8'));