const fs = require('fs');
const xml = require('..');
const parser = require('../parser');
const reader = require('../reader');
const printer = require('../printer');
const traverse = require('../traverse');

xml.readFile(__dirname + '/demo.xml').then(obj => {
  console.log(obj);
});
