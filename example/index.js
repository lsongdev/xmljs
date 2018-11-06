const fs = require('fs');
const reader = require('../reader');

reader(rootNode => {
  console.log('done', JSON.stringify(rootNode, null, 2));
})(fs.readFileSync(__dirname + '/demo.xml', 'utf8'));