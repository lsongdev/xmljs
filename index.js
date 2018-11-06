const parser = require('./parser');
const reader = require('./reader');
const printer = require('./printer');
const { Transform } = require('stream');

class XML extends Transform {
  static parse(str){
    return new Promise(done => reader(done)(str));
  }
}

module.exports = XML;