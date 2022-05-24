import * as builder from 'xmlbuilder';
import * as random from '../../util/random.js';

export function verifyAccessTokenTemplate(options) {
  const aysnc = options.async || 'false';
  const continueOnError = options.continueOnError || 'false';
  const enabled = options.enabled || 'true';
  const name = options.name || `verifyAccessToken-${random.randomText()}`;

  const verifyAccessToken = builder.create('OAuthV2');
  verifyAccessToken.att('async', aysnc);
  verifyAccessToken.att('continueOnError', continueOnError);
  verifyAccessToken.att('enabled', enabled);
  verifyAccessToken.att('name', name);

  verifyAccessToken.ele('DisplayName', {}, 'verifyAccessToken');
  verifyAccessToken.ele('Properties', {});
  verifyAccessToken.ele('ExternalAuthorization', {}, false);
  verifyAccessToken.ele('Operation', {}, 'VerifyAccessToken');
  verifyAccessToken.ele('SupportedGrantTypes', {});
  verifyAccessToken.ele('GenerateResponse', { enabled: true });
  verifyAccessToken.ele('Tokens', {});

  const xmlString = verifyAccessToken.end({
    pretty: true,
    indent: '  ',
    newline: '\n',
  });
  return xmlString;
}

export function verifyAccessTokenGenTemplate(options, name) {
  const templateOptions = options;
  templateOptions.name = name || 'verifyAccessToken';
  return verifyAccessTokenTemplate(templateOptions);
}
