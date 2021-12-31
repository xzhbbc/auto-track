const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');
const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        visitor: {
            Program: {
                enter (path, state) {
                    path.traverse({
                        ImportDeclaration (curPath) {
                            const requirePath = curPath.get('source').node.value;
                            if (requirePath === options.trackerPath) {
                                const specifierPath = curPath.get('specifiers.0');
                                if (specifierPath.isImportSpecifier()) {
                                    state.trackerImportId = specifierPath.toString();
                                } else if(specifierPath.isImportNamespaceSpecifier()) {
                                    state.trackerImportId = specifierPath.get('local').toString();
                                }
                                path.stop();
                            }
                        },
                        'StringLiteral'(curPath) {
                            const parent = curPath.parent?.id?.name
                            const value = curPath.node.value
                            if (parent == 'logFilter') {
                                state.rootLog = value
                                // path.stop();
                            }
                            // const value = curPath.node?.source?.value
                            // const requirePath = getId?.container?.name
                        },
                        ReturnStatement (curPath) {
                            // console.log(curPath)
                            const rootArgument = curPath.node.argument
                            if (['JSXElement', 'JSXFragment'].includes(rootArgument.type)) {
                                const nodeChildList = rootArgument.children
                                nodeChildList.forEach(item => {
                                    if (item.type === 'JSXElement') {
                                        const itemAttr = item.openingElement.attributes
                                        if (itemAttr && itemAttr.length > 0) {
                                            for (let i = 0; i < itemAttr.length; i++) {
                                                const attr = itemAttr[i]
                                                if (attr.type === 'JSXAttribute' && attr.name.name === 'onClick') {
                                                    if (!state.trackerClickList) {
                                                        state.trackerClickList = [attr.value.expression.name]
                                                    } else {
                                                        state.trackerClickList.push(attr.value.expression.name)
                                                    } 
                                                }
                                            }
                                        }
                                    }
                                })
                            }
                            // console.log(state.trackerClickList)
                            // const requirePath = curPath.get('source').node.value;
                        }
                    });
                    if (!state.trackerImportId) {
                        state.trackerImportId  = importModule.addDefault(path, options.import, {
                            nameHint: path.scope.generateUid(options.trackerPath)
                        }).name;
                        // state.trackerAST = api.template.statement(`${state.trackerImportId}()`)();
                    }
                }
            },
            'ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
                // const getIdName = path.node.declarations[0].id.name
                // if (state.trackerClickList.includes(getIdName)) {
                //     path.node.body.unshift(state.trackerAST);
                // }
                const bodyPath = path.get('body')
                const parent = path.parent?.id?.name
                // console.log(path.get('parent').toString())
                // const bodyName = bodyPath.node.body[0].expression.callee.name
                if (bodyPath.isBlockStatement() && state.trackerClickList.includes(parent)) {
                    const nameLogs = `click name ${parent}`
                    // console.log(template)
                    const nameLogsAst = api.template.ast(`${state.trackerImportId}("${state.rootLog}","${nameLogs}","")`)
                    bodyPath.node.body.unshift(nameLogsAst)
                }
                //  else {
                //     const ast = api.template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({PREV_BODY: bodyPath.node});
                //     bodyPath.replaceWith(ast);
                // }
            }
        }
    }
})

module.exports = autoTrackPlugin