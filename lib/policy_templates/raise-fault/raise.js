import * as builder from 'xmlbuilder';

export function raiseFaultTemplate (options) {
  const {name} = options
  const displayName = options.displayName || name
  const statusCode = options.statusCode || '500'
  const reasonPhrase = options.reasonPhrase || 'Ooops'
  const msg = builder.create('RaiseFault')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  const FaultResponse = msg.ele('FaultResponse').ele('Set')
  FaultResponse.ele('Headers')
  FaultResponse.ele('Payload', { contentType: 'text/plain' })
  FaultResponse.ele('StatusCode', statusCode)
  FaultResponse.ele('ReasonPhrase', reasonPhrase)
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function raiseFaultGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return raiseFaultTemplate(templateOptions)
}
