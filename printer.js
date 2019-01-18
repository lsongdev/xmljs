
const serializeAttrs = attrs => {
  return Object.keys(attrs).reduce((str, key) => {
    str += ' ' + key;
    const value = attrs[key];
    if(value !== void(0)){
      str += `="${value}"`;
    }
    return str;
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