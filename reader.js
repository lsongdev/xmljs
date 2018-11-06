const parser = require('./parser');

const createNode = node => Object.assign({
  attributes: {},
  children: []
}, node);

module.exports = done => {
  var current, attrname;
  return parser((type, value) => {
    switch(type){
      case 'open-tag':
        const node = createNode({ 
          type,
          name: value,
          parent: current,
        });
        current && current.children.push(node);
        current = node;
        break;
      case 'attribute-name':
        attrname = value;
        current.attributes[value] = '';
        break;
      case 'attribute-value':
        current.attributes[attrname] = value;
        break;
      case 'text':
        current.children.push(createNode({
          type,
          value
        }));
        break;
      case 'close-tag':
        const { parent } = current;
        delete current.parent;
        !parent && done(current);
        current = parent;
        break;
    }
  });
};