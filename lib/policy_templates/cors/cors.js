import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function corsTemplate(options) {
  const aysnc = options.async || 'false';
  const continueOnError = options.continueOnError || 'false';
  const enabled = options.enabled || 'true';
  const name = options.name || `Quota-${random.randomText()}`;
  const displayName = options.displayName || name;
  let faultRules;
  let properties;
  const headers = options.headers || {
    'Access-Control-Allow-Origin': { default: '*' },
    'Access-Control-Allow-Credentials': { default: false },
    'Access-Control-Allow-Headers': { default: 'Content-Type, X-Powered-By' },
    'Access-Control-Allow-Methods': { default: 'GET, HEAD' },
    'Access-Control-Max-Age': { default: 86400 },
  };
  const msg = builder.create('AssignMessage');
  msg.att('async', aysnc);
  msg.att('continueOnError', continueOnError);
  msg.att('enabled', enabled);
  msg.att('name', name);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('FaultRules', {}, faultRules);
  msg.ele('Properties', {}, properties);
  const corsHeaders = msg.ele('Add').ele('Headers');
  Object.keys(headers).forEach((header) => {
    corsHeaders.ele('Header', { name: header }, headers[header].default);
  });
  msg.ele('IgnoreUnresolvedVariables', {}, true);
  msg.ele('AssignTo', {
    createNew: false,
    transport: 'http',
    type: 'response',
  });
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

export function corsGenTemplate(options, name) {
  const templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return corsTemplate(templateOptions);
}
