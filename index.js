const fs = require('fs');
const { promisify } = require('util');
const parser = require('./parser');
const reader = require('./reader');
const printer = require('./printer');
const traverse = require('./traverse');
const { Transform } = require('stream');

class XML extends Transform {
  static read(str){
    return new Promise(done => reader(done)(str));
  }
  static async readFile(filename, options = {}){
    const readFile = promisify(fs.readFile);
    const source = await readFile(filename, 'utf8');
    return XML.read(source, options);
  }
  static serialize(ast, options){
    return printer(ast, options);
  }
  static traverse(ast, walker){
    return traverse(ast, walker);
  }
}

module.exports = XML;