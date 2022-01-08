const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
const autoTrackPlugin = require('./plugin/auto-track-plugin');

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
    encoding: 'utf-8'
});

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: [
        'jsx',
    ]
});

// console.log(ast)
// import entLog from '@/core/entlog'
const { code } = transformFromAstSync(ast, sourceCode, {
    plugins: [[autoTrackPlugin, {
        trackerPath: 'entLog',
        import: '@/core/entLog'
    }]]
});

console.log(code);