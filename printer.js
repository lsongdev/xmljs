
const serializeAttrs = attrs => {
  return Object.keys(attrs).reduce((str, key) => {
    return str + ` ${key}="${attrs[key]}"`;
  }, '');
};

const print = (ast, options) => {
  options = Object.assign({
    selfClosed: [ 'image' ]
  }, options);
  if(Array.isArray(ast)){
    return ast.map(ast => print(ast, options)).join('');
  }
  const { type, name, value, attributes, children } = ast;
  if(type === 'text'){
    return value;
  }
  const selfClosed = options.selfClosed.includes(name);
  var str = '';
  str += `<${name}`;
  str += serializeAttrs(attributes);
  if(children.length || !selfClosed){
    str += '>';
    str += print(children, options);
    str += `</${name}>`;
  }else{
    str += ' />';
  }
  return str;
};

module.exports = print;