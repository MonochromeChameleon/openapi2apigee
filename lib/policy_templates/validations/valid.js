import * as builder from 'xmlbuilder';
import omit from 'lodash.omit';

export function validationsSchema (api) {
  const blackList = ['host', 'x-a127-services']
  return omit(api, blackList)
}

export function validationsTemplate (options) {
  const continueOnError = options.continueOnError || 'true'
  const enabled = options.enabled || 'true'
  const {name} = options
  const displayName = options.displayName || name
  const msg = builder.create('Javascript')
  const {resourceUrl} = options
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('timeLimit', '200')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  msg.ele('ResourceURL', resourceUrl)
  msg.ele('IncludeURL', 'jsc://api.js')
  // msg.ele('IncludeURL', 'jsc://regex-utils.js');
  msg.ele('IncludeURL', 'jsc://bundle-policify.js')
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function validationsGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return validationsTemplate(templateOptions)
}
