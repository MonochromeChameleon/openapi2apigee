import { create } from 'xmlbuilder';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';

export async function generateProxy(
  apiProxy,
  { destination = resolve('api_bundles') },
  api
) {
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const root = create('APIProxy');
  root.att('revison', 1);
  root.att('name', apiProxy);
  root.ele('CreatedAt', {}, Math.floor(Date.now() / 1000));
  root.ele('Description', {}, api.info.title);
  const proxyEndPoints = root.ele('ProxyEndpoints', {});
  proxyEndPoints.ele('ProxyEndpoint', {}, 'default');
  const targetEndPoints = root.ele('TargetEndpoints', {});
  targetEndPoints.ele('TargetEndpoint', {}, 'default');
  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  return writeFile(join(rootDirectory, `${apiProxy}.xml`), xmlString);
}
