import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function spikeArrestTemplate(options) {
  const aysnc = options.async || 'false';
  const continueOnError = options.continueOnError || 'false';
  const enabled = options.enabled || 'true';
  const name = options.name || `SpikeArrest-${random.randomText()}`;
  const displayName = options.displayName || name;
  const identifierRef =
    options.identifierRef || 'request.header.some-header-name';
  const messageWeightRef = options.intervalRef || 'request.header.weight';
  const rate = options.rate || '30ps';

  const spike = builder.create('SpikeArrest');
  spike.att('async', aysnc);
  spike.att('continueOnError', continueOnError);
  spike.att('enabled', enabled);
  spike.att('name', name);

  spike.ele('DisplayName', {}, displayName);
  spike.ele('Properties', {});
  spike.ele('Identifier', { ref: identifierRef });
  spike.ele('MessageWeight', { ref: messageWeightRef });
  spike.ele('Rate', {}, rate);
  const xmlString = spike.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

export function spikeArrestGenTemplate(options, name) {
  const templateOptions = options;
  templateOptions.name = name;
  if (options.timeUnit === 'minute') {
    templateOptions.rate = `${options.allow}pm`;
  } else {
    templateOptions.rate = `${options.allow}ps`;
  }
  return spikeArrestTemplate(templateOptions);
}
