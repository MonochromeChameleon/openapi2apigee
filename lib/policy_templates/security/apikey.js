import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function apiKeyTemplate (options) {
  const aysnc = options.async || 'false'
  const continueOnError = options.continueOnError || 'false'
  const enabled = options.enabled || 'true'
  const name = options.name || `apiKey-${  random.randomText()}`
  const keyRef = options.keyRef || 'request.queryparam.apikey'

  const apiKey = builder.create('VerifyAPIKey')
  apiKey.att('async', aysnc)
  apiKey.att('continueOnError', continueOnError)
  apiKey.att('enabled', enabled)
  apiKey.att('name', name)

  apiKey.ele('Properties', {})
  apiKey.ele('APIKey', {ref: keyRef})

  const xmlString = apiKey.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function apiKeyGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.name = name
  if (name === 'apiKeyHeader') {
    templateOptions.keyRef = 'request.header.apikey'
  }
  return apiKeyTemplate(templateOptions)
}
