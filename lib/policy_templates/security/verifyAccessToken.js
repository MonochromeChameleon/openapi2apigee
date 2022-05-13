import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function verifyAccessTokenTemplate (options) {
  var aysnc = options.async || 'false'
  var continueOnError = options.continueOnError || 'false'
  var enabled = options.enabled || 'true'
  var name = options.name || 'verifyAccessToken-' + random.randomText()

  var verifyAccessToken = builder.create('OAuthV2')
  verifyAccessToken.att('async', aysnc)
  verifyAccessToken.att('continueOnError', continueOnError)
  verifyAccessToken.att('enabled', enabled)
  verifyAccessToken.att('name', name)

  verifyAccessToken.ele('DisplayName', {}, 'verifyAccessToken')
  verifyAccessToken.ele('Properties', {})
  verifyAccessToken.ele('ExternalAuthorization', {}, false)
  verifyAccessToken.ele('Operation', {}, 'VerifyAccessToken')
  verifyAccessToken.ele('SupportedGrantTypes', {})
  verifyAccessToken.ele('GenerateResponse', {enabled: true})
  verifyAccessToken.ele('Tokens', {})

  var xmlString = verifyAccessToken.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function verifyAccessTokenGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.name = name || 'verifyAccessToken'
  return verifyAccessTokenTemplate(templateOptions)
}
