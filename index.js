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
    const ast = await XML.read(`<root>${source}</root>`, options);
    return ast.children;
  }
  static serialize(ast, options){
    return printer(ast, options);
  }
  static traverse(ast, walker){
    return traverse(ast, walker);
  }
  static async transform(source, options = {}){
    const { plugins = [] } = options;
    var ast = source;
    if(typeof source === 'string'){
      ast = await XML.read(source);
    }
    const visitors = plugins
      .map(plugin => plugin(ast))
      .filter(Boolean);
    XML.traverse(ast, node => {
      visitors.forEach(visitor => {
        const fn = visitor[node.name];
        typeof fn === 'function' && fn(node);
      });
    });
    return XML.serialize(ast, options);
  }
  static async transformFile(filename, options){
    const ast = await XML.readFile(filename, options);
    return XML.transform(ast, options);
  }
}

module.exports = XML;