const fs = require('fs');
const xml = require('..');
const parser = require('../parser');
const reader = require('../reader');
const printer = require('../printer');
const traverse = require('../traverse');

xml.readFile(__dirname + '/demo.xml').then(obj => {
  traverse(obj, node => {
    if(node.name === 'image'){
      node.attributes.src = 'abc';
    }
  });
  console.log(xml.serialize(obj));
});
