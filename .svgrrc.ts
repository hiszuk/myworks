// .svgrrc.js

export const typescript = true
export function template({ template }, opts, { imports, componentName, props, jsx }) {
  const plugins = ['jsx']
  if (opts.typescript) {
    plugins.push('typescript')
  }
  const typeScriptTpl = template.smart({ plugins })
  return typeScriptTpl.ast`${imports}

    export const ${componentName} = (${props}): JSX.Element => {
        return ${jsx};
      }
    `
}