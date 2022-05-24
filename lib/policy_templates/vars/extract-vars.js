import * as builder from 'xmlbuilder';

export function extractVarsTemplate (options) {
  const continueOnError = options.continueOnError || 'true'
  const enabled = options.enabled || 'true'
  const {name} = options
  const displayName = options.displayName || name
  const msg = builder.create('ExtractVariables')
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Source', { clearPayload: 'false' }, 'request')

  const uri = msg.ele('URIPath', {})
  Object.keys(options.api.paths).forEach((path) => {
    // Only add pattern if there is a parameter.
    if (path.indexOf('{') > -1) {
      uri.ele('Pattern', { ignoreCase: 'true' }, path)
    }
  })
  msg.ele('VariablePrefix', {}, 'pathParam')
  msg.ele('IgnoreUnresolvedVariables', {}, 'false')
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function extractVarsGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return extractVarsTemplate(templateOptions)
}
