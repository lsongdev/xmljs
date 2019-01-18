const fs = require('fs');
const { promisify } = require('util');
const createParser = require('./parser');
const reader = require('./reader');
const printer = require('./printer');
const traverse = require('./traverse');
const EventEmitter = require('events');

class XML extends EventEmitter {
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
  constructor(){
    super();
    this._write = createParser((type, value) => 
      this.emit(type, value));
  }
  write(buf){
    this._write(buf.toString());
    return this;
  }
  end(buf){
    buf && this._write(buf.toString());
    return this;
  }
}

module.exports = XML;