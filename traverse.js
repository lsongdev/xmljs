

const traverse = (ast, walker) => {
  if(Array.isArray(ast)){
    return ast.map(ast => traverse(ast, walker));
  }
  walker(ast);
  if(ast.children && ast.children.length){
    return traverse(ast.children, walker);
  }
};

module.exports = traverse;