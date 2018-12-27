// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'browser.js',
  output: {
    name: 'xml2',
    file: 'dist/xml2.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ 
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', { modules: false }]],
    })
  ]
};