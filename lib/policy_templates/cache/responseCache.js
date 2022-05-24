import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function responseCacheTemplate(options) {
  const aysnc = options.async || 'false';
  const continueOnError = options.continueOnError || 'false';
  const enabled = options.enabled || 'true';
  const name = options.name || `responseCache-${random.randomText()}`;
  const displayName = options.displayName || name;

  const keyFragment = options.keyFragment || '';
  const keyFragmentRef = options.keyFragmentRef || 'request.uri';

  const scope = options.scope || 'Exclusive';

  const timeoutInSec = options.timeoutInSec || '300';

  const cache = builder.create('ResponseCache');
  cache.att('async', aysnc);
  cache.att('continueOnError', continueOnError);
  cache.att('enabled', enabled);
  cache.att('name', name);

  cache.ele('DisplayName', {}, displayName);
  cache.ele('Properties', {});

  const cacheKey = cache.ele('CacheKey', {});
  cacheKey.ele('Prefix', {});
  cacheKey.ele(
    'KeyFragment',
    { ref: keyFragmentRef, type: 'string' },
    keyFragment
  );

  cache.ele('Scope', {}, scope);
  const expirySettings = cache.ele('ExpirySettings', {});
  expirySettings.ele('ExpiryDate', {});
  expirySettings.ele('TimeOfDay', {});
  expirySettings.ele('TimeoutInSec', {}, timeoutInSec);

  cache.ele('SkipCacheLookup', {});
  cache.ele('SkipCachePopulation', {});
  const xmlString = cache.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

export function responseCacheGenTemplate(options, name) {
  const templateOptions = options;
  templateOptions.keyFragment = options.name;
  templateOptions.name = name;
  templateOptions.timeoutInSec = Math.round(options.ttl / 1000);
  return responseCacheTemplate(templateOptions);
}
