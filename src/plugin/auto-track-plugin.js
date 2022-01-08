const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');
const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        visitor: {
            Program: {
                enter (path, state) {
                    state.init = 1
                    path.traverse({
                        ImportDeclaration (curPath) {
                            const requirePath = curPath.get('source').node.value;
                            // console.log(requirePath.match(options.trackerPath))
                            if (requirePath.match(options.trackerPath)) {
                                const specifierPath = curPath.get('specifiers.0');
                                if (specifierPath.isImportSpecifier()) {
                                    state.trackerImportId = specifierPath.toString();
                                } else if(specifierPath.isImportNamespaceSpecifier() || specifierPath.isImportDefaultSpecifier()) {
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
            },
            'ExpressionStatement'(path, state) {
                // console.log(path, state)
                const bodyPath = path.get('body')
                const expression = bodyPath?.container?.expression
                const calleeName = expression?.callee?.name
                // 找到useEffect
                if (calleeName == 'useEffect' && expression?.arguments.length === 2) {
                    // 取到第一个参数
                    const firstExpression = expression.arguments[0]
                    const bodyPathFirst = firstExpression.body
                    if (bodyPathFirst.type === 'BlockStatement' && state.init) {
                        state.init--
                        const nameLogsAst = api.template.ast(`${state.trackerImportId}("${state.rootLog}","first init","")`)
                        bodyPathFirst.body.unshift(nameLogsAst)
                        // path.stop()
                    }
                }
            }
        }
    }
})

module.exports = autoTrackPlugin